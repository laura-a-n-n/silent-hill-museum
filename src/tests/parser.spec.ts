import path from "path";
import { expect, test } from "vitest";
import { loadModel } from "../load";
import { globby } from "globby";
import SilentHillModel from "../kaitai/Mdl";
import { transformationMatrixToMat4 } from "../utils";
import { BufferGeometry, Skeleton } from "three";
import {
  bindSkeletonToGeometry,
  bindSkeletonToTransparentGeometry,
  createMaterial,
  createSkeleton,
} from "../model";
import logger from "../objects/Logger";

const QUICK = process.env.QUICK;
const VERBOSE = true;

const modelCache: {
  [filename: string]: {
    model: SilentHillModel | undefined;
    skeleton?: Skeleton;
  };
} = {};
const loadModelWithCache = async (file: string) => {
  if (modelCache[file]) {
    return modelCache[file];
  }

  const model = await loadModel(file);
  modelCache[file] = { model };
  return model;
};

test("should parse all models without error", async () => {
  const inputDir = path.join(__dirname, "../../public/mdl");
  const files = await globby([`${inputDir}/**/*.mdl`]);

  for (const file of files) {
    if (file.endsWith("_st.mdl")) {
      // unknown, skip
      continue;
    }
    if (VERBOSE) {
      logger.info("Parsing", file);
    }
    const model = loadModelWithCache(file);
    await expect(model).resolves.not.toThrow();
  }
});

test("should handle empty files correctly", async () => {
  for (const file in modelCache) {
    const fileContent = await fetch(file);

    const { model } = modelCache[file];
    if ((await fileContent.arrayBuffer()).byteLength === 0) {
      expect(model).toBeUndefined();
      return;
    }
    expect(model).toBeDefined();
  }
});

test("should detect important properties", () => {
  for (const file in modelCache) {
    const { model } = modelCache[file];
    if (model === undefined) {
      continue;
    }
    expect(model?.header).toBeDefined();
    expect(model?.modelData).toBeDefined();
    expect(model?.header.characterId > 0);
  }
});

test("should have orthogonal bone matrices", () => {
  for (const file in modelCache) {
    const { model } = modelCache[file];
    if (model === undefined) {
      continue;
    }
    for (const initialMatrix of model.modelData.initialMatrices) {
      const mat4 = transformationMatrixToMat4(initialMatrix);
      expect(mat4.determinant() - 1.0 < 0.001);
    }
  }
});

test("should have orthogonal relative bone transformations", () => {
  for (const file in modelCache) {
    const { model } = modelCache[file];
    if (model === undefined) {
      continue;
    }
    for (const parentChildMatrix of model.modelData.defaultPcmsMatrices) {
      const mat4 = transformationMatrixToMat4(parentChildMatrix);
      expect(mat4.determinant() - 1.0 < 0.001);
    }
  }
});

test("should have an acyclic bone graph", () => {
  for (const file in modelCache) {
    const { model } = modelCache[file];
    if (model === undefined) {
      continue;
    }
    const skeletonTree = model.modelData.skeletonTree;
    // Ensure that parents are always defined before children
    for (let childBone = 0; childBone < skeletonTree.length; childBone++) {
      const parentBone = skeletonTree[childBone];
      // Note that 255 designates root bone
      if (parentBone !== 255) {
        expect(parentBone).toBeLessThan(childBone);
      }
    }
  }
});

test("should have well-defined bone pairs", () => {
  for (const file in modelCache) {
    const { model } = modelCache[file];
    if (model === undefined) {
      continue;
    }
    const boneCount = model.modelData.boneCount;
    // Ensure that skeleton pairs are for defined bones
    model.modelData.bonePairs.forEach((pair) => {
      expect(pair.parent).toBeLessThan(boneCount);
      expect(pair.child).toBeLessThan(boneCount);
    });
  }
});

test("should successfully build skeletons", () => {
  for (const file in modelCache) {
    const modelWrapper = modelCache[file];
    if (modelWrapper.model === undefined) {
      continue;
    }
    const { skeleton } = createSkeleton(modelWrapper.model);
    modelWrapper.skeleton = skeleton;
    expect(skeleton).toBeDefined();
  }
});

test("should recognize unique texture identifiers", () => {
  const allTextureIds: number[] = [];
  const allSpriteIds: number[] = [];
  const textureCounts: number[] = [];
  const textureToSpriteMap: {
    [textureId: number]: { array: number[]; filename: string };
  } = {};
  for (const file in modelCache) {
    const { model } = modelCache[file];
    if (model === undefined) {
      continue;
    }

    // model may not have any textures; check first
    textureCounts.push(model.header.textureCount);
    const textureMetadata = model.modelData.textureMetadata;
    if (textureMetadata === undefined) {
      expect(model.header.textureCount).toStrictEqual(0);
      continue;
    }

    // model has textures, record relevant ids
    const textureIds = textureMetadata.mainTextureIds;
    allTextureIds.push(...textureIds);
    let skipSprites = false;
    for (const textureId of textureIds) {
      if (textureToSpriteMap[textureId] !== undefined) {
        // expect this to be a reused texture
        // we can do this by assuming that the second-to-last item in the
        // filename split is a folder name, and expecting this folder name
        // to match that of the model where this texture was loaded
        const thisFolderName = file.split("/").at(-2);
        const originalFolderName = file.split("/").at(-2);
        expect(thisFolderName).toEqual(originalFolderName);
        skipSprites = true;
        continue;
      }
      expect(textureToSpriteMap[textureId]).toBeUndefined();
    }
    if (skipSprites) {
      continue;
    }
    for (const pair of textureMetadata.texturePairs) {
      const textureId = textureIds[pair.textureIndex];
      textureToSpriteMap[textureId] ??= { array: [], filename: file };
      textureToSpriteMap[textureId].array.push(pair.spriteId);
      allSpriteIds.push(pair.spriteId);
    }
  }
  logger.debug("Maximum texture count", Math.max(...textureCounts));
  logger.debug("Minimum texture ID", Math.min(...allTextureIds));
  logger.debug("Maximum texture ID", Math.max(...allTextureIds));
  logger.debug("Minimum sprite ID", Math.min(...allSpriteIds));
  logger.debug("Maximum sprite ID", Math.max(...allSpriteIds));
  logger.debug(textureToSpriteMap);
});

if (!QUICK) {
  test("should be able to bind skeletons to geometry", () => {
    for (const file in modelCache) {
      const { model } = modelCache[file];
      if (model === undefined) {
        continue;
      }
      if (model.modelData.primitiveHeadersCount > 0) {
        const geometry = new BufferGeometry();
        bindSkeletonToGeometry(model, geometry);
        expect(geometry.getAttribute("skinIndex").array.length).toBeGreaterThan(
          0
        );
        expect(
          geometry.getAttribute("skinWeight").array.length
        ).toBeGreaterThan(0);
        geometry.dispose();
      }
      if (model.modelData.transparentPrimitiveHeadersCount > 0) {
        const geometry = new BufferGeometry();
        bindSkeletonToTransparentGeometry(model, geometry);
        expect(geometry.getAttribute("skinIndex").array.length).toBeGreaterThan(
          0
        );
        expect(
          geometry.getAttribute("skinWeight").array.length
        ).toBeGreaterThan(0);
        geometry.dispose();
      }
    }
  });

  test("should be able to create materials", () => {
    for (const file in modelCache) {
      const { model } = modelCache[file];
      if (model === undefined) {
        continue;
      }
      if (model.textureData?.textures) {
        const material = createMaterial(model);
        expect(material).toBeDefined();
      }
    }
  });
}
