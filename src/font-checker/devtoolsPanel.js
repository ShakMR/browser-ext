import "./devtoolsPanel.css";

const status = document.querySelector("#status");
const matches = document.querySelector("#matches");
const refreshButton = document.querySelector("#refresh");

const INSPECTOR_EXPRESSION = `(() => {
  const button = document.querySelector("#font-substring-checker-button");
  const elements = [...document.querySelectorAll(".font-substring-checker-match")];
  return {
    available: Boolean(button),
    checked: button?.dataset.checked === "true",
    substring: button?.dataset.fontSubstring || "",
    elements: elements.map((element) => {
      const id = element.id ? \`#\${element.id}\` : "";
      const classes = [...element.classList]
        .filter((className) => className !== "font-substring-checker-match")
        .slice(0, 2)
        .map((className) => \`.\${className}\`)
        .join("");
      return {
        selector: \`\${element.tagName.toLowerCase()}\${id}\${classes}\`,
        fontFamily: getComputedStyle(element).fontFamily,
        text: (element.innerText || element.textContent || "")
          .trim()
          .replace(/\\s+/g, " ")
          .slice(0, 160),
      };
    }),
  };
})()`;

const setStatus = (state, text) => {
  status.className = `status ${state}`;
  status.textContent = text;
};

const createMatchItem = ({ selector, fontFamily, text }) => {
  const item = document.createElement("li");
  const name = document.createElement("code");
  const font = document.createElement("span");
  const content = document.createElement("p");

  name.textContent = selector;
  font.className = "font-family";
  font.textContent = fontFamily;
  content.textContent = text || "No text content";
  item.append(name, font, content);
  return item;
};

const render = (result, exception) => {
  matches.replaceChildren();
  if (exception) {
    setStatus("error", exception.description || "Unable to inspect this page.");
  } else if (!result?.available) {
    setStatus(
      "waiting",
      "The checker is disabled or unavailable on this page.",
    );
  } else if (!result.checked) {
    setStatus(
      "waiting",
      `Click the floating button to scan for “${result.substring}”.`,
    );
  } else if (!result.elements.length) {
    setStatus("success", `OK — “${result.substring}” was not found.`);
  } else {
    setStatus(
      "error",
      `${result.elements.length} element${result.elements.length === 1 ? "" : "s"} matched “${result.substring}”.`,
    );
    matches.append(...result.elements.map(createMatchItem));
  }
};

const refresh = () =>
  chrome.devtools.inspectedWindow.eval(INSPECTOR_EXPRESSION, render);

refreshButton.addEventListener("click", refresh);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refresh();
});
setInterval(() => {
  if (!document.hidden) refresh();
}, 1000);
refresh();
