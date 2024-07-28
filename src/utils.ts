import {
  Box3,
  Color,
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
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { TransformationMatrix } from "./types/Mdl";

/**
 * Remove degenerate triangles, split by primitives, and convert to
 * triangle list.
 */
export const triangleStripToList = (
  stripIndices: number[],
  primitiveStartIndices: number[],
  triangleCount: number
) => {
  const triangleIndices: number[] = [];
  const primitiveCount = primitiveStartIndices.length;
  const groupData: { start: number; count: number }[] = [
    { start: 0, count: 0 },
  ];
  const primitiveVertexSets: Set<number>[] = [new Set()];
  let index = 2;
  let primitiveIndex = 0;
  let currentIndex = 0;
  let groupIndexCount = 0;
  let triangleOrientation = 0;

  while (index < triangleCount) {
    const [v0, v1, v2] = [
      stripIndices[index - 2],
      stripIndices[index - 1],
      stripIndices[index],
    ];
    if (
      primitiveIndex < primitiveCount &&
      primitiveStartIndices[primitiveIndex + 1] === index
    ) {
      // this vertex is part of a new primitive, scoot forward two vertices
      index += 2;

      // update primitives
      groupData[primitiveIndex].count = groupIndexCount;
      groupData.push({
        start: currentIndex,
        count: 0,
      });
      groupIndexCount = 0;
      triangleOrientation = 0;
      primitiveIndex++;
      primitiveVertexSets.push(new Set());
      continue;
    }
    if (v0 === v1 || v1 === v2 || v0 === v2) {
      // degenerate triangle
      index++;
      triangleOrientation++;
      continue;
    }
    const vertexSet = primitiveVertexSets[primitiveIndex];
    vertexSet.add(v0);
    vertexSet.add(v1);
    vertexSet.add(v2);
    if (triangleOrientation % 2 === 0) {
      triangleIndices.push(v0, v1, v2);
    } else {
      triangleIndices.push(v2, v1, v0);
    }
    index++;
    triangleOrientation++;
    currentIndex += 3;
    groupIndexCount += 3;
  }
  groupData.at(-1)!.count = groupIndexCount;

  return { triangleIndices, primitiveVertexSets, groupData };
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

/**
 * Gives a remainder that is never negative.
 * @param n dividend
 * @param m divisor
 * @returns nonnegative-definite remainder
 */
export const mod = (n: number, m: number) => {
  return ((n % m) + m) % m;
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
