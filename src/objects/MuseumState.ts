import {
  chr2Folders,
  chrFolders,
  constructIndex,
  destructureIndex,
  fileStructure,
  MuseumFile,
  travelAlongLevel,
} from "../files";
import { toggleWithBackground, onConfirm } from "../modals";
import { MaterialView } from "../model";
import { exportModel } from "../utils";
import { Object3D, Vector3 } from "three";

export const START_INDEX = constructIndex("chr", "favorites", "org.mdl");
const START_PATH_ARRAY = destructureIndex(START_INDEX);
export const FilePath = {
  RootFolder: 0,
  Folder: 1,
  File: 2,
} as const;

export default class MuseumState {
  public constructor() {}

  private fileIndex = START_INDEX;
  private filePathArray = START_PATH_ARRAY;
  private glVersion = 2;
  private currentObject?: Object3D;
  private onUpdate?: () => void;

  public setFileIndex(index: number) {
    this.fileIndex = index;
    this.computeFilePathArray();
    this.onUpdate?.();
  }

  public getFileIndex() {
    return this.fileIndex;
  }

  private computeFilePathArray() {
    this.filePathArray = destructureIndex(this.fileIndex);
  }

  public get rootFolder() {
    return this.filePathArray[FilePath.RootFolder];
  }

  public set rootFolder(rootFolder) {
    const newIndex = constructIndex(rootFolder);
    this.setFileIndex(newIndex + FilePath.File);
  }

  public get folder() {
    const folder = this.filePathArray[FilePath.Folder];
    return folder;
  }

  public set folder(folder) {
    const newIndex = constructIndex(this.rootFolder, folder);
    this.setFileIndex(newIndex + FilePath.Folder);
  }

  public get file() {
    return this.filePathArray[FilePath.File];
  }

  public set file(filename) {
    const newIndex = constructIndex(this.rootFolder, this.folder, filename);
    this.setFileIndex(newIndex);
  }

  public nextFile() {
    const newIndex = travelAlongLevel(
      this.fileIndex,
      FilePath.File,
      1,
      this.params["Lock To Folder"]
    );
    this.setFileIndex(newIndex);
  }

  public previousFile() {
    const newIndex = travelAlongLevel(
      this.fileIndex,
      FilePath.File,
      -1,
      this.params["Lock To Folder"]
    );
    this.setFileIndex(newIndex);
  }

  public nextFolder() {
    const newIndex = travelAlongLevel(this.fileIndex, FilePath.Folder, -1);
    this.setFileIndex(newIndex + FilePath.Folder);
  }

  public previousFolder() {
    const newIndex = travelAlongLevel(this.fileIndex, FilePath.Folder, 1);
    this.setFileIndex(newIndex + FilePath.Folder);
  }

  public nextRootFolder() {
    const newIndex = travelAlongLevel(this.fileIndex, FilePath.RootFolder, 1);
    this.setFileIndex(newIndex + FilePath.File);
  }

  public previousRootFolder() {
    const newIndex = travelAlongLevel(this.fileIndex, FilePath.RootFolder, -1);
    this.setFileIndex(newIndex + FilePath.File);
  }

  public getPossibleFilenames() {
    const folders = fileStructure[this.rootFolder];
    return folders[this.folder as keyof typeof folders];
  }

  public getPossibleFolders() {
    return this.rootFolder === "chr" ? chrFolders : chr2Folders;
  }

  public hasAcceptedContentWarning() {
    return !!localStorage.getItem("contentWarningAccepted");
  }

  public setOnUpdate(onUpdate: () => void) {
    this.onUpdate = onUpdate;
  }

  public setGlVersion(glVersion: 0 | 1 | 2) {
    this.glVersion = glVersion;
  }

  public getGlVersion() {
    return this.glVersion;
  }

  public setCurrentObject(object: Object3D) {
    this.currentObject = object;
  }

  public params = {
    Scenario: "Main Scenario",
    Folder: this.folder,
    Filename: this.file,
    "Lock To Folder": true,
    "Next File": () => this.nextFile(),
    "Previous File": () => this.previousFile(),
    "Save Image": () => (this.params["Render This Frame"] = true),
    "Export to GLTF": () => {
      const object = this.currentObject;
      if (object === undefined) {
        return;
      }
      toggleWithBackground("disclaimerModal", true);
      onConfirm(() => {
        exportModel(object, this.file);
        toggleWithBackground("blenderExportModal", true);
      });
    },

    "Auto-Rotate": true,
    "Bone Controls": false,
    "Controls Mode": "rotate",
    "Selected Bone": 0,

    "Render Primary": true,
    "Render Extra": true,
    "Skeleton Mode": this.glVersion === 2,
    "Visualize Skeleton": false,
    "Visualize Normals": false,

    "Render Mode": MaterialView.Textured as string,
    "Ambient Color": 0xffffff,
    "Ambient Intensity": 1.0,
    Transparency: true,
    "Alpha Test": 0.01,
    "Invert Alpha": false,
    "Model Opacity": 1.0,
    "Render Side": "FrontSide",

    "Render This Frame": false,
    "Content Warning Accepted": this.hasAcceptedContentWarning(),
  };
}

export const clientState = new MuseumState();

/**
 * Preferred clientState.params for models that are best viewed with certain settings.
 * May be needed as certain properties haven't been reverse-engineered yet.
 */
export const preferredParams: {
  [File in MuseumFile]?: Partial<typeof clientState.params>;
} = {
  "nef.mdl": {
    "Render Side": "DoubleSide",
  },
  "i_radio.mdl": {
    Transparency: false,
    "Alpha Test": 0,
  },
  "noa.mdl": {
    "Render Side": "DoubleSide",
  },
  "nor.mdl": {
    "Render Side": "DoubleSide",
  },
  "rhhh_mar.mdl": {
    "Render Side": "BackSide",
  },
  "x_keygate.mdl": {
    "Invert Alpha": true,
  },
  "x_ringcopper.mdl": {
    "Alpha Test": 0,
  },
  "x_lighter.mdl": {
    "Alpha Test": 0,
  },
  "rlxx_mar.mdl": {
    "Render Side": "BackSide",
  },
  "rwp_colt.mdl": {
    "Render Side": "BackSide",
  },
};
export const cameraFix: {
  [File in MuseumFile]?: {
    cameraPosition: Vector3;
    controlsTarget: Vector3;
  };
} = {
  "bos.mdl": {
    controlsTarget: new Vector3(
      -58.17799245068679,
      -626.735509717446,
      -169.58143575897614
    ),
    cameraPosition: new Vector3(
      12.92254067950762,
      -573.3331804019333,
      943.5324793077427
    ),
  },
};
export const defaultParams = Object.assign(
  {},
  ...Object.values(preferredParams).map((o) =>
    Object.fromEntries(
      Object.keys(o).map((k) => [
        k,
        clientState.params[k as keyof typeof clientState.params],
      ])
    )
  )
);
