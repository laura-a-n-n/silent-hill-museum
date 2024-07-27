import KaitaiStream from "./types/KaitaiStream";
import SilentHillModel from "./types/Mdl";

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
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
};

export const loadModelFromBytes = (bytes: ArrayBuffer) => {
  const stream = new KaitaiStream(bytes);
  const model = new SilentHillModel(stream);
  return model;
};

export const loadModel = async (url: string) => {
  if (url in modelCache) {
    return modelCache[url];
  }
  if (!url.endsWith(".mdl")) {
    console.warn("Cannot load files other than .mdl.");
    return undefined;
  }
  const bytes = await fetchRawBytes(url);
  if (bytes.byteLength === 0) {
    console.warn("File is empty.");
    modelCache[url] = undefined;
    return undefined;
  }
  const model = loadModelFromBytes(bytes);
  modelCache[url] = model;
  return model;
};
