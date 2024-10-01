import { clientState } from "./objects/MuseumState";

type UiDescription = {
  open: boolean;
  element: HTMLDivElement | undefined;
  onClose?: () => void;
};
const uiDescriptions: {
  [elementKey: string]: UiDescription;
} = {
  aboutModal: { open: false, element: undefined },
  disclaimerModal: { open: false, element: undefined },
  blenderExportModal: { open: false, element: undefined },
  blurBackground: { open: false, element: undefined },
  keybindsModal: { open: false, element: undefined },
  contentWarningModal: { open: false, element: undefined },
  webglNotSupportedModal: { open: false, element: undefined },
  quickModal: { open: false, element: undefined },
};

const uiQueue: { elementKey: string; open?: boolean }[] = [];

export const addUiElement = (
  elementKey: string,
  element?: HTMLDivElement,
  open = false
) => {
  uiDescriptions[elementKey] = { open, element };
};

export const initializeModals = () => {
  const aboutModal = document.getElementById("about-modal");
  if (!(aboutModal instanceof HTMLDivElement)) {
    throw Error("Did not find the about modal!");
  }
  const blurBackground = document.getElementById("blur-background");
  if (!(blurBackground instanceof HTMLDivElement)) {
    throw Error("Did not find the background element!");
  }
  const openAboutModal = document.getElementById("open-about-modal");
  if (!(openAboutModal instanceof HTMLAnchorElement)) {
    throw Error("Did not find the about modal open link!");
  }
  const disclaimerModal = document.getElementById("disclaimer-modal");
  if (!(disclaimerModal instanceof HTMLDivElement)) {
    throw Error("Did not find the disclaimer modal!");
  }
  const blenderExportModal = document.getElementById("blender-export-modal");
  if (!(blenderExportModal instanceof HTMLDivElement)) {
    throw Error("Did not find the blender export modal!");
  }
  const keybindsModal = document.getElementById("keybinds-modal");
  if (!(keybindsModal instanceof HTMLDivElement)) {
    throw Error("Did not find the keybinds modal!");
  }
  const contentWarningModal = document.getElementById("content-warning-modal");
  if (!(contentWarningModal instanceof HTMLDivElement)) {
    throw Error("Did not find the content warning modal!");
  }
  const webglNotSupportedModal = document.getElementById(
    "webgl-not-supported-modal"
  );
  if (!(webglNotSupportedModal instanceof HTMLDivElement)) {
    throw Error("Did not find the support message modal!");
  }
  const quickModal = document.getElementById("quick-modal");
  if (!(quickModal instanceof HTMLDivElement)) {
    throw Error("Did not find the quick modal!");
  }
  addUiElement("aboutModal", aboutModal);
  addUiElement("blurBackground", blurBackground);
  addUiElement("disclaimerModal", disclaimerModal);
  addUiElement("keybindsModal", keybindsModal);
  addUiElement("contentWarningModal", contentWarningModal);
  addUiElement("webglNotSupportedModal", webglNotSupportedModal);
  addUiElement("blenderExportModal", blenderExportModal);
  addUiElement("quickModal", quickModal);
  openAboutModal.addEventListener("click", () => {
    toggleWithBackground("aboutModal", true);
  });
  blurBackground.addEventListener("click", () => closeAllElements());
  const closeButtons = document.querySelectorAll(".close-all-modals");
  closeButtons.forEach((button) =>
    button.addEventListener("click", () => closeAllElements())
  );
};

export const isAnyElementOpen = () => {
  return uiDescriptions.blurBackground.open;
};

export const isAnyElementOpenOtherThan = (elementKey: string) => {
  return isAnyElementOpen() && !uiDescriptions[elementKey].open;
};

export const closeAllElements = () => {
  for (const elementKey in uiDescriptions) {
    toggleElement(elementKey, false);
  }
  const queued = uiQueue.pop();
  if (queued === undefined) {
    return;
  }
  toggleWithBackground(queued.elementKey, queued.open);
};

export const pushToQueue = (elementKey: string, open?: boolean) => {
  if (!isAnyElementOpen() && !uiQueue.length) {
    toggleWithBackground(elementKey, open);
    return;
  }
  uiQueue.push({ elementKey, open });
};

export const toggleWithBackground = (
  elementKey: keyof typeof uiDescriptions,
  state?: boolean
) => {
  toggleElement("blurBackground", state);
  toggleElement(elementKey, state);
};

export const toggleElement = (
  elementKey: keyof typeof uiDescriptions,
  state?: boolean
) => {
  const open = state ?? !uiDescriptions[elementKey].open;
  if (elementKey === "blurBackground" && isAnyElementOpen() && open) {
    // If ui element is already open, close it
    closeAllElements();
  }
  uiDescriptions[elementKey].open = open;
  if (!open) {
    uiDescriptions[elementKey].onClose?.();
  }

  const modalElement = uiDescriptions[elementKey].element;
  if (!modalElement) {
    return;
  }
  modalElement.style.display = open ? "block" : "none";
  if (open) {
    modalElement.classList.add("active");
  } else {
    modalElement.classList.remove("active");
  }
};

export const onConfirm = (
  confirmCallback: () => void,
  uiDescription?: UiDescription
) => {
  const confirmButton = document.querySelector(".modal.active .confirm-button");
  if (!(confirmButton instanceof HTMLButtonElement)) {
    throw Error("Did not find confirm button!");
  }
  if (confirmButton.getAttribute("eventListenerAdded")) {
    return;
  }
  function onConfirm() {
    if (uiDescription?.onClose) {
      uiDescription.onClose = undefined;
    }
    closeAllElements();
    confirmCallback();
    confirmButton?.removeEventListener("click", onConfirm);
    confirmButton?.removeAttribute("eventListenerAdded");
  }
  confirmButton.setAttribute("eventListenerAdded", "true");
  confirmButton.addEventListener("click", onConfirm);
};

export const showContentWarningModal = (
  confirmCallback: () => void,
  declineCallback: () => void
) => {
  if (!clientState.hasAcceptedContentWarning()) {
    toggleWithBackground("contentWarningModal", true);
    uiDescriptions.contentWarningModal.onClose = declineCallback;
    onConfirm(() => {
      localStorage.setItem("contentWarningAccepted", "true");
      confirmCallback();
    }, uiDescriptions.contentWarningModal);
  } else {
    confirmCallback();
  }
};

export const showNotSupportedModal = (glVersion = 0, queue = true) => {
  const element = uiDescriptions.webglNotSupportedModal.element;
  if (!element) {
    throw Error("Could not find support message modal!");
  }
  if (element.innerHTML === "" && !glVersion) {
    let html = "";
    html += "<p>Sorry, WebGL is not supported in your browser :(</p>";
    html +=
      "<p>Please try updating your browser, or try a different device.</p>";
    element.innerHTML = html;
  } else if (element.innerHTML === "" && glVersion === 1) {
    let html = "";
    html +=
      "<p>WebGL 2 is not supported on your browser, but you can still use this site!</p>";
    html +=
      "<p>Please note that you will not be able to view or export model skeletons.</p>";
    html +=
      "<p>To allow skeleton mode, try updating your browser or using a different device.</p>";
    element.innerHTML = html;
  }
  if (queue) {
    pushToQueue("webglNotSupportedModal", true);
  } else {
    toggleWithBackground("webglNotSupportedModal", true);
  }
};

export const showQuickModal = (html?: string, className?: string) => {
  const element = uiDescriptions.quickModal.element;
  if (!element) {
    throw Error("Could not find quick modal element!");
  }
  if (html !== undefined) {
    element.innerHTML = html;
  }
  element.className = "modal";
  element.role = "button";
  if (className) {
    element.classList.add(className);
  }
  pushToQueue("quickModal", true);
  return element;
};
