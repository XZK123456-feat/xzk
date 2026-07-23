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
const listenerCounts = new Map();
let loadedCount = 0;
const shot = {
  classList: {
    add(name) {
      if (name === "is-loaded") loadedCount += 1;
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
    listenerCounts.set(type, (listenerCounts.get(type) || 0) + 1);
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
context.window.initImageLoadStates(fakeRoot);

assert.strictEqual(
  loadedCount,
  0,
  "a deferred thumbnail with no real source must not be marked loaded just because complete is true",
);
assert.ok(listeners.has("load"), "a deferred thumbnail should keep a listener for its later real load");
assert.strictEqual(
  listenerCounts.get("load"),
  1,
  "initializing the same deferred thumbnail twice should bind only one load listener",
);
assert.strictEqual(listeners.get("load").options.once, true);

image.currentSrc = "assets/broken-thumb.webp";
context.window.initImageLoadStates(fakeRoot);
assert.strictEqual(loadedCount, 0, "a failed source with no natural width must remain in the loading state");
assert.strictEqual(
  listenerCounts.get("load"),
  1,
  "reinitializing an errored thumbnail should preserve its existing listener for a later retry",
);

image.currentSrc = "assets/thumb.webp";
image.naturalWidth = 320;
listeners.get("load").listener();
assert.strictEqual(
  loadedCount,
  1,
  "the thumbnail should become loaded exactly once after its assigned source really loads",
);

console.log("image load-state checks passed");
