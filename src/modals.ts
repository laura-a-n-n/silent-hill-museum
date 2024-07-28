const uiDescriptions: {
  [elementKey: string]: { open: boolean; element: HTMLDivElement | undefined };
} = {
  aboutModal: { open: false, element: undefined },
  disclaimerModal: { open: false, element: undefined },
  blurBackground: { open: false, element: undefined },
  keybindsModal: { open: false, element: undefined },
  contentWarningModal: { open: false, element: undefined },
  webglNotSupportedModal: { open: false, element: undefined },
};

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
  addUiElement("aboutModal", aboutModal);
  addUiElement("blurBackground", blurBackground);
  addUiElement("disclaimerModal", disclaimerModal);
  addUiElement("keybindsModal", keybindsModal);
  addUiElement("contentWarningModal", contentWarningModal);
  addUiElement("webglNotSupportedModal", webglNotSupportedModal);
  openAboutModal.addEventListener("click", () => {
    toggleWithBackground("aboutModal", true);
  });
  blurBackground.addEventListener("click", () => closeAllElements());
  const closeButtons = document.querySelectorAll(".close-all-modals");
  closeButtons.forEach((button) =>
    button.addEventListener("click", () => closeAllElements())
  );
};

export const closeAllElements = () => {
  for (const elementKey in uiDescriptions) {
    toggleElement(elementKey, false);
  }
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
  if (
    elementKey === "blurBackground" &&
    uiDescriptions["blurBackground"].open &&
    state !== false
  ) {
    // If ui element is already open, close it
    closeAllElements();
  }
  uiDescriptions[elementKey].open = state ?? !uiDescriptions[elementKey].open;
  const modalElement = uiDescriptions[elementKey].element;
  if (!modalElement) {
    return;
  }
  const open = uiDescriptions[elementKey].open;
  modalElement.style.display = open ? "block" : "none";
  if (open) {
    modalElement.classList.add("active");
  } else {
    modalElement.classList.remove("active");
  }
};

export const onConfirm = (confirmCallback: () => void) => {
  const confirmButton = document.querySelector(".modal.active .confirm-button");
  if (!(confirmButton instanceof HTMLButtonElement)) {
    throw Error("Did not find confirm button!");
  }
  if (confirmButton.getAttribute("eventListenerAdded")) {
    return;
  }
  function onConfirm() {
    confirmCallback();
    confirmButton?.removeEventListener("click", onConfirm);
    confirmButton?.removeAttribute("eventListenerAdded");
    closeAllElements();
  }
  confirmButton.setAttribute("eventListenerAdded", "true");
  confirmButton.addEventListener("click", onConfirm);
};

export const showContentWarningModal = (confirmCallback: () => void) => {
  if (!localStorage.getItem("contentWarningAccepted")) {
    toggleWithBackground("contentWarningModal", true);
    onConfirm(() => {
      localStorage.setItem("contentWarningAccepted", "true");
      confirmCallback();
    });
  } else {
    confirmCallback();
  }
};

export const showNotSupportedModal = () => {
  const element = uiDescriptions.webglNotSupportedModal.element;
  if (!element) {
    throw Error("Could not find support message modal!");
  }
  if (element.innerHTML === "") {
    let html = "";
    html += "<p>Sorry, WebGL is not supported in your browser :(</p>";
    html += "<p>Please try updating your browser.</p>";
    html += "<p>If you are on a mobile phone, try using a computer.</p>";
    element.innerHTML = html;
  }
  toggleWithBackground("webglNotSupportedModal", true);
};
