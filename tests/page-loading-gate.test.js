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

for (const page of pages) {
  const html = read(page);
  const htmlTag = html.match(/<html\b[^>]*>/)?.[0] || "";
  const bodyTag = html.match(/<body\b[^>]*>/)?.[0] || "";
  const expectedBodyClass = detailPages.has(page)
    ? 'class="detail-page is-page-loading"'
    : 'class="is-page-loading"';
  const criticalStyleIndex = html.indexOf("<style data-loader-critical>");
  const stylesheetIndex = html.indexOf('<link rel="stylesheet"');

  assert.ok(htmlTag.includes('class="is-page-loading"'), `${page} html should start in the loading state`);
  assert.ok(bodyTag.includes(expectedBodyClass), `${page} body should preserve its page class and start loading`);
  assert.ok(criticalStyleIndex >= 0, `${page} should include marked critical loader CSS`);
  assert.ok(criticalStyleIndex < stylesheetIndex, `${page} critical loader CSS should precede the external stylesheet`);
  assert.match(html, /<style data-loader-critical>[\s\S]*?overflow:\s*hidden;[\s\S]*?position:\s*fixed;[\s\S]*?z-index:\s*10000;[\s\S]*?background:\s*#111;[\s\S]*?<\/style>/, `${page} critical CSS should lock scrolling behind a dark fixed cover`);

  const firstBodyChild = html.slice(html.indexOf(bodyTag) + bodyTag.length).match(/^\s*(<[^>]+>)/)?.[1];
  assert.equal(firstBodyChild, '<div class="page-loader" role="status" aria-label="页面正在加载">', `${page} loader should be the first body child`);
  assert.ok(html.indexOf('class="page-loader"') < html.indexOf('class="page-shell"'), `${page} loader should precede visible page content`);
  assert.ok(html.includes('data-loading-percent>08%</span>'), `${page} should expose the initial visual percentage`);
  assert.ok(html.includes('<script src="script.js"></script>'), `${page} should load the shared controller`);

  const loaderBlock = html.match(/<div class="page-loader"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)?.[0];
  assert.ok(loaderBlock, `${page} should include the complete loader markup`);
  loaderBlocks.push(loaderBlock.replace(/\s+/g, " "));

  assert.doesNotMatch(html, /<link\b[^>]*rel="preload"[^>]*as="(?:image|video)"/i, `${page} should not preload galleries or videos`);
}

loaderBlocks.slice(1).forEach((block) => {
  assert.equal(block, loaderBlocks[0], "all pages should use identical loader markup");
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

[
  "const PAGE_LOADER_MIN_MS = 350",
  "const PAGE_LOADER_TIMEOUT_MS = 5000",
  "function waitForStylesheets",
  "document.fonts.ready",
  "function waitForFirstViewImages",
  'image.loading === "lazy"',
  "window.innerHeight * 1.25",
  'image.addEventListener("load"',
  'image.addEventListener("error"',
  "Promise.allSettled",
  "Promise.race",
  "Math.max(currentProgress",
  'loader.setAttribute("aria-hidden", "true")',
  'document.documentElement.classList.remove("is-page-loading")',
  'document.body.classList.remove("is-page-loading")',
  'window.addEventListener("pageshow"',
  "event.persisted",
  "clearTimeout",
].forEach((token) => assert.ok(script.includes(token), `loader controller should include ${token}`));

const loaderController = script.slice(0, script.indexOf('const navLinks ='));
assert.ok(loaderController.includes("function initPageLoader"), "loader controller should precede unrelated interactions");
assert.ok(loaderController.includes("currentProgress"), "loader initialization should own progress state");
assert.ok(loaderController.includes("PAGE_LOADER_MIN_MS"), "loader initialization should enforce its minimum duration");
assert.ok(loaderController.includes("PAGE_LOADER_TIMEOUT_MS"), "loader initialization should enforce its hard timeout");
assert.match(script, /document\.fonts\s*\?[\s\S]*?document\.fonts\.ready\.catch\([\s\S]*?:\s*Promise\.resolve\(\)/, "font readiness should have failure and unsupported-browser fallbacks");

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

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

function createResource(options = {}) {
  const resource = new FakeEventTarget();
  Object.assign(resource, options);
  resource.getBoundingClientRect = () => options.rect || { top: 0, bottom: 100 };
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
  const attributes = new Map(options.loaderHidden ? [["aria-hidden", "true"]] : []);
  const loader = {
    getAttribute: (name) => attributes.get(name) ?? null,
    querySelector: (selector) => selector === ".page-loader__fill" ? fill : percent,
    removeAttribute: (name) => attributes.delete(name),
    setAttribute: (name, value) => attributes.set(name, value),
  };
  const documentElement = { classList: new FakeClassList(options.loading === false ? [] : ["is-page-loading"]) };
  const body = { classList: new FakeClassList(options.loading === false ? [] : ["is-page-loading"]) };
  const stylesheets = options.stylesheets || [];
  const images = options.images || [];
  const windowTarget = new FakeEventTarget();
  const scrollState = { scrollToCalls: 0, x: 24, y: 480 };
  Object.assign(windowTarget, {
    clearTimeout: (id) => clock.clearTimeout(id),
    innerHeight: 800,
    scrollTo: () => { scrollState.scrollToCalls += 1; },
    scrollX: scrollState.x,
    scrollY: scrollState.y,
    setTimeout: (callback, delay) => clock.setTimeout(callback, delay),
  });

  const document = {
    body,
    documentElement,
    fonts: options.fonts,
    images,
    querySelector: (selector) => selector === ".page-loader" ? loader : null,
    querySelectorAll: (selector) => selector === 'link[rel="stylesheet"]' ? stylesheets : [],
  };

  vm.runInNewContext(loaderController, {
    clearTimeout: (id) => clock.clearTimeout(id),
    document,
    performance: { now: () => clock.now },
    window: windowTarget,
  }, { filename: "script.js", timeout: 1000 });

  return {
    body,
    clock,
    documentElement,
    loader,
    percent,
    progressValues,
    scrollState,
    window: windowTarget,
  };
}

async function flushMicrotasks() {
  for (let index = 0; index < 8; index += 1) {
    await Promise.resolve();
  }
}

async function advance(harness, milliseconds) {
  harness.clock.advance(milliseconds);
  await flushMicrotasks();
  harness.clock.advance(0);
  await flushMicrotasks();
}

async function testSettledResourcesAndMinimumDuration() {
  const stylesheet = createResource({ sheet: null });
  const loadedImage = createResource({ complete: false, loading: "eager" });
  const failedImage = createResource({ complete: false, loading: "eager" });
  const lazyImage = createResource({ complete: false, loading: "lazy" });
  const farImage = createResource({ complete: false, loading: "eager", rect: { top: 1200, bottom: 1300 } });
  const fonts = deferred();
  const harness = createLoaderHarness({
    fonts: { ready: fonts.promise },
    images: [loadedImage, failedImage, lazyImage, farImage],
    stylesheets: [stylesheet],
  });

  assert.equal(lazyImage.listenerCount("load"), 0, "lazy images should not receive readiness listeners");
  assert.equal(farImage.listenerCount("load"), 0, "far-offscreen images should not receive readiness listeners");
  stylesheet.dispatch("error");
  await flushMicrotasks();
  assert.ok(harness.progressValues.includes(38), "stylesheet error settlement should advance progress");

  fonts.resolve();
  await flushMicrotasks();
  assert.ok(harness.progressValues.includes(68), "font settlement should advance progress");

  loadedImage.dispatch("load");
  failedImage.dispatch("error");
  await flushMicrotasks();

  assert.deepEqual([...harness.progressValues].sort((left, right) => left - right), harness.progressValues, "progress should be monotonic");
  assert.ok(harness.progressValues.includes(92), "first-view image settlement should advance progress");
  assert.equal(harness.percent.textContent, "100%", "combined readiness should reach 100 percent");

  await advance(harness, 349);
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "loader should honor the minimum duration");
  await advance(harness, 1);
  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "settled resources should dismiss after the minimum duration");
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), false, "html loading class should be released");
  assert.equal(harness.body.classList.contains("is-page-loading"), false, "body loading class should be released");
  assert.deepEqual([harness.window.scrollX, harness.window.scrollY], [24, 480], "loader should preserve scroll coordinates");
  assert.equal(harness.scrollState.scrollToCalls, 0, "loader should not mutate scroll position");
}

async function testHardTimeoutRelease() {
  const stylesheet = createResource({ sheet: null });
  const image = createResource({ complete: false, loading: "eager" });
  const fonts = deferred();
  const harness = createLoaderHarness({
    fonts: { ready: fonts.promise },
    images: [image],
    stylesheets: [stylesheet],
  });

  await advance(harness, 4999);
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "loader should remain before the hard timeout");
  await advance(harness, 1);
  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "hard timeout should release unresolved resources");
  assert.equal(harness.percent.textContent, "100%", "hard timeout should still complete progress");
}

async function testPersistedRearmInvalidatesPriorCompletion() {
  const harness = createLoaderHarness({
    fonts: { ready: Promise.resolve() },
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
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), true, "persisted pageshow should re-lock html");
  assert.equal(harness.body.classList.contains("is-page-loading"), true, "persisted pageshow should re-lock body");

  const loaderRule = css.match(/\.page-loader\s*{([\s\S]*?)}/)?.[1] || "";
  const hiddenLoaderRule = css.match(/\.page-loader\[aria-hidden="true"\]\s*{([\s\S]*?)}/)?.[1] || "";
  assert.match(loaderRule, /visibility:\s*visible;/, "restored loader should use a visible base state");
  assert.doesNotMatch(loaderRule, /visibility\s+0s\s+linear\s+400ms/, "restored loader visibility must not wait for the exit delay");
  assert.match(hiddenLoaderRule, /transition:[^;]*visibility\s+0s\s+linear\s+400ms;/, "only dismissal should delay visibility hiding");

  await advance(harness, 250);
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "obsolete first-run completion should be invalidated");
  await advance(harness, 100);
  assert.equal(harness.loader.getAttribute("aria-hidden"), "true", "rearmed loader should dismiss after its own minimum duration");
  assert.equal(harness.documentElement.classList.contains("is-page-loading"), false, "rearmed loader should release html");
  assert.equal(harness.body.classList.contains("is-page-loading"), false, "rearmed loader should release body");
  assert.equal(harness.scrollState.scrollToCalls, 0, "BFCache rearm should not mutate scroll");
}

(async () => {
  await testSettledResourcesAndMinimumDuration();
  await testHardTimeoutRelease();
  await testPersistedRearmInvalidatesPriorCompletion();
  console.log(`page loading gate checks passed (${pages.length} pages, ${videoTags.length} videos, executable controller)`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
