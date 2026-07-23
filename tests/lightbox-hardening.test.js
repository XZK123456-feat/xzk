const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const scriptPath = path.resolve(__dirname, "..", "click-stage.js");
const source = fs.readFileSync(scriptPath, "utf8");

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(value) {
    this.values.add(value);
  }

  remove(value) {
    this.values.delete(value);
  }

  contains(value) {
    return this.values.has(value);
  }
}

class FakeCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

class FakeLightbox {
  constructor() {
    this.attributes = new Map([["aria-hidden", "true"]]);
    this.classList = new FakeClassList();
    this.dataset = {};
    this.events = [];
    this.figure = {
      getBoundingClientRect() {
        return { left: 100, right: 300, top: 100, bottom: 300 };
      },
    };
  }

  dispatchEvent(event) {
    this.events.push(event);
    return true;
  }

  querySelector(selector) {
    return selector === "figure" ? this.figure : null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
}

class FakeImage {
  constructor() {
    this.listeners = new Map();
    this.style = {};
    this.attributes = new Map();
    this.assignedSources = [];
    this.naturalWidth = 0;
  }

  addEventListener(type, listener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(listener);
  }

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(type) {
    Array.from(this.listeners.get(type) || []).forEach((listener) => listener.call(this));
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  getAttribute(name) {
    return this.attributes.get(name) || "";
  }

  set src(value) {
    this.attributes.set("src", String(value));
    this.assignedSources.push(String(value));
  }

  get src() {
    return this.getAttribute("src");
  }
}

function makeItem(id, fullSmall, full) {
  const item = {
    dataset: {
      full,
      fullSmall,
      fullWidth: "1600",
    },
    hidden: false,
    id,
    image: {
      alt: id,
      currentSrc: `${id}-thumb.webp`,
      src: `${id}-thumb.webp`,
    },
    closest(selector) {
      return selector === ".detail-gallery" ? item.gallery : null;
    },
    querySelector(selector) {
      if (selector === "img") {
        return item.image;
      }
      if (selector === ".detail-shot-label") {
        return { textContent: id };
      }
      return null;
    },
  };
  return item;
}

const prefetched = [];
const context = {
  document: {},
  window: {
    CustomEvent: FakeCustomEvent,
    Image: class {
      set src(value) {
        prefetched.push(String(value));
      }
    },
  },
};
vm.runInNewContext(source, context, { filename: scriptPath });

const api = context.window.PortfolioLightbox;
assert.ok(api, "click-stage.js should expose the shared PortfolioLightbox API");

const sourceItems = [
  makeItem("a", "a-small.webp", "a.png"),
  makeItem("b", "b-small.webp", "b.png"),
  makeItem("c", "c-small.webp", "c.png"),
  makeItem("d", "d-small.webp", "d.png"),
  makeItem("e", "e-small.webp", "e.png"),
  makeItem("f", "f-small.png", "f.webp"),
];

assert.deepStrictEqual(
  Array.from(api.getAdjacentSources(sourceItems, 3)),
  ["b-small.webp", "c-small.webp", "e-small.webp"],
  "prefetching should be bounded to two items on either side and prefer the small source",
);
assert.deepStrictEqual(
  Array.from(api.getAdjacentSources([
    makeItem("same-a", "same.webp", "same.png"),
    makeItem("same-b", "same.webp", "same.png"),
    makeItem("other", "", "other.webp"),
  ], 1)),
  ["other.webp"],
  "tiny galleries should dedupe repeated candidates and never duplicate the current item",
);

const items = sourceItems.slice(0, 5);
const gallery = {
  querySelectorAll(selector) {
    return selector === "[data-detail-preview]" ? items : [];
  },
};
items.forEach((item) => {
  item.gallery = gallery;
});
items[3].hidden = true;

const lightbox = new FakeLightbox();
const image = new FakeImage();
const modalCalls = [];
const renderCalls = [];
const scheduled = [];
const controller = api.createController({
  activateModal(dialog, opener) {
    modalCalls.push(["activate", dialog, opener]);
  },
  createPrefetchImage() {
    return new context.window.Image();
  },
  deactivateModal(dialog) {
    modalCalls.push(["deactivate", dialog]);
    modalCalls.find(([type]) => type === "activate")[2].focusRestored = true;
  },
  image,
  lightbox,
  lockScroll() {
    modalCalls.push(["lock"]);
  },
  onRender(detail) {
    renderCalls.push(detail);
  },
  schedule(callback) {
    scheduled.push(callback);
  },
  unlockScroll() {
    modalCalls.push(["unlock"]);
  },
});

controller.open(items[0]);
assert.strictEqual(lightbox.classList.contains("is-open"), true);
assert.strictEqual(modalCalls.filter(([type]) => type === "activate").length, 1);
assert.strictEqual(modalCalls.find(([type]) => type === "activate")[2], items[0]);
assert.strictEqual(
  lightbox.events.filter(({ type }) => type === "portfolio:lightboxopen").length,
  1,
  "opening should dispatch one transition event",
);

controller.navigate(1);
controller.navigate(1);
controller.navigate(1);
assert.strictEqual(renderCalls.at(-1).item, items[3], "navigation should include hidden off-page category items");
assert.strictEqual(renderCalls.at(-1).items.length, items.length, "the full category should remain the Lightbox group");
assert.strictEqual(
  lightbox.events.filter(({ type }) => type === "portfolio:lightboxopen").length,
  1,
  "paging an open Lightbox must not dispatch duplicate open events",
);

const staleLoadListeners = Array.from(image.listeners.get("load") || []);
controller.navigate(1);
assert.strictEqual(image.style.opacity, "0", "a new source should hide the old image immediately");
staleLoadListeners.forEach((listener) => listener.call(image));
assert.strictEqual(image.style.opacity, "0", "a stale load callback must not reveal the previous image");
image.naturalWidth = 1200;
image.dispatch("load");
assert.strictEqual(image.style.opacity, "1", "only the active image request should reveal the image");

scheduled.splice(0).forEach((callback) => callback());
assert.deepStrictEqual(
  prefetched,
  ["b-small.webp", "c-small.webp", "d-small.webp", "e-small.webp"],
  "adjacent prefetch should stay deduped across rapid navigation",
);
assert.ok(prefetched.every((value) => !value.endsWith(".png")), "original PNG files must never be prefetched");

const interactiveTarget = {
  closest() {
    return {};
  },
};
assert.strictEqual(
  controller.shouldCloseFromBackdropClick({
    clientX: 20,
    clientY: 20,
    defaultPrevented: false,
    target: interactiveTarget,
  }),
  false,
  "Lightbox controls and content must never count as backdrop clicks",
);
assert.strictEqual(
  controller.shouldCloseFromBackdropClick({
    clientX: 90,
    clientY: 90,
    defaultPrevented: false,
    target: { closest: () => null },
  }),
  false,
  "the safety gap around the figure should not close the Lightbox",
);
assert.strictEqual(
  controller.shouldCloseFromBackdropClick({
    clientX: 20,
    clientY: 20,
    defaultPrevented: false,
    target: lightbox,
  }),
  true,
  "only the remote outer backdrop should close the Lightbox",
);

controller.close();
controller.close();
assert.strictEqual(items[0].focusRestored, true, "close should restore the exact original trigger");
assert.strictEqual(
  lightbox.events.filter(({ type }) => type === "portfolio:lightboxclose").length,
  1,
  "closing should dispatch exactly one transition event",
);
assert.strictEqual(modalCalls.filter(([type]) => type === "deactivate").length, 1);

console.log("lightbox hardening behavior checks passed");
