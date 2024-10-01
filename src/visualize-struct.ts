type RenderableStruct = { [key: string]: any };

const DROPDOWN_CLASS = "json-dropdown";
const CONTENT_CLASS = "json-content";
const KEY_CLASS = "json-key";
const LITERAL_CLASS = "json-literal";
const TOGGLE_VISIBLE = "block";
const TOGGLE_HIDDEN = "none";
const INITIAL_DROPDOWN_TEXT = ": {...}";
const AUTOEXPAND_FILTER = ["model", "header"];
const ARRAY_LENGTH_CUTOFF = 6000;

const renderStructProperty = (
  parent: HTMLElement,
  key: string,
  value: RenderableStruct,
  autoexpand = false
) => {
  autoexpand = autoexpand || AUTOEXPAND_FILTER.includes(key);

  const button = document.createElement("button");
  button.className = DROPDOWN_CLASS;
  button.textContent = `${key}${INITIAL_DROPDOWN_TEXT}`;

  const content = document.createElement("div");
  content.className = CONTENT_CLASS;
  content.setAttribute("is-rendered", "false");

  parent.appendChild(button);
  parent.appendChild(content);

  const onClick = () => {
    const isRendered = content.getAttribute("is-rendered") === "true";
    if (!isRendered) {
      const renderableProperties = Object.keys(value)
        .concat(listGetters(value))
        .filter((name) => !name.includes("_"));
      content.setAttribute("is-rendered", "true");
      if (renderableProperties.length === 0) {
        content.innerHTML = "<em>(empty)</em>";
      } else {
        for (const subKey of renderableProperties) {
          content.appendChild(renderJson(subKey, value[subKey]));
        }
      }
      if (content && button) {
        content.style.display = TOGGLE_VISIBLE;
        button.textContent = `${key}:`;
      }
    } else {
      const isHidden = content.style.display !== TOGGLE_VISIBLE;
      content.style.display = isHidden ? TOGGLE_VISIBLE : TOGGLE_HIDDEN;
      button.textContent = isHidden
        ? `${key}:`
        : `${key}${INITIAL_DROPDOWN_TEXT}`;
    }
  };
  if (autoexpand) {
    onClick();
  } else {
    button.classList.add("interactive");
    button.addEventListener("click", onClick);
  }
};

function renderJson(
  key: string,
  value: any,
  autoexpand = false
): HTMLDivElement {
  const container = document.createElement("div");
  const isLargeArray =
    (Array.isArray(value) || value instanceof Uint8Array) &&
    value.length > ARRAY_LENGTH_CUTOFF;

  if (typeof value === "object" && value !== null && !isLargeArray) {
    renderStructProperty(container, key, value, autoexpand);
  } else {
    const literal = document.createElement("div");

    let processedValue = value;
    if (isLargeArray) {
      processedValue = `[large array of size ${value.length}]`;
    } else if (typeof value === "number" && Number.isInteger(value)) {
      processedValue = `<strong>${value < 0 ? "-" : ""}0x${Math.abs(
        value
      ).toString(16)}</strong> (${value})`;
    }

    let innerHtml = `<span class="${KEY_CLASS}">${key}</span>: `;
    innerHtml += `<span class="${LITERAL_CLASS}">${processedValue}</span>`;
    literal.innerHTML = innerHtml;
    container.appendChild(literal);
  }

  return container;
}

export const listGetters = (instance: object) =>
  Object.entries(
    Object.getOwnPropertyDescriptors(Reflect.getPrototypeOf(instance))
  )
    .filter((e) => typeof e[1].get === "function" && e[0] !== "__proto__")
    .map((e) => e[0]);

export const renderStructToContainer = (
  renderContainer: HTMLElement,
  object: RenderableStruct
) => {
  let innerHtml = '<p class="title">model structure viewer</p>';
  renderContainer.innerHTML = innerHtml;
  renderContainer.appendChild(renderJson("model", object, true));
};
