import { DEFAULT_SETTINGS } from "./config";
import "./popup.css";
import "./popup.html";

const enabledInput = document.querySelector("#enabled");
const substringInput = document.querySelector("#font-substring");
const form = document.querySelector("#settings-form");
const saveStatus = document.querySelector("#save-status");

chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
  enabledInput.checked = settings.enabled;
  substringInput.value = settings.fontSubstring;
});

enabledInput.addEventListener("change", () => {
  chrome.storage.sync.set({ enabled: enabledInput.checked });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const fontSubstring =
    substringInput.value.trim() || DEFAULT_SETTINGS.fontSubstring;
  substringInput.value = fontSubstring;
  chrome.storage.sync.set({ fontSubstring }, () => {
    saveStatus.textContent = "Saved";
  });
});
