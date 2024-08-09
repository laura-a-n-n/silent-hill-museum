import {
  bindSkeletonToGeometry,
  bindSkeletonToSecondaryGeometry,
  createGeometry,
  createMaterial,
  createSkeleton,
  MaterialType,
  MaterialView,
} from "./model";
import { loadModel } from "./load";
import {
  cameraFix,
  clientState,
  defaultParams,
  preferredParams,
  START_INDEX,
} from "./objects/MuseumState";
import { exportCanvas, fitCameraToSelection, RenderSideMap } from "./utils";
import {
  WebGLRenderer,
  Object3D,
  PerspectiveCamera,
  Scene,
  Group,
  SkeletonHelper,
  AmbientLight,
  Skeleton,
  Mesh,
  SkinnedMesh,
  Color,
  ColorManagement,
  SRGBColorSpace,
  ACESFilmicToneMapping,
  PMREMGenerator,
  Clock,
  WebGL1Renderer,
  Material,
} from "three";
import {
  OrbitControls,
  TransformControls,
  VertexNormalsHelper,
  WebGL,
} from "three/examples/jsm/Addons.js";
import {
  initializeModals,
  showContentWarningModal,
  showNotSupportedModal,
  toggleWithBackground,
} from "./modals";
import { chrFolders, MuseumFile } from "./files";
import "./keybinds";
import GUI from "lil-gui";

const appContainer = document.getElementById("app");
if (!(appContainer instanceof HTMLDivElement)) {
  throw Error("The app container was not found!");
}

initializeModals();

if (localStorage.getItem("visited") === null) {
  toggleWithBackground("aboutModal", true);
  localStorage.setItem("visited", "true");
}

let glVersion: 0 | 1 | 2 = 0;
if (!WebGL.isWebGLAvailable()) {
  showNotSupportedModal(glVersion);
  throw Error("WebGL is not available on this browser.");
} else if (!WebGL.isWebGL2Available()) {
  glVersion = 1;
  showNotSupportedModal(glVersion);
} else {
  glVersion = 2;
}
clientState.setGlVersion(glVersion);

const gui = new GUI({ width: 250 });

const dataGuiFolder = gui.addFolder("Data");
const scenarioInput = dataGuiFolder
  .add(clientState.params, "Scenario", ["Main Scenario", "Born From A Wish"])
  .onFinishChange((scenarioName: "Main Scenario" | "Born From A Wish") => {
    clientState.rootFolder = scenarioName === "Main Scenario" ? "chr" : "chr2";
  });
const folderInput = dataGuiFolder
  .add(clientState.params, "Folder", chrFolders)
  .onFinishChange((folderName: (typeof chrFolders)[number]) => {
    clientState.folder = folderName;
  });
const possibleFilenames = clientState.getPossibleFilenames();
const fileInput = dataGuiFolder.add(
  clientState.params,
  "Filename",
  possibleFilenames
);
dataGuiFolder
  .add(clientState.params, "Lock To Folder")
  .onFinishChange(() => {
    showContentWarningModal(
      () => {
        clientState.params["Lock To Folder"] = false;
        render();
      },
      () => {
        clientState.setFileIndex(START_INDEX);
        const controllers = gui.controllersRecursive();
        controllers.forEach((c) => {
          c.setValue(c.initialValue);
        });
      }
    );
  })
  .listen();
dataGuiFolder.add(clientState.params, "Next File");
dataGuiFolder.add(clientState.params, "Previous File");
dataGuiFolder.add(clientState.params, "Save Image");
dataGuiFolder.add(clientState.params, "Export to GLTF");
fileInput.onFinishChange((file: (typeof possibleFilenames)[number]) => {
  clientState.file = file;
});
dataGuiFolder.open();

const controlsGuiFolder = gui.addFolder("Controls");
controlsGuiFolder.add(clientState.params, "Auto-Rotate");
controlsGuiFolder
  .add(clientState.params, "Bone Controls")
  .onFinishChange((value: boolean) => {
    if (value) {
      controlsModeInput.show();
      boneSelector.show();
      return;
    }
    controlsModeInput.hide();
    boneSelector.hide();
  });
const boneSelector = controlsGuiFolder
  .add(clientState.params, "Selected Bone", 0, 1, 1)
  .onFinishChange(() => transformControls.removeFromParent())
  .hide()
  .listen();
const controlsModeInput = controlsGuiFolder
  .add(clientState.params, "Controls Mode", ["translate", "rotate"])
  .listen()
  .hide();

const geometryFolder = gui.addFolder("Geometry");
geometryFolder.add(clientState.params, "Render Primary");
geometryFolder.add(clientState.params, "Render Extra");
if (clientState.getGlVersion() === 2) {
  geometryFolder.add(clientState.params, "Skeleton Mode");
  geometryFolder
    .add(clientState.params, "Visualize Skeleton")
    .onFinishChange((on: boolean) => {
      if (on && clientState.params["Model Opacity"] > 0.5) {
        clientState.params["Model Opacity"] = 0.5;
      } else if (!on) {
        clientState.params["Model Opacity"] = 1.0;
      }
    });
} else {
  controlsGuiFolder.hide();
  geometryFolder.add(clientState.params, "Auto-Rotate");
}
geometryFolder.add(clientState.params, "Visualize Normals");
geometryFolder.onFinishChange(() => render());

const textureFolder = gui.addFolder("Texture");
textureFolder
  .add(clientState.params, "Render Mode", [
    MaterialView.Flat,
    MaterialView.UV,
    MaterialView.Wireframe,
    MaterialView.Textured,
  ])
  .onFinishChange(() => render());
textureFolder.addColor(clientState.params, "Ambient Color");
textureFolder.add(clientState.params, "Ambient Intensity", 0, 8);
textureFolder
  .add(clientState.params, "Model Opacity", 0, 1, 0.01)
  .onFinishChange(() => render())
  .listen();
textureFolder
  .add(clientState.params, "Transparency")
  .onFinishChange(() => render())
  .listen();
textureFolder
  .add(clientState.params, "Invert Alpha")
  .onFinishChange(() => render())
  .listen();
textureFolder
  .add(clientState.params, "Alpha Test", 0, 1, 0.01)
  .onFinishChange(() => render())
  .listen();
textureFolder
  .add(clientState.params, "Render Side", [
    "DoubleSide",
    "FrontSide",
    "BackSide",
  ])
  .onFinishChange(() => render())
  .listen();

const width = appContainer.offsetWidth;
const height = appContainer.offsetHeight;
const renderer = glVersion === 2 ? new WebGLRenderer() : new WebGL1Renderer();
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);
appContainer.appendChild(renderer.domElement);

Object3D.DEFAULT_UP.multiplyScalar(-1); // -Y is up
const camera = new PerspectiveCamera(75, width / height, 0.1, 100);
camera.position.z = 5;

const prefersReducedMotion = !!window.matchMedia(
  `(prefers-reduced-motion: reduce)`
);
const onWindowResize = () => {
  const width = appContainer.offsetWidth;
  const height = appContainer.offsetHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  if (!gui._closed && width < 700) {
    gui.close();
  } else if (width > 700 && gui._closed) {
    if (prefersReducedMotion) {
      gui.openAnimated();
    } else {
      gui.open();
    }
  }
};
onWindowResize();
window.addEventListener("resize", onWindowResize);

const scene = new Scene();
const pmremGenerator = new PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(scene).texture;
ColorManagement.enabled = true;
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = ACESFilmicToneMapping;

const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = clientState.params["Auto-Rotate"];
controls.update();

const transformControls = new TransformControls(camera, renderer.domElement);

const clock = new Clock();

const group = new Group();
let helper: SkeletonHelper | undefined;

let lastIndex = clientState.getFileIndex();
const render = () => {
  const filename = clientState.file;
  const currentFileIndex = clientState.getFileIndex();
  if (lastIndex !== currentFileIndex) {
    if (
      clientState.folder !== "favorites" &&
      !clientState.hasAcceptedContentWarning()
    ) {
      showContentWarningModal(
        () => {
          clientState.params["Lock To Folder"] = false;
          render();
        },
        () => {
          clientState.setFileIndex(START_INDEX);
          const controllers = gui.controllersRecursive();
          controllers.forEach((c) => {
            c.setValue(c.initialValue);
          });
        }
      );
      return;
    }
    lastIndex = currentFileIndex;
    if (filename in preferredParams) {
      Object.assign(
        clientState.params,
        preferredParams[filename as keyof typeof preferredParams]
      );
    } else {
      Object.assign(clientState.params, defaultParams);
    }
    clientState.params["Selected Bone"] = 0;

    fileInput.setValue(clientState.file);
    scenarioInput.setValue(
      clientState.rootFolder === "chr" ? "Main Scenario" : "Born From A Wish"
    );
    folderInput.setValue(clientState.folder);
    folderInput.options(clientState.getPossibleFolders());
    fileInput.options(clientState.getPossibleFilenames());
  }
  loadModel(
    `/mdl/${clientState.rootFolder}/${clientState.folder}/${clientState.file}`
  ).then((model) => {
    console.log("Parsed model structure", model);
    scene.clear();
    const light = new AmbientLight(
      clientState.params["Ambient Color"],
      clientState.params["Ambient Intensity"]
    );
    scene.add(light);
    if (model === undefined) {
      return;
    }

    group.children.forEach(
      (child) =>
        "dispose" in child &&
        typeof child.dispose === "function" &&
        child.dispose()
    );
    helper?.dispose();
    group.clear();

    // temporary: separate into primary & secondary until specularity is implemented?
    // likely need to create more materials for most accurate results
    const primaryMaterial = createMaterial(
      model,
      clientState.params["Render Mode"] as MaterialType,
      {
        alphaTest: clientState.params["Alpha Test"],
        transparent: false,
        side: RenderSideMap[
          clientState.params["Render Side"] as
            | "DoubleSide"
            | "FrontSide"
            | "BackSide"
        ],
        opacity: clientState.params["Model Opacity"],
      },
      clientState.params["Invert Alpha"]
    );
    const secondaryMaterial = createMaterial(
      model,
      clientState.params["Render Mode"] as MaterialType,
      {
        alphaTest: clientState.params["Alpha Test"],
        transparent: clientState.params.Transparency,
        side: RenderSideMap[
          clientState.params["Render Side"] as
            | "DoubleSide"
            | "FrontSide"
            | "BackSide"
        ],
        opacity: clientState.params["Model Opacity"],
      },
      clientState.params["Invert Alpha"]
    );

    if (
      primaryMaterial instanceof Material &&
      primaryMaterial.name === "uv-map" &&
      clientState.params["Render Mode"] !== MaterialView.UV
    ) {
      textureFolder.hide();
    } else {
      textureFolder.show();
    }

    const primaryGeometry = clientState.params["Render Primary"]
      ? createGeometry(model, 0)
      : undefined;

    let modelSkeleton: Skeleton | undefined = undefined;
    if (primaryGeometry) {
      primaryGeometry.name = `${clientState.file}-primary`;

      let mesh: Mesh;

      if (clientState.params["Skeleton Mode"]) {
        const { skeleton, rootBoneIndices } = createSkeleton(model);
        bindSkeletonToGeometry(model, primaryGeometry);

        mesh = new SkinnedMesh(primaryGeometry, primaryMaterial);
        rootBoneIndices.forEach((boneIndex) =>
          mesh.add(skeleton.bones[boneIndex])
        );
        (mesh as SkinnedMesh).bind(skeleton);
        modelSkeleton = skeleton;

        if (clientState.params["Visualize Skeleton"]) {
          helper = new SkeletonHelper(mesh);
          scene.add(helper);
        }
      } else {
        mesh = new Mesh(primaryGeometry, primaryMaterial);
      }
      mesh.renderOrder = 1;

      if (clientState.params["Visualize Normals"]) {
        const normalsHelper = new VertexNormalsHelper(mesh, 8, 0xff0000);
        scene.add(normalsHelper);
      }

      console.log("Added primary geometry to mesh!", primaryGeometry);
      group.add(mesh);
    }

    const secondaryGeometry = clientState.params["Render Extra"]
      ? createGeometry(model, 1)
      : undefined;
    if (secondaryGeometry) {
      secondaryGeometry.name = `${clientState.file}-secondary`;

      let mesh: SkinnedMesh | Mesh;
      if (clientState.params["Skeleton Mode"]) {
        mesh = new SkinnedMesh(secondaryGeometry, secondaryMaterial);

        if (!primaryGeometry || !modelSkeleton) {
          const { skeleton, rootBoneIndices } = createSkeleton(model);
          modelSkeleton = skeleton;
          rootBoneIndices.forEach((boneIndex) =>
            mesh.add(skeleton.bones[boneIndex])
          );
        }
        bindSkeletonToSecondaryGeometry(model, secondaryGeometry);
        (mesh as SkinnedMesh).bind(modelSkeleton);
      } else {
        mesh = new Mesh(secondaryGeometry, secondaryMaterial);
      }
      mesh.renderOrder = 2;

      console.log("Added secondary geometry to mesh!", secondaryGeometry);
      group.add(mesh);
    }

    scene.add(group);
    clientState.setCurrentObject(group);
    if (primaryGeometry !== undefined || secondaryGeometry !== undefined) {
      const fix = cameraFix[filename as MuseumFile];
      fitCameraToSelection(camera, controls, [group]);
      if (fix !== undefined) {
        controls.target.copy(fix.controlsTarget);
        camera.position.copy(fix.cameraPosition);
        controls.update();
      }
    }

    if (clientState.folder === "favorites" && clientState.file === "org.mdl") {
      modelSkeleton?.bones[0]?.rotateZ(Math.PI / 2);
      modelSkeleton?.bones[6]?.rotateZ(-Math.PI / 2);
      modelSkeleton?.bones[7]?.rotateZ(-Math.PI / 2);
      modelSkeleton?.bones[8]?.rotateZ(Math.PI / 2);
    }

    const maxBoneSelection = (modelSkeleton?.bones.length ?? 1) - 1;
    boneSelector.max(maxBoneSelection);
    if (maxBoneSelection === 0) {
      boneSelector.hide();
    } else if (clientState.params["Bone Controls"]) {
      boneSelector.show();
    }

    function animate() {
      const delta = clock.getDelta() * 120; // targeting 120 fps
      if (
        modelSkeleton &&
        clientState.params["Bone Controls"] &&
        transformControls.parent === null
      ) {
        transformControls.enabled = true;
        transformControls.attach(
          modelSkeleton.bones[clientState.params["Selected Bone"]]
        );
        transformControls.size = 0.5;
        scene.add(transformControls);
      } else if (
        transformControls.parent &&
        !clientState.params["Bone Controls"]
      ) {
        scene.remove(transformControls);
        transformControls.enabled = false;
      }
      transformControls.mode = clientState.params["Controls Mode"] as
        | "translate"
        | "rotate";
      if (transformControls.dragging) {
        controls.enabled = false;
      } else {
        controls.enabled = true;
      }

      controls.autoRotate = clientState.params["Auto-Rotate"];
      controls.update();

      light.color = new Color(clientState.params["Ambient Color"]);
      light.intensity = clientState.params["Ambient Intensity"];

      if (
        clientState.folder === "favorites" &&
        clientState.file === "org.mdl"
      ) {
        modelSkeleton?.bones[2]?.rotateZ(delta * -0.005);
        modelSkeleton?.bones[3]?.rotateZ(delta * -0.0025);
      }

      renderer.render(scene, camera);

      if (clientState.params["Render This Frame"]) {
        exportCanvas(appContainer, clientState.file + ".png");
        clientState.params["Render This Frame"] = false;
      }
    }
    renderer.setAnimationLoop(animate);
  });
};
render();
clientState.setOnUpdate(render);
