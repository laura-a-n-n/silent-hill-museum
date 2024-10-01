import {
  bindSkeletonToGeometry,
  bindSkeletonToTransparentGeometry,
  createGeometry,
  createMaterial,
  createSkeleton,
  MaterialType,
  MaterialView,
} from "./model";
import { loadModel, loadModelFromBytes } from "./load";
import {
  cameraFix,
  clientState,
  defaultParams,
  preferredParams,
} from "./objects/MuseumState";
import {
  createRainbowLights,
  disposeResources,
  exportCanvas,
  fitCameraToSelection,
  RenderSideMap,
  WrapMap,
} from "./utils";
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
  SphereGeometry,
  MeshBasicMaterial,
  Bone,
  RepeatWrapping,
  ClampToEdgeWrapping,
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
import GUI from "lil-gui";
import { acceptModelDrop, applyUpdate } from "./write";
import SilentHillModel from "./kaitai/Mdl";
import RaycastHelper from "./objects/RaycastHelper";
import logger from "./objects/Logger";
import "./keybinds";
import EditMode, { consoleGui } from "./edit-mode";
import { TextureViewerStates } from "./objects/TextureViewer";
import { editorState } from "./objects/EditorState";
import Gizmo from "./objects/Gizmo";

const appContainer = document.getElementById("app");
if (!(appContainer instanceof HTMLDivElement)) {
  throw Error("The app container was not found!");
}
const uiContainer = document.getElementById("ui-container");
if (!(uiContainer instanceof HTMLDivElement)) {
  throw Error("The UI container was not found!");
}

initializeModals();
acceptModelDrop(appContainer);

const params = new URLSearchParams(window.location.search);
const bypassAboutModal = params.get("bypass-modal");
if (!bypassAboutModal && localStorage.getItem("visited") === null) {
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

const gui = new GUI({ width: 250, container: uiContainer });
gui.domElement.id = "main-gui";

const dataGuiFolder = gui.addFolder("Data");
const scenarioInput = dataGuiFolder
  .add(clientState.uiParams, "Scenario", ["Main Scenario", "Born From A Wish"])
  .onFinishChange((scenarioName: "Main Scenario" | "Born From A Wish") => {
    clientState.rootFolder = scenarioName === "Main Scenario" ? "chr" : "chr2";
  });
const folderInput = dataGuiFolder
  .add(clientState.uiParams, "Folder", chrFolders)
  .onFinishChange((folderName: (typeof chrFolders)[number]) => {
    clientState.folder = folderName;
  });
const possibleFilenames = clientState.getPossibleFilenames();
const fileInput = dataGuiFolder.add(
  clientState.uiParams,
  "Filename",
  possibleFilenames
);
dataGuiFolder
  .add(clientState.uiParams, "Lock To Folder")
  .onFinishChange(() => {
    showContentWarningModal(
      () => {
        clientState.uiParams["Lock To Folder"] = false;
        render();
      },
      () => {
        clientState.setFileIndex(clientState.defaultStartIndex);
        const controllers = gui.controllersRecursive();
        controllers.forEach((c) => {
          c.setValue(c.initialValue);
        });
      }
    );
  })
  .listen();
const updateLink = (sharable?: boolean) => {
  const baseUrl =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname;
  if (sharable === false) {
    window.history.pushState({ path: baseUrl }, "", baseUrl);
    return;
  }
  const newUrl =
    baseUrl +
    "?model=" +
    [
      clientState.rootFolder,
      clientState.folder,
      clientState.file.split(".")[0],
    ].join("-");
  window.history.pushState({ path: newUrl }, "", newUrl);
};
dataGuiFolder
  .add(clientState.uiParams, "Sharable Link")
  .onFinishChange(updateLink);
dataGuiFolder.add(clientState.uiParams, "View Structure 🔎");
dataGuiFolder.add(clientState.uiParams, "Next File");
dataGuiFolder.add(clientState.uiParams, "Previous File");
dataGuiFolder.add(clientState.uiParams, "Save Image");
dataGuiFolder.add(clientState.uiParams, "Export to GLTF");
fileInput.onFinishChange((file: (typeof possibleFilenames)[number]) => {
  clientState.file = file;
});
dataGuiFolder.open();

const controlsGuiFolder = gui.addFolder("Controls");
const editModeButton = controlsGuiFolder
  .add(clientState.uiParams, "Edit Mode ✨")
  .listen()
  .onFinishChange((value: boolean) => {
    clientState.setMode(value ? "edit" : "viewing");
    if (value) {
      textureViewerButton.hide();
    } else {
      textureViewerButton.show();
    }
  });
const textureViewerButton = controlsGuiFolder
  .add(clientState.uiParams, "Texture Viewer 👀")
  .listen()
  .onFinishChange((value: boolean) => {
    if (value) {
      clientState.getTextureViewer()?.setState(TextureViewerStates.Locked);
    } else {
      clientState.getTextureViewer()?.setState(TextureViewerStates.Inactive);
    }
  });
controlsGuiFolder.add(clientState.uiParams, "Auto-Rotate");
controlsGuiFolder
  .add(clientState.uiParams, "Bone Controls")
  .onFinishChange((value: boolean) => {
    if (value) {
      controlsModeInput.show();
      boneSelector.show();
      return;
    }
    controlsModeInput.hide();
    boneSelector.hide();
    raycastTargets.forEach((target) => {
      target.removeFromParent();
      disposeResources(target);
    });
    raycastTargetsGenerated = false;
    raycastTargets.length = 0;
  });
const boneSelector = controlsGuiFolder
  .add(clientState.uiParams, "Selected Bone", 0, 1, 1)
  .onChange(() => boneTransformGizmo.getTransformControls().removeFromParent())
  .hide()
  .listen();
const controlsModeInput = controlsGuiFolder
  .add(clientState.uiParams, "Controls Mode", ["translate", "rotate"])
  .listen()
  .hide();

const geometryFolder = gui.addFolder("Geometry");
geometryFolder
  .add(clientState.uiParams, "Render Opaque")
  .onFinishChange(() => render());
geometryFolder
  .add(clientState.uiParams, "Render Transparent")
  .onFinishChange(() => render());
if (clientState.getGlVersion() === 2) {
  geometryFolder
    .add(clientState.uiParams, "Skeleton Mode")
    .onFinishChange(() => render());
  geometryFolder
    .add(clientState.uiParams, "Visualize Skeleton")
    .onFinishChange((on: boolean) => {
      if (on && clientState.uiParams["Model Opacity"] > 0.5) {
        clientState.uiParams["Model Opacity"] = 0.5;
      } else if (!on) {
        clientState.uiParams["Model Opacity"] = 1.0;
      }
      render();
    });
} else {
  controlsGuiFolder.hide();
  geometryFolder.add(clientState.uiParams, "Auto-Rotate");
}
geometryFolder
  .add(clientState.uiParams, "Visualize Normals")
  .onFinishChange(() => render());

const textureFolder = gui.addFolder("Texture");
textureFolder
  .add(clientState.uiParams, "Render Mode", [
    MaterialView.Flat,
    MaterialView.UV,
    MaterialView.Wireframe,
    MaterialView.Textured,
  ])
  .onFinishChange(() => render());
textureFolder
  .add(clientState.uiParams, "Render Side", [
    "DoubleSide",
    "FrontSide",
    "BackSide",
  ])
  .onFinishChange(() => render())
  .listen();
textureFolder
  .add(clientState.uiParams, "Wrapping", [
    "ClampToEdge",
    "Repeat",
    "MirroredRepeat",
  ])
  .onFinishChange(() => render())
  .listen()
  .setValue(clientState.uiParams.Wrapping.replace("Wrapping", ""));
textureFolder
  .add(clientState.uiParams, "Model Opacity", 0, 1, 0.01)
  .onFinishChange(() => render())
  .listen();
textureFolder
  .add(clientState.uiParams, "Transparency")
  .onFinishChange(() => render())
  .listen();
textureFolder
  .add(clientState.uiParams, "Invert Alpha")
  .onFinishChange(() => render())
  .listen();
textureFolder
  .add(clientState.uiParams, "Alpha Test", 0, 1, 0.01)
  .onFinishChange(() => render())
  .listen();

textureFolder.addColor(clientState.uiParams, "Ambient Color");
textureFolder.add(clientState.uiParams, "Ambient Intensity", 0, 8);
textureFolder
  .add(clientState.uiParams, "Fancy Lighting")
  .onFinishChange((value: boolean) => {
    if (!value && lightGroup) {
      lightGroup?.removeFromParent();
      disposeResources(lightGroup);
      lightGroup = undefined;
      return;
    } else if (value && !lightGroup) {
      render();
    }
  });

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
    textureViewerButton.hide();
    editModeButton.hide();
    clientState.setMode("viewing");
  } else if (width > 700 && gui._closed) {
    if (prefersReducedMotion) {
      gui.openAnimated();
    } else {
      gui.open();
    }
    textureViewerButton.show();
    editModeButton.show();
  }
};
onWindowResize();
window.addEventListener("resize", onWindowResize);

const raycastHelper = new RaycastHelper(renderer, camera);
const raycastTargets: Mesh[] = [];
let raycastTargetsGenerated = false;

const onClick = (event: MouseEvent) => {
  if (!clientState.uiParams["Bone Controls"]) {
    return;
  }
  const currentObject = clientState.getCurrentObject();
  for (const skinnedMesh of currentObject?.children.filter(
    (object) => object instanceof SkinnedMesh
  ) ?? []) {
    const bones = skinnedMesh.skeleton.bones;
    if (!bones || !bones.length || !currentObject) {
      return;
    }
    const cast = raycastHelper.cast(event, raycastTargets);
    const nearest = cast.shift();
    const parentBone = nearest?.object.parent;
    if (parentBone instanceof Bone) {
      const index = bones.indexOf(parentBone);
      clientState.uiParams["Selected Bone"] = index;
      boneTransformGizmo.getTransformControls().removeFromParent();
      break;
    }
  }
};
appContainer.addEventListener("click", onClick);

export const scene = new Scene();
const pmremGenerator = new PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(scene).texture;
ColorManagement.enabled = true;
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = ACESFilmicToneMapping;

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.autoRotate = clientState.uiParams["Auto-Rotate"];
orbitControls.update();
const disableOrbitControls = () => (orbitControls.enabled = false);
const enableOrbitControls = () => (orbitControls.enabled = true);

const boneTransformGizmo = new Gizmo(scene, camera, renderer.domElement);
boneTransformGizmo.setRenderLoop(() => {
  boneTransformGizmo.getTransformControls().mode = clientState.uiParams[
    "Controls Mode"
  ] as "translate" | "rotate" | "scale";
});
boneTransformGizmo.setOnDrag(disableOrbitControls);
boneTransformGizmo.setOnStopDrag(enableOrbitControls);

const modelTransformGizmo = new Gizmo(scene, camera, renderer.domElement);
const modelRenderLoop = (controls: TransformControls) => {
  controls.mode = clientState.uiParams["Controls Mode"] as
    | "translate"
    | "rotate"
    | "scale";
  controls.setRotationSnap(
    (editorState.editorParams["Rotation Step"] / 180) * Math.PI
  );
};
modelTransformGizmo.setRenderLoop(modelRenderLoop);
modelTransformGizmo.setOnDrag(() => {
  disableOrbitControls();
  editorState.modelPropertyDiff.transform =
    clientState.getCurrentObject()?.matrixWorld;
});
modelTransformGizmo.setOnStopDrag(enableOrbitControls);

const originalTransformGizmo = new Gizmo(scene, camera, renderer.domElement);
originalTransformGizmo.setRenderLoop(modelRenderLoop);
originalTransformGizmo.setOnDrag(disableOrbitControls);
originalTransformGizmo.setOnStopDrag(enableOrbitControls);

let helper: SkeletonHelper | undefined;

const clock = new Clock();
let group = new Group();
let lastIndex = clientState.getFileIndex();

const editor = new EditMode();

clientState.setOnModeUpdate((oldMode) => {
  const newMode = clientState.getMode();
  document.body.classList.remove(oldMode);
  clientState
    .getTextureViewer()
    ?.setState(
      newMode === "edit" || clientState.uiParams["Texture Viewer 👀"]
        ? TextureViewerStates.Locked
        : TextureViewerStates.Inactive
    );
  document.body.classList.add(newMode);
  if (newMode === "edit") {
    consoleGui.openAnimated();
  } else {
    logger.disablePipeIfExists("editModeLog");
    consoleGui.close();
  }
  onWindowResize();
});

let lightGroup: Group | undefined;

const render = () => {
  const modelCallback = (
    model: SilentHillModel | undefined,
    cleanupResources = true
  ) => {
    logger.debug("Parsed model structure", model);
    scene.clear();
    const light = new AmbientLight(
      clientState.uiParams["Ambient Color"],
      clientState.uiParams["Ambient Intensity"]
    );
    scene.add(light);
    if (model === undefined) {
      return;
    }

    if (cleanupResources) {
      disposeResources(group);
      helper?.dispose();
      group.clear();
    }
    group = new Group();

    raycastTargetsGenerated = false;
    raycastTargets.length = 0;

    if (editorState.cachedOriginalModel) {
      scene.add(editorState.cachedOriginalModel);
      if (clientState.uiParams["Visualize Skeleton"]) {
        helper = new SkeletonHelper(editorState.cachedOriginalModel);
        scene.add(helper);
      }
    }

    // temporary: separate into opaque & transparent until specularity is implemented?
    // likely need to create more materials for most accurate results
    const opaqueMaterial = createMaterial(
      model,
      clientState.uiParams["Render Mode"] as MaterialType,
      {
        alphaTest: clientState.uiParams["Alpha Test"],
        transparent: clientState.uiParams["Visualize Skeleton"],
        side: RenderSideMap[
          clientState.uiParams["Render Side"] as
            | "DoubleSide"
            | "FrontSide"
            | "BackSide"
        ],
        opacity: clientState.uiParams["Model Opacity"],
      },
      clientState.uiParams["Invert Alpha"],
      WrapMap[
        clientState.uiParams.Wrapping as
          | "ClampToEdgeWrapping"
          | "RepeatWrapping"
          | "MirroredRepeatWrapping"
      ] ??
        (model.modelData.geometry.primitiveHeaders[0].body.samplerStates[0] ===
        0x01
          ? RepeatWrapping
          : ClampToEdgeWrapping)
    );
    const transparentMaterial = createMaterial(
      model,
      clientState.uiParams["Render Mode"] as MaterialType,
      {
        alphaTest: clientState.uiParams["Alpha Test"],
        transparent:
          clientState.uiParams.Transparency ||
          clientState.uiParams["Visualize Skeleton"],
        side: RenderSideMap[
          clientState.uiParams["Render Side"] as
            | "DoubleSide"
            | "FrontSide"
            | "BackSide"
        ],
        opacity: clientState.uiParams["Model Opacity"],
      },
      clientState.uiParams["Invert Alpha"],
      WrapMap[
        clientState.uiParams.Wrapping as
          | "ClampToEdgeWrapping"
          | "RepeatWrapping"
          | "MirroredRepeatWrapping"
      ] ??
        (model.modelData.geometry.primitiveHeaders[0].body.samplerStates[0] ===
        0x01
          ? RepeatWrapping
          : ClampToEdgeWrapping),
      opaqueMaterial instanceof Material ? [opaqueMaterial] : opaqueMaterial
    );

    if (
      opaqueMaterial instanceof Material &&
      opaqueMaterial.name === "uv-map" &&
      clientState.uiParams["Render Mode"] !== MaterialView.UV
    ) {
      textureFolder.hide();
    } else {
      textureFolder.show();
    }

    const opaqueGeometry = clientState.uiParams["Render Opaque"]
      ? createGeometry(model, 0)
      : undefined;

    let modelSkeleton: Skeleton | undefined = undefined;
    let opaqueMesh: SkinnedMesh | Mesh;
    if (opaqueGeometry) {
      opaqueGeometry.name = `${clientState.file}-opaque`;

      if (clientState.uiParams["Skeleton Mode"]) {
        const { skeleton, rootBoneIndices } = createSkeleton(model);
        bindSkeletonToGeometry(model, opaqueGeometry);

        opaqueMesh = new SkinnedMesh(opaqueGeometry, opaqueMaterial);
        rootBoneIndices.forEach((boneIndex) =>
          opaqueMesh.add(skeleton.bones[boneIndex])
        );
        (opaqueMesh as SkinnedMesh).bind(skeleton);
        modelSkeleton = skeleton;

        if (clientState.uiParams["Visualize Skeleton"]) {
          helper = new SkeletonHelper(opaqueMesh);
          scene.add(helper);
        }
      } else {
        opaqueMesh = new Mesh(opaqueGeometry, opaqueMaterial);
      }
      opaqueMesh.renderOrder = 1;

      if (clientState.uiParams["Visualize Normals"]) {
        const normalsHelper = new VertexNormalsHelper(opaqueMesh, 8, 0xff0000);
        opaqueMesh.add(normalsHelper);
      }

      logger.debug("Added opaque geometry to mesh!", opaqueGeometry);
      group.add(opaqueMesh);
    }

    const transparentGeometry = clientState.uiParams["Render Transparent"]
      ? createGeometry(model, 1)
      : undefined;
    let transparentMesh: SkinnedMesh | Mesh;
    if (transparentGeometry) {
      transparentGeometry.name = `${clientState.file}-transparent`;

      if (clientState.uiParams["Skeleton Mode"]) {
        transparentMesh = new SkinnedMesh(
          transparentGeometry,
          transparentMaterial
        );

        if (!opaqueGeometry || !modelSkeleton) {
          const { skeleton, rootBoneIndices } = createSkeleton(model);
          modelSkeleton = skeleton;
          rootBoneIndices.forEach((boneIndex) =>
            transparentMesh.add(skeleton.bones[boneIndex])
          );
        }
        bindSkeletonToTransparentGeometry(model, transparentGeometry);
        (transparentMesh as SkinnedMesh).bind(modelSkeleton);
      } else {
        transparentMesh = new Mesh(transparentGeometry, transparentMaterial);
      }
      transparentMesh.renderOrder = 2;

      if (clientState.uiParams["Visualize Normals"]) {
        const normalsHelper = new VertexNormalsHelper(
          transparentMesh,
          8,
          0xff0000
        );
        transparentMesh.add(normalsHelper);
      }

      logger.debug("Added transparent geometry to mesh!", transparentGeometry);
      group.add(transparentMesh);
    }

    group.userData = {
      silentHillModel: {
        name: clientState.file,
        characterId: model.header.characterId,
      },
    };
    logger.debug("Adding group to scene", group);
    scene.add(group);

    clientState.setCurrentObject(group);
    clientState.getTextureViewer()?.attach(group);
    if (
      !clientState.getCustomModel() &&
      (opaqueGeometry !== undefined || transparentGeometry !== undefined)
    ) {
      const fix = cameraFix[filename as MuseumFile];
      fitCameraToSelection(camera, orbitControls, [group]);
      if (fix !== undefined) {
        orbitControls.target.copy(fix.controlsTarget);
        camera.position.copy(fix.cameraPosition);
        orbitControls.update();
      }
    }

    let lightAnimate: (deltaTime: number) => void | undefined;
    if (clientState.uiParams["Fancy Lighting"] && !lightGroup) {
      const { lightGroup: fancyLightingGroup, animate: fancyLightingAnimate } =
        createRainbowLights(group, 20);
      lightGroup = fancyLightingGroup;
      lightAnimate = fancyLightingAnimate;
    }

    if (
      !clientState.getCustomModel() &&
      clientState.folder === "favorites" &&
      clientState.file === "org.mdl"
    ) {
      modelSkeleton?.bones[0]?.rotateZ(Math.PI / 2);
      modelSkeleton?.bones[6]?.rotateZ(-Math.PI / 2);
      modelSkeleton?.bones[7]?.rotateZ(-Math.PI / 2);
      modelSkeleton?.bones[8]?.rotateZ(Math.PI / 2);
    }

    const maxBoneSelection = (modelSkeleton?.bones.length ?? 1) - 1;
    boneSelector.max(maxBoneSelection);
    if (maxBoneSelection === 0) {
      boneSelector.hide();
    } else if (clientState.uiParams["Bone Controls"]) {
      boneSelector.show();
    }

    boneTransformGizmo.setOnAdded(() => {
      if (!raycastTargetsGenerated) {
        raycastTargetsGenerated = true;
        const modelBones = modelSkeleton?.bones ?? [];
        const bones = modelBones;
        bones.forEach((bone) => {
          const sphere = new SphereGeometry(8);
          const material = new MeshBasicMaterial({
            opacity: 0.5,
            transparent: true,
          });
          const mesh = new Mesh(sphere, material);
          raycastTargets.push(mesh);
          bone.add(mesh);
        });
      }
    });

    function animate() {
      const delta = clock.getDelta() * 120; // targeting 120 fps
      modelTransformGizmo.render(
        clientState.getMode() === "edit" &&
          editorState.editorParams["Model Controls"],
        group
      );
      boneTransformGizmo.render(
        !!modelSkeleton && clientState.uiParams["Bone Controls"],
        modelSkeleton?.bones[clientState.uiParams["Selected Bone"]]
      );
      originalTransformGizmo.render(
        clientState.getMode() === "edit" &&
          editorState.editorParams["Base Model Controls"],
        editorState.cachedOriginalModel
      );

      orbitControls.autoRotate = clientState.uiParams["Auto-Rotate"];
      orbitControls.update();

      light.color = new Color(clientState.uiParams["Ambient Color"]);
      light.intensity = clientState.uiParams["Ambient Intensity"];
      lightAnimate?.(delta);

      if (
        !clientState.getCustomModel() &&
        clientState.folder === "favorites" &&
        clientState.file === "org.mdl"
      ) {
        modelSkeleton?.bones[2]?.rotateZ(delta * -0.005);
        modelSkeleton?.bones[3]?.rotateZ(delta * -0.0025);
      }

      renderer.render(scene, camera);

      if (clientState.uiParams["Render This Frame"]) {
        exportCanvas(appContainer, clientState.file + ".png");
        clientState.uiParams["Render This Frame"] = false;
      }
    }
    renderer.setAnimationLoop(animate);
    return group;
  };

  const filename = clientState.file;
  const currentFileIndex = clientState.getFileIndex();
  if (lastIndex !== currentFileIndex) {
    if (
      clientState.folder !== "favorites" &&
      !clientState.hasAcceptedContentWarning()
    ) {
      showContentWarningModal(
        () => {
          clientState.uiParams["Lock To Folder"] = false;
          render();
        },
        () => {
          clientState.setFileIndex(clientState.defaultStartIndex);
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
        clientState.uiParams,
        preferredParams[filename as keyof typeof preferredParams]
      );
    } else {
      Object.assign(clientState.uiParams, defaultParams);
    }
    clientState.uiParams["Selected Bone"] = 0;

    fileInput.setValue(clientState.file);
    scenarioInput.setValue(
      clientState.rootFolder === "chr" ? "Main Scenario" : "Born From A Wish"
    );
    folderInput.setValue(clientState.folder);
    folderInput.options(clientState.getPossibleFolders());
    fileInput.options(clientState.getPossibleFilenames());

    disposeResources(lightGroup);
    lightGroup = undefined;

    clientState.releaseCustomModel();

    if (clientState.uiParams["Sharable Link"] && !!history.pushState) {
      updateLink();
    }
  }

  editor.toggleOptionsIfNeeded();
  const customModel = clientState.getCustomModel();
  if (customModel !== undefined) {
    if (
      clientState.getMode() === "edit" &&
      editorState.serializerNeedsUpdate()
    ) {
      applyUpdate();
      return;
    }

    if (
      clientState.getMode() === "edit" &&
      editorState.editorParams["Show Original"] &&
      !editorState.cachedOriginalModel
    ) {
      loadModel(clientState.fullPath).then((original) => {
        const cachedOriginalModel = modelCallback(original);
        if (cachedOriginalModel) {
          cachedOriginalModel.parent = null;
        }
        cachedOriginalModel?.traverse((object) => {
          if (object instanceof Mesh) {
            const materials =
              object.material instanceof Material
                ? [object.material]
                : object.material;
            materials.forEach((material: Material) => {
              material.transparent = true;
              material.opacity = 0.5;
            });
          }
        });
        editorState.cachedOriginalModel = cachedOriginalModel;

        const model = loadModelFromBytes(customModel.contents);
        model._read();
        modelCallback(model, false);
      });
    } else {
      if (
        !editorState.editorParams["Show Original"] &&
        editorState.cachedOriginalModel instanceof Group
      ) {
        disposeResources(editorState.cachedOriginalModel);
        editorState.cachedOriginalModel = undefined;
      }
      const model = loadModelFromBytes(customModel.contents);
      model._read();
      modelCallback(model);
    }
    return;
  }
  loadModel(clientState.fullPath).then((model) => {
    clientState.setCurrentViewerModel(model);
    modelCallback(model);
  });
};
render();
clientState.setOnUpdate(render);
