import { isSafari, isModuleWorkerSupported } from "../utils";
import logger from "./Logger";

export class WriteWorker {
  private static worker?: Worker;
  private static supported?: boolean;

  public static isSupported() {
    if (WriteWorker.supported === undefined) {
      const offscreenSupported =
        typeof HTMLCanvasElement.prototype.transferControlToOffscreen !==
        "undefined";
      WriteWorker.supported =
        !isSafari() && isModuleWorkerSupported() && offscreenSupported;
    }
    return WriteWorker.supported;
  }

  private static createWorker() {
    logger.debug("Initializing worker...");
    const worker = new Worker(new URL("../write-worker.ts", import.meta.url), {
      type: "module",
    });
    WriteWorker.worker = worker;
    let canvas: HTMLCanvasElement | OffscreenCanvas =
      document.createElement("canvas");
    canvas = canvas.transferControlToOffscreen();
    worker.postMessage({ type: "init", body: { offscreenCanvas: canvas } }, [
      canvas,
    ]);
  }

  public static getWorker() {
    if (
      WriteWorker.isSupported() &&
      WriteWorker.worker === undefined &&
      typeof document !== "undefined"
    ) {
      WriteWorker.createWorker();
    }
    return WriteWorker.worker;
  }
}
