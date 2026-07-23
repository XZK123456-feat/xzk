const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const scriptPath = path.resolve(__dirname, "..", "script.js");
const source = fs.readFileSync(scriptPath, "utf8");
const start = source.indexOf("const modalDialogStates = new WeakMap();");
const end = source.indexOf("function initBackToTop()");
assert.ok(start >= 0 && end > start, "shared modal implementation should remain extractable for behavior tests");

class FakeElement {
  constructor(name) {
    this.name = name;
    this.attributes = new Set();
    this.children = [];
    this.hidden = false;
    this.isConnected = true;
    this.visibility = "visible";
  }

  contains(element) {
    return this === element || this.children.includes(element);
  }

  focus() {
    document.activeElement = this;
    this.focusCount = (this.focusCount || 0) + 1;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  matches(selector) {
    return selector === "script, .page-loader" && (this.name === "script" || this.name === "loader");
  }

  querySelectorAll() {
    return this.children;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  setAttribute(name) {
    this.attributes.add(name);
  }
}

const opener = new FakeElement("opener");
const shell = new FakeElement("main");
const preInert = new FakeElement("pre-inert");
preInert.setAttribute("inert");
const dialog = new FakeElement("dialog");
const closeButton = new FakeElement("close");
const nextButton = new FakeElement("next");
dialog.children = [closeButton, nextButton];

const listeners = new Map();
const document = {
  activeElement: opener,
  body: {
    children: [shell, preInert, dialog],
  },
  addEventListener(type, listener) {
    listeners.set(type, listener);
  },
  querySelector(selector) {
    return selector === ".website-lightbox.is-open, .resume-overlay.is-open" ? dialog : null;
  },
};
const window = {};

vm.runInNewContext(source.slice(start, end), {
  document,
  getComputedStyle(element) {
    return { visibility: element.visibility };
  },
  window,
}, { filename: "modal-dialog-behavior.js" });

window.activateModalDialog(dialog, opener);
assert.strictEqual(document.activeElement, closeButton, "the first dialog control should receive initial focus");
assert.strictEqual(shell.hasAttribute("inert"), true, "the page shell should be inert while the dialog is open");
assert.strictEqual(preInert.hasAttribute("inert"), true, "pre-existing inert state should be preserved");

document.activeElement = nextButton;
let trapped = false;
listeners.get("keydown")({
  key: "Tab",
  preventDefault() {
    trapped = true;
  },
  shiftKey: false,
});
assert.strictEqual(trapped, true, "Tab should be trapped at the final dialog control");
assert.strictEqual(document.activeElement, closeButton);

window.deactivateModalDialog(dialog);
assert.strictEqual(document.activeElement, opener, "closing should restore the exact opener focus");
assert.strictEqual(shell.hasAttribute("inert"), false, "temporary page inert state should be removed");
assert.strictEqual(preInert.hasAttribute("inert"), true, "pre-existing inert state should remain");
assert.strictEqual(dialog.hasAttribute("inert"), true, "the closed dialog should be inert");

console.log("modal focus and inert behavior checks passed");
