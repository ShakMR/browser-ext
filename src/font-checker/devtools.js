import "./devtools.html";
import "./devtools-panel.html";

chrome.devtools.panels.create("Font Checker", "", "devtools-panel.html");
