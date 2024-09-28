import { Camera, Object3D, Scene } from "three";
import { TransformControls } from "three/examples/jsm/Addons.js";

export default class Gizmo {
  private transformControls: TransformControls;
  private onAdded?: () => void;
  private onDrag?: () => void;
  private dragging = false;
  private onStopDrag?: () => void;
  private renderLoop?: (controls: TransformControls) => void;

  public constructor(
    private parent: Scene | Object3D,
    camera: Camera,
    domElement?: HTMLElement,
    properties?: Partial<TransformControls>
  ) {
    const transformControls = new TransformControls(camera, domElement);

    // default properties
    transformControls.size = 0.5;
    transformControls.setSpace("local");

    Object.assign(transformControls, properties);
    this.transformControls = transformControls;
  }

  public getTransformControls() {
    return this.transformControls;
  }

  public setOnAdded(onAdded: () => void) {
    this.onAdded = onAdded;
  }

  public setOnDrag(onDrag: () => void) {
    this.onDrag = onDrag;
  }

  public setOnStopDrag(onStopDrag: () => void) {
    this.onStopDrag = onStopDrag;
  }

  public setRenderLoop(renderLoop: (controls: TransformControls) => void) {
    this.renderLoop = renderLoop;
  }

  public render(condition: boolean, adornee?: Object3D) {
    const transformControls = this.transformControls;
    if (condition && adornee && transformControls.parent === null) {
      transformControls.enabled = true;
      transformControls.attach(adornee);
      this.parent.add(transformControls);
      this.onAdded?.();
    } else if (transformControls.parent && !condition) {
      this.parent.remove(transformControls);
      transformControls.enabled = false;
    } else {
      this.renderLoop?.(this.transformControls);
    }
    if (transformControls.dragging) {
      this.dragging = true;
      this.onDrag?.();
    } else if (this.dragging) {
      this.dragging = false;
      this.onStopDrag?.();
    }
  }
}
