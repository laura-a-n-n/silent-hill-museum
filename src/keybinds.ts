import {
  isAnyElementOpenOtherThan,
  toggleWithBackground,
  closeAllElements,
} from "./modals";
import KeybindManager from "./objects/KeybindManager";
import { clientState } from "./objects/MuseumState";

const keybindManager = new KeybindManager();
keybindManager.addKeybind(
  "arrowright",
  () => clientState.nextFile(),
  "Next file in folder"
);
keybindManager.addKeybind(
  "arrowleft",
  () => clientState.previousFile(),
  "Previous file in folder"
);
keybindManager.addKeybind(
  "arrowup",
  () => clientState.nextFolder(),
  "Next folder"
);
keybindManager.addKeybind(
  "arrowdown",
  () => clientState.previousFolder(),
  "Previous folder"
);
keybindManager.addKeybind(
  "s",
  () => clientState.nextRootFolder(),
  "Toggle scenarios"
);
keybindManager.addKeybind(
  "r",
  () => (clientState.params["Controls Mode"] = "rotate"),
  "Bone rotate mode"
);
keybindManager.addKeybind(
  "t",
  () => (clientState.params["Controls Mode"] = "translate"),
  "Bone translate mode"
);
keybindManager.addKeybind(
  "0",
  () => (clientState.params["Render This Frame"] = true),
  "Render the current frame as PNG"
);
keybindManager.addKeybind(
  "k",
  () =>
    !isAnyElementOpenOtherThan("keybindsModal") &&
    toggleWithBackground("keybindsModal"),
  "Toggle keybinds modal"
);
keybindManager.addKeybind(
  "escape",
  () => closeAllElements(),
  "Close all modals"
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
    html += `<tr><td>${keybindHtml}</td>`;
    html += `<td>${description}</td></tr>`;
  }
  html += "</tbody></table>";
  keybindsModal.innerHTML = html;
}
