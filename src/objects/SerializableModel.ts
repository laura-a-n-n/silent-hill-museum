import {
  Bone,
  BufferAttribute,
  DataTexture,
  InterleavedBufferAttribute,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  Skeleton,
  SkinnedMesh,
  Texture,
  TypedArray,
  Vector3,
} from "three";
import { loadModelFromBytes } from "../load";
import SilentHillModel, { PrimitiveHeader } from "../kaitai/Mdl";
import Stripifier from "../wasm/stripifier/stripifier";
import KaitaiStream from "../kaitai/runtime/KaitaiStream";
import {
  applyDiffToOffsetTable,
  assignPublicProperties,
  computeAverageVertex,
  ensureOffsetTableAligned,
  getPixelsFromCanvasImageSource,
  mat4ToTransformationMatrix,
  MIN_SIGNED_INT,
  transformationMatrixToMat4,
  UnhandledCaseError,
} from "../utils";
import logger from "./Logger";
import ImageLibrary, { ByteArray } from "./ImageLibrary";
import Squish, { SquishFlags } from "../wasm/libsquish/dxt";
import type { BoundingBox, Enum, VertexLike } from "../types/common";
import type { ModelPropertyDiff } from "../write-worker";
import { Bonemap, sharedSerializationData } from "../write";

const TEXTURE_ID_SPACE_START = 53895;
const SPRITE_ID_SPACE_START = 99686;

/**
 * List of sections that can be used to apply offset diffs.
 */
const supportedSectionTypes = [
  "primitives",
  "opaqueIndices",
  "opaqueVertices",
  "textureBlocks",
  "textureMetadata",
  "bonePairs",
  "defaultPcmsMatrices",
] as const;
type SizeList = {
  [sectionName in (typeof supportedSectionTypes)[number]]: number;
};

export type ModelParams = {
  modelType: SilentHillModelType;
  scale: number;
  autoscale: AutoscaleType;
  flipY: boolean;

  backfaceCulling: boolean;
  renderTransparentPrimitives: boolean;
  materialIndices?: number[];
  textureIndices?: number[];

  bonemap?: Bonemap;
  bonemapType: BonemapType;
  bonemapCollapseTarget: number;

  removeMorphTargets: boolean;
  mapToSelf: boolean;
};

export const SilentHillModelTypes = {
  BaseModel: "BaseModel",
  NotexModel: "NotexModel",
  RModel: "R-Model",
} as const;
export type SilentHillModelType = Enum<typeof SilentHillModelTypes>;

export const Autoscale = {
  AverageVertex: "AverageVertex",
  BoundingBox: "BoundingBox",
  None: "None",
} as const;
export type AutoscaleType = Enum<typeof Autoscale>;

export const BonemapMethod = {
  /**
   * Collapses all bones into a single position.
   */
  Collapse: "Collapse",

  /**
   * Match similar bones together.
   */
  Auto: "Auto",

  /**
   * Use numbers in the bone names.
   */
  "By Name": "By Name",

  /**
   * Edit the bonemap directly.
   */
  Manual: "Manual",
} as const;
export type BonemapType = Enum<typeof BonemapMethod>;

/**
 * A way for the worker to pass data up to the main thread.
 * Exists in the non-worker implementation for consistency.
 */
export type SendToShared = (
  data: Partial<typeof sharedSerializationData>
) => void;

/**
 * This is the transformation from SH2 coords to GLTF convention.
 */
const globalBoneTransform = new Matrix4().makeBasis(
  new Vector3(0, 1, 0),
  new Vector3(0, 0, -1),
  new Vector3(1, 0, 0)
);

/**
 * Representation of an imported model.
 * This is for converting GLTF models to MDL.
 */
export default class SerializableModel {
  private fileContents: ArrayBuffer;
  private model: SilentHillModel;
  private meshes: Mesh[];
  private imageLibrary?: ImageLibrary;
  private params: ModelParams = {
    modelType: SilentHillModelTypes.BaseModel,
    scale: 1,
    autoscale: Autoscale.BoundingBox,
    flipY: true,
    bonemapType: BonemapMethod.Collapse,
    bonemapCollapseTarget: 0,
    removeMorphTargets: true,
    backfaceCulling: false,
    renderTransparentPrimitives: false,
    mapToSelf: true,
  };

  private opaquePrimitives: SilentHillModel.PrimitiveHeaderWrapper[] = [];
  private opaqueVertices: SilentHillModel.VertexData[] = [];
  /**
   * A concatenated list of all opaque triangle indices before being made into
   * a SilentHillModel.IndexList.
   */
  private opaqueTriangleIndices: number[] = [];
  private opaqueTriangleStrip?: SilentHillModel.IndexList;

  private transparentPrimitives: SilentHillModel.PrimitiveHeaderWrapper[] = [];
  private transparentVertices: SilentHillModel.VertexData[] = [];
  /**
   * A concatenated list of all transparent triangle indices before being made into
   * a SilentHillModel.IndexList.
   */
  private transparentTriangleIndices: number[] = [];
  private textureContainers: SilentHillModel.TextureContainer[] = [];

  /* various helper data */
  /**
   * Array of pointers to vertex sets that have been processed already.
   */
  private seenVertices: TypedArray[] = [];
  private seenVerticesToPrimitiveMap: number[] = [];
  private vertexSetOffsets: number[] = [];
  /**
   * Array of pointers to materials that have been processed.
   */
  private seenMaterials: Material[] = [];
  /**
   * Array of pointers to textures that have been processed.
   */
  private seenMaps: Texture[] = [];
  private materialIndices: number[] = [];
  private textureIndices: number[] = [];
  private seenMapToMaterialIndex: number[] = [];
  /**
   * Array of pointers to buffers that have edits applied.
   */
  private transformedBuffers: (BufferAttribute | InterleavedBufferAttribute)[] =
    [];
  private globalAddedBonePairs = new Map<number, number>();
  private boneSpaceMatrices = new Map<number, Matrix4>();
  private inverseTransposeBoneSpaceMatrices = new Map<number, Matrix4>();

  // TODO: pass these into the worker from localStorage
  private lastTextureId = TEXTURE_ID_SPACE_START;
  private lastSpriteId = SPRITE_ID_SPACE_START;

  /* diff machinery */
  private totalSizeDiff = 0;
  private newSectionSizes: SizeList = {
    primitives: 0,
    opaqueIndices: 0,
    opaqueVertices: 0,
    textureBlocks: 0,
    textureMetadata: 0,
    bonePairs: 0,
    defaultPcmsMatrices: 0,
  };
  private oldSectionSizes: SizeList;
  private originalHeaderOffsetTable?: SilentHillModel.FileHeader;
  private originalDataOffsetTable?: SilentHillModel.Model;
  private originalClusters?: SilentHillModel.Cluster[];

  private appliedEdits?: ModelPropertyDiff;
  private appliedTransform: Matrix4 = new Matrix4();
  private sendToShared: SendToShared;

  public constructor(
    fileContents: ArrayBuffer,
    meshPrimitives: Mesh[],
    params: Partial<ModelParams> = {},
    modelPropertyDiff?: ModelPropertyDiff,
    resizer?: ImageLibrary,
    sendToShared?: SendToShared
  ) {
    const model = loadModelFromBytes(fileContents);
    model._read();
    model._fetchInstances();
    Object.assign(this.params, params);

    this.validateModel(model);

    this.fileContents = fileContents;
    this.model = model;
    this.meshes = meshPrimitives;

    this.oldSectionSizes = this.computeBaseSectionSizes();
    if (resizer) {
      this.imageLibrary = resizer;
    }
    this.appliedEdits = modelPropertyDiff;
    this.sendToShared =
      sendToShared ?? ((data) => Object.assign(sharedSerializationData, data));
  }

  public getModel() {
    return this.model;
  }

  public validateModel(model: SilentHillModel) {
    logger.debug("ModelType", this.params.modelType);
    if (
      model.header.noTextureId &&
      this.params.modelType !== SilentHillModelTypes.RModel
    ) {
      throw new Error(
        "Do not directly serialize a notex model, instead use modelType 'NotexModel' on the base model."
      );
    }
    switch (this.params.modelType) {
      case SilentHillModelTypes.NotexModel:
        model.header.noTextureId = 1;
        break;
      case SilentHillModelTypes.RModel:
        model.header.noTextureId = 1;
        if (!Array.isArray(this.params.materialIndices)) {
          throw new Error(
            "Please provide the material indices for each primitive if creating an r-model."
          );
        }
        if (!Array.isArray(this.params.textureIndices)) {
          throw new Error(
            "Please provide the texture indices for each primitive if creating an r-model."
          );
        }
    }
  }

  /**
   * Applies update to model from a given diff.
   */
  public applyEdits() {
    if (!this.appliedEdits) {
      if (this.params.flipY) {
        logger.debug("Flipping y-axis");
        this.applyMatrixToAllMeshes(new Matrix4().makeScale(1, -1, 1));
      }
      logger.debug("Autoscale", this.params.autoscale);
      switch (this.params.autoscale) {
        case Autoscale.AverageVertex:
          this.scaleToAverageVertex();
          break;
        case Autoscale.BoundingBox:
          this.scaleToBoundingBox(true);
          break;
        default:
          return;
      }
      this.sendToShared({ appliedTransform: this.appliedTransform });
      return;
    }
    const { accumulatedTransform } = this.appliedEdits;
    const matrix = new Matrix4().compose(
      accumulatedTransform.position,
      accumulatedTransform.quaternion,
      accumulatedTransform.scale
    );
    this.applyMatrixToAllMeshes(matrix, false);
  }

  /**
   * Iterates over all primitives and populates array.
   */
  public async createPrimitives() {
    const model = this.model;
    const meshes = this.meshes;
    const stripifier = Stripifier.getInstance();

    if (!meshes.length) {
      throw new Error("No meshes to serialize.");
    }
    if (
      parseInt(meshes[0].userData.silentHillModel?.characterId) ===
      model.header.characterId
    ) {
      this.params.mapToSelf = true;
      logger.debug("Detected an in-house museum model!");
      logger.debug(`Editing ${meshes[0].userData.silentHillModel.name}`);
    }

    this.applyEdits();

    const firstPrimitive = model.modelData.geometry.primitiveHeaders[0];
    let currentPrimitiveTriangleIndex = 0;
    this.newSectionSizes.bonePairs = 2 * model.modelData.bonePairsCount;
    this.newSectionSizes.defaultPcmsMatrices =
      this.oldSectionSizes.defaultPcmsMatrices;

    const bonemap = this.handleBonemap();
    if (typeof bonemap !== "number") {
      this.sendToShared({ bonemap });
    }
    this.generateBonePairMap();

    for (let index = 0; index < meshes.length; index++) {
      // load up all attributes
      const mesh = meshes[index];
      const meshGeometry = mesh.geometry;
      const meshAttributes = meshGeometry.attributes;
      mesh.updateMatrixWorld();
      const meshVertices = meshAttributes.position.array;
      if (!meshAttributes.normal) {
        meshGeometry.computeVertexNormals();
      }

      // compute triangle strip
      const meshTriangles = meshGeometry.getIndex()?.array;
      if (meshTriangles === undefined) {
        throw Error(`Mesh ${index} did not have any triangles.`);
      }
      const vertexCount = meshVertices.length / 3;
      const triangles = await stripifier.triangleStripFromList(
        Array.from(meshTriangles),
        vertexCount
      );
      const triangleIndexCount = triangles.length;

      // create primitive header
      const templatePrimitive =
        (this.params.mapToSelf &&
          model.modelData.geometry.primitiveHeaders[index]) ||
        firstPrimitive;
      logger.debug(`Primitive ${index}`);
      if (templatePrimitive.body.poseIndex) {
        logger.debug(
          `Primitive ${index} has poseIndex ${templatePrimitive.body.poseIndex}`
        );
      }
      const primitiveWrapper = new SilentHillModel.PrimitiveHeaderWrapper(
        new KaitaiStream(new ArrayBuffer(templatePrimitive._io.size)),
        model.modelData.geometry,
        model
      );
      primitiveWrapper.primitiveHeaderSize =
        templatePrimitive.primitiveHeaderSize;
      const primitive = new SilentHillModel.PrimitiveHeader(
        new KaitaiStream(
          new ArrayBuffer(primitiveWrapper.primitiveHeaderSize - 4)
        ),
        primitiveWrapper,
        model
      );
      assignPublicProperties(templatePrimitive.body, primitive);
      primitiveWrapper.body = primitive;
      primitive.primitiveStartIndex = currentPrimitiveTriangleIndex;
      primitive.primitiveLength = triangleIndexCount;
      primitive.backfaceCulling = Number(this.params.backfaceCulling);
      primitive.materialType =
        SilentHillModel.PrimitiveHeader.MaterialType.MATTE_PLUS;
      primitive.samplerStates = [/*0x03, 0x03,*/ 0x01, 0x01, 0x02, 0x02];
      currentPrimitiveTriangleIndex += triangleIndexCount;

      if (this.params.modelType !== SilentHillModelTypes.RModel) {
        const material = await this.createTextureForMesh(mesh, primitive);
        /**
          # 1 = D3DTADDRESS_WRAP
          # 2 = D3DTADDRESS_MIRROR
          # 3 = D3DTADDRESS_CLAMP
          # 4 = D3DTADDRESS_BORDER
          # 5 = D3DTADDRESS_MIRRORONCE
         */
        if ("map" in material && material.map instanceof Texture) {
          primitive.samplerStates = [
            material.map.wrapS === RepeatWrapping ? 0x01 : 0x03,
            material.map.wrapT === RepeatWrapping ? 0x01 : 0x03,
            0x02,
            0x02,
          ];
        }
      } else {
        const materialIndex = this.params.materialIndices?.[index] ?? 0;
        primitive.textureIndices.array = [materialIndex];
        model.modelData.textureMetadata.texturePairs[
          materialIndex
        ].textureIndex = this.params.textureIndices?.[index] ?? 0;
      }
      const newPrimitiveSize = this.createOpaquePrimitive(
        mesh,
        primitive,
        vertexCount,
        triangles
      );
      this.newSectionSizes.primitives += newPrimitiveSize;
      if (false) {
        this.createTransparentPrimitive();
      }
      primitive._io = new KaitaiStream(new ArrayBuffer(newPrimitiveSize - 4));
      primitiveWrapper._io = new KaitaiStream(
        new ArrayBuffer(newPrimitiveSize)
      );
      primitiveWrapper.primitiveHeaderSize = newPrimitiveSize;
      this.opaquePrimitives.push(primitiveWrapper);
    }
    if ((2 * model.modelData.bonePairsCount) % 16 > 0) {
      model.modelData.pad2 = Array(
        16 - ((2 * model.modelData.bonePairsCount) % 16)
      ).fill(0);
    }
    this.newSectionSizes.bonePairs +=
      this.newSectionSizes.bonePairs % 16 > 0
        ? 16 - (this.newSectionSizes.bonePairs % 16)
        : 0;

    this.finalizeTriangles(this.opaqueTriangleIndices);
    this.finalizeTextures();

    if (!this.params.renderTransparentPrimitives) {
      logger.debug("Not rendering transparent primitives");
      model.modelData.transparentPrimitiveHeadersCount = 0;
    }

    if (this.params.removeMorphTargets) {
      this.removeMorphTargets();
    }

    this.runDiffMachinery();
  }

  private removeMorphTargets() {
    const { modelData } = this.model;
    modelData.clusterMaps.opaque.forEach((mapping, mappingIndex) => {
      mapping.count = 0;
      mapping.sourceStartIndex = mappingIndex;
      mapping.targetStartIndex = mappingIndex;
    });
    modelData.clusterMaps.transparent.forEach((mapping, mappingIndex) => {
      mapping.count = 0;
      mapping.sourceStartIndex = mappingIndex;
      mapping.targetStartIndex = mappingIndex;
    });
  }

  private searchForSkeleton() {
    let skeleton: Skeleton | undefined;
    for (let meshIndex = 0; meshIndex < this.meshes.length; meshIndex++) {
      const mesh = this.meshes[meshIndex];
      if (mesh instanceof SkinnedMesh) {
        skeleton = mesh.skeleton;
        break;
      }
    }
    return skeleton;
  }

  private handleBonemap(): Bonemap | number {
    const model = this.model;
    const bonemap: Bonemap = {};
    this.params.bonemap ??= {};

    // bonemap collapse requires that all bones get sent to a specific position
    switch (this.params.bonemapType) {
      default:
      case BonemapMethod.Collapse:
        for (
          let boneIndex = 0;
          boneIndex < model.modelData.boneCount;
          boneIndex++
        ) {
          model.modelData.initialMatrices[boneIndex] =
            model.modelData.initialMatrices[this.params.bonemapCollapseTarget];
        }
        this.params.bonemap = {};
        return this.params.bonemapCollapseTarget;
      case BonemapMethod.Auto: {
        const skeleton = this.searchForSkeleton();
        if (!skeleton) {
          this.params.bonemapType = BonemapMethod.Collapse;
          logger.debug(
            "Defaulting to 'collapse' bonemap method as model is without a skeleton"
          );
          return this.handleBonemap();
        }
        const sourceBones = skeleton.bones;
        const targetBones = model.modelData.initialMatrices.map((boneMatrix) =>
          transformationMatrixToMat4(boneMatrix)
        );
        const inverseMap: Record<number, number> = {};

        sourceBones.map((sourceBone, sourceBoneIndex) => {
          const sourceTransform = sourceBone.matrixWorld;
          let minValidDistance = Number.MAX_VALUE;
          let argminIndex = -1;
          let minFallbackDistance = Number.MAX_VALUE;
          let fallbackIndex = -1;

          targetBones.forEach((targetBone, targetBoneIndex) => {
            const targetTransform = targetBone
              .clone()
              .multiply(globalBoneTransform);
            const distance = targetTransform.elements.reduce(
              (currentSum, element, elementIndex) =>
                currentSum +
                Math.pow(sourceTransform.elements[elementIndex] - element, 2)
            );
            if (
              !(targetBoneIndex in inverseMap) &&
              distance < minValidDistance
            ) {
              minValidDistance = distance;
              argminIndex = targetBoneIndex;
            }
            if (distance < minFallbackDistance) {
              minFallbackDistance = distance;
              fallbackIndex = targetBoneIndex;
            }
          });

          if (argminIndex === -1) {
            // Couldn't find a valid bonemap. Just use the closest possible
            argminIndex = fallbackIndex;
            minValidDistance = minFallbackDistance;
          }

          bonemap[sourceBoneIndex] = argminIndex;
          inverseMap[argminIndex] = sourceBoneIndex;
          return { argminIndex, minDistance: minValidDistance };
        });
        logger.debug("Bonemap", JSON.stringify(bonemap, null, 4));

        return Object.assign(this.params.bonemap, bonemap);
      }
      case "By Name": {
        const skeleton = this.searchForSkeleton();
        if (!skeleton) {
          this.params.bonemapType = BonemapMethod.Collapse;
          logger.debug(
            "Defaulting to 'collapse' bonemap method as model is without a skeleton"
          );
          return this.handleBonemap();
        }
        skeleton.bones.forEach((bone, boneIndex) => {
          // try to extract number from bone name
          const digits = bone.name.match(/\d+(?=\D*$)/)?.[0];
          const number = digits
            ? parseInt(digits)
            : this.params.bonemapCollapseTarget;
          bonemap[boneIndex] = number;
        });
        return Object.assign(this.params.bonemap, bonemap);
      }
      case "Manual": {
        if (!Object.keys(this.params.bonemap).length) {
          logger.warn(
            "Manual bonemapping was selected, but no bonemap was provided."
          );
          logger.warn("Defaulting to auto bonemapping.");
          this.params.bonemapType = "Auto";
          return this.handleBonemap();
        }
        return this.params.bonemap;
      }
    }
  }

  private generateBonePairMap() {
    const { modelData } = this.model;
    const bonePairs = modelData.bonePairs;
    const globalAddedBonePairs = this.globalAddedBonePairs;
    for (let i = 0; i < modelData.bonePairsCount; i++) {
      const { parent, child } = bonePairs[i];
      const key = (parent << 8) | child;
      globalAddedBonePairs.set(key, i);
    }
  }

  private finalizeTriangles(indices: number[]) {
    if (indices.length % 8 !== 0) {
      // alignment
      // these zeros get processed as degenerate, so it's ok
      indices.push(...Array(8 - (indices.length % 8)).fill(0));
    }

    const indicesSize = indices.length * 2;
    const model = this.model;
    const triangleStrip = new SilentHillModel.IndexList(
      new KaitaiStream(new ArrayBuffer(indicesSize)),
      model.modelData.geometry,
      model
    );
    triangleStrip.array = indices;
    this.newSectionSizes.opaqueIndices = indicesSize;
    this.opaqueTriangleStrip = triangleStrip;
  }

  private finalizeTextures() {
    const newSectionSizes = this.newSectionSizes;
    const { modelData, header } = this.model;
    newSectionSizes.textureMetadata =
      4 * header.textureCount + 8 * modelData.textureIdCount;
    if (this.params.modelType === SilentHillModelTypes.RModel) {
      newSectionSizes.textureBlocks = this.oldSectionSizes.textureBlocks;
    }

    // handle silly textureMetadata padding
    // this seems like more of a hack. can we fix this?
    if (modelData.textureBlocksCount % 4 > 0) {
      modelData.textureMetadata.pad = new Uint8Array(
        16 - ((4 * modelData.textureBlocksCount) % 16)
      ).fill(0);
      newSectionSizes.textureMetadata +=
        16 - ((4 * modelData.textureBlocksCount) % 16);
      newSectionSizes.textureBlocks +=
        16 - ((4 * modelData.textureBlocksCount) % 16);
    }

    if (this.materialIndices.length) {
      this.sendToShared({
        materialIndices: this.materialIndices,
        textureIndices: this.textureIndices,
      });
    }
  }

  private createTransparentPrimitive() {
    // TODO
    logger.warn("Transparent primitives are not implemented yet");
    this.transparentPrimitives;
    this.transparentVertices;
    this.transparentTriangleIndices;
  }

  private createOpaquePrimitive(
    mesh: Mesh,
    primitive: PrimitiveHeader,
    vertexCount: number,
    triangleStrip: Uint32Array
  ): number {
    const meshGeometry = mesh.geometry;
    const meshAttributes = meshGeometry.attributes;
    const meshVertices = meshAttributes.position.array;
    const seenVertices = this.seenVertices;
    const vertexSetOffsets = this.vertexSetOffsets;
    const indexOfSeen = seenVertices.indexOf(meshVertices);
    const triangleIndices = this.opaqueTriangleIndices;

    // triangle indices are relative to primitive
    // need to make them "global" w.r.t. the model
    let vertexOffset = 0;
    if (indexOfSeen >= 0) {
      vertexOffset = vertexSetOffsets[indexOfSeen] - vertexCount;
    } else {
      vertexOffset = vertexSetOffsets[vertexSetOffsets.length - 1] ?? 0;
    }
    triangleIndices.push(
      ...triangleStrip.map((triangleIndex) => triangleIndex + vertexOffset)
    );

    // set up primitive bone arrays
    const model = this.model;
    const boneCount = model.modelData.boneCount;
    primitive.boneIndices = [...Array(boneCount).keys()];
    primitive.bonePairIndices.array = [];
    primitive.boneCount = boneCount;
    primitive.bonePairsCount = 0;

    if (indexOfSeen >= 0) {
      // reused vertex set, no need to process more than once
      const referencePrimitiveIndex =
        this.seenVerticesToPrimitiveMap[indexOfSeen];
      const referencePrimitiveWrapper =
        this.opaquePrimitives[referencePrimitiveIndex];
      const referencePrimitive = referencePrimitiveWrapper.body;
      assignPublicProperties(referencePrimitive, primitive, {
        primitiveLength: true,
        primitiveStartIndex: true,
        poseIndex: true,
      });
      primitive.bonePairIndices.array =
        referencePrimitive.bonePairIndices.array;
      primitive.bonePairsCount = primitive.bonePairsCount;
      return referencePrimitiveWrapper.primitiveHeaderSize;
    }

    const meshUvs = meshAttributes.uv?.array;
    const meshNormals = meshAttributes.normal.array;
    const vertices = this.opaqueVertices;
    const newSectionSizes = this.newSectionSizes;
    const scale = this.params.scale;

    seenVertices.push(meshVertices);
    vertexSetOffsets.push(vertexOffset + vertexCount);
    this.seenVerticesToPrimitiveMap.push(this.opaquePrimitives.length);

    const boneIndices = meshGeometry.attributes.skinIndex?.array;
    const boneWeights = meshGeometry.attributes.skinWeight?.array;
    const boneSpaceMatrices = this.boneSpaceMatrices;
    const inverseTransposeBoneSpaceMatrices =
      this.inverseTransposeBoneSpaceMatrices;
    const globalAddedBonePairs = this.globalAddedBonePairs;
    const localAddedBonePairs = new Map<number, number>();

    const bonemapCollapseTarget = this.params.bonemapCollapseTarget;
    const bonemap = this.params.bonemap ?? { 0: bonemapCollapseTarget };

    const newBonesSize = Math.ceil((2 * boneCount) / 16) * 16;
    let newPrimitiveSize = 128 + newBonesSize;
    for (
      let vertexIndex = 0, uvIndex = 0, skinIndex = 0;
      vertexIndex < meshVertices.length;
      vertexIndex += 3, uvIndex += 2, skinIndex += 4
    ) {
      const vertexData = new SilentHillModel.VertexData(
        new KaitaiStream(new ArrayBuffer(48)),
        model.modelData.geometry,
        model
      );
      [vertexData.x, vertexData.y, vertexData.z] = [
        meshVertices[vertexIndex],
        meshVertices[vertexIndex + 1],
        meshVertices[vertexIndex + 2],
      ];
      const vector = new Vector3(vertexData.x, vertexData.y, vertexData.z);
      vector.multiply(new Vector3(scale, scale, scale));
      [vertexData.x, vertexData.y, vertexData.z] = [
        vector.x,
        vector.y,
        vector.z,
      ];
      const normalVector = new Vector3(
        meshNormals[vertexIndex] * MIN_SIGNED_INT,
        meshNormals[vertexIndex + 1] * MIN_SIGNED_INT,
        meshNormals[vertexIndex + 2] * MIN_SIGNED_INT
      );
      vertexData.normals = [normalVector.x, normalVector.y, normalVector.z];
      vertexData.alignment = 0;
      vertexData.u = meshUvs?.[uvIndex] ?? 0;
      vertexData.v = meshUvs?.[uvIndex + 1] ?? 0;
      if (mesh instanceof SkinnedMesh) {
        let sourceBone = boneIndices[skinIndex];
        let targetBone = bonemap[sourceBone];
        while (targetBone === undefined) {
          const parent = mesh.skeleton.bones[sourceBone].parent;
          if (parent instanceof Bone) {
            sourceBone = mesh.skeleton.bones.indexOf(parent);
            targetBone = bonemap[sourceBone];
          } else {
            sourceBone = bonemapCollapseTarget;
            targetBone = bonemap[sourceBone];
            break;
          }
        }
        targetBone =
          targetBone < model.modelData.boneCount
            ? targetBone
            : bonemapCollapseTarget;
        const boneAndPairs: number[] = [targetBone];
        let objectSpaceMatrix;
        if (!objectSpaceMatrix) {
          mesh.skeleton.bones[sourceBone].updateMatrixWorld();
          const transform =
            model.modelData.initialMatrices[
              targetBone ?? bonemapCollapseTarget
            ] ?? model.modelData.initialMatrices[bonemapCollapseTarget];
          objectSpaceMatrix = transformationMatrixToMat4(transform).invert();
          boneSpaceMatrices.set(targetBone, objectSpaceMatrix);
          this.inverseTransposeBoneSpaceMatrices.set(
            targetBone,
            new Matrix4()
              .extractRotation(transformationMatrixToMat4(transform))
              .transpose()
          );
        }
        vector.applyMatrix4(objectSpaceMatrix);
        normalVector.applyMatrix4(objectSpaceMatrix);
        [vertexData.x, vertexData.y, vertexData.z] = [
          vector.x,
          vector.y,
          vector.z,
        ];
        vertexData.normals = [normalVector.x, normalVector.y, normalVector.z];
        for (let pairIndex = 1; pairIndex <= 3; pairIndex++) {
          const parent = targetBone;
          let child = bonemap[boneIndices[skinIndex + pairIndex]];
          if (
            parent === undefined ||
            child === undefined ||
            child === targetBone
          ) {
            continue;
          }
          const mapKey = (parent << 8) | child;
          const existingBonePair = localAddedBonePairs.get(mapKey);
          if (existingBonePair) {
            boneAndPairs.push(existingBonePair);
            continue;
          }

          let globalBonePairIndex = globalAddedBonePairs.get(mapKey);
          if (globalBonePairIndex === undefined) {
            const bonePair = new SilentHillModel.SkeletonPair(
              new KaitaiStream(new ArrayBuffer(2)),
              model.modelData,
              model
            );
            bonePair.parent = parent;
            bonePair.child = child;
            globalBonePairIndex = model.modelData.bonePairs.push(bonePair) - 1;
            model.modelData.defaultPcmsMatrices.push(
              mat4ToTransformationMatrix(
                transformationMatrixToMat4(
                  model.modelData.initialMatrices[child] ??
                    model.modelData.initialMatrices[bonemapCollapseTarget]
                )
                  .invert()
                  .multiply(
                    transformationMatrixToMat4(
                      model.modelData.initialMatrices[parent] ??
                        model.modelData.initialMatrices[bonemapCollapseTarget]
                    )
                  ),
                new SilentHillModel.TransformationMatrix(
                  new KaitaiStream(new ArrayBuffer(64)),
                  model.modelData,
                  model
                )
              )
            );
            model.modelData.bonePairsCount += 1;
            newSectionSizes.bonePairs += 2;
            newSectionSizes.defaultPcmsMatrices += 64;
            globalAddedBonePairs.set(mapKey, globalBonePairIndex);
          }

          const bonePairIndex =
            primitive.bonePairIndices.array.push(globalBonePairIndex) -
            1 +
            boneCount;

          primitive.bonePairsCount += 1;

          if (primitive.bonePairIndices.array.length >= 8) {
            newPrimitiveSize += 2;
          }
          newPrimitiveSize += 2;

          boneAndPairs.push(bonePairIndex);
          localAddedBonePairs.set(mapKey, bonePairIndex);
        }
        const finalBoneAndPairs = [
          boneAndPairs[0],
          boneWeights[skinIndex + 1] ? boneAndPairs[1] ?? 0 : 0,
          boneWeights[skinIndex + 2] ? boneAndPairs[2] ?? 0 : 0,
          boneWeights[skinIndex + 3] ? boneAndPairs[3] ?? 0 : 0,
        ];
        [
          vertexData.boneIndex0,
          vertexData.boneIndex1,
          vertexData.boneIndex2,
          vertexData.boneIndex3,
        ] = finalBoneAndPairs;
        [
          vertexData.boneWeight0,
          vertexData.boneWeight1,
          vertexData.boneWeight2,
          vertexData.boneWeight3,
        ] = [
          boneWeights[skinIndex],
          boneAndPairs[1] ? boneWeights[skinIndex + 1] : 0,
          boneAndPairs[2] ? boneWeights[skinIndex + 2] : 0,
          boneAndPairs[3] ? boneWeights[skinIndex + 3] : 0,
        ];
        const sum =
          vertexData.boneWeight0 +
          vertexData.boneWeight1 +
          vertexData.boneWeight2 +
          vertexData.boneWeight3;
        if (sum) {
          [
            vertexData.boneWeight0,
            vertexData.boneWeight1,
            vertexData.boneWeight2,
            vertexData.boneWeight3,
          ] = [
            vertexData.boneWeight0 / sum,
            vertexData.boneWeight1 / sum,
            vertexData.boneWeight2 / sum,
            vertexData.boneWeight3 / sum,
          ];
        } else {
          [
            vertexData.boneWeight0,
            vertexData.boneWeight1,
            vertexData.boneWeight2,
            vertexData.boneWeight3,
          ] = [1, 0, 0, 0];
        }
        if (
          Math.abs(
            [
              vertexData.boneWeight0,
              vertexData.boneWeight1,
              vertexData.boneWeight2,
              vertexData.boneWeight3,
            ].reduce((a, b) => a + b) - 1
          ) > 1e-1
        ) {
          throw Error(`Division by ${sum}, which is very close to zero`);
        }
      } else {
        let objectSpaceMatrix = boneSpaceMatrices.get(bonemapCollapseTarget);
        let inverseTransposeBoneSpaceMatrix =
          inverseTransposeBoneSpaceMatrices.get(bonemapCollapseTarget);
        if (!objectSpaceMatrix || !inverseTransposeBoneSpaceMatrix) {
          objectSpaceMatrix = transformationMatrixToMat4(
            model.modelData.initialMatrices[bonemapCollapseTarget]
          ).invert();
          boneSpaceMatrices.set(bonemapCollapseTarget, objectSpaceMatrix);
          inverseTransposeBoneSpaceMatrix = new Matrix4()
            .extractRotation(
              transformationMatrixToMat4(model.modelData.initialMatrices[0])
            )
            .transpose();
          this.inverseTransposeBoneSpaceMatrices.set(
            bonemapCollapseTarget,
            inverseTransposeBoneSpaceMatrix
          );
        }
        vector.applyMatrix4(objectSpaceMatrix);
        normalVector.applyMatrix4(inverseTransposeBoneSpaceMatrix);
        [vertexData.x, vertexData.y, vertexData.z] = [
          vector.x,
          vector.y,
          vector.z,
        ];
        vertexData.normals = [normalVector.x, normalVector.y, normalVector.z];
        vertexData.boneWeight0 = 1;
        vertexData.boneWeight1 = 0;
        vertexData.boneWeight2 = 0;
        vertexData.boneWeight3 = 0;
        vertexData.boneIndex0 = bonemapCollapseTarget;
        vertexData.boneIndex1 = 0;
        vertexData.boneIndex2 = 0;
        vertexData.boneIndex3 = 0;
      }
      newSectionSizes.opaqueVertices += 48;
      vertices.push(vertexData);
    }

    primitive.bonePairsOffset =
      128 + newBonesSize + (primitive.bonePairsCount ? 0 : 16);
    newPrimitiveSize += 16 - (newPrimitiveSize % 16);
    primitive.textureIndexOffset = newPrimitiveSize;
    newPrimitiveSize += 16;
    primitive.samplerStatesOffset = newPrimitiveSize;
    newPrimitiveSize += 16;

    return newPrimitiveSize;
  }

  private async createTextureForMesh(mesh: Mesh, primitive: PrimitiveHeader) {
    const material = mesh.material;
    if (!(material instanceof Material)) {
      throw new UnhandledCaseError("Mesh has more than one material");
    }
    const seenMaterials = this.seenMaterials;
    let materialIndex = seenMaterials.indexOf(material);
    const map = "map" in material ? (material.map as Texture) : undefined;
    if (map && materialIndex < 0) {
      materialIndex =
        this.seenMapToMaterialIndex[this.seenMaps.indexOf(map)] ?? -1;
    }
    if (materialIndex >= 0) {
      // material has been processed already
      primitive.textureIndices.array = [materialIndex];
      this.materialIndices.push(materialIndex);
      this.textureIndices.push(
        this.model.modelData.textureMetadata.texturePairs[materialIndex]
          .textureIndex
      );
      return material;
    }

    const model = this.model;

    // create a new material
    materialIndex = seenMaterials.length;
    seenMaterials.push(material);

    let pixels: ByteArray;
    let width, height;
    if (map?.source.data.data instanceof Uint8ClampedArray) {
      pixels = map.source.data.data;
      width = map.source.data.width;
      height = map.source.data.height;
    } else if (map?.source.data.data instanceof Uint8Array) {
      pixels = Uint8ClampedArray.from(map.source.data.data);
      width = map.source.data.width;
      height = map.source.data.height;
    } else if (
      !map ||
      !(
        map.source.data instanceof ImageBitmap ||
        map.source.data instanceof HTMLImageElement
      )
    ) {
      if (
        material instanceof MeshStandardMaterial ||
        material instanceof MeshBasicMaterial
      ) {
        pixels = new Uint8ClampedArray(
          Array(64)
            .fill([
              Math.floor(0xff * material.color.r),
              Math.floor(0xff * material.color.g),
              Math.floor(0xff * material.color.b),
              255,
            ])
            .flat()
        );
        width = 8;
        height = 8;
      } else throw new UnhandledCaseError("Material map is not recognized");
    } else {
      width = map.source.data.width;
      height = map.source.data.height;
      if (width * height >= 1 << 20) {
        logger.warn(
          `A texture of size ${width}, ${height} is large for this game.`
        );
        logger.warn("Resizing so that the maximum dimension is 512.");
        const scaleFactor = width > height ? 512 / width : 512 / height;
        width = Math.pow(2, Math.round(Math.log2(width * scaleFactor)));
        height = Math.pow(2, Math.round(Math.log2(height * scaleFactor)));
        [width, height];
        this.imageLibrary ??= new ImageLibrary();
        pixels = this.imageLibrary.resize(map.source.data, width, height, {
          imageSmoothingQuality: "high",
        });
      } else {
        pixels = getPixelsFromCanvasImageSource(
          map.source.data,
          (this.imageLibrary ?? new ImageLibrary()).canvas
        );
      }
    }

    if (width * height >= 1 << 20) {
      logger.warn(
        `A texture of size ${width}, ${height} is large for this game.`
      );
    }

    // compute pixel data and dxt compression
    this.seenMaps.push(map ?? new DataTexture(pixels, width, height));
    this.seenMapToMaterialIndex.push(materialIndex);

    const dxt = Squish.getInstance();
    const imageLibrary = this.imageLibrary;
    const imageKey = imageLibrary?.findByProperty(
      materialIndex,
      "materialIndex"
    );
    if (imageKey) {
      logger.debug(`Reusing cached material ${materialIndex}`);
    } else {
      logger.debug("Did not find image in cache, compressing");
    }
    let compressed = imageLibrary?.get(imageKey)?.compressed;
    if (!compressed) {
      compressed = imageLibrary?.registerImage({
        compressed: await dxt.compress(
          Uint8Array.from(pixels),
          width,
          height,
          SquishFlags.DXT5
        ),
        materialIndex,
      })?.compressed;
    }
    if (!compressed) {
      logger.debug("Failed, using uncompressed");
      compressed = Uint8Array.from(pixels);
    }
    const dataSize = width * height;
    const dataSizeFull = dataSize + 16;

    const textureContainers = model.textureData.textures;
    const textureMetadata = model.modelData.textureMetadata;
    let textureId =
      model.modelData.textureMetadata.mainTextureIds[materialIndex];
    const textureContainerIndex = model.textureData.textures.findIndex(
      (textureContainer) => textureContainer.textureId === textureId
    );
    let textureContainer: SilentHillModel.TextureContainer | undefined =
      model.textureData.textures[textureContainerIndex];
    let oldTextureContainerSize = 0;

    if (textureContainer === undefined) {
      // need to create a new texture container
      model.header.textureCount += 1; // for texture id
      model.modelData.textureBlocksCount += 1; // for texture id
      model.modelData.textureIdCount += 1; // for sprite id

      textureContainer = new SilentHillModel.TextureContainer(
        new KaitaiStream(new ArrayBuffer(64 + dataSize)),
        model.textureData,
        model
      );
      textureContainer.unknownSection = new Uint8Array([
        // todo: update ksy documentation, as I'm pretty sure the nonzero
        // values here is the index of the last sprite header, which
        // contains the actual data size
        0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]);
      textureContainer.spriteCount = 1;

      // todo this really doesn't need to be a list
      primitive.textureIndices = new SilentHillModel.IndexList(
        new KaitaiStream(new ArrayBuffer(2)),
        primitive,
        model
      );
      logger.debug("New texture container generated");
      primitive.textureIndices.array = [materialIndex];
      this.materialIndices.push(materialIndex);

      const newSpriteHeader = new SilentHillModel.SpriteHeader(
        new KaitaiStream(new ArrayBuffer(32)),
        textureContainer,
        model
      );

      // this is... lol.
      // current theory is that sprites are an unused feature
      // any fields that aren't set here get set later
      // (i.e., width, height, dataSize, allSize)
      newSpriteHeader.x = 0;
      newSpriteHeader.y = 0;
      newSpriteHeader.format =
        // @ts-ignore need to correct .d.ts
        SilentHillModel.SpriteHeader.TextureFormat.Dxt5;
      newSpriteHeader.unknown0 = 1;
      newSpriteHeader.importance = 300; // ???
      newSpriteHeader.pad = new Uint8Array([0, 0, 0, 0]);
      newSpriteHeader.unknown1 = 0;
      newSpriteHeader.unknown2 = 0;
      newSpriteHeader.endMagic = 0x9900;

      textureContainer.spriteHeaders = [newSpriteHeader];

      const pair = new SilentHillModel.TexturePair(
        new KaitaiStream(new ArrayBuffer(8)),
        textureMetadata,
        model
      );
      pair.textureIndex = materialIndex;
      textureMetadata.texturePairs.push(pair);
      textureMetadata.texturePairs[materialIndex] = pair;

      const { spriteId, textureId } = this.generateTextureIds();
      textureContainer.textureId = textureId;
      textureMetadata.mainTextureIds.push(textureId);
      newSpriteHeader.spriteId = 0;
      pair.spriteId = spriteId;
      console.log(textureContainer);
    } else {
      // mdl already had a texture container here, so just modify it
      const textureMetadata = model.modelData.textureMetadata;
      const spriteHeader = textureContainer.spriteHeaders.at(-1)!;
      oldTextureContainerSize = 64 + spriteHeader.dataSize;
      const textureIndex = textureMetadata.mainTextureIds.indexOf(
        textureContainer.textureId
      );
      textureMetadata.texturePairs[materialIndex].textureIndex = textureIndex;
      primitive.textureIndices.array[0] = materialIndex;
      this.materialIndices.push(materialIndex);
      this.textureIndices.push(textureIndex);
    }
    this.newSectionSizes.textureBlocks += 4;

    textureContainer.width = width;
    textureContainer.height = height;
    textureContainer.width2 = width;
    textureContainer.height2 = height;
    textureContainer.data = Uint8Array.from(compressed);

    const spriteHeader = textureContainer.spriteHeaders.at(-1);
    if (spriteHeader === undefined) {
      throw Error("No sprite header?");
    }
    spriteHeader.dataSize = dataSize;
    spriteHeader.allSize = dataSizeFull;
    spriteHeader.width = width;
    spriteHeader.height = height;

    // since textures are the last thing in the mdl file, and computing their
    // original size is a bit cumbersome, it makes sense to directly modify
    // the totalSizeDiff rather than going through the sectionSize machinery.
    // maybe a future todo is to go back on this decision just so everything
    // is more consistent?
    const diff = 64 + dataSize - oldTextureContainerSize;
    this.totalSizeDiff += diff;
    textureContainers[
      textureContainerIndex < 0
        ? textureContainers.length
        : textureContainerIndex
    ] = textureContainer;

    return material;
  }

  private generateTextureIds() {
    logger.debug("Generating a new texture ID!");
    let textureId: number;
    let spriteId: number;
    if (typeof localStorage !== "undefined") {
      // local storage is available, so use this to avoid collisions
      let lastTextureId =
        parseInt(localStorage.getItem("lastTextureId") ?? "0") ||
        this.lastTextureId;
      let lastSpriteId =
        parseInt(localStorage.getItem("lastSpriteId") ?? "0") ||
        this.lastSpriteId;
      if (!lastTextureId) {
        textureId = TEXTURE_ID_SPACE_START;
      } else {
        textureId = ++lastTextureId;
      }
      if (!lastSpriteId) {
        spriteId = SPRITE_ID_SPACE_START;
      } else {
        spriteId = ++lastSpriteId;
      }
      localStorage.setItem("lastTextureId", textureId.toString());
      localStorage.setItem("lastSpriteId", spriteId.toString());
    } else {
      // unavailable, just store at start of unreserved space i suppose
      textureId = this.lastTextureId++;
      spriteId = this.lastSpriteId++;
    }
    return { textureId, spriteId };
  }

  private computeBaseSectionSizes() {
    const { header, modelData } = this.model;
    const oldSectionSizes: SizeList = {
      primitives: modelData.geometry.primitiveHeaders.reduce<number>(
        (a, b) => a + b.primitiveHeaderSize,
        0
      ),
      opaqueIndices: modelData.geometry.triangleIndices._io.size,
      opaqueVertices: modelData.vertexCount * 48,
      // todo can this be replaced with io size?
      textureBlocks: 16,
      textureMetadata:
        4 * header.textureCount +
        8 * modelData.textureIdCount +
        ((4 * modelData.textureBlocksCount) % 16 > 0
          ? 16 - ((4 * modelData.textureBlocksCount) % 16)
          : 0),
      bonePairs: Math.ceil((modelData.bonePairsCount * 2) / 16) * 16,
      defaultPcmsMatrices: modelData.bonePairsCount * 64,
    };
    return oldSectionSizes;
  }

  private scaleToBoundingBox(center: boolean) {
    const model = this.model;
    const sourceVertices = model.modelData.geometry.vertexList;
    const targetVertices = this.meshes.flatMap((mesh) => [
      ...mesh.geometry.attributes.position.array,
    ]);

    // Compute bounding boxes for both models
    const sourceBoundingBox = this.computeBoundingBox(sourceVertices);
    const targetBoundingBox = this.computeBoundingBox(targetVertices);

    // Get the dimensions of both bounding boxes (difference between max and min coordinates)
    const sourceMaxDimension = Math.max(
      sourceBoundingBox.maxX - sourceBoundingBox.minX,
      sourceBoundingBox.maxY - sourceBoundingBox.minY,
      sourceBoundingBox.maxZ - sourceBoundingBox.minZ
    );

    const targetMaxDimension = Math.max(
      targetBoundingBox.maxX - targetBoundingBox.minX,
      targetBoundingBox.maxY - targetBoundingBox.minY,
      targetBoundingBox.maxZ - targetBoundingBox.minZ
    );

    // Compute scale factor
    const scaleFactor = sourceMaxDimension / targetMaxDimension;

    if (scaleFactor > 0.1 && scaleFactor < 2) {
      logger.debug(
        "Canceling autoscale because the scale factor is relatively small"
      );
      return;
    }

    const targetCenter = { x: 0, y: 0, z: 0 };
    const matrix = new Matrix4();

    if (center) {
      targetCenter.x = (targetBoundingBox.minX + targetBoundingBox.maxX) / 2;
      targetCenter.y = (targetBoundingBox.minY + targetBoundingBox.maxY) / 2;
      targetCenter.z = (targetBoundingBox.minZ + targetBoundingBox.maxZ) / 2;

      // Move target vertices so that they are centered at the origin
      matrix.makeTranslation(-targetCenter.x, -targetCenter.y, -targetCenter.z);

      // Recompute the target bounding box after centering
      const newTargetBoundingBox = this.computeBoundingBox(targetVertices);

      // Update targetBoundingBox with the new values
      Object.assign(targetBoundingBox, newTargetBoundingBox);
    }

    // Scale target vertices
    matrix.premultiply(
      new Matrix4().makeScale(scaleFactor, scaleFactor, scaleFactor)
    );

    // Undo centering
    if (center) {
      matrix.premultiply(
        new Matrix4().makeTranslation(
          targetCenter.x,
          targetCenter.y,
          targetCenter.z
        )
      );
    }

    this.applyMatrixToAllMeshes(matrix);

    logger.debug("Scaled to bounding box with scale factor", scaleFactor);

    return this.appliedTransform;
  }

  /**
   * Apply a matrix to all meshes, intended for before serializing.
   * @param matrix the matrix to apply
   * @param pushToStack if true, the matrix will be applied to
   * `this.appliedTransform`
   * @return whether any transforms were applied or not
   */
  private applyMatrixToAllMeshes(matrix: Matrix4, pushToStack = true): boolean {
    const transformedBuffers = this.transformedBuffers;
    let anyTransformsApplied = false;
    this.meshes.forEach((mesh) => {
      const meshVertices = mesh.geometry.attributes.position;
      if (transformedBuffers.indexOf(meshVertices) >= 0) {
        return;
      }
      transformedBuffers.push(meshVertices);
      anyTransformsApplied = true;
      meshVertices.applyMatrix4(matrix);
    });
    if (anyTransformsApplied && pushToStack) {
      this.appliedTransform.premultiply(matrix);
    }
    transformedBuffers.length = 0;
    return anyTransformsApplied;
  }

  private computeBoundingBox(
    vertexList: SilentHillModel.VertexData[]
  ): BoundingBox;
  private computeBoundingBox(vertexList: number[]): BoundingBox;
  private computeBoundingBox(
    vertexList: SilentHillModel.VertexData[] | number[]
  ) {
    // Initialize min/max values with extremes
    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity;

    if (typeof vertexList[0] === "number") {
      vertexList = vertexList as number[];
      for (let index = 0; index < vertexList.length; index++) {
        const x = vertexList[index];
        const y = vertexList[index + 1];
        const z = vertexList[index + 2];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (z < minZ) minZ = z;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        if (z > maxZ) maxZ = z;
      }
    } else {
      const vertices = vertexList as VertexLike[];
      // Iterate through all vertices to compute the bounding box
      vertices.forEach((vertex) => {
        if (vertex.x < minX) minX = vertex.x;
        if (vertex.y < minY) minY = vertex.y;
        if (vertex.z < minZ) minZ = vertex.z;
        if (vertex.x > maxX) maxX = vertex.x;
        if (vertex.y > maxY) maxY = vertex.y;
        if (vertex.z > maxZ) maxZ = vertex.z;
      });
    }

    return { minX, minY, minZ, maxX, maxY, maxZ };
  }

  private scaleToAverageVertex() {
    const model = this.model;
    const sourceVertices = model.modelData.geometry.vertexList;
    const targetVertices = this.meshes.flatMap((mesh) => [
      ...mesh.geometry.attributes.position.array,
    ]);
    const sourceAverageVertex = computeAverageVertex(sourceVertices);
    const targetAverageVertex = computeAverageVertex(targetVertices);
    const scaleFactor =
      Math.hypot(...sourceAverageVertex) / Math.hypot(...targetAverageVertex);
    if (scaleFactor > 0.1 && scaleFactor < 2) {
      logger.debug(
        "Canceling autoscale because the scale factor is relatively small"
      );
      return;
    }
    const appliedTransform = new Matrix4().makeScale(
      scaleFactor,
      scaleFactor,
      scaleFactor
    );
    this.applyMatrixToAllMeshes(appliedTransform);
    logger.debug("Scaled to average vertex with scale factor", scaleFactor);
    return this.appliedTransform;
  }

  /**
   * Computes sizes and applies all size diffs to offset tables.
   * @remarks If a given section X had size 32, and the new section X has
   * size 64, then the diff is +32, and all offsets that point to sections
   * that come after X are increased by 32 bytes. Conversely, if the old
   * section X had size 64 and the new size is 32, then the diff is -32 and
   * all affected offsets are decreased.
   */
  private runDiffMachinery() {
    const newSectionSizes = this.newSectionSizes;
    const oldSectionSizes = this.oldSectionSizes;
    const model = this.model;
    const { modelData, header } = model;

    const sizeDiffPerSection: SizeList = {
      primitives: 0,
      opaqueIndices: 0,
      opaqueVertices: 0,
      textureMetadata: 0,
      textureBlocks: 0,
      bonePairs: 0,
      defaultPcmsMatrices: 0,
    };
    for (const key of supportedSectionTypes) {
      if (!newSectionSizes[key]) {
        if (key === "textureMetadata") {
          header.noTextureId = 1;
          continue;
        }
        logger.warn(`Section size for ${key} is zero!`);
      }
      const diff = newSectionSizes[key] - oldSectionSizes[key];
      sizeDiffPerSection[key] = diff;
      this.totalSizeDiff += diff;
    }

    modelData.primitiveHeadersCount = this.opaquePrimitives.length;
    modelData.geometry.primitiveHeaders = this.opaquePrimitives;
    if (this.opaqueTriangleStrip) {
      modelData.geometry.triangleIndices = this.opaqueTriangleStrip;
    }
    modelData.geometry.vertexList = this.opaqueVertices;
    modelData.vertexCount = this.opaqueVertices.length;
    if (model.textureData) {
      model.textureData.textures = [
        ...this.textureContainers,
        ...(model.textureData?.textures.slice(this.textureContainers.length) ??
          []),
      ];
    }

    this.originalHeaderOffsetTable = Object.assign({}, header);
    const originalDataOffsetTable = Object.assign({}, modelData);
    this.originalDataOffsetTable = originalDataOffsetTable;
    const originalClusters = modelData.clusters?.map((cluster) =>
      Object.assign({}, cluster)
    );
    this.originalClusters = originalClusters;

    this.updateOffsetTablesFromDiff(
      sizeDiffPerSection.primitives,
      originalDataOffsetTable.primitiveHeadersOffset
    );
    this.updateOffsetTablesFromDiff(
      sizeDiffPerSection.opaqueIndices,
      originalDataOffsetTable.triangleIndexOffset
    );
    this.updateOffsetTablesFromDiff(
      sizeDiffPerSection.opaqueVertices,
      originalDataOffsetTable.vertexDataOffset
    );
    this.updateOffsetTablesFromDiff(
      sizeDiffPerSection.bonePairs,
      originalDataOffsetTable.bonePairsOffset
    );
    this.updateOffsetTablesFromDiff(
      sizeDiffPerSection.defaultPcmsMatrices,
      originalDataOffsetTable.defaultPcmsOffset
    );
    this.updateOffsetTablesFromDiff(
      Math.max(sizeDiffPerSection.textureBlocks, 0), // todo fix
      originalDataOffsetTable.textureBlocksOffset
    );
    this.updateOffsetTablesFromDiff(
      Math.ceil(sizeDiffPerSection.textureMetadata / 16) * 16,
      originalDataOffsetTable.textureIdOffset
    );

    ensureOffsetTableAligned(model.header);
    ensureOffsetTableAligned(model.modelData, { funcDataOffset: true });
    model.modelData.clusters?.forEach((cluster) =>
      ensureOffsetTableAligned(cluster)
    );
  }

  private updateOffsetTablesFromDiff(diff: number, current: number) {
    const { header, modelData } = this.model;
    const originalHeaderOffsetTable = this.originalHeaderOffsetTable;
    const originalDataOffsetTable = this.originalDataOffsetTable;
    const originalClusters = this.originalClusters;
    if (originalHeaderOffsetTable) {
      applyDiffToOffsetTable(header, originalHeaderOffsetTable, diff, current);
    }
    if (originalDataOffsetTable) {
      applyDiffToOffsetTable(modelData, originalDataOffsetTable, diff, current);
    }
    if (originalClusters) {
      modelData.clusters.forEach((cluster, clusterIndex) =>
        applyDiffToOffsetTable(
          cluster,
          originalClusters[clusterIndex],
          diff,
          current
        )
      );
    }
  }

  public write() {
    const stream = new KaitaiStream(
      new DataView(
        new ArrayBuffer(this.fileContents.byteLength + this.totalSizeDiff + 8)
      )
    );
    const model = this.model;
    model._write__seq(stream);
    model._fetchInstances();
    stream.writeBackChildStreams();
    const byteArray = stream.toByteArray();
    return byteArray;
  }
}
