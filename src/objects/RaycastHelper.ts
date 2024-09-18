import { Camera, Object3D, Raycaster, Vector2, WebGLRenderer } from "three";

export default class RaycastHelper {
  private raycaster: Raycaster;
  private ndcMouseCoords: Vector2 = new Vector2();
  private renderer: WebGLRenderer;
  private camera: Camera;

  public constructor(renderer: WebGLRenderer, camera: Camera) {
    this.raycaster = new Raycaster();
    this.renderer = renderer;
    this.camera = camera;
  }

  public get size() {
    const rendererSize = new Vector2();
    return this.renderer.getSize(rendererSize);
  }

  private updateFromMouseEvent(event: MouseEvent) {
    const { width, height } = this.size;
    this.ndcMouseCoords.x = (event.clientX / width) * 2 - 1;
    this.ndcMouseCoords.y = -(event.clientY / height) * 2 + 1;
  }

  public cast(event: MouseEvent, objectList: (Object3D | unknown)[]) {
    const raycaster = this.raycaster;
    this.updateFromMouseEvent(event);
    raycaster.setFromCamera(this.ndcMouseCoords, this.camera);
    return raycaster.intersectObjects(
      objectList.filter((object) => object instanceof Object3D)
    );
  }
}
