import {
  Bone,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  DoubleSide,
  Float32BufferAttribute,
  Material,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  MeshStandardMaterialParameters,
  Skeleton,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import SilentHillModel from "./types/Mdl";
import { transformationMatrixToMat4, triangleStripToList } from "./utils";
import decodeDXT from "decode-dxt";

export const MaterialView = {
  Flat: "Flat color",
  UV: "UV visualization",
  Textured: "Textured model",
} as const;
export type MaterialType = (typeof MaterialView)[keyof typeof MaterialView];

export const createGeometry = (model: SilentHillModel, primitiveType = 0) => {
  const geometry = new BufferGeometry();

  if (primitiveType === 0) {
    const primitiveHeaders = model.modelData.geometry.primitiveHeaders;
    if (primitiveHeaders && primitiveHeaders.length !== 0) {
      processPrimitiveHeaders(model, geometry);
    } else {
      console.warn("Requested primary primitive headers, but model has none.");
      return undefined;
    }
  } else {
    const secondaryPrimitiveHeaders =
      model.modelData.geometry.secondaryPrimitiveHeaders;
    if (secondaryPrimitiveHeaders && secondaryPrimitiveHeaders.length !== 0) {
      processSecondaryPrimitiveHeaders(model, geometry);
    } else {
      console.warn(
        "Requested secondary primitive headers, but model has none."
      );
      return undefined;
    }
  }

  return geometry;
};

const processSecondaryPrimitiveHeaders = (
  model: SilentHillModel,
  geometry: BufferGeometry
) => {
  const secondaryPrimitiveHeaders =
    model.modelData.geometry.secondaryPrimitiveHeaders;
  const geometryData = model.modelData.geometry;
  const primitiveStartIndices = secondaryPrimitiveHeaders
    .map((header) => header.body.primitiveStartIndex)
    .sort((a, b) => a - b);
  const stripIndices = geometryData.secondaryTriangleIndices.array;
  const lastPrimitiveHeader = secondaryPrimitiveHeaders.at(-1)!.body;
  const triangleCount =
    lastPrimitiveHeader.primitiveStartIndex +
    lastPrimitiveHeader.primitiveLength;
  const { triangleIndices, primitiveVertexSets, groupData } =
    triangleStripToList(stripIndices, primitiveStartIndices, triangleCount);
  geometry.setIndex(triangleIndices);

  const initialMatrices = model.modelData.initialMatrices.map((matrix) =>
    transformationMatrixToMat4(matrix)
  );
  const vertices = new Float32Array(
    geometryData.secondaryVertexList.flatMap((vertex, vertexIndex) => {
      const vector = new Vector3(vertex.x, vertex.y, vertex.z);
      let primitiveIndex = 0;
      for (; primitiveIndex < primitiveVertexSets.length; primitiveIndex++) {
        if (primitiveVertexSets[primitiveIndex].has(vertexIndex)) {
          break;
        }
      }
      const header = secondaryPrimitiveHeaders[primitiveIndex];
      if (header === undefined) {
        console.warn(`Unused vertex? Index: ${vertexIndex}`);
        return [vector.x, vector.y, vector.z];
      }
      const matrix = initialMatrices[vertex.initialMatrixIndex];
      vector.applyMatrix4(matrix);
      return [vector.x, vector.y, vector.z];
    })
  );
  geometry.setAttribute("position", new BufferAttribute(vertices, 3));
  const normals = new Float32Array(
    geometryData.secondaryVertexList.flatMap((vertex) => [
      vertex.normalX,
      vertex.normalY,
      vertex.normalZ,
    ])
  );
  geometry.setAttribute("normal", new BufferAttribute(normals, 3));
  const uvs = new Float32Array(
    geometryData.secondaryVertexList.flatMap((vertex) => [vertex.u, vertex.v])
  );
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  const textureIdMap = model.modelData.textureMetadata?.texturePairs.map(
    (pair) => pair.textureIndex
  ) ?? [0];
  groupData.forEach((group, index) => {
    geometry.addGroup(
      group.start,
      group.count,
      textureIdMap[secondaryPrimitiveHeaders[index].body.textureIndex ?? 0]
    );
  });
  return geometry;
};

const processPrimitiveHeaders = (
  model: SilentHillModel,
  geometry: BufferGeometry
) => {
  const primitiveHeaders = model.modelData.geometry.primitiveHeaders;
  const geometryData = model.modelData.geometry;
  const primitiveStartIndices = primitiveHeaders
    .map((header) => header.body.primitiveStartIndex)
    .sort((a, b) => a - b);
  const stripIndices = geometryData.triangleIndices.array;
  const lastPrimitiveHeader = primitiveHeaders.at(-1)!.body;
  const triangleCount =
    lastPrimitiveHeader.primitiveStartIndex +
    lastPrimitiveHeader.primitiveLength;
  const { triangleIndices, primitiveVertexSets, groupData } =
    triangleStripToList(stripIndices, primitiveStartIndices, triangleCount);
  geometry.setIndex(triangleIndices);

  const initialMatrices = model.modelData.initialMatrices.map((matrix) =>
    transformationMatrixToMat4(matrix)
  );
  const vertices = new Float32Array(
    geometryData.vertexList.flatMap((vertex, vertexIndex) => {
      const vector = new Vector3(vertex.x, vertex.y, vertex.z);
      let primitiveIndex = 0;
      for (; primitiveIndex < primitiveVertexSets.length; primitiveIndex++) {
        if (primitiveVertexSets[primitiveIndex].has(vertexIndex)) {
          break;
        }
      }
      const header = primitiveHeaders[primitiveIndex];
      if (header === undefined) {
        console.warn(`Unused vertex? Index: ${vertexIndex}`);
        return [vector.x, vector.y, vector.z];
      }
      const boneIndices = header.body.boneIndices;
      const matrix = initialMatrices[boneIndices[vertex.boneIndex0]];
      vector.applyMatrix4(matrix);
      return [vector.x, vector.y, vector.z];
    })
  );
  geometry.setAttribute("position", new BufferAttribute(vertices, 3));
  const uvs = new Float32Array(
    geometryData.vertexList.flatMap((vertex) => [vertex.u, vertex.v])
  );
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  const textureIdMap = model.modelData.textureMetadata?.texturePairs.map(
    (pair) => pair.textureIndex
  ) ?? [0];
  groupData.forEach((group, index) => {
    geometry.addGroup(
      group.start,
      group.count,
      textureIdMap[primitiveHeaders[index].body.textureIndices.array[0] ?? 0]
    );
  });
  return geometry;
};

export const createMaterial = (
  model: SilentHillModel,
  materialType: MaterialType = MaterialView.Textured,
  parameters?: MeshStandardMaterialParameters
): Material | Material[] => {
  let material: Material | Material[];
  let textureMap = defaultDiffuseMap;
  let [width, height] = [128, 128];
  switch (materialType) {
    case MaterialView.Flat: {
      const materialParams = Object.assign(
        {},
        {
          color: parameters?.color ?? 0xff0000,
          side: DoubleSide,
        },
        parameters
      );
      material = new MeshStandardMaterial(materialParams);
      break;
    }
    case MaterialView.Textured: {
      const textureIds = model.modelData.textureMetadata?.mainTextureIds;
      let modelTextures = model.textureData?.textures;
      if (!modelTextures) {
        console.warn("This model has no textures.");
        return createMaterial(model, MaterialView.UV);
      }
      modelTextures = modelTextures.sort(
        (a, b) =>
          textureIds.indexOf(a.textureId) - textureIds.indexOf(b.textureId)
      );
      material = modelTextures.map((texture): MeshStandardMaterial => {
        if (texture !== undefined) {
          const ddsBuffer = new Uint8Array(texture.data);
          [width, height] = [texture.width, texture.height];
          const ddsDataView = new DataView(ddsBuffer.buffer);
          const rgbaData = decodeDXT(
            ddsDataView,
            width,
            height,
            DxtLookup[texture.spriteHeaders[0].format as keyof typeof DxtLookup]
          );
          textureMap = rgbaData;
        }
        const dataTexture = new DataTexture(textureMap, width, height);
        dataTexture.needsUpdate = true;
        const materialParams = Object.assign(
          {},
          {
            map: dataTexture,
            side: DoubleSide,
            transparent: true,
          } as MeshStandardMaterialParameters,
          parameters
        );
        return new MeshStandardMaterial(materialParams);
      });
      break;
    }
    case MaterialView.UV: {
      const texture = new DataTexture(textureMap, width, height);
      texture.needsUpdate = true;
      const materialParams = Object.assign(
        {},
        {
          map: texture,
          side: DoubleSide,
          transparent: true,
        },
        parameters
      );
      material = new MeshStandardMaterial(materialParams);
      material.name = "uv-map";
      break;
    }
  }
  return material;
};

export const DxtLookup = {
  0: "dxt1",
  1: "dxt2",
  2: "dxt3",
  3: "dxt4",
  4: "dxt5",
} as const;

export const createSkeleton = (model: SilentHillModel) => {
  const bones: Bone[] = [];
  const rootBoneIndices: number[] = [];
  const skeletonRepresentation = model.modelData.skeletonTree;
  const initialMatrices = model.modelData.initialMatrices;
  const flipY = new Matrix4();
  flipY.makeScale(1, 1, 1);
  for (let i = 0; i < skeletonRepresentation.length; i++) {
    const parentBoneIndex = skeletonRepresentation[i];
    if (parentBoneIndex === 255) {
      // root bone
      const bone = new Bone();
      bone.applyMatrix4(transformationMatrixToMat4(initialMatrices[i]));
      bone.applyMatrix4(flipY);
      bones.push(bone);
      rootBoneIndices.push(i);
      continue;
    }
    const parentBone = bones[parentBoneIndex];
    if (parentBone === undefined) {
      throw Error("Invalid skeleton tree.");
    }
    const bone = new Bone();
    bone.applyMatrix4(transformationMatrixToMat4(initialMatrices[i]));
    bone.applyMatrix4(
      transformationMatrixToMat4(initialMatrices[parentBoneIndex]).invert()
    );
    parentBone.add(bone);
    bones.push(bone);
  }
  const skeleton = new Skeleton(bones);
  return { skeleton, rootBoneIndices };
};

export const bindSkeletonToGeometry = (
  model: SilentHillModel,
  geometry: BufferGeometry
) => {
  const geometryData = model.modelData.geometry;
  const primitiveHeaders = geometryData.primitiveHeaders;
  const primitiveStartIndices = primitiveHeaders
    .map((header) => header.body.primitiveStartIndex)
    .sort((a, b) => a - b);
  const stripIndices = geometryData.triangleIndices.array;
  const lastPrimitiveHeader = primitiveHeaders.at(-1)!.body;
  const triangleCount =
    lastPrimitiveHeader.primitiveStartIndex +
    lastPrimitiveHeader.primitiveLength;
  const { primitiveVertexSets } = triangleStripToList(
    stripIndices,
    primitiveStartIndices,
    triangleCount
  );

  const boneIndices = geometryData.vertexList.flatMap((vertex, vertexIndex) => {
    let primitiveIndex = 0;
    for (; primitiveIndex < primitiveVertexSets.length; primitiveIndex++) {
      if (primitiveVertexSets[primitiveIndex].has(vertexIndex)) {
        break;
      }
    }
    const header = primitiveHeaders[primitiveIndex];
    if (header === undefined) {
      console.warn(`Unused vertex? Index: ${vertexIndex}`);
      return [0, 0, 0, 0];
    }
    const primitiveBoneIndices = header.body.boneIndices;
    const vertexBoneIndices = [
      vertex.boneIndex0,
      vertex.boneIndex1,
      vertex.boneIndex2,
      vertex.boneIndex3,
    ];
    const bonePairIndicesArray = header.body.bonePairIndices.array;
    const boneLinks = vertexBoneIndices.map((maybeBonePair, index) => {
      if (maybeBonePair > 0 && index > 0 && maybeBonePair !== 255) {
        const bonePairIndex = maybeBonePair - primitiveBoneIndices.length;
        const boneRelationship =
          model.modelData.bonePairs[bonePairIndicesArray[bonePairIndex]];
        if (boneRelationship === undefined) {
          throw Error(
            `Bone pair ${bonePairIndex} was specified,` +
              `but primitive ${primitiveIndex} has ${bonePairIndicesArray.length} pairs!`
          );
        }
        return boneRelationship.child;
      } else {
        return 0;
      }
    });
    return [
      primitiveBoneIndices[vertex.boneIndex0],
      boneLinks[1] ?? 0,
      boneLinks[2] ?? 0,
      boneLinks[3] ?? 0,
    ];
  });
  const boneWeights = geometryData.vertexList.flatMap((vertex) => {
    return [
      vertex.boneWeight0,
      vertex.boneWeight1,
      vertex.boneWeight2,
      vertex.boneWeight3,
    ];
  });
  geometry.setAttribute("skinIndex", new Uint16BufferAttribute(boneIndices, 4));
  geometry.setAttribute(
    "skinWeight",
    new Float32BufferAttribute(boneWeights, 4)
  );
  return { boneIndices, boneWeights };
};

export const bindSkeletonToSecondaryGeometry = (
  model: SilentHillModel,
  geometry: BufferGeometry
) => {
  const geometryData = model.modelData.geometry;
  const boneIndices = geometryData.secondaryVertexList.flatMap((vertex) => [
    vertex.initialMatrixIndex,
    0,
    0,
    0,
  ]);
  const boneWeights = geometryData.secondaryVertexList.flatMap(() => {
    return [1, 0, 0, 0];
  });
  geometry.setAttribute("skinIndex", new Uint16BufferAttribute(boneIndices, 4));
  geometry.setAttribute(
    "skinWeight",
    new Float32BufferAttribute(boneWeights, 4)
  );
  return { boneWeights, boneIndices };
};

export const getMesh = (
  geometry: BufferGeometry,
  material: Material | Material[]
) => {
  return new Mesh(geometry, material);
};

const getDefaultDiffuseMap = () => {
  const width = 128,
    height = 128;
  const size = width * height;
  const data = new Uint8Array(4 * size);
  for (let i = 0; i < size; i++) {
    const stride = i * 4,
      a1 = i / size,
      a2 = (i % width) / width;
    data[stride] = Math.floor(255 * a1);
    data[stride + 1] = 255 - Math.floor(255 * a1);
    data[stride + 2] = Math.floor(255 * a2);
    data[stride + 3] = 255;
  }
  return data;
};
const defaultDiffuseMap = getDefaultDiffuseMap();
