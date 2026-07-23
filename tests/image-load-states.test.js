const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "script.js"), "utf8");
const start = source.indexOf("function markLoadedImage");
const end = source.indexOf("initBackToTop();", start);
assert.ok(start >= 0 && end > start, "image load-state helpers should remain executable in isolation");

const listeners = new Map();
let loaded = false;
const shot = {
  classList: {
    add(name) {
      if (name === "is-loaded") loaded = true;
    },
  },
};
const image = {
  complete: true,
  currentSrc: "",
  naturalWidth: 0,
  closest(selector) {
    return selector === ".detail-shot" ? shot : null;
  },
  getAttribute() {
    return null;
  },
  addEventListener(type, listener, options) {
    listeners.set(type, { listener, options });
  },
};
const fakeRoot = {
  querySelectorAll(selector) {
    return selector === ".detail-shot img" ? [image] : [];
  },
};
const context = {
  document: fakeRoot,
  window: {},
};

vm.runInNewContext(source.slice(start, end), context, { filename: "image-load-states.js" });
context.window.initImageLoadStates(fakeRoot);

assert.strictEqual(
  loaded,
  false,
  "a deferred thumbnail with no real source must not be marked loaded just because complete is true",
);
assert.ok(listeners.has("load"), "a deferred thumbnail should keep a listener for its later real load");
assert.strictEqual(listeners.get("load").options.once, true);

image.currentSrc = "assets/thumb.webp";
image.naturalWidth = 320;
listeners.get("load").listener();
assert.strictEqual(loaded, true, "the thumbnail should become loaded after its assigned source really loads");

console.log("image load-state checks passed");
