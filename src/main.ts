import "./style.css";
import {
  bindSkeletonToGeometry,
  bindSkeletonToSecondaryGeometry,
  createGeometry,
  createMaterial,
  createSkeleton,
  getMesh,
  MaterialType,
  MaterialView,
} from "./model";
import { loadModel } from "./load";
import MuseumState, {
  folderNames,
  MuseumInputFile,
  Scenario,
  ScenarioType,
  secondaryFolderNames,
} from "./objects/MuseumState";
import KeybindManager from "./objects/KeybindManager";
import {
  exportCanvas,
  fitCameraToSelection,
  saveArrayBuffer,
  saveString,
} from "./utils";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
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
  DoubleSide,
  FrontSide,
  BackSide,
  ColorManagement,
  SRGBColorSpace,
  ACESFilmicToneMapping,
  PMREMGenerator,
  Clock,
  Vector3,
} from "three";
import {
  GLTFExporter,
  OrbitControls,
  TransformControls,
  WebGL,
} from "three/examples/jsm/Addons.js";
import {
  closeAllElements,
  initializeModals,
  onConfirm,
  showNotSupportedModal,
  toggleWithBackground,
} from "./modals";

const appContainer = document.getElementById("app");
if (!(appContainer instanceof HTMLDivElement)) {
  throw Error("The app container was not found!");
}

initializeModals();

if (!WebGL.isWebGL2Available()) {
  showNotSupportedModal();
  throw Error("WebGL is not available on this browser.");
}

const state = new MuseumState();
const keybindManager = new KeybindManager();
keybindManager.addKeybind(
  "arrowright",
  () => state.nextFile(),
  "Next file in folder"
);
keybindManager.addKeybind(
  "arrowleft",
  () => state.previousFile(),
  "Previous file in folder"
);
keybindManager.addKeybind("arrowup", () => state.nextFolder(), "Next folder");
keybindManager.addKeybind(
  "arrowdown",
  () => state.previousFolder(),
  "Previous folder"
);
keybindManager.addKeybind(
  "s",
  () => state.toggleScenario(),
  "Toggle scenarios"
);
keybindManager.addKeybind(
  "r",
  () => (params["Controls Mode"] = "rotate"),
  "Bone rotate mode"
);
keybindManager.addKeybind(
  "t",
  () => (params["Controls Mode"] = "translate"),
  "Bone translate mode"
);
keybindManager.addKeybind(
  "0",
  () => (params["Render This Frame"] = true),
  "Render the current frame as PNG"
);
keybindManager.addKeybind(
  "k",
  () => {
    toggleWithBackground("keybindsModal");
  },
  "Toggle keybinds modal"
);
keybindManager.addKeybind(
  "escape",
  () => closeAllElements(),
  "Close all modals"
);
keybindManager.addKeybind(
  "c",
  () => console.log(controls.target, camera.position),
  "Camera log"
);

const keybindsModal = document.getElementById("keybinds-modal");
if (keybindsModal) {
  // list all keybinds
  const entries = Array.from(keybindManager.getDescriptionMap().entries());
  let html = "<table><tbody>";
  for (const [keybind, description] of entries) {
    const keybindHtml = keybind
      .split("/")
      .map((key) => `<kbd>${key}</kbd>`)
      .join("+");
    html += `<tr><td>${keybindHtml}</td> <td>${description}</td></tr>`;
  }
  html += "</tbody></table>";
  keybindsModal.innerHTML = html;
}

const gui = new GUI({ width: 250 });
const params = {
  Scenario: state.getScenario(),
  Folder: state.getFolderName() as string,
  Filename: state.file,
  "Next File": () => state.nextFile(),
  "Previous File": () => state.previousFile(),
  "Render View": () => (params["Render This Frame"] = true),
  "Export to GLTF": () => {
    toggleWithBackground("disclaimerModal", true);
    onConfirm(exportModel);
  },

  "Auto-Rotate": false,
  "Bone Controls": false,
  "Controls Mode": "rotate",
  "Selected Bone": 0,

  "Render Primary": true,
  "Render Secondary": true,
  "Skeleton Mode": true,
  "Visualize Skeleton": false,

  "Render Mode": MaterialView.Textured as string,
  "Ambient Color": 0xffffff,
  "Ambient Intensity": 1.0,
  Transparency: true,
  "Alpha Test": 0.01,
  "Model Opacity": 1.0,
  "Render Side": "FrontSide",

  "Render This Frame": false,
  "Content Warning Accepted": localStorage.getItem("contentWarningAccepted"),
};
const RenderSideMap = {
  DoubleSide,
  FrontSide,
  BackSide,
};
/**
 * Preferred params for models that are best viewed with certain settings.
 * May be needed if certain properties haven't been reverse-engineered yet.
 */
const preferredParams: { [File in MuseumInputFile]?: Partial<typeof params> } =
  {
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
  };
const cameraFix: {
  [File in MuseumInputFile]?: {
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
const defaultParams = Object.assign(
  {},
  ...Object.values(preferredParams).map((o) =>
    Object.fromEntries(
      Object.keys(o).map((k) => [k, params[k as keyof typeof params]])
    )
  )
);
const dataGuiFolder = gui.addFolder("Data");
const scenarioInput = dataGuiFolder
  .add(params, "Scenario", Object.values(Scenario))
  .onFinishChange((scenarioName) => {
    if (scenarioName === "Born From A Wish") {
      subScenarioFolderInput.show();
      mainFolderInput.hide();
      folderInput = subScenarioFolderInput;
    } else {
      mainFolderInput.show();
      subScenarioFolderInput.hide();
      folderInput = mainFolderInput;
    }
    state.setScenario(scenarioName as ScenarioType);
  })
  .listen();
const mainFolderInput = dataGuiFolder
  .add(params, "Folder", folderNames)
  .onFinishChange((folderName) => {
    state.setFolderName(folderName);
  });
const subScenarioFolderInput = dataGuiFolder
  .add(params, "Folder", secondaryFolderNames)
  .onFinishChange((folderName) => {
    state.setFolderName(folderName);
  })
  .hide();
let folderInput = mainFolderInput;
const fileInput = dataGuiFolder.add(params, "Filename");
dataGuiFolder.add(params, "Next File");
dataGuiFolder.add(params, "Previous File");
dataGuiFolder.add(params, "Render View");
dataGuiFolder.add(params, "Export to GLTF");
fileInput.onFinishChange((file) => {
  state.file = file;
});
dataGuiFolder.open();

const controlsGuiFolder = gui.addFolder("Controls");
controlsGuiFolder.add(params, "Auto-Rotate");
controlsGuiFolder.add(params, "Bone Controls").onChange((value) => {
  if (value) {
    controlsModeInput.show();
    boneSelector.show();
    return;
  }
  controlsModeInput.hide();
  boneSelector.hide();
});
const boneSelector = controlsGuiFolder
  .add(params, "Selected Bone", 0, 1, 1)
  .onChange(() => transformControls.removeFromParent())
  .hide();
const controlsModeInput = controlsGuiFolder
  .add(params, "Controls Mode", ["translate", "rotate"])
  .listen()
  .hide();

const geometryFolder = gui.addFolder("Geometry");
geometryFolder.add(params, "Render Primary");
geometryFolder.add(params, "Render Secondary");
geometryFolder.add(params, "Skeleton Mode");

geometryFolder.add(params, "Visualize Skeleton").onChange((on) => {
  if (on && params["Model Opacity"] > 0.5) {
    params["Model Opacity"] = 0.5;
  } else if (!on) {
    params["Model Opacity"] = 1.0;
  }
});
geometryFolder.onFinishChange(() => render());

const textureFolder = gui.addFolder("Texture");
textureFolder
  .add(params, "Render Mode", [
    MaterialView.Flat,
    MaterialView.Textured,
    MaterialView.UV,
  ])
  .onFinishChange(() => render());
textureFolder.addColor(params, "Ambient Color");
textureFolder.add(params, "Ambient Intensity", 0, 8);
textureFolder
  .add(params, "Model Opacity", 0, 1, 0.01)
  .onFinishChange(() => render())
  .listen();
textureFolder
  .add(params, "Transparency")
  .onFinishChange(() => render())
  .listen();
textureFolder
  .add(params, "Alpha Test", 0, 1, 0.01)
  .onFinishChange(() => render())
  .listen();
textureFolder
  .add(params, "Render Side", ["DoubleSide", "FrontSide", "BackSide"])
  .onFinishChange(() => render())
  .listen();

const width = appContainer.offsetWidth;
const height = appContainer.offsetHeight;
const renderer = new WebGLRenderer();
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
controls.autoRotate = params["Auto-Rotate"];
controls.update();

const transformControls = new TransformControls(camera, renderer.domElement);

const clock = new Clock();

const group = new Group();
let helper: SkeletonHelper | undefined;

const exporter = new GLTFExporter();
function exportModel() {
  exporter.parse(
    group,
    (result) => {
      if (result instanceof ArrayBuffer) {
        saveArrayBuffer(result, `${state.file}.glb`);
      } else {
        const output = JSON.stringify(result, null, 2);
        saveString(output, `${state.file}.gltf`);
      }
    },
    (error) => {
      console.warn("Could not export the scene. An error occurred: ", error);
    },
    { onlyVisible: false }
  );
}

let lastFile = state.file;
const render = () => {
  const filename = state.file.split("/")[1];
  if (lastFile !== state.file) {
    lastFile = state.file;
    if (filename in preferredParams) {
      Object.assign(
        params,
        preferredParams[filename as keyof typeof preferredParams]
      );
    } else {
      Object.assign(params, defaultParams);
    }
  }
  fileInput.setValue(state.file);
  scenarioInput.setValue(state.getScenario());
  folderInput.setValue(state.getFolderName());
  loadModel(`/mdl/${state.rootFolder}/${state.file}`).then((model) => {
    scene.clear();
    const light = new AmbientLight(
      params["Ambient Color"],
      params["Ambient Intensity"]
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

    const material = createMaterial(
      model,
      params["Render Mode"] as MaterialType,
      {
        alphaTest: params["Alpha Test"],
        transparent: params.Transparency,
        side: RenderSideMap[
          params["Render Side"] as "DoubleSide" | "FrontSide" | "BackSide"
        ],
        opacity: params["Model Opacity"],
      }
    );

    const primaryGeometry = params["Render Primary"]
      ? createGeometry(model, 0)
      : undefined;

    let modelSkeleton: Skeleton | undefined = undefined;
    if (primaryGeometry) {
      primaryGeometry.name = `${state.file}-primary`;
      primaryGeometry.computeVertexNormals();

      let mesh: Mesh;

      if (params["Skeleton Mode"]) {
        const { skeleton, rootBoneIndices } = createSkeleton(model);
        bindSkeletonToGeometry(model, primaryGeometry);

        mesh = new SkinnedMesh(primaryGeometry, material);
        rootBoneIndices.forEach((boneIndex) =>
          mesh.add(skeleton.bones[boneIndex])
        );
        (mesh as SkinnedMesh).bind(skeleton);
        modelSkeleton = skeleton;

        if (params["Visualize Skeleton"]) {
          helper = new SkeletonHelper(mesh);
          scene.add(helper);
        }
      } else {
        mesh = getMesh(primaryGeometry, material);
      }
      mesh.renderOrder = 1;

      console.log("Added primary geometry to mesh!", primaryGeometry);
      group.add(mesh);
    }

    const secondaryGeometry = params["Render Secondary"]
      ? createGeometry(model, 1)
      : undefined;
    if (secondaryGeometry) {
      secondaryGeometry.name = `${state.file}-secondary`;
      secondaryGeometry.computeVertexNormals();

      let mesh: SkinnedMesh | Mesh;
      if (params["Skeleton Mode"]) {
        mesh = new SkinnedMesh(secondaryGeometry, material);

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
        mesh = getMesh(secondaryGeometry, material);
      }
      mesh.renderOrder = 2;

      console.log("Added secondary geometry to mesh!", secondaryGeometry);
      group.add(mesh);
    }

    scene.add(group);
    if (primaryGeometry !== undefined || secondaryGeometry !== undefined) {
      const fix = cameraFix[filename as MuseumInputFile];
      fitCameraToSelection(camera, controls, [group]);
      if (fix !== undefined) {
        controls.target.copy(fix.controlsTarget);
        camera.position.copy(fix.cameraPosition);
        controls.update();
      }
    }

    if (state.file === "favorites/org.mdl") {
      modelSkeleton?.bones[0]?.rotateZ(Math.PI / 2);
      modelSkeleton?.bones[6]?.rotateZ(-Math.PI / 2);
      modelSkeleton?.bones[7]?.rotateZ(-Math.PI / 2);
      modelSkeleton?.bones[8]?.rotateZ(Math.PI / 2);
    }

    function animate() {
      const delta = clock.getDelta() * 120; // targeting 120 fps
      if (
        modelSkeleton &&
        params["Bone Controls"] &&
        transformControls.parent === null
      ) {
        const maxSelection = modelSkeleton.bones.length - 1;
        if (modelSkeleton.bones.length > 1) {
          boneSelector.show();
          boneSelector.max(maxSelection);
        } else {
          boneSelector.hide();
        }
        params["Selected Bone"] = Math.min(
          maxSelection,
          params["Selected Bone"]
        );
        transformControls.attach(modelSkeleton.bones[params["Selected Bone"]]);
        transformControls.size = 0.5;
        scene.add(transformControls);
      } else if (transformControls.parent && !params["Bone Controls"]) {
        scene.remove(transformControls);
      }
      transformControls.mode = params["Controls Mode"] as
        | "translate"
        | "rotate";
      if (transformControls.dragging) {
        controls.enabled = false;
      } else {
        controls.enabled = true;
      }

      controls.autoRotate = params["Auto-Rotate"];
      controls.update();

      light.color = new Color(params["Ambient Color"]);
      light.intensity = params["Ambient Intensity"];

      if (state.file === "favorites/org.mdl") {
        modelSkeleton?.bones[2]?.rotateZ(delta * -0.005);
        modelSkeleton?.bones[3]?.rotateZ(delta * -0.0025);
      }

      renderer.render(scene, camera);

      if (params["Render This Frame"]) {
        exportCanvas(appContainer, state.file + ".png");
        params["Render This Frame"] = false;
      }
    }
    renderer.setAnimationLoop(animate);
  });
};
state.setOnUpdate(render);
