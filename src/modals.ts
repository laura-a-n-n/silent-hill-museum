const uiDescriptions: {
  [elementKey: string]: { open: boolean; element: HTMLDivElement | undefined };
} = {
  aboutModal: { open: false, element: undefined },
  disclaimerModal: { open: false, element: undefined },
  blurBackground: { open: false, element: undefined },
  keybindsModal: { open: false, element: undefined },
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
  addUiElement("aboutModal", aboutModal);
  addUiElement("blurBackground", blurBackground);
  addUiElement("disclaimerModal", disclaimerModal);
  addUiElement("keybindsModal", keybindsModal);
  openAboutModal.addEventListener("click", () => {
    toggleElement("aboutModal", true);
    toggleElement("blurBackground", true);
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

export const toggleElement = (
  elementKey: keyof typeof uiDescriptions,
  state?: boolean
) => {
  uiDescriptions[elementKey].open = state ?? !uiDescriptions[elementKey].open;
  const modalElement = uiDescriptions[elementKey].element;
  if (!modalElement) {
    return;
  }
  modalElement.style.display = uiDescriptions[elementKey].open
    ? "block"
    : "none";
};

export const onConfirm = (confirmCallback: () => void) => {
  const confirmButton = document.getElementById("confirm-button");
  if (!(confirmButton instanceof HTMLButtonElement)) {
    throw Error("Did not find confirm button!");
  }
  function onConfirm() {
    confirmCallback();
    confirmButton?.removeEventListener("pointerdown", onConfirm);
    closeAllElements();
  }
  confirmButton.addEventListener("pointerdown", onConfirm);
};
