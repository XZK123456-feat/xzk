const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const pages = [
  "index.html",
  "website-design.html",
  "ua-creatives.html",
  "community-creatives.html",
  "video-design.html",
];
const detailPages = new Set(pages.slice(1));
const read = (file) => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const css = read("styles.css");
const script = read("script.js");
const loaderBlocks = [];
const watchdogBlocks = [];

for (const page of pages) {
  const html = read(page);
  const htmlTag = html.match(/<html\b[^>]*>/)?.[0] || "";
  const bodyTag = html.match(/<body\b[^>]*>/)?.[0] || "";
  const expectedBodyClass = detailPages.has(page)
    ? 'class="detail-page is-page-loading"'
    : 'class="is-page-loading"';
  const criticalStyleIndex = html.indexOf("<style data-loader-critical>");
  const watchdogIndex = html.indexOf("<script data-loader-watchdog>");
  const stylesheetIndex = html.indexOf('<link rel="stylesheet"');

  assert.ok(htmlTag.includes('class="is-page-loading"'), `${page} html should start in the loading state`);
  assert.ok(bodyTag.includes(expectedBodyClass), `${page} body should preserve its page class and start loading`);
  assert.ok(criticalStyleIndex >= 0, `${page} should include marked critical loader CSS`);
  assert.ok(criticalStyleIndex < stylesheetIndex, `${page} critical loader CSS should precede the external stylesheet`);
  assert.ok(watchdogIndex > criticalStyleIndex && watchdogIndex < stylesheetIndex, `${page} watchdog should start before the external stylesheet`);
  assert.match(html, /<style data-loader-critical>[\s\S]*?overflow:\s*hidden;[\s\S]*?position:\s*fixed;[\s\S]*?z-index:\s*10000;[\s\S]*?background:\s*#111;[\s\S]*?<\/style>/, `${page} critical CSS should lock scrolling behind a dark fixed cover`);
  assert.match(html, /<style data-loader-critical>[\s\S]*?\.is-page-loading\s+\.page-shell[\s\S]*?visibility:\s*hidden;/, `${page} critical CSS should hide page content from focus and assistive technology`);
  assert.match(html, /<noscript>[\s\S]*?\.page-loader[\s\S]*?display:\s*none\s*!important;[\s\S]*?\.page-shell[\s\S]*?visibility:\s*visible\s*!important;[\s\S]*?<\/noscript>/, `${page} should fail open when JavaScript is disabled`);
  assert.match(html, /<link rel="stylesheet"[^>]*onload="this\.dataset\.loaderState='loaded'"[^>]*onerror="this\.dataset\.loaderState='error'"/, `${page} stylesheet should record load and error settlement on the link`);

  const firstBodyChild = html.slice(html.indexOf(bodyTag) + bodyTag.length).match(/^\s*(<[^>]+>)/)?.[1];
  assert.equal(firstBodyChild, '<div class="page-loader" role="status" aria-label="页面正在加载">', `${page} loader should be the first body child`);
  assert.ok(html.indexOf('class="page-loader"') < html.indexOf('class="page-shell"'), `${page} loader should precede visible page content`);
  assert.ok(html.includes('data-loading-percent>08%</span>'), `${page} should expose the initial visual percentage`);
  assert.ok(html.includes('data-loading-label>LOADING</span>'), `${page} should expose a mutable loading label`);
  assert.ok(html.includes('data-loading-retry'), `${page} should expose a retry control for critical loading failures`);
  assert.ok(html.includes('<link rel="stylesheet" href="styles.css?v=stability-1"'), `${page} should cache-bust the optimized styles`);
  assert.ok(html.includes('<script src="script.js?v=stability-1"></script>'), `${page} should cache-bust the optimized shared controller`);

  const loaderBlock = html.match(/<div class="page-loader"[\s\S]*?<\/div>\s*(?=<div class="scroll-progress")/)?.[0];
  assert.ok(loaderBlock, `${page} should include the complete loader markup`);
  loaderBlocks.push(loaderBlock.replace(/\s+/g, " "));
  const watchdogBlock = html.match(/<script data-loader-watchdog>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(watchdogBlock, `${page} should include the independent watchdog`);
  watchdogBlocks.push(watchdogBlock);

  assert.doesNotMatch(html, /<link\b[^>]*rel="preload"[^>]*as="(?:image|video)"/i, `${page} should not preload galleries or videos`);
}

loaderBlocks.slice(1).forEach((block) => {
  assert.equal(block, loaderBlocks[0], "all pages should use identical loader markup");
});
watchdogBlocks.slice(1).forEach((block) => {
  assert.equal(block.replace(/\s+/g, " "), watchdogBlocks[0].replace(/\s+/g, " "), "all pages should use identical watchdog logic");
});

[
  [".page-loader", "fixed loader"],
  ["position: fixed;", "fixed positioning"],
  ["inset: 0;", "full-screen inset"],
  ["z-index: 10000;", "loader stacking"],
  ["background: #111;", "dark loader background"],
  ["color: #fff;", "white loader text"],
  ["width: min(320px,", "stable inner width"],
  ["font-size: 24px;", "desktop brand size"],
  ["height: 5px;", "progress track height"],
  ["transform: scaleX(0.08);", "initial progress scale"],
  ["font-size: 11px;", "loader metadata size"],
  ["transition: opacity 400ms", "exit fade"],
  [".is-page-loading .page-shell", "loading content visibility gate"],
  ['.page-loader[aria-hidden="true"]', "dismissed loader state"],
  ["@media (max-width: 620px)", "mobile breakpoint"],
  ["font-size: 21px;", "mobile brand size"],
  ["@media (prefers-reduced-motion: reduce)", "reduced-motion query"],
].forEach(([token, label]) => assert.ok(css.includes(token), `styles should include ${label}`));

const brandRule = css.match(/\.page-loader__brand\s*{([\s\S]*?)}/)?.[1] || "";
assert.ok(brandRule.includes("font-family:"), "loader brand should define a local/system font stack");
assert.ok(!brandRule.includes("ZHYuwanPortfolio"), "loader brand should not wait for the portfolio font");
assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.page-loader__inner\s*{[\s\S]*?width:[^;}]+;[\s\S]*?\.page-loader__brand\s*{[\s\S]*?font-size:\s*21px;/, "mobile loader should reduce inner width and brand size");
assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.page-loader[\s\S]*?transition:\s*none;[\s\S]*?\.page-loader__fill[\s\S]*?transition:\s*none;/, "reduced motion should disable loader exit and fill transitions");
assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.page-loader,\s*\.page-loader\[aria-hidden="true"\]\s*{\s*transition:\s*none;/, "reduced motion should override the more-specific dismissed loader transition");

const fontFaceBlocks = [...css.matchAll(/@font-face\s*{([\s\S]*?)}/g)]
  .map((match) => match[1])
  .filter((block) => block.includes('font-family: "ZHYuwanPortfolio"'));
assert.equal(fontFaceBlocks.length, 5, "portfolio font should expose one static face per critical UI weight");
assert.deepEqual(
  fontFaceBlocks.map((block) => Number(block.match(/font-weight:\s*(\d+)\s*;/)?.[1])).sort((left, right) => left - right),
  [400, 500, 700, 800, 900],
  "portfolio font should explicitly map every critical mobile weight",
);
assert.doesNotMatch(css, /font-family:\s*"ZHYuwanPortfolio";[\s\S]{0,300}?font-weight:\s*400\s+900\s*;/, "static portfolio font must not be declared as a variable range");

const controllerStartMarker = "// PAGE_LOADER_CONTROLLER_START";
const controllerEndMarker = "// PAGE_LOADER_CONTROLLER_END";
const controllerStart = script.indexOf(controllerStartMarker);
const controllerEnd = script.indexOf(controllerEndMarker);
assert.ok(controllerStart >= 0 && controllerEnd > controllerStart, "loader controller should expose explicit test boundaries");
const loaderController = script.slice(controllerStart + controllerStartMarker.length, controllerEnd);
const watchdogSource = watchdogBlocks[0];
const hashSyncGuardSource = script.match(/function syncHashTargetWhenUnlocked\(\) \{[\s\S]*?\n\}/)?.[0] || "";
const loadHandlerSource = script.match(/window\.addEventListener\("load", \(\) => \{[\s\S]*?\n\}\);/)?.[0] || "";

for (const page of ["website-design.html", "video-design.html"]) {
  assert.ok(read(page).includes('loading="lazy"'), `${page} should preserve lazy gallery media`);
}
assert.ok(read("ua-creatives.js").includes('loading="lazy"'), "UA generated galleries should preserve lazy images");
assert.ok(read("community-creatives.js").includes('loading="lazy"'), "community generated galleries should preserve lazy images");

const videoHtml = read("video-design.html");
const videoTags = videoHtml.match(/<video\b[\s\S]*?<\/video>/g) || [];
assert.ok(videoTags.length > 0, "video page should retain video elements");
videoTags.forEach((video, index) => {
  assert.ok(video.includes('preload="none"'), `video ${index + 1} should preserve preload=none`);
});

class FakeClassList {
  constructor(classes = []) {
    this.classes = new Set(classes);
  }

  add(className) {
    this.classes.add(className);
  }

  remove(className) {
    this.classes.delete(className);
  }

  contains(className) {
    return this.classes.has(className);
  }
}

class FakeEventTarget {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, callback, options = {}) {
    const listeners = this.listeners.get(type) || [];
    listeners.push({ callback, once: Boolean(options.once) });
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, callback) {
    const listeners = this.listeners.get(type) || [];
    this.listeners.set(type, listeners.filter((listener) => listener.callback !== callback));
  }

  dispatch(type, event = {}) {
    const listeners = [...(this.listeners.get(type) || [])];
    listeners.forEach((listener) => {
      if (listener.once) {
        const current = this.listeners.get(type) || [];
        this.listeners.set(type, current.filter((candidate) => candidate !== listener));
      }
      listener.callback(event);
    });
  }

  listenerCount(type) {
    return (this.listeners.get(type) || []).length;
  }

  totalListenerCount() {
    return [...this.listeners.values()].reduce((total, listeners) => total + listeners.length, 0);
  }
}

class FakeClock {
  constructor() {
    this.now = 0;
    this.nextId = 1;
    this.timers = new Map();
  }

  setTimeout(callback, delay = 0) {
    const id = this.nextId;
    this.nextId += 1;
    this.timers.set(id, { callback, dueAt: this.now + Math.max(0, Number(delay) || 0) });
    return id;
  }

  clearTimeout(id) {
    this.timers.delete(id);
  }

  nextDueAt() {
    return Math.min(...[...this.timers.values()].map((timer) => timer.dueAt));
  }

  timerCount() {
    return this.timers.size;
  }

  advance(milliseconds) {
    const target = this.now + milliseconds;

    while (true) {
      const next = [...this.timers.entries()]
        .filter(([, timer]) => timer.dueAt <= target)
        .sort((left, right) => left[1].dueAt - right[1].dueAt || left[0] - right[0])[0];

      if (!next) {
        break;
      }

      const [id, timer] = next;
      this.now = timer.dueAt;
      this.timers.delete(id);
      timer.callback();
    }

    this.now = target;
  }
}

function createStateElement(classes = []) {
  const attributes = new Map();
  return {
    attributes,
    classList: new FakeClassList(classes),
    dataset: {},
    getAttribute: (name) => attributes.get(name) ?? null,
    removeAttribute: (name) => attributes.delete(name),
    setAttribute: (name, value) => attributes.set(name, String(value)),
    style: {},
  };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

function createFonts(ready = Promise.resolve(), load = () => Promise.resolve()) {
  return { load, ready };
}

function createResource(options = {}) {
  const resource = new FakeEventTarget();
  Object.assign(resource, options);
  resource.dataset = options.dataset || {};
  resource.getBoundingClientRect = options.getBoundingClientRect
    || (() => options.rect || { top: 0, bottom: 100 });
  return resource;
}

function createLoaderHarness(options = {}) {
  const clock = new FakeClock();
  const progressValues = [];
  const fillStyle = {};
  Object.defineProperty(fillStyle, "transform", {
    set(value) {
      const scale = Number(value.match(/scaleX\(([^)]+)\)/)?.[1]);
      progressValues.push(Math.round(scale * 100));
    },
  });

  const fill = { style: fillStyle };
  const percent = { textContent: "08%" };
  const label = { textContent: "LOADING" };
  const retry = createStateElement();
  retry.hidden = true;
  const loader = createStateElement();
  if (options.loaderHidden) {
    loader.setAttribute("aria-hidden", "true");
  }
  loader.querySelector = (selector) => {
    if (selector === ".page-loader__fill") return fill;
    if (selector === "[data-loading-percent]") return percent;
    if (selector === "[data-loading-label]") return label;
    if (selector === "[data-loading-retry]") return retry;
    return null;
  };
  const initialClasses = options.loading === false ? [] : ["is-page-loading"];
  const documentElement = createStateElement(initialClasses);
  const body = createStateElement(initialClasses);
  const pageShell = createStateElement();
  const stylesheets = options.stylesheets || [];
  const images = options.images || [];
  const windowTarget = new FakeEventTarget();
  const scrollState = {
    appliedScrollToCalls: 0,
    ignoredScrollToCalls: 0,
    scrollToCalls: 0,
    x: 24,
    y: 480,
  };
  Object.assign(windowTarget, {
    cancelAnimationFrame: (id) => clock.clearTimeout(id),
    clearTimeout: (id) => clock.clearTimeout(id),
    innerHeight: options.innerHeight || 800,
    location: { hash: options.hash || "" },
    requestAnimationFrame: (callback) => clock.setTimeout(() => callback(clock.now), 16),
    scrollTo: () => {
      scrollState.scrollToCalls += 1;
      if (documentElement.classList.contains("is-page-loading")) {
        scrollState.ignoredScrollToCalls += 1;
      } else {
        scrollState.appliedScrollToCalls += 1;
      }
    },
    scrollX: scrollState.x,
    scrollY: scrollState.y,
    setTimeout: (callback, delay) => clock.setTimeout(callback, delay),
    matchMedia: () => ({ matches: Boolean(options.reduceMotion) }),
  });

  const document = new FakeEventTarget();
  Object.assign(document, {
    body,
    documentElement,
    fonts: options.fonts,
    images,
    readyState: options.readyState || "complete",
    getElementById: (id) => options.elementsById?.[id] || null,
    querySelector: (selector) => {
      if (selector === ".page-loader") return loader;
      if (selector === ".page-shell") return pageShell;
      return null;
    },
    querySelectorAll: (selector) => selector === 'link[rel="stylesheet"]' ? stylesheets : [],
  });
  const context = vm.createContext({
    clearTimeout: (id) => clock.clearTimeout(id),
    document,
    performance: { now: () => clock.now },
    syncHashTarget: options.syncHashTarget,
    window: windowTarget,
  });
  const runController = () => vm.runInContext(loaderController, context, { filename: "script.js", timeout: 1000 });

  if (options.runWatchdog) {
    vm.runInContext(watchdogSource, context, { filename: "watchdog.js", timeout: 1000 });
  }
  if (options.startController !== false) {
    runController();
  }

  return {
    body,
    clock,
    context,
    document,
    documentElement,
    loader,
    label,
    pageShell,
    percent,
    progressValues,
    retry,
    runController,
    scrollState,
    stylesheets,
    window: windowTarget,
  };
}

async function flushMicrotasks() {
  for (let index = 0; index < 24; index += 1) {
    await Promise.resolve();
  }
}

async function advance(harness, milliseconds) {
  const target = harness.clock.now + milliseconds;
  while (harness.clock.nextDueAt() <= target) {
    const nextDelay = harness.clock.nextDueAt() - harness.clock.now;
    harness.clock.advance(nextDelay);
    await flushMicrotasks();
  }

  harness.clock.advance(target - harness.clock.now);
  await flushMicrotasks();
}

async function testPostDomReadyLayoutDiscoveryIncludesRenderedImages() {
  const imageDecode = deferred();
  let visibleDecodeCalls = 0;
  let farDecodeCalls = 0;
  const visibleLazyImage = createResource({
    complete: false,
    loading: "lazy",
    rect: { top: 100, bottom: 420 },
    decode: () => {
      visibleDecodeCalls += 1;
      return imageDecode.promise;
    },
  });
  const farLazyImage = createResource({
    complete: false,
    loading: "lazy",
    rect: { top: 1800, bottom: 2100 },
    decode: () => {
      farDecodeCalls += 1;
      return Promise.resolve();
    },
  });
  const harness = createLoaderHarness({
    fonts: createFonts(),
    images: [],
    readyState: "loading",
    stylesheets: [createResource({ sheet: {} })],
  });

  await flushMicrotasks();
  assert.equal(harness.document.listenerCount("DOMContentLoaded"), 1, "image discovery should wait for DOM readiness");
  harness.document.images.push(visibleLazyImage, farLazyImage);
  harness.document.readyState = "interactive";
  harness.document.dispatch("DOMContentLoaded");
  await flushMicrotasks();

  assert.equal(harness.document.listenerCount("DOMContentLoaded"), 0, "DOM readiness listener should clean itself after firing");
  assert.equal(visibleLazyImage.loading, "lazy", "image discovery should wait for a post-readiness layout frame");
  await advance(harness, 16);
  assert.equal(visibleLazyImage.loading, "eager", "a visible image rendered before load discovery should be promoted");
  assert.equal(visibleLazyImage.listenerCount("load"), 1, "a rendered first-view image should be awaited");
  assert.equal(farLazyImage.loading, "lazy", "an offscreen image rendered before discovery should stay lazy");
  assert.equal(farLazyImage.totalListenerCount(), 0, "an offscreen rendered image should not block reveal");

  await advance(harness, 334);
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "the rendered image load should block dismissal");
  visibleLazyImage.dispatch("load");
  await flushMicrotasks();
  assert.equal(visibleDecodeCalls, 1, "the rendered first-view image should decode after loading");
  assert.equal(farDecodeCalls, 0, "the offscreen rendered image should not decode");
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "the rendered image decode should block dismissal");

  imageDecode.resolve();
  await flushMicrotasks();
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "final media scan should run before dismissal");
  await advance(harness, 16);
  assert.equal(visibleDecodeCalls, 1, "final scan should not decode an initially prepared image twice");
  assert.equal(visibleLazyImage.totalListenerCount(), 0, "final scan should not reattach listeners to an initially prepared image");
  await advance(harness, 160);
  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "the loader should dismiss after rendered image decode");
}

async function testOffscreenEagerImageDoesNotDelayAfterDomReady() {
  let hashSyncCalls = 0;
  let harness;
  const offscreenEagerImage = createResource({
    complete: false,
    loading: "eager",
    rect: { top: 1800, bottom: 2100 },
  });
  harness = createLoaderHarness({
    fonts: createFonts(),
    images: [offscreenEagerImage],
    readyState: "loading",
    stylesheets: [createResource({ sheet: {} })],
    syncHashTarget: () => {
      hashSyncCalls += 1;
      harness.window.scrollTo();
    },
  });

  harness.document.readyState = "interactive";
  harness.document.dispatch("DOMContentLoaded");
  await flushMicrotasks();
  await advance(harness, 16);

  assert.equal(offscreenEagerImage.totalListenerCount(), 0, "an offscreen eager image should not be included in readiness");
  assert.equal(hashSyncCalls, 0, "an empty hash should not invoke early fragment alignment");
  assert.equal(harness.scrollState.scrollToCalls, 0, "an empty hash should not mutate scroll");
  await advance(harness, 334);
  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "offscreen eager image bytes should not delay dismissal");
  await advance(harness, 400);
  assert.equal(hashSyncCalls, 0, "an empty hash should not invoke fragment alignment after release");
  assert.equal(harness.scrollState.scrollToCalls, 0, "an empty hash should preserve scroll after release");
}

async function testProjectedHashViewportImagesBlockUntilPostReleaseAlignment() {
  const imageDecode = deferred();
  let decodeCalls = 0;
  let hashSyncCalls = 0;
  let harness;
  const projectedNearImage = createResource({
    complete: false,
    loading: "lazy",
    rect: { top: 1500, bottom: 1840 },
    decode: () => {
      decodeCalls += 1;
      return imageDecode.promise;
    },
  });
  const projectedFarImage = createResource({
    complete: false,
    loading: "lazy",
    rect: { top: 2700, bottom: 3040 },
  });
  const hashTarget = {
    contains: (image) => image === projectedNearImage || image === projectedFarImage,
    getBoundingClientRect: () => ({ top: 1400, bottom: 3200 }),
  };
  harness = createLoaderHarness({
    elementsById: { "horizontal gallery": hashTarget },
    fonts: createFonts(),
    hash: "#horizontal%20gallery",
    images: [projectedNearImage, projectedFarImage],
    readyState: "loading",
    stylesheets: [createResource({ sheet: {} })],
    syncHashTarget: () => {
      hashSyncCalls += 1;
      harness.window.scrollTo({ top: 1400, behavior: "auto" });
    },
  });

  harness.document.readyState = "interactive";
  harness.document.dispatch("DOMContentLoaded");
  await flushMicrotasks();
  assert.equal(projectedNearImage.loading, "lazy", "projected media discovery should still wait for the layout frame");
  await advance(harness, 16);

  assert.equal(hashSyncCalls, 0, "fragment alignment should not run while loader scroll lock is active");
  assert.equal(harness.scrollState.scrollToCalls, 0, "media selection should not rely on locked scroll attempts");
  assert.equal(projectedNearImage.loading, "eager", "an image in the projected fragment viewport should be promoted");
  assert.equal(projectedNearImage.listenerCount("load"), 1, "an image in the projected fragment viewport should be awaited");
  assert.equal(projectedFarImage.loading, "lazy", "an image beyond the projected fragment viewport should remain lazy");
  assert.equal(projectedFarImage.totalListenerCount(), 0, "far projected fragment media should not block readiness");

  await advance(harness, 334);
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "projected fragment media should block dismissal while loading");
  projectedNearImage.dispatch("load");
  await flushMicrotasks();
  assert.equal(decodeCalls, 1, "projected fragment media should decode after loading");
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "projected fragment decode should block dismissal");

  imageDecode.resolve();
  await flushMicrotasks();
  await advance(harness, 16);
  assert.equal(decodeCalls, 1, "final scan should not decode projected media prepared in pass one twice");
  assert.equal(projectedNearImage.totalListenerCount(), 0, "final scan should not reattach projected media listeners");
  await advance(harness, 160);
  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "loader should dismiss after projected fragment media decodes");
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), true, "fragment alignment should wait through the exit fade");
  assert.equal(hashSyncCalls, 0, "fragment alignment should not run before scroll lock release");

  const unlockDueAt = harness.clock.nextDueAt();
  await advance(harness, unlockDueAt - harness.clock.now - 1);
  assert.equal(hashSyncCalls, 0, "fragment alignment should remain pending until the lock is released");
  await advance(harness, 1);
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), false, "release should remove scroll lock before fragment alignment");
  assert.equal(hashSyncCalls, 1, "fragment alignment should run once after release");
  assert.equal(harness.scrollState.ignoredScrollToCalls, 0, "fragment alignment should not attempt scrolling while locked");
  assert.equal(harness.scrollState.appliedScrollToCalls, 1, "post-release fragment alignment should apply scrolling");
}

async function testLayoutReflowSafetyBandPreparesOnlyNearMedia() {
  const imageDecode = deferred();
  let decodeCalls = 0;
  const safetyBandImage = createResource({
    complete: false,
    loading: "lazy",
    rect: { top: 2300, bottom: 2600 },
    decode: () => {
      decodeCalls += 1;
      return imageDecode.promise;
    },
  });
  const beyondSafetyBandImage = createResource({
    complete: false,
    loading: "lazy",
    rect: { top: 2500, bottom: 2800 },
  });
  const hashTarget = {
    contains: (image) => image === safetyBandImage || image === beyondSafetyBandImage,
    getBoundingClientRect: () => ({ top: 1400, bottom: 3200 }),
  };
  const harness = createLoaderHarness({
    elementsById: { horizontal: hashTarget },
    fonts: createFonts(),
    hash: "#horizontal",
    images: [safetyBandImage, beyondSafetyBandImage],
    innerHeight: 720,
    stylesheets: [createResource({ sheet: {} })],
  });

  await flushMicrotasks();
  await advance(harness, 16);
  assert.equal(safetyBandImage.loading, "eager", "media beyond 1.25 viewports but within the safety band should be promoted");
  assert.equal(safetyBandImage.listenerCount("load"), 1, "safety-band media should be awaited");
  assert.equal(beyondSafetyBandImage.loading, "lazy", "media beyond the safety band should remain lazy");
  assert.equal(beyondSafetyBandImage.totalListenerCount(), 0, "media beyond the safety band should remain nonblocking");

  await advance(harness, 334);
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "safety-band media should prevent early reveal");
  safetyBandImage.dispatch("load");
  await flushMicrotasks();
  assert.equal(decodeCalls, 1, "safety-band media should decode after loading");
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "safety-band decode should block reveal");

  imageDecode.resolve();
  await flushMicrotasks();
  await advance(harness, 16);
  assert.equal(decodeCalls, 1, "final scan should not decode safety-band media twice");
  await advance(harness, 160);
  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "loader should dismiss after safety-band media decode");
}

async function testFontLayoutShiftTriggersFinalImageDiscovery() {
  const fontsReady = deferred();
  const imageDecode = deferred();
  let decodeCalls = 0;
  let fontsSettled = false;
  fontsReady.promise.then(() => {
    fontsSettled = true;
  });
  const shiftedImage = createResource({
    complete: false,
    loading: "lazy",
    getBoundingClientRect: () => fontsSettled
      ? { top: 2272, bottom: 2572 }
      : { top: 2600, bottom: 2900 },
    decode: () => {
      decodeCalls += 1;
      return imageDecode.promise;
    },
  });
  const finalOffscreenImage = createResource({
    complete: false,
    loading: "lazy",
    rect: { top: 2700, bottom: 3000 },
  });
  const hashTarget = {
    contains: (image) => image === shiftedImage || image === finalOffscreenImage,
    getBoundingClientRect: () => ({ top: 1400, bottom: 3200 }),
  };
  const harness = createLoaderHarness({
    elementsById: { horizontal: hashTarget },
    fonts: createFonts(fontsReady.promise),
    hash: "#horizontal",
    images: [shiftedImage, finalOffscreenImage],
    stylesheets: [createResource({ sheet: {} })],
  });

  await flushMicrotasks();
  await advance(harness, 16);
  assert.equal(shiftedImage.loading, "lazy", "initial scan should exclude media at the projected safety-band boundary");
  assert.equal(shiftedImage.totalListenerCount(), 0, "initially offscreen media should not receive listeners");

  fontsReady.resolve();
  await flushMicrotasks();
  assert.equal(shiftedImage.loading, "lazy", "font settlement should wait for a fresh layout frame before rescanning");
  await advance(harness, 16);

  assert.equal(shiftedImage.loading, "eager", "post-font rescan should promote media shifted into the projected viewport");
  assert.equal(shiftedImage.listenerCount("load"), 1, "post-font rescan should await shifted media");
  assert.equal(finalOffscreenImage.loading, "lazy", "media outside the final projected viewport should remain lazy");
  assert.equal(finalOffscreenImage.totalListenerCount(), 0, "final offscreen media should remain nonblocking");
  assert.equal(harness.progressValues.includes(92), false, "image progress should wait for final-scan media readiness");

  await advance(harness, 318);
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "shifted media should prevent early reveal");
  shiftedImage.dispatch("load");
  await flushMicrotasks();
  assert.equal(decodeCalls, 1, "shifted media should decode after loading");
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "shifted media decode should block reveal");

  imageDecode.resolve();
  await flushMicrotasks();
  await advance(harness, 0);
  await advance(harness, 160);
  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "loader should dismiss after shifted media decode");
}

async function testSettledResourcesAndMinimumDuration() {
  const stylesheet = createResource({ sheet: null });
  const loadedImage = createResource({ complete: false, loading: "eager" });
  const failedImage = createResource({ complete: false, loading: "eager" });
  const lazyImage = createResource({ complete: false, loading: "lazy", rect: { top: 1400, bottom: 1500 } });
  const farImage = createResource({ complete: false, loading: "eager", rect: { top: 1200, bottom: 1300 } });
  const fonts = deferred();
  const harness = createLoaderHarness({
    fonts: createFonts(fonts.promise),
    images: [loadedImage, failedImage, lazyImage, farImage],
    stylesheets: [stylesheet],
  });
  await flushMicrotasks();
  await advance(harness, 16);

  assert.equal(harness.documentElement.getAttribute("aria-busy"), "true", "controller should mark the page busy while loading");
  assert.equal(lazyImage.listenerCount("load"), 0, "lazy images should not receive readiness listeners");
  assert.equal(farImage.listenerCount("load"), 0, "far-offscreen images should not receive readiness listeners");
  const beforeStyles = Number.parseInt(harness.percent.textContent, 10);
  stylesheet.dispatch("error");
  await flushMicrotasks();
  assert.equal(stylesheet.totalListenerCount(), 0, "stylesheet settlement should remove both listeners");
  await advance(harness, 64);
  assert.ok(Number.parseInt(harness.percent.textContent, 10) > beforeStyles, "stylesheet settlement should advance displayed progress");

  fonts.resolve();
  await flushMicrotasks();
  await advance(harness, 16);
  assert.equal(loadedImage.listenerCount("load"), 1, "only the first visible image should become critical after fonts settle");
  assert.equal(failedImage.totalListenerCount(), 0, "the second visible image should remain nonblocking");

  const beforeImages = Number.parseInt(harness.percent.textContent, 10);
  loadedImage.dispatch("load");
  await flushMicrotasks();
  assert.equal(loadedImage.totalListenerCount(), 0, "image load should remove both listeners");
  assert.equal(failedImage.totalListenerCount(), 0, "image error should remove both listeners");
  await advance(harness, 160);

  assert.deepEqual([...harness.progressValues].sort((left, right) => left - right), harness.progressValues, "progress should be monotonic");
  assert.ok(harness.progressValues.some((value) => value > beforeImages), "first-view image settlement should advance progress");
  assert.equal(harness.percent.textContent, "100%", "combined readiness should reach 100 percent");

  const remainingBeforeMinimum = Math.max(0, 350 - harness.clock.now);
  await advance(harness, Math.max(0, remainingBeforeMinimum - 1));
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "loader should honor the minimum duration");
  await advance(harness, 1);
  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "settled resources should dismiss after the minimum duration");
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), true, "normal dismissal should keep html locked during the fade");
  assert.equal(harness.body.classList.contains("is-page-loading"), true, "normal dismissal should keep body locked during the fade");
  assert.equal(harness.documentElement.getAttribute("aria-busy"), "true", "normal dismissal should keep aria-busy during the fade");
  await advance(harness, 400);
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), false, "html loading class should be released");
  assert.equal(harness.body.classList.contains("is-page-loading"), false, "body loading class should be released");
  assert.equal(harness.documentElement.getAttribute("aria-busy"), null, "normal dismissal should clear aria-busy");
  assert.equal(harness.clock.timerCount(), 0, "normal dismissal should retain no run timers");
  assert.deepEqual([harness.window.scrollX, harness.window.scrollY], [24, 480], "loader should preserve scroll coordinates");
  assert.equal(harness.scrollState.scrollToCalls, 0, "loader should not mutate scroll position");
}

async function testExplicitFontAndVisibleImageDecode() {
  const fontLoad = deferred();
  const fontsReady = deferred();
  const imageDecode = deferred();
  const fontCalls = [];
  let fontsReadyReads = 0;
  let visibleDecodeCalls = 0;
  let farDecodeCalls = 0;
  const fonts = {
    load: (descriptor, sample) => {
      fontCalls.push({ descriptor, sample });
      return fontLoad.promise;
    },
  };
  Object.defineProperty(fonts, "ready", {
    get() {
      fontsReadyReads += 1;
      return fontsReady.promise;
    },
  });
  const visibleLazyImage = createResource({
    complete: true,
    loading: "lazy",
    rect: { top: 40, bottom: 340 },
    decode: () => {
      visibleDecodeCalls += 1;
      return imageDecode.promise;
    },
  });
  const farLazyImage = createResource({
    complete: true,
    loading: "lazy",
    rect: { top: 2200, bottom: 2500 },
    decode: () => {
      farDecodeCalls += 1;
      return Promise.resolve();
    },
  });
  const harness = createLoaderHarness({
    fonts,
    images: [visibleLazyImage, farLazyImage],
    stylesheets: [createResource({ sheet: {} })],
  });

  await flushMicrotasks();
  await advance(harness, 16);
  assert.deepEqual(
    fontCalls.map((call) => call.descriptor),
    [400, 500, 700, 800, 900].map((weight) => `${weight} 16px "ZHYuwanPortfolio"`),
    "loader should explicitly request every critical portfolio font weight",
  );
  fontCalls.forEach((call) => {
    assert.ok(call.sample.includes("肖子康"), "each font request should include representative Chinese glyphs");
  });
  assert.equal(fontsReadyReads, 0, "loader should wait for the explicit font request before reading fonts.ready");
  assert.equal(visibleLazyImage.loading, "lazy", "priority image discovery should wait for final font layout");
  assert.equal(visibleDecodeCalls, 0, "priority image decode should not start before font readiness");
  assert.equal(farLazyImage.loading, "lazy", "offscreen image should stay lazy");
  assert.equal(farDecodeCalls, 0, "offscreen image should not block reveal");

  fontLoad.resolve();
  await flushMicrotasks();
  assert.equal(fontsReadyReads, 1, "loader should await fonts.ready after the explicit request settles");
  fontsReady.resolve();
  await flushMicrotasks();
  await advance(harness, 16);
  assert.equal(visibleLazyImage.loading, "eager", "the first visible image should be promoted after font layout");
  assert.equal(visibleDecodeCalls, 1, "the priority image should decode before reveal");
  await advance(harness, 350);
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "pending image decode should block dismissal");
  imageDecode.resolve();
  await flushMicrotasks();
  assert.notEqual(harness.percent.textContent, "100%", "progress should animate through the final critical-image step");
  await advance(harness, 160);
  assert.equal(visibleDecodeCalls, 1, "the priority image should decode only once");
  assert.equal(visibleLazyImage.totalListenerCount(), 0, "priority image listeners should be removed after settlement");
  assert.equal(harness.percent.textContent, "100%", "decoded priority image should complete progress");
  await advance(harness, 0);
  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "loader should dismiss after visible image decode settles");
}

async function testDecodeFailureSettlesButFontFailureShowsRetry() {
  let decodeCalls = 0;
  const image = createResource({
    complete: true,
    loading: "lazy",
    rect: { top: 20, bottom: 220 },
    decode: () => {
      decodeCalls += 1;
      return Promise.reject(new Error("decode failed"));
    },
  });
  const fonts = createFonts(
    Promise.resolve(),
    () => Promise.reject(new Error("font load failed")),
  );
  const harness = createLoaderHarness({
    fonts,
    images: [image],
    stylesheets: [createResource({ sheet: {} })],
  });

  await flushMicrotasks();
  await advance(harness, 16);
  assert.equal(image.loading, "lazy", "font failure should stop before promoting noncritical images");
  assert.equal(decodeCalls, 0, "font failure should not start image decode work");
  await advance(harness, 350);
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "font rejection should keep the loading gate visible");
  assert.equal(harness.loader.dataset.state, "error", "font rejection should switch the loading gate to its retry state");
  assert.equal(harness.retry.hidden, false, "font rejection should expose the retry control");
  assert.notEqual(harness.percent.textContent, "100%", "font rejection must not report successful completion");
}

async function testProgressAnimatesAcrossLiveResourceStates() {
  const fontLoad = deferred();
  const harness = createLoaderHarness({
    fonts: createFonts(Promise.resolve(), () => fontLoad.promise),
    images: [createResource({ complete: true, loading: "eager" })],
    stylesheets: [createResource({ sheet: {} })],
  });

  await flushMicrotasks();
  await advance(harness, 240);
  const pendingFontProgress = Number.parseInt(harness.percent.textContent, 10);
  const intermediateValues = new Set(harness.progressValues.filter((value) => value > 8 && value < pendingFontProgress));
  assert.ok(pendingFontProgress > 38, "settled styles and first-view media should move progress beyond the old 38 percent stall");
  assert.ok(pendingFontProgress < 100, "pending fonts should keep progress below completion");
  assert.ok(intermediateValues.size >= 3, "displayed progress should render multiple intermediate values instead of jumping milestones");

  fontLoad.resolve();
  await flushMicrotasks();
  await advance(harness, 300);
  assert.equal(harness.percent.textContent, "100%", "font settlement should allow animated progress to reach completion");
}

async function testOnlyOnePriorityImageBlocksEntry() {
  const firstDecode = deferred();
  const firstImage = createResource({
    complete: false,
    loading: "lazy",
    rect: { top: 80, bottom: 380 },
    decode: () => firstDecode.promise,
  });
  const secondImage = createResource({
    complete: false,
    loading: "lazy",
    rect: { top: 420, bottom: 720 },
  });
  const harness = createLoaderHarness({
    fonts: createFonts(),
    images: [firstImage, secondImage],
    stylesheets: [createResource({ sheet: {} })],
  });

  await flushMicrotasks();
  await advance(harness, 32);
  assert.equal(firstImage.loading, "eager", "the first visible image should be promoted as the priority image");
  assert.equal(firstImage.listenerCount("load"), 1, "the priority image should block entry until it settles");
  assert.equal(secondImage.loading, "lazy", "later visible images should remain lazy");
  assert.equal(secondImage.totalListenerCount(), 0, "later visible images should not block entry");

  firstImage.dispatch("load");
  await flushMicrotasks();
  firstDecode.resolve();
  await flushMicrotasks();
  await advance(harness, 320);
  assert.equal(harness.percent.textContent, "100%", "one decoded priority image should complete critical readiness");
  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "entry should not wait for additional visible images");
}

function testUpdatedTimeouts() {
  assert.match(loaderController, /const PAGE_LOADER_TIMEOUT_MS = 12000;/, "controller timeout should allow critical assets twelve seconds");
  watchdogBlocks.forEach((block, index) => {
    assert.match(block, /window\.setTimeout\(failOpen, 12250\)/, `${pages[index]} watchdog should remain after the controller timeout`);
  });
}

function testLoadHashRetriesWaitForUnlock() {
  assert.ok(hashSyncGuardSource, "script should define an unlocked hash-sync guard");
  assert.match(
    loadHandlerSource,
    /syncHashTargetWhenUnlocked\(\);\s*updateScrollProgress\(\);\s*window\.setTimeout\(syncHashTargetWhenUnlocked, 120\);\s*window\.setTimeout\(syncHashTargetWhenUnlocked, 420\);/,
    "load-time hash sync and retries should use the unlocked guard",
  );

  const documentElement = { classList: new FakeClassList(["is-page-loading"]) };
  const body = { classList: new FakeClassList(["is-page-loading"]) };
  const retryCallbacks = new Map();
  const windowTarget = new FakeEventTarget();
  windowTarget.setTimeout = (callback, delay) => retryCallbacks.set(delay, callback);
  let hashSyncCalls = 0;
  let progressCalls = 0;
  const context = vm.createContext({
    document: { body, documentElement },
    syncHashTarget: () => { hashSyncCalls += 1; },
    updateScrollProgress: () => { progressCalls += 1; },
    window: windowTarget,
  });

  vm.runInContext(`${hashSyncGuardSource}\n${loadHandlerSource}`, context, { filename: "hash-load-guard.js" });
  windowTarget.dispatch("load");
  assert.equal(hashSyncCalls, 0, "immediate load sync should be suppressed while loading");
  assert.equal(progressCalls, 1, "load should still update scroll progress");
  documentElement.classList.remove("is-page-loading");
  retryCallbacks.get(120)();
  assert.equal(hashSyncCalls, 0, "legacy retry should be suppressed while the body remains loading");

  body.classList.remove("is-page-loading");
  retryCallbacks.get(420)();
  assert.equal(hashSyncCalls, 1, "legacy retry should sync after loading unlocks");
}

async function testHardTimeoutRelease() {
  const stylesheet = createResource({ sheet: null });
  let decodeCalls = 0;
  const image = createResource({
    complete: false,
    loading: "eager",
    decode: () => {
      decodeCalls += 1;
      return Promise.resolve();
    },
  });
  const fonts = deferred();
  const harness = createLoaderHarness({
    fonts: createFonts(fonts.promise),
    images: [image],
    stylesheets: [stylesheet],
  });

  await flushMicrotasks();
  await advance(harness, 11999);
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "loader should remain before the hard timeout");
  await advance(harness, 1);
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "hard timeout should keep the gate visible instead of revealing fallback typography");
  assert.equal(harness.loader.dataset.state, "error", "hard timeout should enter the retry state");
  assert.equal(harness.retry.hidden, false, "hard timeout should expose the retry control");
  assert.notEqual(harness.percent.textContent, "100%", "hard timeout must not report false completion");
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), true, "hard timeout should keep html locked behind the retry state");
  assert.equal(harness.documentElement.getAttribute("aria-busy"), "true", "hard timeout should keep aria-busy during the fade");
  assert.equal(stylesheet.totalListenerCount(), 0, "timeout should remove outstanding stylesheet listeners");
  assert.equal(image.totalListenerCount(), 0, "timeout should remove outstanding image listeners");
  assert.equal(decodeCalls, 0, "timeout cancellation should not start stale image decode work");
  await advance(harness, 400);
  assert.equal(harness.clock.timerCount(), 0, "timeout dismissal should retain no run timers");
  assert.equal(harness.documentElement.getAttribute("aria-busy"), "true", "retry state should remain busy until the user reloads");
}

async function testPersistedRearmInvalidatesPriorCompletion() {
  const harness = createLoaderHarness({
    fonts: createFonts(),
    images: [createResource({ complete: true, loading: "eager" })],
    stylesheets: [createResource({ sheet: {} })],
  });
  await flushMicrotasks();
  await advance(harness, 100);

  harness.loader.setAttribute("aria-hidden", "true");
  harness.documentElement.classList.remove("is-page-loading");
  harness.body.classList.remove("is-page-loading");
  harness.window.dispatch("pageshow", { persisted: true });
  await flushMicrotasks();

  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "persisted pageshow should reveal the restored gate immediately");
  assert.equal(harness.documentElement.getAttribute("aria-busy"), "true", "persisted pageshow should mark the page busy again");
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), true, "persisted pageshow should re-lock html");
  assert.equal(harness.body.classList.contains("is-page-loading"), true, "persisted pageshow should re-lock body");

  const loaderRule = css.match(/\.page-loader\s*{([\s\S]*?)}/)?.[1] || "";
  const hiddenLoaderRule = css.match(/\.page-loader\[aria-hidden="true"\]\s*{([\s\S]*?)}/)?.[1] || "";
  assert.match(loaderRule, /visibility:\s*visible;/, "restored loader should use a visible base state");
  assert.doesNotMatch(loaderRule, /visibility\s+0s\s+linear\s+400ms/, "restored loader visibility must not wait for the exit delay");
  assert.doesNotMatch(loaderRule, /transition:[^;]*opacity/, "restored loader opacity must not fade in");
  assert.match(hiddenLoaderRule, /transition:\s*opacity\s+400ms\s+ease,\s*visibility\s+0s\s+linear\s+400ms;/, "only dismissal should own the opacity fade and delayed visibility hiding");

  await advance(harness, 250);
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "obsolete first-run completion should be invalidated");
  await advance(harness, 100);
  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "rearmed loader should dismiss after its own minimum duration");
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), true, "rearmed loader should keep html locked during the fade");
  assert.equal(harness.body.classList.contains("is-page-loading"), true, "rearmed loader should keep body locked during the fade");
  await advance(harness, 400);
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), false, "rearmed loader should release html");
  assert.equal(harness.body.classList.contains("is-page-loading"), false, "rearmed loader should release body");
  assert.equal(harness.documentElement.getAttribute("aria-busy"), null, "rearmed loader should clear aria-busy");
  assert.equal(harness.clock.timerCount(), 0, "rearmed dismissal should retain no timers");
  assert.equal(harness.scrollState.scrollToCalls, 0, "BFCache rearm should not mutate scroll");
}

async function testAlreadySettledStylesheetError() {
  const stylesheet = createResource({ dataset: { loaderState: "error" }, sheet: null });
  const harness = createLoaderHarness({
    fonts: createFonts(),
    images: [createResource({ complete: true, loading: "eager" })],
    stylesheets: [stylesheet],
  });
  await flushMicrotasks();

  assert.equal(stylesheet.totalListenerCount(), 0, "an already-failed stylesheet should not receive late listeners");
  await advance(harness, 350);
  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "an already-failed stylesheet should settle without the hard timeout");
}

async function testReducedMotionReleasesImmediately() {
  const harness = createLoaderHarness({
    reduceMotion: true,
    fonts: createFonts(),
    images: [createResource({ complete: true, loading: "eager" })],
    stylesheets: [createResource({ sheet: {} })],
  });
  await flushMicrotasks();
  await advance(harness, 366);

  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "reduced motion should still dismiss the loader");
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), false, "reduced motion should release html immediately");
  assert.equal(harness.body.classList.contains("is-page-loading"), false, "reduced motion should release body immediately");
  assert.equal(harness.documentElement.getAttribute("aria-busy"), null, "reduced motion should clear aria-busy immediately");
  assert.equal(harness.clock.timerCount(), 0, "reduced motion dismissal should retain no timers");
}

async function testIndependentWatchdogFailOpen() {
  const harness = createLoaderHarness({ runWatchdog: true, startController: false });
  const watchdogDueAt = harness.clock.nextDueAt();

  assert.equal(watchdogDueAt, 12250, "watchdog should independently start after the twelve-second controller timeout");
  assert.equal(harness.documentElement.getAttribute("aria-busy"), "true", "watchdog should mark the initial document busy");
  await advance(harness, watchdogDueAt - 1);
  assert.equal(harness.window.__pageLoaderWatchdogFired, false, "watchdog should not fail open early");
  await advance(harness, 1);

  assert.equal(harness.window.__pageLoaderWatchdogFired, true, "watchdog should expose a global fired flag");
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), false, "watchdog should unlock html when the controller never runs");
  assert.equal(harness.body.classList.contains("is-page-loading"), false, "watchdog should unlock body when the controller never runs");
  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "watchdog should hide the loader semantically");
  assert.equal(harness.loader.style.display, "none", "watchdog should hide the loader without shared CSS");
  assert.equal(harness.pageShell.style.visibility, "visible", "watchdog should reveal the page shell without shared CSS");
  assert.equal(harness.documentElement.getAttribute("aria-busy"), null, "watchdog should clear aria-busy");
  assert.deepEqual([harness.window.scrollX, harness.window.scrollY], [24, 480], "watchdog should preserve scroll coordinates");
  assert.equal(harness.scrollState.scrollToCalls, 0, "watchdog should not mutate scroll position");
}

async function testControllerCancelsWatchdog() {
  const harness = createLoaderHarness({
    fonts: createFonts(),
    images: [createResource({ complete: true, loading: "eager" })],
    runWatchdog: true,
    stylesheets: [createResource({ sheet: {} })],
  });
  await flushMicrotasks();
  await advance(harness, 350);

  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "controller should dismiss normally before the watchdog");
  assert.equal(harness.clock.timerCount(), 1, "normal dismissal should retain only the fade unlock timer");
  await advance(harness, 13000);
  assert.equal(harness.window.__pageLoaderWatchdogFired, false, "canceled watchdog should never fire later");
  assert.equal(harness.clock.timerCount(), 0, "normal dismissal should clean the fade unlock timer");
}

async function testFiredWatchdogPreventsRelock() {
  const stylesheet = createResource({ sheet: null });
  const image = createResource({ complete: false, loading: "eager" });
  const harness = createLoaderHarness({
    fonts: createFonts(deferred().promise),
    images: [image],
    runWatchdog: true,
    startController: false,
    stylesheets: [stylesheet],
  });
  await advance(harness, harness.clock.nextDueAt());
  harness.runController();
  await flushMicrotasks();

  assert.equal(harness.documentElement.classList.contains("is-page-loading"), false, "controller should not re-lock html after watchdog fail-open");
  assert.equal(harness.body.classList.contains("is-page-loading"), false, "controller should not re-lock body after watchdog fail-open");
  assert.equal(harness.documentElement.getAttribute("aria-busy"), null, "controller should not restore aria-busy after watchdog fail-open");
  assert.equal(stylesheet.totalListenerCount(), 0, "controller should not attach stylesheet listeners after watchdog fail-open");
  assert.equal(image.totalListenerCount(), 0, "controller should not attach image listeners after watchdog fail-open");
  assert.equal(harness.clock.timerCount(), 0, "controller should not start timers after watchdog fail-open");
}

async function testPersistedWatchdogRestoresLoader() {
  const harness = createLoaderHarness({
    fonts: createFonts(deferred().promise),
    images: [createResource({ complete: false, loading: "eager" })],
    runWatchdog: true,
    startController: false,
    stylesheets: [createResource({ sheet: null })],
  });
  await advance(harness, harness.clock.nextDueAt());
  assert.equal(harness.window.__pageLoaderWatchdogFired, true, "watchdog should have failed open before the persisted return");
  assert.equal(harness.loader.style.display, "none", "watchdog should leave the loader display hidden");
  harness.runController();
  await flushMicrotasks();

  harness.stylesheets.splice(0, harness.stylesheets.length, createResource({ sheet: {} }));
  harness.document.images = [createResource({ complete: true, loading: "eager" })];
  harness.document.fonts = createFonts();
  harness.window.dispatch("pageshow", { persisted: true });
  await flushMicrotasks();

  assert.equal(harness.window.__pageLoaderWatchdogFired, false, "persisted pageshow should clear the watchdog fired state");
  assert.equal(harness.loader.style.display, "", "persisted pageshow should restore the loader display property");
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "persisted pageshow should reveal the loader");
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), true, "persisted pageshow should re-lock html");
  assert.equal(harness.body.classList.contains("is-page-loading"), true, "persisted pageshow should re-lock body");
  assert.equal(harness.documentElement.getAttribute("aria-busy"), "true", "persisted pageshow should restore aria-busy");

  await advance(harness, 350);
  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "restored loader should dismiss after readiness");
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), true, "restored loader should keep html locked during the fade");
  await advance(harness, 400);
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), false, "restored loader should unlock html after the fade");
}

async function testPersistedReturnCancelsPendingWatchdog() {
  const harness = createLoaderHarness({
    fonts: createFonts(deferred().promise),
    images: [createResource({ complete: false, loading: "eager" })],
    runWatchdog: true,
    stylesheets: [createResource({ sheet: null })],
  });

  assert.ok([...harness.clock.timers.values()].some((timer) => timer.dueAt === 12250), "initial load should have a pending watchdog");
  harness.stylesheets.splice(0, harness.stylesheets.length, createResource({ sheet: {} }));
  harness.document.images = [createResource({ complete: true, loading: "eager" })];
  harness.document.fonts = createFonts();
  harness.window.dispatch("pageshow", { persisted: true });
  await flushMicrotasks();

  assert.equal(
    [...harness.clock.timers.values()].some((timer) => timer.dueAt === 12250),
    false,
    "persisted return should cancel the old watchdog before it can affect the new run",
  );
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "new persisted run should keep the loader visible during its minimum duration");
}

async function testPersistedRearmCancelsPendingUnlock() {
  const harness = createLoaderHarness({
    fonts: createFonts(),
    images: [createResource({ complete: true, loading: "eager" })],
    stylesheets: [createResource({ sheet: {} })],
  });
  await flushMicrotasks();
  await advance(harness, 350);

  assert.equal(harness.documentElement.classList.contains("is-page-loading"), true, "fade should leave html locked before persisted rearm");
  harness.stylesheets.splice(0, harness.stylesheets.length, createResource({ sheet: null }));
  harness.document.images = [createResource({ complete: false, loading: "eager" })];
  harness.document.fonts = createFonts(deferred().promise);
  harness.window.dispatch("pageshow", { persisted: true });
  await flushMicrotasks();

  await advance(harness, 400);
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), true, "an old unlock callback must not release a rearmed page");
  assert.equal(harness.body.classList.contains("is-page-loading"), true, "an old unlock callback must not release the rearmed body");
  assert.equal(harness.documentElement.getAttribute("aria-busy"), "true", "rearmed page should remain busy while resources are pending");
  harness.window.__pageLoaderControllerCleanup();
  assert.equal(harness.clock.timerCount(), 0, "cleanup should cancel the rearmed run and unlock timer");
}

async function testWatchdogCleansPartiallyStartedController() {
  const stylesheet = createResource({ sheet: null });
  let decodeCalls = 0;
  const image = createResource({
    complete: false,
    loading: "eager",
    decode: () => {
      decodeCalls += 1;
      return Promise.resolve();
    },
  });
  const harness = createLoaderHarness({
    fonts: createFonts(deferred().promise),
    images: [image],
    runWatchdog: true,
    stylesheets: [stylesheet],
  });
  await flushMicrotasks();
  await advance(harness, 16);
  const controllerTimer = [...harness.clock.timers.entries()]
    .find(([, timer]) => timer.dueAt === 12000)?.[0];
  harness.clock.clearTimeout(controllerTimer);

  assert.equal(stylesheet.totalListenerCount(), 2, "partially started controller should have stylesheet listeners before fail-open");
  assert.equal(image.totalListenerCount(), 0, "critical image discovery should wait for stylesheet and font readiness");
  await advance(harness, 12250 - harness.clock.now);

  assert.equal(harness.window.__pageLoaderWatchdogFired, true, "independent watchdog should fire when the controller timeout is unavailable");
  assert.equal(stylesheet.totalListenerCount(), 0, "watchdog should clean a partial controller's stylesheet listeners");
  assert.equal(image.totalListenerCount(), 0, "watchdog should clean a partial controller's image listeners");
  assert.equal(decodeCalls, 0, "watchdog cancellation should not start stale image decode work");
  assert.equal(harness.clock.timerCount(), 0, "watchdog should clean a partial controller's remaining timers");
}

async function testRearmCleansPriorRunListeners() {
  const oldStylesheet = createResource({ sheet: null });
  let oldDecodeCalls = 0;
  const oldImage = createResource({
    complete: false,
    loading: "eager",
    decode: () => {
      oldDecodeCalls += 1;
      return Promise.resolve();
    },
  });
  const harness = createLoaderHarness({
    fonts: createFonts(deferred().promise),
    images: [oldImage],
    stylesheets: [oldStylesheet],
  });
  await flushMicrotasks();
  await advance(harness, 16);

  assert.equal(oldStylesheet.totalListenerCount(), 2, "initial run should observe stylesheet load and error");
  assert.equal(oldImage.totalListenerCount(), 0, "initial run should defer image observation until critical prerequisites settle");
  harness.stylesheets.splice(0, harness.stylesheets.length, createResource({ sheet: {} }));
  harness.document.images = [createResource({ complete: true, loading: "eager" })];
  harness.document.fonts = createFonts();
  harness.window.dispatch("pageshow", { persisted: true });
  await flushMicrotasks();

  assert.equal(oldStylesheet.totalListenerCount(), 0, "rearm should remove prior stylesheet listeners");
  assert.equal(oldImage.totalListenerCount(), 0, "rearm should remove prior image listeners");
  assert.equal(oldDecodeCalls, 0, "BFCache invalidation should not start stale image decode work");
  await advance(harness, 350);
  await advance(harness, 400);
  assert.equal(harness.clock.timerCount(), 0, "rearmed run should clean all timers on dismissal");
}

(async () => {
  await testPostDomReadyLayoutDiscoveryIncludesRenderedImages();
  await testOffscreenEagerImageDoesNotDelayAfterDomReady();
  await testProjectedHashViewportImagesBlockUntilPostReleaseAlignment();
  await testExplicitFontAndVisibleImageDecode();
  await testDecodeFailureSettlesButFontFailureShowsRetry();
  await testProgressAnimatesAcrossLiveResourceStates();
  await testOnlyOnePriorityImageBlocksEntry();
  testUpdatedTimeouts();
  testLoadHashRetriesWaitForUnlock();
  await testSettledResourcesAndMinimumDuration();
  await testHardTimeoutRelease();
  await testPersistedRearmInvalidatesPriorCompletion();
  await testAlreadySettledStylesheetError();
  await testReducedMotionReleasesImmediately();
  await testIndependentWatchdogFailOpen();
  await testControllerCancelsWatchdog();
  await testFiredWatchdogPreventsRelock();
  await testPersistedWatchdogRestoresLoader();
  await testPersistedReturnCancelsPendingWatchdog();
  await testPersistedRearmCancelsPendingUnlock();
  await testWatchdogCleansPartiallyStartedController();
  await testRearmCleansPriorRunListeners();
  console.log(`page loading gate checks passed (${pages.length} pages, ${videoTags.length} videos, executable controller)`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
