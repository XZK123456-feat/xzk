const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "detail-stage.js"), "utf8");

function createClassList() {
  const values = new Set();
  return {
    add(...names) {
      names.forEach((name) => values.add(name));
    },
    contains(name) {
      return values.has(name);
    },
    remove(...names) {
      names.forEach((name) => values.delete(name));
    },
  };
}

class FakeControl {
  constructor(document) {
    this.ownerDocument = document;
    this.attributes = new Map();
    this.classList = createClassList();
    this.dataset = {};
    this.disabled = false;
    this.parentElement = null;
    this.tagName = "BUTTON";
    this.textContent = "";
    this.type = "";
  }

  closest(selector) {
    if (selector === "[data-media-retry]" && this.dataset.mediaRetry !== undefined) {
      return this;
    }
    return this.parentElement?.closest?.(selector) || null;
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  remove() {
    if (this.parentElement) {
      this.parentElement.retryControl = null;
    }
    this.parentElement = null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
}

class FakeFrame {
  constructor(document, tagName = "DIV") {
    this.ownerDocument = document;
    this.attributes = new Map();
    this.children = [];
    this.classList = createClassList();
    this.dataset = {};
    this.media = null;
    this.retryControl = null;
    this.tagName = tagName;
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    this.retryControl = child;
    return child;
  }

  closest(selector) {
    if (selector === "[data-media-retry]" && this.dataset.mediaRetry !== undefined) {
      return this;
    }
    return null;
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  querySelector(selector) {
    if (selector === "[data-media-retry]") return this.retryControl;
    if (selector.includes("img") || selector.includes("video")) return this.media;
    return null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
}

class FakeMedia {
  constructor(frame, tagName, attributes = {}) {
    this.attributes = new Map(Object.entries(attributes));
    this.dataset = {};
    this.frame = frame;
    this.loadCount = 0;
    this.tagName = tagName;
    frame.media = this;
  }

  closest(selector) {
    return selector.includes(".detail-shot") || selector.includes(".community-video-stage")
      ? this.frame
      : null;
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  load() {
    this.loadCount += 1;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
}

class FakeRoot {
  constructor(document) {
    this.ownerDocument = document;
    this.listeners = new Map();
  }

  addEventListener(type, listener, options) {
    this.listeners.set(type, { listener, options });
  }

  contains() {
    return true;
  }

  dispatch(type, target) {
    let prevented = false;
    let stopped = false;
    this.listeners.get(type)?.listener({
      target,
      preventDefault() {
        prevented = true;
      },
      stopImmediatePropagation() {
        stopped = true;
      },
    });
    return { prevented, stopped };
  }
}

const frames = [];
const document = {
  body: null,
  createElement() {
    return new FakeControl(document);
  },
  defaultView: {
    requestAnimationFrame(callback) {
      callback();
    },
  },
};
const window = {};
vm.runInNewContext(source, { console, document: null, window }, { filename: "detail-stage.js" });

assert.strictEqual(
  typeof window.DetailStage?.installMediaRecovery,
  "function",
  "DetailStage should expose shared media recovery before DOM initialization",
);

const galleryRoot = new FakeRoot(document);
assert.strictEqual(window.DetailStage.installMediaRecovery(galleryRoot), true);
assert.strictEqual(
  window.DetailStage.installMediaRecovery(galleryRoot),
  false,
  "media recovery installation should be idempotent",
);

const imageFrame = new FakeFrame(document, "BUTTON");
frames.push(imageFrame);
const image = new FakeMedia(imageFrame, "IMG", {
  src: "thumb.webp",
  srcset: "thumb-480.webp 480w, thumb.webp 960w",
});
galleryRoot.dispatch("error", image);
assert.ok(imageFrame.classList.contains("has-media-error"), "failed image frame should expose a stable error state");
assert.strictEqual(imageFrame.dataset.mediaRetry, "", "an existing gallery button should become the retry control");
assert.match(imageFrame.getAttribute("aria-label"), /重试/, "gallery retry should be announced through the existing button");

const imageRetryEvent = galleryRoot.dispatch("click", imageFrame);
assert.strictEqual(image.getAttribute("src"), "thumb.webp", "retry should restore the failed image source");
assert.strictEqual(
  image.getAttribute("srcset"),
  "thumb-480.webp 480w, thumb.webp 960w",
  "retry should restore responsive image candidates",
);
assert.ok(imageRetryEvent.prevented && imageRetryEvent.stopped, "retry should not also open the Lightbox");

const videoFrame = new FakeFrame(document);
frames.push(videoFrame);
const video = new FakeMedia(videoFrame, "VIDEO", { "data-src": "clip.mp4" });
galleryRoot.dispatch("error", video);
assert.ok(videoFrame.retryControl, "failed video should receive a dedicated retry button");
assert.strictEqual(videoFrame.retryControl.dataset.mediaRetry, "");
galleryRoot.dispatch("click", videoFrame.retryControl);
assert.strictEqual(video.getAttribute("src"), "clip.mp4", "video retry should hydrate the lazy source");
assert.strictEqual(video.loadCount, 1, "video retry should restart media loading exactly once");

galleryRoot.dispatch("load", image);
assert.ok(!imageFrame.classList.contains("has-media-error"), "successful media load should clear the error state");

const detailPages = [
  "website-design.html",
  "ua-creatives.html",
  "community-creatives.html",
  "video-design.html",
];
detailPages.forEach((file) => {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  assert.match(
    html,
    /data-stage-live[^>]*aria-live="polite"[^>]*aria-atomic="true"/,
    `${file} should include a dedicated polite stage announcement`,
  );
});

const css = fs.readFileSync(path.join(root, "click-stage.css"), "utf8");
assert.match(css, /\.stage-live-region\s*\{[\s\S]*?position:\s*fixed;/);
assert.match(css, /\.has-media-error/);
assert.match(css, /\[data-media-retry\]/);

console.log("click stage accessibility and recovery checks passed");
