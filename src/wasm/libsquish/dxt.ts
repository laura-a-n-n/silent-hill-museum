import SquishFactory, { MainModule as SquishModule } from "./dist/libsquish.js";
import SquishFactoryRelaxed, {
  MainModule as SquishModuleRelaxed,
} from "./dist/libsquish_relaxed.js";
import SquishFactoryNoSimd, {
  MainModule as SquishModuleNoSimd,
} from "./dist/libsquish_no_simd.js";

// original JS: https://www.npmjs.com/package/dxt-js

export const SquishFlags = {
  // Use DXT1 compression.
  DXT1: 1 << 0,
  // Use DXT3 compression.
  DXT3: 1 << 1,
  // Use DXT5 compression.
  DXT5: 1 << 2,
  // Use a very slow but very high quality colour compressor.
  ColourIterativeClusterFit: 1 << 8,
  // Use a slow but high quality colour compressor (the default).
  ColourClusterFit: 1 << 3,
  // Use a fast but low quality colour compressor.
  ColourRangeFit: 1 << 4,
  // Use a perceptual metric for colour error (the default).
  ColourMetricPerceptual: 1 << 5,
  // Use a uniform metric for colour error.
  ColourMetricUniform: 1 << 6,
  // Weight the colour by alpha during cluster fit (disabled by default).
  WeightColourByAlpha: 1 << 7,
} as const;
export type SquishFlag = (typeof SquishFlags)[keyof typeof SquishFlags];

export default class Squish {
  private static squish: SquishInstance;

  public static getInstance() {
    if (!Squish.squish) {
      Squish.setInstance(new SquishInstance());
    }
    return Squish.squish;
  }

  private static setInstance(instance: SquishInstance) {
    Squish.squish = instance;
  }
}

/* (module (func (export "_") (param v128))) */
const TEST_SIMD_SUPPORT =
  "AGFzbQEAAAABBQFgAXsAAwIBAAcFAQFfAAAKBAECAAsACgRuYW1lAgMBAAA=";
/* (module (func (export "_") (param v128) local.get 0 i32x4.relaxed_trunc_f32x4_s drop)) */
const TEST_RELAXED_SIMD_SUPPORT =
  "AGFzbQEAAAABBQFgAXsAAwIBAAcFAQFfAAAKCgEIACAA/YECGgsACgRuYW1lAgMBAAA=";

function wasmValidates(base64: string) {
  try {
    const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    new WebAssembly.Module(buffer);
    return true;
  } catch (e) {
    return false;
  }
}

class SquishInstance {
  public module: Promise<
    SquishModule | SquishModuleNoSimd | SquishModuleRelaxed
  >;

  public constructor() {
    const simdSupported = wasmValidates(TEST_SIMD_SUPPORT);
    const relaxedSimdSupported =
      simdSupported && wasmValidates(TEST_RELAXED_SIMD_SUPPORT);
    this.module = relaxedSimdSupported
      ? SquishFactoryRelaxed()
      : simdSupported
      ? SquishFactory()
      : SquishFactoryNoSimd();
  }

  /**
   * Get an emscripten pointer to a typed array.
   */
  private async pointerFromData(sourceData: Uint8Array) {
    const main = await this.module;
    const buf = main._malloc(sourceData.length * 4);
    main.HEAPU8.set(sourceData, buf);
    return buf;
  }

  private async getDataFromPointer(pointer: number, size: number) {
    const main = await this.module;
    return new Uint8Array(main.HEAPU8.buffer, pointer, size).slice();
  }

  public async compress(
    inputData: Uint8Array,
    width: number,
    height: number,
    flags: number
  ) {
    const main = await this.module;
    const getStorageRequirements = main.cwrap(
      "GetStorageRequirements",
      "number",
      ["number", "number", "number"]
    );
    const compressImage = main.cwrap("CompressImage", "void", [
      "number",
      "number",
      "number",
      "number",
      "number",
    ]);
    const source = await this.pointerFromData(inputData);
    const targetSize = getStorageRequirements(width, height, flags);
    const pointer = main._malloc(targetSize);
    compressImage(source, width, height, pointer, flags);
    const out = this.getDataFromPointer(pointer, targetSize);
    main._free(source);
    main._free(pointer);
    return out;
  }

  public async decompress(
    inputData: Uint8Array,
    width: number,
    height: number,
    flags: number
  ) {
    const main = await this.module;
    const decompressImage = main.cwrap("DecompressImage", "void", [
      "number",
      "number",
      "number",
      "number",
      "number",
    ]);
    const source = await this.pointerFromData(inputData);
    const targetSize = width * height;
    const pointer = main._malloc(targetSize);
    decompressImage(pointer, width, height, source, flags);
    const out = this.getDataFromPointer(pointer, targetSize);
    main._free(source);
    main._free(pointer);
    return out;
  }
}
