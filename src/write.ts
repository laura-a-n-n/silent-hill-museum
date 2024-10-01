import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { fetchRawBytes, loadModelFromBytes } from "./load";
import { clientState } from "./objects/MuseumState";
import { acceptFileDrop, arrayBufferToBase64 } from "./utils";
import { Matrix4, Mesh, Object3D } from "three";
import logger, { LogLevel } from "./objects/Logger";
import SerializableModel, {
  ModelParams,
  SendToShared,
} from "./objects/SerializableModel";
import ImageLibrary from "./objects/ImageLibrary";
import SilentHillModel from "./kaitai/Mdl";
import KaitaiStream from "./kaitai/runtime/KaitaiStream";
import type {
  CreationPayload,
  ModelPropertyDiff,
  WorkerMessage,
} from "./write-worker";
import { WriteWorker } from "./objects/WriteWorker";
import { editorState } from "./objects/EditorState";

/**
 * Any data that we need to share with SerializableModel, that would otherwise
 * be difficult to pass over.
 */
export const sharedSerializationData: SharedSerializationData = {};

export type SharedSerializationData = {
  appliedTransform?: Matrix4;
  bonemap?: Bonemap;
  materialIndices?: number[];
  textureIndices?: number[];
};
export type Bonemap = Record<number, number>;

/**
 * The ImageLibrary used when module workers aren't supported.
 * Otherwise, the library instance lives on the worker thread.
 */
let vanillaImageLibrary: ImageLibrary;

const gltfSerializationWorker = (message: WorkerMessage) => {
  if (message.type === "init") {
    // we shouldn't really get here, this is a typechecking thing
    WriteWorker.getWorker();
    return;
  }

  const writeWorker = WriteWorker.getWorker();
  if (!writeWorker) {
    throw new Error("Attempted to call worker in unsupported context.");
  }
  logger.debug("Calling worker...");
  writeWorker.postMessage(
    message,
    message.type === "create" ? [message.body.bytes, message.body.baseFile] : []
  );
  writeWorker.onmessage = (event) => {
    const { log, logLevel, output, error, sharedData } = event.data;
    if (log && logLevel) {
      logger[logLevel as LogLevel]?.(log);
    } else if (error) {
      logger.error("Error during serialization:", error.message, error);
      logger.error("Import was not successful.");
    } else if (sharedData) {
      logger.debug("Received shared data from worker", sharedData);
      onReceiveSharedData(sharedData);
    } else if (output !== undefined) {
      logger.info("Serialization successful!", output);
      onReceiveModelByteArray(output);
    }
  };
};

export const onReceiveSharedData = (
  sharedData: Partial<SharedSerializationData>
) => {
  logger.debug("Processing shared data...");
  if (
    sharedSerializationData.appliedTransform === undefined &&
    sharedData.appliedTransform
  ) {
    logger.debug("Accumulating transform...");
    sharedSerializationData.appliedTransform = new Matrix4();
    sharedSerializationData.appliedTransform.elements =
      sharedData.appliedTransform.elements;
    editorState.accumulateTransform(sharedSerializationData.appliedTransform);
  }
  if (sharedData.bonemap) {
    logger.debug("Updating bonemap...");
    sharedSerializationData.bonemap = sharedData.bonemap;
    editorState.triggerUpdate();
  }
  if (sharedData.materialIndices && sharedData.textureIndices) {
    sharedSerializationData.materialIndices = sharedData.materialIndices;
    sharedSerializationData.textureIndices = sharedData.textureIndices;
  }
};

export const gltfSerializationVanilla = async (
  payload: CreationPayload,
  diff?: ModelPropertyDiff
) => {
  vanillaImageLibrary ??= new ImageLibrary(document.createElement("canvas"));
  onReceiveModelByteArray(
    await serializeGltfModel(
      payload.bytes,
      payload.baseFile,
      payload.serializationParams,
      vanillaImageLibrary,
      diff,
      onReceiveSharedData
    )
  );
};

export const serializeGltfModel = async (
  bytes: ArrayBuffer,
  baseFile: ArrayBuffer,
  serializationParams: Partial<ModelParams>,
  imageLibrary?: ImageLibrary,
  diff?: ModelPropertyDiff,
  sendToShared?: SendToShared
) => {
  const url = arrayBufferToBase64(bytes, true);

  const loadPromise = new Promise<Uint8Array>((resolve, reject) => {
    new GLTFLoader().load(
      url,
      async (data) => {
        try {
          const children = data.scene.children;
          const crossRefModel = data.scene.children[0];
          if (!crossRefModel) {
            reject(new Error("No cross reference model found."));
            return;
          }
          crossRefModel.updateMatrixWorld();
          if (children.length) {
            // Resolve the promise with the return value of serializeObjects
            serializeObjects(
              data.scene,
              baseFile,
              serializationParams,
              imageLibrary,
              diff,
              sendToShared
            )
              .then(resolve)
              .catch(reject);
          } else {
            reject(new Error("There weren't any children in the scene."));
          }
        } catch (error) {
          reject(error);
        }
      },
      undefined,
      (error) => {
        // Handle any errors during the loading process
        reject(error);
      }
    );
  });

  return loadPromise;
};

export const serializeObjects = async (
  rootObject: Object3D,
  baseFile: ArrayBuffer,
  serializationParams: Partial<ModelParams>,
  imageLibrary?: ImageLibrary,
  diff?: ModelPropertyDiff,
  sendToShared?: SendToShared
) => {
  const meshes: Mesh[] = [];
  let userData: any;
  const searchForMeshes = (object: Object3D) => {
    object.updateMatrix();
    object.updateMatrixWorld(true);
    if (object.userData.silentHillModel) {
      userData = object.userData;
    }
    if (object instanceof Mesh) {
      object.userData = userData ?? {};
      meshes.push(object);
    }
    for (const child of object.children) {
      searchForMeshes(child);
    }
  };
  searchForMeshes(rootObject);
  meshes.forEach((mesh) =>
    mesh.geometry.attributes.position.applyMatrix4(mesh.matrixWorld)
  );
  return writeMeshes(
    meshes,
    baseFile,
    serializationParams,
    imageLibrary,
    diff,
    sendToShared
  );
};

const writeMeshes = async (
  meshes: Mesh[],
  baseFile: ArrayBuffer,
  serializationParams: Partial<ModelParams>,
  imageLibrary?: ImageLibrary,
  diff?: ModelPropertyDiff,
  sendToShared?: SendToShared
) => {
  const model = new SerializableModel(
    baseFile,
    meshes,
    serializationParams,
    diff,
    imageLibrary,
    sendToShared
  );
  await model.createPrimitives();
  return model.write();
};

const readFile = (file: File, callback: (buffer: ArrayBuffer) => void) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    const arrayBuffer = e.target?.result;
    if (arrayBuffer instanceof ArrayBuffer) {
      callback(arrayBuffer);
    }
  };

  reader.onerror = (e) => {
    logger.error("Failed to read file", e);
  };

  reader.readAsArrayBuffer(file);
};

export const readCustomStruct = (buffer: ArrayBuffer) => {
  const model = loadModelFromBytes(buffer);
  model._read();
  clientState.setCustomModel({
    model,
    contents: new Uint8Array(buffer),
  });
};

const onReceiveModelByteArray = (byteArray: Uint8Array) => {
  const model = new SilentHillModel(new KaitaiStream(byteArray.buffer));
  model._read();
  clientState.setCustomModel({ contents: byteArray, model });
};

export const applyUpdate = () => {
  logger.enablePipeIfExists("editModeLog");
  logger.debug("Applying update...");
  const worker = WriteWorker.getWorker();
  editorState.accumulateTransform();
  if (worker) {
    gltfSerializationWorker({
      type: "update",
      body: {
        diff: editorState.getModelPropertyDiff(),
        serializationParams: editorState.getSerializationParams(),
      },
    });
  } else {
    if (!editorState.cachedCreationPayload) {
      logger.warn("An update was attempted, but no model data was cached.");
      return;
    }
    gltfSerializationVanilla(
      editorState.cachedCreationPayload,
      editorState.getModelPropertyDiff()
    );
  }
};

export const fileCallback = (file: File) => {
  if (file.name.endsWith(".gltf") || file.name.endsWith(".glb")) {
    clientState.setMode("edit");
    readFile(file, async (buffer) => {
      clientState.setCurrentFile(file);

      logger.enablePipeIfExists("editModeLog");
      const payload: CreationPayload = {
        bytes: buffer,
        baseFile: await fetchRawBytes(clientState.fullPath),
        serializationParams: editorState.getSerializationParams(),
      };
      if (WriteWorker.isSupported()) {
        gltfSerializationWorker({ type: "create", body: payload });
      } else {
        gltfSerializationVanilla(payload);
        editorState.cachedCreationPayload = payload;
      }
    });
    return;
  } else if (!file.name.endsWith(".mdl")) {
    throw Error("Not a mdl!");
  }
  readFile(file, readCustomStruct);
};

export const acceptModelDrop = (appContainer: HTMLDivElement) =>
  acceptFileDrop(appContainer, fileCallback);
