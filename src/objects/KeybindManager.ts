import logger from "./Logger";

export type KeyModifier = "control" | "meta" | "shift" | "alt";
// prettier-ignore
export type Key =
| "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m"
| "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
| "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "enter" | "space"
| "escape" | "arrowup" | "arrowdown" | "arrowleft" | "arrowright" | "backspace"
| "delete" | "tab";
export type KeyboardCallback = (event: KeyboardEvent) => void;

export type KeyCombination =
  | `${Key}`
  | `${KeyModifier}+${Key}`
  | `${KeyModifier}+${KeyModifier}+${Key}`;

export default class KeybindManager {
  private keybindMap = new Map<KeyCombination, KeyboardCallback>();
  private descriptionMap = new Map<KeyCombination, string>();
  private inputEnabled = true;
  private debugMode = false;

  constructor() {
    window.addEventListener("keydown", (event: KeyboardEvent) =>
      this.handleEvent(event)
    );
  }

  /**
   * Bind a key combination to a given callback.
   * @param keyCombination a string key combo, e.g. "control+shift+v"
   * @param callback a function that gets called when the key combination is detected
   * @returns true if keybind was successful, false if keybind is already defined
   */
  public addKeybind(
    keyCombination: KeyCombination,
    callback: KeyboardCallback,
    description?: string
  ) {
    if (this.keybindMap.get(keyCombination)) {
      return false;
    }

    this.keybindMap.set(keyCombination, callback);
    if (description) {
      this.descriptionMap.set(keyCombination, description);
    }
    return true;
  }

  public removeKeybind(keyCombination: KeyCombination) {
    this.keybindMap.delete(keyCombination);
  }

  public setInputEnabled(enabled: boolean) {
    this.inputEnabled = enabled;
  }

  public setDebugMode(debugMode: boolean) {
    this.debugMode = debugMode;
  }

  public getKeybindMap() {
    return Object.freeze(this.keybindMap);
  }

  public getDescriptionMap() {
    return Object.freeze(this.descriptionMap);
  }

  private handleEvent(event: KeyboardEvent) {
    if (!this.inputEnabled) {
      return;
    }

    const modifiers: Record<KeyModifier, boolean> = {
      control: event.ctrlKey,
      meta: event.metaKey,
      shift: event.shiftKey,
      alt: event.altKey,
    };

    const keysDown = [
      ...Object.keys(modifiers).filter(
        (modifier) => modifiers[modifier as KeyModifier]
      ),
    ];
    if (!(event.key.toLowerCase() in modifiers)) {
      keysDown.push(event.key);
    }

    const keyCombination = keysDown.join("+").toLowerCase() as KeyCombination;

    if (this.debugMode) {
      logger.debug("Key combination detected", keyCombination);
    }

    const action = this.keybindMap.get(keyCombination);
    action?.(event);

    if (this.debugMode && action) {
      logger.debug("Keybind action", this.keybindMap.get(keyCombination));
    }
  }
}
