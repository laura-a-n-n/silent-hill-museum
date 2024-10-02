import { Vector3, Quaternion, Matrix4, Object3D } from "three";
import { applyUpdate, sharedSerializationData } from "../write";
import type {
  ModelPropertyDiff,
  CreationPayload,
  TextureInfo,
} from "../write-worker";
import {
  ModelParams,
  Autoscale,
  BonemapMethod,
  SilentHillModelTypes,
} from "./SerializableModel";
import { clientState } from "./MuseumState";
import logger from "./Logger";

export default class EditorState {
  public editorParams = {
    "Model Type": SilentHillModelTypes.BaseModel,
    "Auto-Scale": Autoscale.BoundingBox,
    "Flip Y": false,
    "Transparent Parts": true,
    "Bonemap Method": BonemapMethod["Collapse"],
    "Collapse Target": 0,
    "Model Scale": 1,
    "Model Controls": false,
    "Show Original": false,
    "Base Model Controls": false,
    "Rotation Step": 90,
  };

  private serializationParams: Partial<ModelParams> = {};

  /**
   * Only used for bonemap frontend at the moment.
   */
  private onUpdate?: () => void;

  public getSerializationParams() {
    return this.updateSerializationParams({
      modelType:
        clientState.file.startsWith("r") && clientState.file !== "red.mdl"
          ? SilentHillModelTypes.RModel
          : this.editorParams["Model Type"],
      backfaceCulling: clientState.uiParams["Render Side"] !== "DoubleSide",
      materialIndices: sharedSerializationData.materialIndices,
      textureIndices: sharedSerializationData.textureIndices,
      autoscale: this.editorParams["Auto-Scale"],
      flipY: this.editorParams["Flip Y"],
      bonemapType: this.editorParams["Bonemap Method"],
      bonemap: sharedSerializationData.bonemap,
      bonemapCollapseTarget: this.editorParams["Collapse Target"],
      renderTransparentPrimitives: clientState.uiParams["Render Transparent"],
    });
  }
  public updateSerializationParams(
    params?: Partial<ModelParams>
  ): Partial<ModelParams> {
    const newParams = params
      ? Object.assign(this.serializationParams, params)
      : this.getSerializationParams();
    if (this.cachedCreationPayload) {
      this.cachedCreationPayload.serializationParams = newParams;
    }
    return newParams;
  }

  public initializePropertyDiff(): ModelPropertyDiff {
    const blankDiff = {
      accumulatedTransform: this.getInitialAccumulatedTransform(),
    };
    this.modelPropertyDiff = blankDiff;
    return blankDiff;
  }

  private getInitialAccumulatedTransform() {
    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3(1, 1, 1);
    new Matrix4().decompose(position, quaternion, scale);
    return { position, quaternion, scale };
  }

  public serializerNeedsUpdate() {
    return this.modelPropertyDiff.transform !== undefined;
  }

  public resetSerializationState() {
    this.initializePropertyDiff();
    sharedSerializationData.appliedTransform = undefined;
  }

  public clearTransform() {
    this.modelPropertyDiff.transform = undefined;
    this.modelPropertyDiff.accumulatedTransform =
      this.getInitialAccumulatedTransform();
  }

  public accumulateTransform(transform?: Matrix4) {
    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3(1, 1, 1);
    const matrixToApply = transform ?? this.modelPropertyDiff.transform;
    if (matrixToApply) {
      const currentMatrix = new Matrix4().compose(
        this.modelPropertyDiff.accumulatedTransform.position,
        this.modelPropertyDiff.accumulatedTransform.quaternion,
        this.modelPropertyDiff.accumulatedTransform.scale
      );
      const result = currentMatrix.premultiply(matrixToApply);
      result.decompose(position, quaternion, scale);
      this.modelPropertyDiff.accumulatedTransform.scale = scale;
      this.modelPropertyDiff.accumulatedTransform.quaternion = quaternion;
      this.modelPropertyDiff.accumulatedTransform.position = position;
    }
    if (!transform) {
      this.modelPropertyDiff.transform = undefined;
    }
  }

  public getModelPropertyDiff(): ModelPropertyDiff {
    const accumulatedTransform = this.modelPropertyDiff.accumulatedTransform;
    return {
      transform: this.modelPropertyDiff.transform?.clone(),
      accumulatedTransform: {
        position: accumulatedTransform.position.clone(),
        quaternion: accumulatedTransform.quaternion.clone(),
        scale: accumulatedTransform.scale.clone(),
      },
      textures: this.modelPropertyDiff.textures,
    };
  }

  public triggerUpdate() {
    this.onUpdate?.();
  }

  public setOnUpdate(onUpdate?: () => void) {
    this.onUpdate = onUpdate;
  }

  public async swapTexture(index: number, file: File) {
    if (!file.type.includes("image")) {
      return;
    }
    const promise = new Promise<HTMLImageElement>(async (resolve, reject) => {
      const image = new Image();

      image.src = URL.createObjectURL(file);
      const buffer = await file.arrayBuffer();
      image.onload = async () => {
        const texture: TextureInfo = {
          buffer,
          mime: file.type,
          width: image.width,
          height: image.height,
        };
        this.modelPropertyDiff.textures ??= new Map();
        this.modelPropertyDiff.textures.set(index, texture);
        applyUpdate();
        resolve(image);
      };
      image.onerror = (error) => {
        logger.error(error);
        reject(error);
      };
    });
    return promise;
  }

  public modelPropertyDiff: ModelPropertyDiff = this.initializePropertyDiff();
  public cachedCreationPayload?: CreationPayload;
  public cachedOriginalModel?: Object3D;
}

export const editorState = new EditorState();
