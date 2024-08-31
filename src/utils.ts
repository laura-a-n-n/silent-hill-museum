import {
  BackSide,
  Box3,
  Color,
  DoubleSide,
  FrontSide,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Object3DEventMap,
  PerspectiveCamera,
  PointLight,
  SphereGeometry,
  Vector3,
} from "three";
import { GLTFExporter, OrbitControls } from "three/examples/jsm/Addons.js";
import { TransformationMatrix } from "./types/Mdl";
import logger from "./objects/Logger";

export const RenderSideMap = {
  DoubleSide,
  FrontSide,
  BackSide,
};

/**
 * Gives a remainder that is never negative.
 * @param n dividend
 * @param m divisor
 * @returns nonnegative-definite remainder
 */
export const mod = (n: number, m: number) => {
  return ((n % m) + m) % m;
};

export const findLastNotExceeding = (
  array: readonly number[],
  target: number
) => {
  let i = 0;
  for (; i < array.length; i++) {
    if (array[i] > target) {
      break;
    }
  }
  return { value: array[i - 1], index: i - 1 };
};

// Below from https://github.com/mrdoob/js/blob/master/examples/misc_exporter_gltf.html
export const save = (blobOrHref: Blob | string, filename: string) => {
  let link = document.getElementById(
    "__blob-anchor"
  ) as HTMLAnchorElement | null;
  if (!(link instanceof HTMLAnchorElement)) {
    link = document.createElement("a");
    link.id = "__blob-anchor";
    link.style.display = "none";
    document.body.appendChild(link);
  }
  link.href =
    typeof blobOrHref === "string"
      ? blobOrHref
      : URL.createObjectURL(blobOrHref);
  link.download = filename;
  link.click();
};
export const saveString = (text: string, filename: string) => {
  save(new Blob([text], { type: "text/plain" }), filename);
};
export const saveArrayBuffer = (buffer: ArrayBuffer, filename: string) => {
  save(new Blob([buffer], { type: "application/octet-stream" }), filename);
};

export const exportCanvas = (
  container: HTMLElement | null,
  filename: string
) => {
  if (!(container instanceof HTMLElement)) {
    throw Error("Container was not valid");
  }
  const canvas = container.querySelector("canvas");
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw Error("Could not find canvas element!");
  }
  const base64 = canvas.toDataURL();
  save(base64, filename);
};

const exporter = new GLTFExporter();
export function exportModel(object: Object3D, filename: string) {
  exporter.parse(
    object,
    (result) => {
      if (result instanceof ArrayBuffer) {
        saveArrayBuffer(result, `${filename}.glb`);
      } else {
        const output = JSON.stringify(result, null, 2);
        saveString(output, `${filename}.gltf`);
      }
    },
    (error) => {
      logger.warn("Could not export the scene. An error occurred: ", error);
    },
    { onlyVisible: false }
  );
}

export const transformationMatrixToMat4 = (matrix: TransformationMatrix) => {
  return new Matrix4(
    matrix.rotation00,
    matrix.rotation01,
    matrix.rotation02,
    matrix.translationX,
    matrix.rotation10,
    matrix.rotation11,
    matrix.rotation12,
    matrix.translationY,
    matrix.rotation20,
    matrix.rotation21,
    matrix.rotation22,
    matrix.translationZ,
    matrix.pad0,
    matrix.pad1,
    matrix.pad2,
    matrix.translationW
  );
};

export const fitCameraToSelection = (
  camera: PerspectiveCamera,
  controls: OrbitControls,
  selection: Object3D[],
  fitOffset = 1.2
) => {
  const size = new Vector3();
  const center = new Vector3();
  const box = new Box3();
  for (const object of selection) {
    box.expandByObject(object);
  }

  box.getSize(size);
  box.getCenter(center);

  const maxSize = Math.max(size.x, size.y, size.z);
  const fitHeightDistance =
    maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

  const direction = controls.target
    .clone()
    .sub(camera.position)
    .normalize()
    .multiplyScalar(distance);

  controls.maxDistance = distance * 10;
  controls.target.copy(center);

  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();

  camera.position.copy(controls.target).sub(direction);

  controls.update();
};

export const createChristmasLights = (
  object: Object3D,
  numLights = 20,
  radiusOffset = 1.2
) => {
  // Compute the bounding box of the object
  const aabb = new Box3();
  aabb.setFromObject(object);

  // Compute the center and size of the bounding box
  const center = aabb.getCenter(new Vector3());
  const size = aabb.getSize(new Vector3());

  // Define the radius of the circle around the object
  const radius = Math.max(size.x, size.y) * radiusOffset;

  // Create a group to hold the lights and spheres
  const lightGroup = new Group();

  // Array to hold individual lights and spheres for animation
  const lightsAndSpheres: {
    sphere: Mesh<SphereGeometry, MeshBasicMaterial, Object3DEventMap>;
    pointLight: PointLight;
    angle: number;
  }[] = [];

  // Loop to create lights
  for (let i = 0; i < numLights; i++) {
    // Calculate the angle for this light
    const angle = (i / numLights) * Math.PI * 2;

    // Calculate the initial position of the light
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);
    const z = center.z;

    // Create a sphere geometry and material
    const sphereGeometry = new SphereGeometry(size.x * 0, 16, 16);
    const hue = i / numLights;
    const color = new Color();
    color.setHSL(hue, 1.0, 0.5);
    const sphereMaterial = new MeshBasicMaterial({ color: color });

    // Create the sphere mesh
    const sphere = new Mesh(sphereGeometry, sphereMaterial);

    // Set the initial position of the sphere
    sphere.position.set(x, y, z);

    // Create a point light
    const pointLight = new PointLight(color, 100000, 0);
    pointLight.position.set(x, y, z);

    // Add the sphere and light to the group
    lightGroup.add(sphere);
    lightGroup.add(pointLight);

    // Store the sphere and light with their initial angle
    lightsAndSpheres.push({ sphere, pointLight, angle });
  }

  object.add(lightGroup);

  // Animation loop
  const animate = (deltaTime: number) => {
    // Update the angle for each light and sphere
    lightsAndSpheres.forEach((item) => {
      item.angle += deltaTime; // Adjust this value to change the speed of rotation

      // Calculate the new position
      const x = center.x + radius * Math.cos(item.angle);
      const y = center.y + radius * Math.sin(item.angle);

      // Update positions
      item.sphere.position.set(x, y, center.z);
      item.pointLight.position.set(x, y, center.z);
    });
  };

  return animate;
};
