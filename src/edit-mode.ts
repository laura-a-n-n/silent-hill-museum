import GUI from "lil-gui";
import { clientState } from "./objects/MuseumState";
import TextureViewer from "./objects/TextureViewer";
import { applyUpdate, fileCallback, sharedSerializationData } from "./write";
import logger from "./objects/Logger";
import { editorState } from "./objects/EditorState";
import {
  Autoscale,
  BonemapMethod,
  BonemapType,
  SilentHillModelTypes,
} from "./objects/SerializableModel";

export const consoleGui = new GUI({
  title: "Output",
  autoPlace: false,
});

export default class EditMode {
  public editorGui: GUI;
  public sidebarButtonsContainer: HTMLDivElement;
  public bonemapTextarea: HTMLTextAreaElement;

  public constructor() {
    const sidebar = document.getElementById("sidebar");
    if (!(sidebar instanceof HTMLDivElement)) {
      throw Error("Could not find sidebar div element!");
    }
    const sidebarButtonsContainer = sidebar.querySelector(".sidebar-buttons");
    if (!(sidebarButtonsContainer instanceof HTMLDivElement)) {
      throw Error("Could not find sidebar buttons element!");
    }
    const filepicker: HTMLInputElement | null =
      document.querySelector(".filepicker");
    filepicker?.addEventListener("change", () => {
      const file = filepicker?.files?.[0];
      if (file) {
        fileCallback(file);
      }
    });
    const editorGui = new GUI({ container: sidebar, title: "Options" });
    const exportButton = editorGui.add(
      {
        "Export Current": async () => {
          const object = clientState.getCurrentObject();
          if (!object) {
            return;
          }
          clientState.requestSave();
          applyUpdate();
        },
      },
      "Export Current"
    );
    const resetModel = async () => {
      const file = clientState.getCurrentFile();
      if (!file) {
        return;
      }
      editorState.resetSerializationState();
      fileCallback(file);
    };
    const resetButton = editorGui.add(
      {
        "Reset Model": resetModel,
      },
      "Reset Model"
    );
    sidebarButtonsContainer.appendChild(exportButton.domElement);
    sidebarButtonsContainer.appendChild(resetButton.domElement);
    editorGui
      .add(
        editorState.editorParams,
        "Model Type",
        Object.values(SilentHillModelTypes)
      )
      .listen()
      .onFinishChange(() => editorState.updateSerializationParams());
    editorGui
      .add(editorState.editorParams, "Auto-Scale", Object.values(Autoscale))
      .onFinishChange(() => this.updateAndReset());
    editorGui
      .add(
        editorState.editorParams,
        "Bonemap Method",
        Object.values(BonemapMethod)
      )
      .onFinishChange((value: BonemapType) => {
        if (value === BonemapMethod.Manual) {
          bonemapTextarea.style.display = "block";
          bonemapButton.style.display = "block";
        } else {
          bonemapTextarea.style.display = "none";
          bonemapButton.style.display = "none";
        }
        applyUpdate();
      });
    editorGui.add(editorState.editorParams, "Collapse Target", 0, 255, 1);
    editorGui
      .add(editorState.editorParams, "Flip Y")
      .onFinishChange(() => this.updateAndReset());
    editorGui
      .add(editorState.editorParams, "Show Original")
      .onFinishChange((show: boolean) => {
        editorState.serializerNeedsUpdate()
          ? applyUpdate()
          : clientState.triggerUpdate();
        if (show) {
          originalModelControls.show();
        } else {
          originalModelControls.hide();
        }
      });
    editorGui.add(editorState.editorParams, "Model Controls");
    editorGui.add(
      editorState.editorParams,
      "Rotation Step",
      Number.MIN_VALUE,
      180
    );
    const originalModelControls = editorGui
      .add(editorState.editorParams, "Base Model Controls")
      .onFinishChange(() =>
        editorState.serializerNeedsUpdate()
          ? applyUpdate()
          : clientState.triggerUpdate()
      )
      .hide();

    const bonemapTextarea = document.createElement("textarea");
    bonemapTextarea.classList.add("bonemap-textarea");
    bonemapTextarea.value = JSON.stringify({ 0: 0 }, null, 4);
    bonemapTextarea.addEventListener("keydown", (event) =>
      event.stopPropagation()
    );
    bonemapTextarea.style.display = "none";
    this.bonemapTextarea = bonemapTextarea;
    editorState.setOnUpdate(() => this.updateBonemap());

    const bonemapButton = document.createElement("button");
    bonemapButton.classList.add("bonemap-button");
    bonemapButton.innerHTML = "OK";
    bonemapButton.style.display = "none";
    bonemapButton.addEventListener("click", () => {
      editorState.updateSerializationParams({
        bonemap: JSON.parse(bonemapTextarea.value),
      });
      applyUpdate();
    });

    editorGui.domElement.appendChild(bonemapTextarea);
    editorGui.domElement.appendChild(bonemapButton);

    this.editorGui = editorGui;
    this.sidebarButtonsContainer = sidebarButtonsContainer;
    this.toggleOptionsIfNeeded();

    const outputLogWrapper = document.querySelector(".output-log-wrapper");
    const outputLog = outputLogWrapper?.querySelector(".output-log");
    if (
      outputLog instanceof HTMLElement &&
      outputLogWrapper instanceof HTMLElement
    ) {
      outputLogWrapper.appendChild(consoleGui.domElement);
      consoleGui.$children.appendChild(outputLog);
      consoleGui.close();
      logger.addPipe(
        {
          onMessage: (level, message, ...optionalParams) => {
            const sanitizedMessage = [message, ...optionalParams]
              .filter((value) => typeof value !== "object")
              .join(" ");
            const levelText = `[${level}]`;
            if (sanitizedMessage) {
              outputLog.innerHTML += `<p class="${level}">${levelText} ${sanitizedMessage}</p>`;
            }
            outputLog.scrollTop = outputLog.scrollHeight;
          },
          clear: () => (outputLog.innerHTML = ""),
          allowedLevels: ["debug", "error", "warn", "info"],
          enabled: false,
        },
        "editModeLog"
      );
    } else {
      throw Error("Did not find output log!");
    }

    const textureViewerGui = new GUI({
      container: sidebar,
      title: "Texture Viewer",
    });
    textureViewerGui.$children.remove();
    textureViewerGui.domElement.classList.add(
      "root",
      "texture-viewer-container"
    );
    const textureViewerContentDiv = document.createElement("div");
    textureViewerContentDiv.classList.add("texture-viewer", "content");
    textureViewerGui.domElement.appendChild(textureViewerContentDiv);
    const textureViewer = new TextureViewer(sidebar);
    clientState.setTextureViewer(textureViewer);
  }

  public updateBonemap() {
    this.bonemapTextarea.value = JSON.stringify(
      sharedSerializationData.bonemap,
      null,
      4
    );
  }

  public toggleOptionsIfNeeded() {
    if (!clientState.getCustomModel()) {
      this.sidebarButtonsContainer.style.display = "none";
      this.editorGui.hide();
    } else {
      this.sidebarButtonsContainer.style.display = "block";
      this.editorGui.show();
    }
  }

  public updateAndReset() {
    const file = clientState.getCurrentFile();
    if (!file) {
      return;
    }
    editorState.updateSerializationParams();
    editorState.clearTransform();
    fileCallback(file);
  }
}
