import { Vector3, Quaternion, Matrix4, Object3D } from "three";
import { sharedSerializationData } from "../write";
import type { ModelPropertyDiff, CreationPayload } from "../write-worker";
import {
  ModelParams,
  Autoscale,
  BonemapMethod,
  SilentHillModelTypes,
} from "./SerializableModel";
import { clientState } from "./MuseumState";

export default class EditorState {
  public editorParams = {
    "Model Type": SilentHillModelTypes.BaseModel,
    "Auto-Scale": Autoscale.BoundingBox,
    "Flip Y": false,
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
    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3(1, 1, 1);
    new Matrix4().decompose(position, quaternion, scale);
    const blankDiff = {
      accumulatedTransform: { position, quaternion, scale },
    };
    this.modelPropertyDiff = blankDiff;
    return blankDiff;
  }

  public serializerNeedsUpdate() {
    return this.modelPropertyDiff.transform !== undefined;
  }

  public resetSerializationState() {
    this.initializePropertyDiff();
    sharedSerializationData.appliedTransform = undefined;
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
    };
  }

  public triggerUpdate() {
    this.onUpdate?.();
  }

  public setOnUpdate(onUpdate?: () => void) {
    this.onUpdate = onUpdate;
  }

  public modelPropertyDiff: ModelPropertyDiff = this.initializePropertyDiff();
  public cachedCreationPayload?: CreationPayload;
  public cachedOriginalModel?: Object3D;
}

export const editorState = new EditorState();
