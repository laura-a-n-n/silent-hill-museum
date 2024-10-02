import type { Enum } from "../types/common";
import logger from "./Logger";

type SmoothingQuality = "low" | "medium" | "high";
type ResizeOptions = {
  imageSmoothingQuality: SmoothingQuality;
  materialIndex?: number;
};

export const SmoothingQuality = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
} as const;

const ResizeSignature = {
  DimensionSize: (1 << 10) - 1,
  Smoothing: (1 << 2) - 1,
} as const;
type ResizeSignatureType = Enum<typeof ResizeSignature>;

type ImageLibraryMap = { [imageKey: string]: ImageData };
export type ByteArray = Uint8Array | Uint8ClampedArray;
type ImageData = {
  data?: ByteArray;
  compressed?: ByteArray;
  resized?: ByteArray;
  materialIndex?: number;
  imageSource?: CanvasImageSource;
  resizeSignature?: ResizeSignatureType;
};

export default class ImageLibrary {
  private map: ImageLibraryMap = {};
  private idCounter = 0;

  public canvas: HTMLCanvasElement | OffscreenCanvas;
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  constructor(canvas?: HTMLCanvasElement | OffscreenCanvas) {
    if (!canvas && typeof document === "undefined") {
      throw Error(
        "Provide an offscreen canvas if running in a context without DOM access"
      );
    }
    this.canvas = canvas ?? document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D;
  }

  public releaseCache() {
    this.map = {};
    this.idCounter = 0;
  }

  public registerImage(props?: Partial<ImageData>, overrideCache = false) {
    if (!overrideCache) {
      const found = this.findByProperty(
        props?.materialIndex ?? -1,
        "materialIndex"
      );
      if (found) {
        return this.map[found];
      }
    }
    this.map[this.idCounter++] = props ?? {};
    return props;
  }

  public get(key: string | undefined): ImageData | undefined {
    return key ? this.map[key] : undefined;
  }

  public findByProperty<Property extends keyof ImageData>(
    value: ImageData[Property],
    property?: Property
  ) {
    for (const key in this.map) {
      if (this.map[key][property ?? "data"] === value) {
        return key;
      }
    }
    return undefined;
  }

  private getResizeSignature(
    targetWidth: number,
    targetHeight: number,
    options?: Partial<ResizeOptions>
  ) {
    if (
      targetWidth < 0 ||
      targetWidth >= 1 << 10 ||
      targetHeight < 0 ||
      targetHeight >= 1 << 10
    ) {
      throw new Error("Values out of range");
    }

    let smoothingBits =
      SmoothingQuality[options?.imageSmoothingQuality ?? "none"];

    // Pack the values into a single number
    return (smoothingBits << 20) | (targetHeight << 10) | targetWidth;
  }

  /**
   * Resizes an image source to the specified width and height
   * @param imageSource the image to be resized; can be any canvas image source
   * @param targetWidth desired target width
   * @param targetHeight desired target height
   * @param options.imageSmoothingEnabled enable or disable image smoothing
   * @param options.imageSmoothingQuality smoothing quality
   * @returns a Uint8ClampedArray containing the resized image data
   */
  public resize(
    imageSource: CanvasImageSource,
    targetWidth: number,
    targetHeight: number,
    options?: Partial<ResizeOptions>
  ): ByteArray {
    const signature = this.getResizeSignature(
      targetWidth,
      targetHeight,
      options
    );
    let key;
    for (key in this.map) {
      const entry = this.map[key];
      if (
        !!entry.materialIndex &&
        entry.materialIndex === options?.materialIndex &&
        entry.resizeSignature === signature
      ) {
        break;
      }
    }
    const cached = this.get(key);
    if (cached && cached.resized) {
      logger.debug("Image is already resized");
      return cached.resized;
    }

    const { imageSmoothingQuality } = options ?? {};

    // Set the canvas size to the target dimensions
    this.canvas.width = targetWidth;
    this.canvas.height = targetHeight;

    // Set image smoothing properties
    this.ctx.imageSmoothingEnabled = !!imageSmoothingQuality;
    this.ctx.imageSmoothingQuality = imageSmoothingQuality ?? "medium";

    // Resize image
    this.ctx.drawImage(imageSource, 0, 0, targetWidth, targetHeight);
    const { data } = this.ctx.getImageData(0, 0, targetWidth, targetHeight);

    this.registerImage({
      data,
      resized: data,
      imageSource: imageSource,
      resizeSignature: signature,
      materialIndex: options?.materialIndex,
    });

    return data;
  }
}
