import type { TypedArray } from "../../types/common";
import StripifierFactory, {
  MainModule as StripifierModule,
  RuntimeExports as StripifierRuntimeExports,
} from "./dist/stripifier.js";

export default class Stripifier {
  private static stripifier: StripifierInstance;

  public static getInstance() {
    if (!Stripifier.stripifier) {
      Stripifier.setInstance(new StripifierInstance());
    }
    return Stripifier.stripifier;
  }

  private static setInstance(instance: StripifierInstance) {
    this.stripifier = instance;
  }
}

class StripifierInstance {
  public module: Promise<StripifierModule>;

  public constructor() {
    this.module = StripifierFactory();
  }

  private transferNumberArrayToHeap<T extends TypedArray>(
    Module: StripifierModule,
    typedArray: T,
    heap: keyof typeof StripifierRuntimeExports
  ) {
    const heapPointer = Module._malloc(
      typedArray.length * typedArray.BYTES_PER_ELEMENT
    );
    Module[heap].set(typedArray, heapPointer >> 2);
    return heapPointer;
  }

  public async triangleStripFromList(array: number[], vertCount: number) {
    const main = await this.module;
    const pointer = this.transferNumberArrayToHeap(
      main,
      Uint32Array.from(array),
      "HEAPU32"
    );
    try {
      const returnPointer = main.ccall(
        "get_triangle_strip",
        "number",
        ["number", "number", "number"],
        [pointer, array.length, vertCount]
      );
      const count = main.ccall("get_return_size", "number");
      const result = new Uint32Array(main.HEAP32.buffer, returnPointer, count);
      main._free(returnPointer);
      main._free(pointer);
      return result;
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
