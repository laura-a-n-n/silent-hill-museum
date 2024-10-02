import { Matrix4, Quaternion, Vector3 } from "three";
import logger from "./objects/Logger";
import { ModelParams } from "./objects/SerializableModel";
import { serializeGltfModel } from "./write";
import ImageLibrary from "./objects/ImageLibrary";

/**
 * Type of message body sent to the worker.
 * - `init` is a one-time initialization that sets up the worker.
 * - `create` is used to import a new model.
 * - `update` is to apply changes to an imported model.
 */
export type PayloadType = "init" | "create" | "update";
export type WorkerMessage =
  | { type: "init"; body: InitialPayload }
  | { type: "create"; body: CreationPayload }
  | { type: "update"; body: UpdatePayload };

/**
 * Setup payload to initialize the worker.
 */
export type InitialPayload = {
  offscreenCanvas: OffscreenCanvas;
};

/**
 * Important data needed for a first serialization.
 * These are the main variables for serializing.
 */
export type CreationPayload = {
  bytes: ArrayBuffer;
  baseFile: ArrayBuffer;
  serializationParams: Partial<ModelParams>;
};

/**
 * Data needed to apply an update to an existing model.
 * Contains the diff, which includes any applied transformations,
 * as well as new serialization parameters.
 */
export type UpdatePayload = {
  diff: ModelPropertyDiff;
  serializationParams: Partial<ModelParams>;
};

/**
 * Represents the difference between the imported source model
 * and the result after user edits are applied.
 */
export type ModelPropertyDiff = {
  transform?: Matrix4;
  accumulatedTransform: {
    position: Vector3;
    quaternion: Quaternion;
    scale: Vector3;
  };
  textures?: TextureMap;
};
export type TextureInfo = {
  buffer: ArrayBuffer;
  mime: string;
  width: number;
  height: number;
};
export type TextureMap = Map<number, TextureInfo>;

/**
 * The creation payload is cached and reused to prevent sending
 * large array buffers to the worker multiple times.
 */
let creationPayloadCache: CreationPayload;

/**
 * This offscreen canvas is used for resizing. Workers don't have access
 * to the DOM, so this is transferred from the main thread.
 */
let offscreenCanvas: OffscreenCanvas;

let imageLibrary: ImageLibrary;

const onMessage = async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;
  let creationPayload;
  switch (message.type) {
    case "init":
      offscreenCanvas = message.body.offscreenCanvas;
      imageLibrary = new ImageLibrary(offscreenCanvas);
      return;

    case "create":
      creationPayload = message.body;
      creationPayloadCache = creationPayload;
      imageLibrary.releaseCache();
      break;

    case "update":
      // reuse cache, but update serialization params
      creationPayload = creationPayloadCache;
      creationPayload.serializationParams = message.body.serializationParams;
      break;
  }

  if (creationPayload === undefined) {
    self.postMessage({
      error: new Error("Cannot update a model without creating one first."),
    });
    return;
  }

  const { bytes, baseFile, serializationParams } = creationPayload;

  try {
    logger.disablePipeIfExists("__default");
    createWorkerLog();
    const output = await serializeGltfModel(
      bytes,
      baseFile,
      serializationParams,
      imageLibrary,
      message.type === "update" ? message.body.diff : undefined,
      (sharedData) => self.postMessage({ sharedData })
    );
    self.postMessage({ output });
  } catch (error) {
    self.postMessage({ error });
  }
};

self.onmessage = onMessage;

const createWorkerLog = () => {
  if (logger.hasPipe("workerLog")) {
    return;
  }
  logger.addPipe(
    {
      enabled: true,
      onMessage: (level, message, ...optionalParams) => {
        const allMessages = [message, ...optionalParams];
        const sanitizedValues: string[] = [];
        for (const value of allMessages) {
          if (typeof value !== "object") {
            sanitizedValues.push(value);
          } else if ("message" in value && typeof value.message === "string") {
            sanitizedValues.push(value.message);
          } else if (value.hasOwnProperty("toString")) {
            sanitizedValues.push(value.toString());
          }
        }
        const sanitizedMessage = sanitizedValues.join(" ");
        self.postMessage({ log: sanitizedMessage, logLevel: level });
      },
      allowedLevels: ["debug", "error", "warn", "info"],
    },
    "workerLog"
  );
};
