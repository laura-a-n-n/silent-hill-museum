import {
  BackSide,
  Box3,
  ClampToEdgeWrapping,
  Color,
  DoubleSide,
  FrontSide,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MirroredRepeatWrapping,
  Object3D,
  Object3DEventMap,
  PerspectiveCamera,
  PointLight,
  RepeatWrapping,
  SphereGeometry,
  Vector3,
} from "three";
import { GLTFExporter, OrbitControls } from "three/examples/jsm/Addons.js";
import { TransformationMatrix } from "./kaitai/Mdl";
import logger from "./objects/Logger";
import { Tuple, VertexLike } from "./types/common";

export const RenderSideMap = {
  DoubleSide,
  FrontSide,
  BackSide,
};
export const WrapMap = {
  Default: undefined,
  ClampToEdgeWrapping,
  RepeatWrapping,
  MirroredRepeatWrapping,
};

export const MIN_SIGNED_INT = -0x8000;

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

export const acceptFileDrop = (
  element: HTMLDivElement,
  fileCallback: (file: File) => void
) => {
  element.ondragover = (event) => {
    event.preventDefault();
  };

  element.ondrop = (event) => {
    logger.debug("File dropped");
    event.preventDefault();

    if (event.dataTransfer?.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...event.dataTransfer.items].forEach((item) => {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            fileCallback(file);
          }
        }
      });
    } else {
      [...(event.dataTransfer?.files ?? [])].forEach((file) => {
        fileCallback(file);
      });
    }
  };
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

/**
 * https://gist.github.com/jonleighton/958841
 */
export const arrayBufferToBase64 = (
  arrayBuffer: ArrayBuffer,
  url?: boolean
) => {
  var base64 = "";
  var encodings =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  var bytes = new Uint8Array(arrayBuffer);
  var byteLength = bytes.byteLength;
  var byteRemainder = byteLength % 3;
  var mainLength = byteLength - byteRemainder;

  var a, b, c, d;
  var chunk;

  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
    d = chunk & 63; // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];

    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4; // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + "==";
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2; // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + "=";
  }

  return (url ? "data:application/octet-stream;base64," : "") + base64;
};

export const base64ToUint8ClampedArray = (base64: string) => {
  var binaryString = atob(base64);
  var bytes = new Uint8ClampedArray(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
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
type GltfCallback = (gltf: ArrayBuffer | { [key: string]: any }) => void;
export function exportModel(object: Object3D, filename: string): void;
export function exportModel(object: Object3D, callback: GltfCallback): void;
export function exportModel(
  object: Object3D,
  filenameOrCallback: string | GltfCallback
) {
  exporter.parse(
    object,
    typeof filenameOrCallback === "string"
      ? (result) => {
          if (result instanceof ArrayBuffer) {
            saveArrayBuffer(result, `${filenameOrCallback}.glb`);
          } else {
            const output = JSON.stringify(result, null, 2);
            saveString(output, `${filenameOrCallback}.gltf`);
          }
        }
      : filenameOrCallback,
    (error) => {
      logger.warn("Could not export the scene. An error occurred: ", error);
    },
    { onlyVisible: false, trs: true }
  );
}

export const assignPublicProperties = <T>(
  source: T,
  target: T,
  excludeFilter: Partial<Record<keyof T, true>> = {}
) => {
  for (const key in source) {
    if (!key.startsWith("_") && !(key in excludeFilter)) {
      target[key] = source[key];
    }
  }
};

export const applyDiffToOffsetTable = <K extends keyof any>(
  newOffsetTable: { [key in K]: unknown | number },
  baseOffsetTable: { [key in K]: unknown | number },
  diff: number,
  current: number
) => {
  if (diff === 0) {
    // no diff to apply
    return;
  }
  for (const key in newOffsetTable) {
    const oldOffset = baseOffsetTable[key];
    if (
      key.toLowerCase().endsWith("offset") &&
      !key.startsWith("_") &&
      typeof oldOffset === "number" &&
      oldOffset > current
    ) {
      if (typeof newOffsetTable[key] === "number") {
        logger.debug(`Adding an offset diff for ${key} with diff ${diff}`);
        newOffsetTable[key] += diff;
      }
    }
  }
};

export const ensureOffsetTableAligned = <K extends keyof any>(
  offsetTable: { [key in K]: unknown | number },
  excludeFilter: Partial<Record<K, true>> = {},
  alignment = 16,
  throwError = false
) => {
  for (const key in offsetTable) {
    if (
      key.toLowerCase().endsWith("offset") &&
      !key.startsWith("_") &&
      !(key in excludeFilter) &&
      typeof offsetTable[key] === "number" &&
      offsetTable[key] % alignment !== 0
    ) {
      if (throwError) {
        throw new Error(
          `Offset ${key} was not ${alignment}-aligned (got ${offsetTable[key]}).`
        );
      }
      logger.error(
        `Offset ${key} was not ${alignment}-aligned (got ${offsetTable[key]}).`
      );
      return false;
    }
  }
  return true;
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

export const mat4ToTransformationMatrix = (
  matrix: Matrix4,
  transformationMatrix: TransformationMatrix
): TransformationMatrix => {
  const elements = matrix.elements;

  transformationMatrix.rotation00 = elements[0];
  transformationMatrix.rotation10 = elements[1];
  transformationMatrix.rotation20 = elements[2];
  transformationMatrix.pad0 = elements[3];

  transformationMatrix.rotation01 = elements[4];
  transformationMatrix.rotation11 = elements[5];
  transformationMatrix.rotation21 = elements[6];
  transformationMatrix.pad1 = elements[7];

  transformationMatrix.rotation02 = elements[8];
  transformationMatrix.rotation12 = elements[9];
  transformationMatrix.rotation22 = elements[10];
  transformationMatrix.pad2 = elements[11];

  transformationMatrix.translationX = elements[12];
  transformationMatrix.translationY = elements[13];
  transformationMatrix.translationZ = elements[14];
  transformationMatrix.translationW = elements[15];

  return transformationMatrix;
};

export const makeIdentityMatrix = (
  initialMatrix: Partial<TransformationMatrix> = {}
): Partial<TransformationMatrix> => {
  const identityMatrix: Partial<TransformationMatrix> = {
    rotation00: 1,
    rotation10: 0,
    rotation20: 0,
    pad0: 0,
    rotation01: 0,
    rotation11: 1,
    rotation21: 0,
    pad1: 0,
    rotation02: 0,
    rotation12: 0,
    rotation22: 1,
    pad2: 0,
    translationX: 0,
    translationY: 0,
    translationZ: 0,
    translationW: 1,
  };
  return Object.assign(initialMatrix, identityMatrix);
};

export const disposeResources = (objectToSearch?: Object3D) => {
  objectToSearch?.traverse((object) => {
    if (object instanceof Mesh) {
      object.geometry?.dispose?.();
      object.material?.dispose?.();
    }
  });
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

export const createRainbowLights = (
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
      item.angle += deltaTime / 100; // Adjust this value to change the speed of rotation

      // Calculate the new position
      const x = center.x + radius * Math.cos(item.angle);
      const y = center.y + radius * Math.sin(item.angle);

      // Update positions
      item.sphere.position.set(x, y, center.z);
      item.pointLight.position.set(x, y, center.z);
    });
  };

  return { lightGroup, animate };
};

export const getPixelsFromCanvasImageSource = (
  canvasImageSource: HTMLImageElement | ImageBitmap,
  canvas?: HTMLCanvasElement | OffscreenCanvas
): Uint8ClampedArray => {
  canvas ??= document.createElement("canvas");
  canvas.width = canvasImageSource.width;
  canvas.height = canvasImageSource.height;

  const context = canvas.getContext("2d") as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  if (!context) throw new Error("Failed to get 2D context");

  context.drawImage(canvasImageSource, 0, 0);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  return imageData.data;
};

export function computeAverageVertex(
  vertices: ArrayLike<number>
): [number, number, number];
export function computeAverageVertex(
  vertices: VertexLike[]
): [number, number, number];
export function computeAverageVertex(
  vertices: VertexLike[] | ArrayLike<number>
): [number, number, number] {
  if (typeof vertices[0] === "number") {
    vertices = vertices as ArrayLike<number>;
    const result = [0, 0, 0] as Tuple<number, 3>;
    for (let index = 0; index < vertices.length; index += 3) {
      result[0] += vertices[index];
      result[1] += vertices[index + 1];
      result[2] += vertices[index + 2];
    }
    result[0] /= vertices.length;
    result[1] /= vertices.length;
    result[2] /= vertices.length;
    return result;
  } else {
    return (["x", "y", "z"] as const).map(
      (key) =>
        (vertices as VertexLike[]).map((v) => v[key]).reduce((a, b) => a + b) /
        vertices.length
    ) as Tuple<number, 3>;
  }
}

export const isModuleWorkerSupported = () => {
  let supports = false;
  try {
    new Worker(
      URL.createObjectURL(
        new Blob(["export {};"], { type: "application/javascript" })
      ),
      {
        get type(): WorkerType {
          supports = true;
          return "module";
        },
      }
    );
  } finally {
    return supports;
  }
};

export const isSafari = () => {
  const userAgent = navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(userAgent) === true;
};

export class UnhandledCaseError extends Error {
  constructor(message: string) {
    super(`Unhandled case: ${message}`);
    this.name = "UnhandledCaseError";
    // Maintains proper stack trace for where our error was thrown (only available on V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnhandledCaseError);
    }
  }
}
