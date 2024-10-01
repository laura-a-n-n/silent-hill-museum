import logger from "./objects/Logger";
import KaitaiStream from "./kaitai/runtime/KaitaiStream";
import SilentHillModel from "./kaitai/Mdl";

export type ModelCache = { [url: string]: SilentHillModel | undefined };
export const modelCache: ModelCache = {};

export const fetchRawBytes = async (url: string): Promise<ArrayBuffer> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not OK: ${response.statusText}`);
    }
    return await response.arrayBuffer();
  } catch (error) {
    logger.error("There was a problem with the fetch operation:", error);
    throw error;
  }
};

export const loadModelFromBytes = (bytes: ArrayBuffer) => {
  const stream = new KaitaiStream(bytes);
  const model = new SilentHillModel(stream);
  return model;
};

export const loadModel = async (url: string) => {
  logger.info(`Attempting to load model ${url}`);
  if (url in modelCache) {
    return modelCache[url];
  }
  if (!url.endsWith(".mdl")) {
    logger.warn("Cannot load files other than .mdl.");
    return undefined;
  }
  const bytes = await fetchRawBytes(url);
  if (bytes.byteLength === 0) {
    logger.warn("File is empty.");
    modelCache[url] = undefined;
    return undefined;
  }
  const model = loadModelFromBytes(bytes);
  model._read();
  modelCache[url] = model;
  return model;
};
