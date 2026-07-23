import { DEFAULT_SETTINGS } from "./config";
import "./fontChecker.css";

const BUTTON_ID = "font-substring-checker-button";
const MATCH_CLASS = "font-substring-checker-match";
let settings = DEFAULT_SETTINGS;
let button;
let highlightedElements = [];

const clearHighlights = () => {
  highlightedElements.forEach((element) =>
    element.classList.remove(MATCH_CLASS),
  );
  highlightedElements = [];
};

const resetButton = () => {
  button.className = "";
  button.textContent = "Aa";
  button.dataset.checked = "false";
  button.dataset.fontSubstring = settings.fontSubstring;
  button.title = `Check for fonts containing “${settings.fontSubstring}”`;
  button.setAttribute("aria-label", button.title);
};

const checkFonts = () => {
  clearHighlights();
  const substring = settings.fontSubstring.toLowerCase();
  highlightedElements = [...document.querySelectorAll("*")].filter(
    (element) =>
      element !== button &&
      window
        .getComputedStyle(element)
        .fontFamily.toLowerCase()
        .includes(substring),
  );
  highlightedElements.forEach((element) => element.classList.add(MATCH_CLASS));

  const found = highlightedElements.length > 0;
  button.dataset.checked = "true";
  button.className = found ? "has-match" : "no-match";
  button.textContent = found ? String(highlightedElements.length) : "OK";
  button.title = found
    ? `Found ${highlightedElements.length} elements using a font containing “${settings.fontSubstring}”`
    : `No fonts containing “${settings.fontSubstring}” found`;
  button.setAttribute("aria-label", button.title);
};

const showButton = () => {
  if (button) return;
  button = document.createElement("button");
  button.id = BUTTON_ID;
  button.type = "button";
  button.addEventListener("click", checkFonts);
  resetButton();
  document.body.appendChild(button);
};

const applySettings = (nextSettings) => {
  settings = { ...DEFAULT_SETTINGS, ...nextSettings };
  clearHighlights();
  if (settings.enabled) {
    showButton();
    resetButton();
  } else {
    button?.remove();
    button = undefined;
  }
};

chrome.storage.sync.get(DEFAULT_SETTINGS, applySettings);
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") return;
  applySettings({
    enabled: changes.enabled?.newValue ?? settings.enabled,
    fontSubstring: changes.fontSubstring?.newValue ?? settings.fontSubstring,
  });
});
