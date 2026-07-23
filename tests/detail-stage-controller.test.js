const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const controllerPath = path.join(root, "detail-stage.js");
assert.ok(fs.existsSync(controllerPath), "detail-stage.js should exist");
const controllerSource = fs.readFileSync(controllerPath, "utf8");
const plain = (value) => JSON.parse(JSON.stringify(value));

const pureWindow = {};
vm.runInNewContext(controllerSource, {
  console,
  document: null,
  window: pureWindow,
}, { filename: controllerPath });
const isolatedState = pureWindow.DetailStageState;
assert.ok(isolatedState, "detail-stage.js should expose pure state helpers without a DOM");
assert.strictEqual(typeof isolatedState.parse, "function", "DetailStageState.parse should be public");
assert.strictEqual(typeof isolatedState.format, "function", "DetailStageState.format should be public");
assert.strictEqual(typeof isolatedState.reduce, "function", "DetailStageState.reduce should be public");
assert.deepStrictEqual(
  Object.keys(isolatedState).sort(),
  ["format", "parse", "reduce"],
  "DetailStageState should expose exactly the standalone pure API",
);
assert.deepStrictEqual(
  plain(isolatedState.parse("#horizontal-p2", ["overview", "horizontal"])),
  { view: "horizontal", page: 2 },
  "the standalone parser should understand paged hashes",
);
assert.strictEqual(
  isolatedState.format({ view: "horizontal", page: 2 }),
  "#horizontal-p2",
  "the standalone formatter should not require PortfolioStage",
);
assert.deepStrictEqual(
  plain(isolatedState.reduce(
    { view: "horizontal", page: 2 },
    { type: "NEXT_PAGE" },
    { horizontal: 3 },
  )),
  { view: "horizontal", page: 3 },
  "the standalone reducer should clamp against view limits",
);

function createClassList(initial = []) {
  const values = new Set(initial);
  return {
    add(...names) {
      names.forEach((name) => values.add(name));
    },
    remove(...names) {
      names.forEach((name) => values.delete(name));
    },
    toggle(name, force) {
      const add = force === undefined ? !values.has(name) : Boolean(force);
      if (add) values.add(name);
      else values.delete(name);
      return add;
    },
    contains(name) {
      return values.has(name);
    },
  };
}

class FakeElement {
  constructor(document, options = {}) {
    this.ownerDocument = document;
    this.tagName = String(options.tagName || "div").toUpperCase();
    this.attributes = new Map(Object.entries(options.attributes || {}));
    this.classList = createClassList(options.classes || []);
    this.dataset = { ...(options.dataset || {}) };
    this.disabled = false;
    this.hidden = Boolean(options.hidden);
    this.listeners = new Map();
    this.queryMap = new Map();
    this.queryAllMap = new Map();
    this.parentElement = options.parentElement || null;
    this.textContent = "";
    this.offsetWidth = 100;
    this.pauseCount = 0;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatch(type, properties = {}) {
    const event = {
      type,
      target: properties.target || this,
      currentTarget: this,
      key: properties.key,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      ...properties,
    };
    (this.listeners.get(type) || []).slice().forEach((listener) => listener(event));
    return event;
  }

  click() {
    return this.dispatch("click");
  }

  closest(selector) {
    if (selector.includes("input") && ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "VIDEO", "AUDIO"].includes(this.tagName)) {
      return this;
    }
    if (selector === "[data-task-rail]" && this.dataset.taskRail !== undefined) return this;
    return this.parentElement?.closest?.(selector) || null;
  }

  contains(node) {
    let current = node;
    while (current) {
      if (current === this) return true;
      current = current.parentElement;
    }
    return false;
  }

  focus() {
    this.ownerDocument.activeElement = this;
    this.focused = true;
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  pause() {
    this.pauseCount += 1;
  }

  querySelector(selector) {
    return this.queryMap.get(selector) || null;
  }

  querySelectorAll(selector) {
    return this.queryAllMap.get(selector) || [];
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
}

function createTimerHarness() {
  let now = 0;
  let nextId = 1;
  const timers = new Map();
  return {
    setTimeout(callback, delay = 0) {
      const id = nextId++;
      timers.set(id, { callback, time: now + Number(delay) });
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
    advance(milliseconds) {
      const target = now + milliseconds;
      while (true) {
        const next = [...timers.entries()]
          .filter(([, timer]) => timer.time <= target)
          .sort((a, b) => a[1].time - b[1].time || a[0] - b[0])[0];
        if (!next) break;
        timers.delete(next[0]);
        now = next[1].time;
        next[1].callback();
      }
      now = target;
    },
  };
}

function createHarness(initialHash = "#overview", options = {}) {
  const timers = createTimerHarness();
  const windowListeners = new Map();
  const documentListeners = new Map();
  const mutationObservers = [];
  let declarativeGallery = null;
  const document = {
    activeElement: null,
    queryMap: new Map(),
    queryAllMap: new Map(),
    addEventListener(type, listener) {
      const listeners = documentListeners.get(type) || [];
      listeners.push(listener);
      documentListeners.set(type, listeners);
    },
    dispatchEvent(event) {
      (documentListeners.get(event.type) || []).slice().forEach((listener) => listener(event));
      return true;
    },
    querySelector(selector) {
      return this.queryMap.get(selector) || null;
    },
    querySelectorAll(selector) {
      return this.queryAllMap.get(selector) || [];
    },
  };
  const body = new FakeElement(document, { tagName: "body" });
  document.body = body;

  const main = new FakeElement(document, { dataset: { detailStage: "", defaultView: "overview" } });
  const tablist = new FakeElement(document, { tagName: "nav" });
  const views = ["overview", "horizontal", "vertical"];
  const tabs = views.map((view) => new FakeElement(document, {
    tagName: "a",
    attributes: { href: `#${view}`, "aria-selected": view === "overview" ? "true" : "false" },
    dataset: { stageTab: view },
    parentElement: tablist,
  }));
  const panels = views.map((view) => new FakeElement(document, {
    tagName: "section",
    attributes: { id: view },
    dataset: { stageView: view },
    parentElement: main,
  }));
  if (options.declarativeGallery) {
    declarativeGallery = new FakeElement(document, {
      classes: options.declarativeGalleryLoading ? ["is-gallery-loading"] : [],
      dataset: {
        stageGallery: "horizontal",
        stageGalleryItems: ".item",
        stageGalleryKind: "horizontal",
      },
      parentElement: panels[1],
    });
    declarativeGallery.queryAllMap.set(
      ".item",
      Array.from(
        { length: options.declarativeGalleryItems ?? 4 },
        () => new FakeElement(document, { tagName: "button", parentElement: declarativeGallery }),
      ),
    );
    panels[1].queryMap.set("[data-stage-gallery]", declarativeGallery);
  }
  const pager = new FakeElement(document, { hidden: true, dataset: { stagePager: "" }, parentElement: main });
  const previous = new FakeElement(document, { tagName: "button", dataset: { stagePrevious: "" }, parentElement: pager });
  const status = new FakeElement(document, { dataset: { stageStatus: "" }, parentElement: pager });
  const next = new FakeElement(document, { tagName: "button", dataset: { stageNext: "" }, parentElement: pager });
  pager.queryMap.set("[data-stage-previous]", previous);
  pager.queryMap.set("[data-stage-status]", status);
  pager.queryMap.set("[data-stage-next]", next);

  const rail = new FakeElement(document, { tagName: "nav", dataset: { taskRail: "" } });
  const railToggle = new FakeElement(document, {
    tagName: "button",
    attributes: { "aria-expanded": "false" },
    dataset: { taskRailToggle: "" },
    parentElement: rail,
  });
  const taskLinks = ["website", "ua", "community", "video"].map((task, index) => new FakeElement(document, {
    tagName: "a",
    attributes: { href: `${task}.html`, ...(index === 1 ? { "aria-current": "page" } : {}) },
    classes: ["directory-item"],
    parentElement: rail,
  }));
  rail.queryMap.set("[data-task-rail-toggle]", railToggle);
  rail.queryAllMap.set(".directory-item", taskLinks);

  const wipe = new FakeElement(document, { classes: ["stage-wipe"] });
  const wipeLabel = new FakeElement(document, { tagName: "span", parentElement: wipe });
  wipe.queryMap.set("span", wipeLabel);
  const lightbox = new FakeElement(document, { classes: ["website-lightbox"] });
  const video = new FakeElement(document, { tagName: "video" });

  main.queryAllMap.set("[data-stage-view]", panels);
  tablist.queryAllMap.set("[data-stage-tab]", tabs);
  document.queryMap.set("[data-detail-stage]", main);
  document.queryMap.set('[role="tablist"]', tablist);
  document.queryMap.set("[data-stage-pager]", pager);
  document.queryMap.set("[data-task-rail]", options.invalid ? null : rail);
  document.queryMap.set(".stage-wipe", wipe);
  document.queryMap.set(".website-lightbox.is-open, .resume-overlay.is-open, [role=\"dialog\"].is-open", null);
  document.queryAllMap.set("video", [video]);

  const location = {
    hash: initialHash,
    assigned: null,
    assign(href) {
      this.assigned = href;
    },
  };
  const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
  const entries = [{ hash: initialHash, state: clone(options.historyState || null) }];
  let historyIndex = 0;
  const dispatchWindow = (event) => {
    (windowListeners.get(event.type) || []).slice().forEach((listener) => listener(event));
  };
  const setHash = (url) => {
    const value = String(url);
    location.hash = value.includes("#") ? value.slice(value.indexOf("#")) : location.hash;
  };
  const history = {
    entries,
    get state() {
      return clone(entries[historyIndex].state);
    },
    pushState(state, _title, url) {
      entries.splice(historyIndex + 1);
      setHash(url);
      entries.push({ hash: location.hash, state: clone(state) });
      historyIndex = entries.length - 1;
    },
    replaceState(state, _title, url) {
      setHash(url);
      entries[historyIndex] = { hash: location.hash, state: clone(state) };
    },
    back() {
      if (historyIndex === 0) return;
      historyIndex -= 1;
      location.hash = entries[historyIndex].hash;
      dispatchWindow({ type: "popstate", state: history.state });
      dispatchWindow({ type: "hashchange" });
    },
    forward() {
      if (historyIndex >= entries.length - 1) return;
      historyIndex += 1;
      location.hash = entries[historyIndex].hash;
      dispatchWindow({ type: "popstate", state: history.state });
      dispatchWindow({ type: "hashchange" });
    },
    manualHash(hash) {
      entries.splice(historyIndex + 1);
      entries.push({ hash, state: null });
      historyIndex = entries.length - 1;
      location.hash = hash;
      dispatchWindow({ type: "hashchange" });
    },
  };
  class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  }
  class MutationObserver {
    constructor(callback) {
      this.callback = callback;
      this.targets = [];
      mutationObservers.push(this);
    }

    observe(target) {
      this.targets.push(target);
    }
  }
  const window = {
    CustomEvent,
    MutationObserver,
    document,
    history,
    innerHeight: 844,
    innerWidth: 390,
    location,
    PortfolioStage: {
      formatHash(view, page) {
        return `#${view}${page > 1 ? `-p${page}` : ""}`;
      },
      getPageSize() {
        return options.pageSize || 1;
      },
    },
    addEventListener(type, listener) {
      const listeners = windowListeners.get(type) || [];
      listeners.push(listener);
      windowListeners.set(type, listeners);
    },
    clearTimeout: timers.clearTimeout,
    dispatchEvent: dispatchWindow,
    matchMedia() {
      return { matches: Boolean(options.reducedMotion) };
    },
    setTimeout: timers.setTimeout,
  };

  vm.runInNewContext(controllerSource, { console, document, window }, { filename: controllerPath });

  return {
    body,
    document,
    declarativeGallery,
    history,
    lightbox,
    location,
    main,
    next,
    pager,
    panels,
    previous,
    rail,
    railToggle,
    status,
    tabs,
    taskLinks,
    timers,
    video,
    window,
    flushMutations(target = declarativeGallery) {
      mutationObservers
        .filter((observer) => observer.targets.includes(target))
        .forEach((observer) => observer.callback([{ target }]));
    },
    setDeclarativeGalleryItems(count) {
      declarativeGallery.queryAllMap.set(
        ".item",
        Array.from(
          { length: count },
          () => new FakeElement(document, { tagName: "button", parentElement: declarativeGallery }),
        ),
      );
    },
    completeDeclarativeGallery(count) {
      this.setDeclarativeGalleryItems(count);
      declarativeGallery.classList.remove("is-gallery-loading");
      declarativeGallery.classList.add("is-gallery-ready");
      this.flushMutations();
    },
    setLightboxOpen(open) {
      lightbox.classList.toggle("is-open", open);
      document.queryMap.set(
        ".website-lightbox.is-open, .resume-overlay.is-open, [role=\"dialog\"].is-open",
        open ? lightbox : null,
      );
    },
    keydown(key, target = body) {
      return document.dispatchEvent({
        type: "keydown",
        key,
        target,
        defaultPrevented: false,
        preventDefault() {
          this.defaultPrevented = true;
        },
      });
    },
  };
}

const pureHarness = createHarness("#overview");
const state = pureHarness.window.DetailStageState;
assert.ok(state, "the controller should expose DetailStageState");
assert.deepStrictEqual(plain(state.parse("#horizontal-p2", ["overview", "horizontal"])), { view: "horizontal", page: 2 });
assert.deepStrictEqual(plain(state.parse("#unknown-p4", ["overview", "horizontal"])), { view: "overview", page: 1 });
assert.deepStrictEqual(plain(state.parse("#horizontal-p0", ["overview", "horizontal"])), { view: "horizontal", page: 1 });
assert.deepStrictEqual(plain(state.parse(null, ["overview"], "overview")), { view: "overview", page: 1 });
assert.strictEqual(state.format({ view: "horizontal", page: 2 }), "#horizontal-p2");
assert.deepStrictEqual(plain(state.reduce({ view: "overview", page: 1 }, { type: "SELECT_VIEW", view: "horizontal" }, { horizontal: 3 })), { view: "horizontal", page: 1 });
assert.deepStrictEqual(plain(state.reduce({ view: "horizontal", page: 1 }, { type: "SET_PAGE", page: 99 }, { horizontal: 3 })), { view: "horizontal", page: 3 });
assert.deepStrictEqual(plain(state.reduce({ view: "horizontal", page: 2 }, { type: "NEXT_PAGE" }, { horizontal: 3 })), { view: "horizontal", page: 3 });
assert.deepStrictEqual(plain(state.reduce({ view: "horizontal", page: 2 }, { type: "PREVIOUS_PAGE" }, { horizontal: 3 })), { view: "horizontal", page: 1 });
assert.deepStrictEqual(plain(state.reduce({ view: "horizontal", page: -4 }, { type: "UNKNOWN" }, { horizontal: 3 })), { view: "horizontal", page: 1 });

const invalidHarness = createHarness("#overview", { invalid: true });
assert.strictEqual(invalidHarness.body.classList.contains("stage-ready"), false, "stage-ready should not be added when validation fails");

const declarativeHarness = createHarness("#horizontal-p2", {
  declarativeGallery: true,
  pageSize: 2,
});
assert.strictEqual(
  declarativeHarness.status.textContent,
  "02 / 02",
  "declarative production galleries should auto-register with the detail controller",
);

const lateGalleryHarness = createHarness("#horizontal-p2", {
  declarativeGallery: true,
  declarativeGalleryItems: 0,
  pageSize: 2,
});
lateGalleryHarness.setDeclarativeGalleryItems(4);
lateGalleryHarness.flushMutations();
assert.strictEqual(
  lateGalleryHarness.status.textContent,
  "02 / 02",
  "late-rendered declarative galleries should refresh their real page count",
);
assert.strictEqual(
  lateGalleryHarness.location.hash,
  "#horizontal-p2",
  "late gallery registration should preserve the requested deep-linked page",
);

const batchedGalleryHarness = createHarness("#horizontal-p4", {
  declarativeGallery: true,
  declarativeGalleryItems: 0,
  declarativeGalleryLoading: true,
  pageSize: 2,
});
batchedGalleryHarness.setDeclarativeGalleryItems(4);
batchedGalleryHarness.flushMutations();
assert.strictEqual(
  batchedGalleryHarness.location.hash,
  "#horizontal-p4",
  "partial render batches should not clamp a valid deep-linked page",
);
batchedGalleryHarness.completeDeclarativeGallery(8);
assert.strictEqual(batchedGalleryHarness.status.textContent, "04 / 04");
assert.strictEqual(batchedGalleryHarness.location.hash, "#horizontal-p4");

const harness = createHarness("#horizontal-p2");
assert.ok(harness.body.classList.contains("stage-ready"), "stage-ready should be added after successful initialization");
assert.deepStrictEqual(harness.history.state, { portfolioDetailState: { view: "horizontal", page: 2 } });
assert.strictEqual(harness.panels[1].hidden, false, "hash-selected panel should be visible");
assert.strictEqual(harness.panels[0].hidden, true, "inactive panels should be hidden after initialization");
assert.strictEqual(harness.panels[0].hasAttribute("inert"), true, "inactive panels should be inert");
assert.strictEqual(harness.panels[0].getAttribute("aria-hidden"), "true", "inactive panels should be aria-hidden");

const horizontalItems = Array.from({ length: 4 }, () => new FakeElement(harness.document, { tagName: "button" }));
const horizontalRoot = new FakeElement(harness.document);
horizontalRoot.queryAllMap.set(".item", horizontalItems);
harness.window.DetailStage.registerGallery("horizontal", horizontalRoot, { kind: "horizontal", itemSelector: ".item" });
assert.strictEqual(harness.status.textContent, "02 / 04", "late gallery registration should restore the requested page");

harness.tabs[2].click();
assert.strictEqual(harness.location.hash, "#vertical", "tab clicks should push the selected view hash");
assert.deepStrictEqual(harness.history.state, { portfolioDetailState: { view: "vertical", page: 1 } }, "tab clicks should push full detail state");
harness.timers.advance(280);
assert.strictEqual(harness.panels[2].hidden, false, "the category should apply at the wipe midpoint");

const verticalItems = Array.from({ length: 2 }, () => new FakeElement(harness.document, { tagName: "button" }));
const verticalRoot = new FakeElement(harness.document);
verticalRoot.queryAllMap.set(".item", verticalItems);
harness.window.DetailStage.registerGallery("vertical", verticalRoot, { kind: "vertical", itemSelector: ".item" });
harness.next.click();
harness.next.click();
assert.strictEqual(harness.status.textContent, "02 / 02", "page actions should clamp to the registered page count");
assert.deepStrictEqual(harness.history.state, { portfolioDetailState: { view: "vertical", page: 2 } });

harness.history.back();
assert.strictEqual(harness.location.hash, "#vertical");
assert.strictEqual(harness.status.textContent, "01 / 02", "popstate should restore the exact stored page");
harness.history.forward();
assert.strictEqual(harness.location.hash, "#vertical-p2");
assert.strictEqual(harness.status.textContent, "02 / 02", "forward navigation should restore the exact stored page");
harness.history.back();
harness.history.manualHash("#not-a-real-view-p8");
assert.strictEqual(harness.location.hash, "#overview", "invalid manual hashes should safely replace with the fallback");
assert.strictEqual(harness.panels[0].hidden, false);

harness.tabs[1].click();
harness.tabs[2].click();
harness.timers.advance(600);
assert.strictEqual(harness.panels[2].hidden, false, "rapid category transitions should leave the latest view active");
assert.strictEqual(harness.panels[1].hidden, true);

harness.railToggle.click();
assert.strictEqual(harness.rail.classList.contains("is-open"), true);
harness.keydown("Escape");
assert.strictEqual(harness.rail.classList.contains("is-open"), false, "Escape should collapse the N2 rail");
assert.strictEqual(harness.document.activeElement, harness.railToggle, "Escape should restore focus to the rail toggle");

harness.tabs[2].click();
harness.timers.advance(280);
assert.strictEqual(harness.status.textContent, "01 / 02");
harness.setLightboxOpen(true);
harness.keydown("ArrowRight");
assert.strictEqual(harness.status.textContent, "01 / 02", "an open Lightbox should suppress page arrow handling");

const memoryHarness = createHarness("#horizontal");
const memoryHorizontalItems = Array.from(
  { length: 4 },
  () => new FakeElement(memoryHarness.document, { tagName: "button" }),
);
const memoryHorizontalRoot = new FakeElement(memoryHarness.document);
memoryHorizontalRoot.queryAllMap.set(".item", memoryHorizontalItems);
memoryHarness.window.DetailStage.registerGallery(
  "horizontal",
  memoryHorizontalRoot,
  { kind: "horizontal", itemSelector: ".item" },
);
const memoryVerticalItems = Array.from(
  { length: 2 },
  () => new FakeElement(memoryHarness.document, { tagName: "button" }),
);
const memoryVerticalRoot = new FakeElement(memoryHarness.document);
memoryVerticalRoot.queryAllMap.set(".item", memoryVerticalItems);
memoryHarness.window.DetailStage.registerGallery(
  "vertical",
  memoryVerticalRoot,
  { kind: "vertical", itemSelector: ".item" },
);
memoryHarness.next.click();
assert.strictEqual(memoryHarness.status.textContent, "02 / 04");
memoryHarness.tabs[2].click();
memoryHarness.timers.advance(280);
assert.strictEqual(memoryHarness.status.textContent, "01 / 02");
memoryHarness.tabs[1].click();
memoryHarness.timers.advance(280);
assert.strictEqual(
  memoryHarness.status.textContent,
  "02 / 04",
  "returning to a category should restore its remembered page",
);
assert.deepStrictEqual(memoryHarness.history.state, {
  portfolioDetailState: { view: "horizontal", page: 2 },
});

const pendingPageHarness = createHarness("#overview");
const pendingHorizontalItems = Array.from(
  { length: 3 },
  () => new FakeElement(pendingPageHarness.document, { tagName: "button" }),
);
const pendingHorizontalRoot = new FakeElement(pendingPageHarness.document);
pendingHorizontalRoot.queryAllMap.set(".item", pendingHorizontalItems);
pendingPageHarness.window.DetailStage.registerGallery(
  "horizontal",
  pendingHorizontalRoot,
  { kind: "horizontal", itemSelector: ".item" },
);
pendingPageHarness.tabs[1].click();
assert.strictEqual(
  pendingPageHarness.panels[0].hidden,
  false,
  "the outgoing panel should remain visible before the category wipe midpoint",
);
pendingPageHarness.keydown("ArrowRight");
assert.strictEqual(
  pendingPageHarness.panels[0].hidden,
  false,
  "page arrows must not apply a pending category before the wipe midpoint",
);
assert.deepStrictEqual(pendingPageHarness.history.state, {
  portfolioDetailState: { view: "horizontal", page: 1 },
});
pendingPageHarness.timers.advance(280);
assert.strictEqual(pendingPageHarness.panels[1].hidden, false);
assert.strictEqual(
  pendingPageHarness.status.textContent,
  "01 / 03",
  "ignored pending-wipe pagination should leave a valid target page",
);

const pendingGalleryHarness = createHarness("#overview", {
  declarativeGallery: true,
  declarativeGalleryItems: 0,
  pageSize: 2,
});
pendingGalleryHarness.tabs[1].click();
pendingGalleryHarness.setDeclarativeGalleryItems(4);
pendingGalleryHarness.flushMutations();
assert.strictEqual(
  pendingGalleryHarness.panels[0].hidden,
  false,
  "late gallery registration must not apply a pending category before the wipe midpoint",
);
pendingGalleryHarness.timers.advance(280);
assert.strictEqual(pendingGalleryHarness.panels[1].hidden, false);
assert.strictEqual(pendingGalleryHarness.status.textContent, "01 / 02");

const currentTaskHarness = createHarness("#overview");
currentTaskHarness.railToggle.click();
assert.strictEqual(currentTaskHarness.rail.classList.contains("is-open"), true);
currentTaskHarness.taskLinks[1].click();
assert.strictEqual(
  currentTaskHarness.rail.classList.contains("is-open"),
  false,
  "clicking the current task should close an open rail",
);
assert.strictEqual(
  currentTaskHarness.document.activeElement,
  currentTaskHarness.railToggle,
  "current-task close should restore focus to the rail toggle",
);
assert.strictEqual(currentTaskHarness.location.assigned, null);

const crossTaskHarness = createHarness("#overview");
crossTaskHarness.railToggle.click();
crossTaskHarness.taskLinks[0].click();
assert.strictEqual(crossTaskHarness.rail.classList.contains("is-open"), false);
assert.strictEqual(
  crossTaskHarness.document.activeElement,
  crossTaskHarness.railToggle,
  "cross-task selection should restore focus before the wipe navigates",
);
assert.strictEqual(crossTaskHarness.location.assigned, null);
crossTaskHarness.timers.advance(280);
assert.strictEqual(crossTaskHarness.location.assigned, "website.html");

console.log("detail stage controller checks passed");
