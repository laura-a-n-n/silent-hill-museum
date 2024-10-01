import {
  isAnyElementOpenOtherThan,
  toggleWithBackground,
  closeAllElements,
} from "./modals";
import KeybindManager from "./objects/KeybindManager";
import { clientState } from "./objects/MuseumState";
import { editorState } from "./objects/EditorState";

const keybindManager = new KeybindManager();
keybindManager.addKeybind(
  "arrowright",
  () => clientState.nextFile(),
  "Next file"
);
keybindManager.addKeybind(
  "arrowleft",
  () => clientState.previousFile(),
  "Previous file"
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
  "f",
  () => clientState.nextRootFolder(),
  "Toggle scenarios"
);
keybindManager.addKeybind(
  "r",
  () => {
    clientState.uiParams["Controls Mode"] = "rotate";
    if (clientState.getMode() === "edit") {
      editorState.editorParams["Model Controls"] = true;
    }
  },
  "Rotate mode"
);
keybindManager.addKeybind(
  "t",
  () => {
    clientState.uiParams["Controls Mode"] = "translate";
    if (clientState.getMode() === "edit") {
      editorState.editorParams["Model Controls"] = true;
    }
  },
  "Move mode"
);
keybindManager.addKeybind(
  "s",
  () => {
    clientState.uiParams["Controls Mode"] = "scale";
    if (clientState.getMode() === "edit") {
      editorState.editorParams["Model Controls"] = true;
    }
  },
  "Scale mode"
);
keybindManager.addKeybind(
  "0",
  () => (clientState.uiParams["Render This Frame"] = true),
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
keybindManager.addKeybind("i", () =>
  clientState.uiParams["View Structure 🔎"]()
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
