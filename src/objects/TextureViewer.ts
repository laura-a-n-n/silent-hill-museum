import { Material, Mesh, Object3D, Texture } from "three";
import logger from "./Logger";
import { showQuickModal } from "../modals";
import { acceptFileDrop } from "../utils";
import { editorState } from "./EditorState";

export const TextureViewerStates = {
  Inactive: "Inactive",
  Active: "Active",
  Locked: "Locked",
} as const;
export type TextureViewerState =
  (typeof TextureViewerStates)[keyof typeof TextureViewerStates];

export default class TextureViewer {
  private state: TextureViewerState = TextureViewerStates.Inactive;
  private seenMaps: Uint8Array[] = [];
  private contentWindow: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private mouseIsOver = false;
  private firstOpen = true;
  private hoverable = false;

  public constructor(
    private guiWindow: HTMLDivElement,
    private currentObject?: Object3D
  ) {
    this.attachToGuiWindow();
    this.canvas = document.createElement("canvas");
    const contentWindow = guiWindow.querySelector(".texture-viewer.content");
    if (!(contentWindow instanceof HTMLDivElement)) {
      throw Error("Could not find content window.");
    }
    this.contentWindow = contentWindow;
    this.renderTextures();
  }

  public setState(state: TextureViewerState) {
    this.state = state;
    switch (state) {
      case TextureViewerStates.Inactive:
        this.close();
        break;
      case TextureViewerStates.Locked:
        this.open();
        break;
    }
  }

  public isOpen() {
    return this.guiWindow.classList.contains("hover");
  }

  public isFirstOpen() {
    return this.firstOpen;
  }

  public isMouseOver() {
    return this.mouseIsOver;
  }

  public close() {
    if (this.state !== TextureViewerStates.Locked) {
      if (this.guiWindow.classList.contains("hover")) {
        this.firstOpen = false;
        this.guiWindow.classList.remove("hover");
      }
    }
  }

  public open() {
    if (this.state !== TextureViewerStates.Inactive) {
      this.guiWindow.classList.add("hover");
    }
  }

  public attachToGuiWindow() {
    if (!this.hoverable) {
      return;
    }
    document.body.addEventListener("pointermove", (event) => {
      if (event.clientX <= this.guiWindow.clientWidth) {
        this.mouseIsOver = true;
        this.open();
        return;
      }
      this.mouseIsOver = false;
      this.close();
    });
  }

  public reset() {
    this.seenMaps = [];
    this.contentWindow.innerHTML = "";
  }

  public attach(object: Object3D) {
    this.currentObject = object;
    this.renderTextures();
  }

  public renderTextures() {
    this.reset();
    if (!this.currentObject) {
      return;
    }
    this.currentObject.traverse((object) => {
      if (!(object instanceof Mesh)) {
        return;
      }
      const materials: Material[] =
        object.material instanceof Material
          ? [object.material]
          : object.material;
      materials.forEach((material) => {
        if (!("map" in material && material.map instanceof Texture)) {
          return;
        }
        const texture = material.map;
        const { data, width, height } = texture.source.data;
        if (!(data instanceof Uint8Array)) {
          logger.warn("Data was not a Uint8Array.", data);
          return;
        }
        if (this.seenMaps.indexOf(data) >= 0) {
          return;
        }
        const index = this.seenMaps.push(data) - 1;
        const image = this.renderUint8ArrayAsImage(data, width, height);
        acceptFileDrop(image, async (file) => {
          const texture = await editorState.swapTexture(index, file);
          if (texture?.src) {
            image.src = texture?.src;
          }
        });
        this.attachPointerListener(image);
        this.contentWindow.appendChild(image);
      });
    });
  }

  private attachPointerListener(image: HTMLImageElement) {
    image.addEventListener("click", () => {
      showQuickModal(image.outerHTML, "preview-modal");
    });
  }

  private renderUint8ArrayAsImage(
    uint8Array: Uint8Array,
    width: number,
    height: number
  ) {
    const canvas = this.canvas;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const imageData = new ImageData(
      new Uint8ClampedArray(uint8Array),
      width,
      height
    );
    ctx?.putImageData(imageData, 0, 0);
    const img = document.createElement("img");
    img.src = canvas.toDataURL();
    img.alt = "Model texture";
    img.className = "texture-image";
    ctx?.clearRect(0, 0, width, height);
    return img;
  }
}
