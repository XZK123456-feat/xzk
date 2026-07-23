const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const homeStagePath = path.join(root, "home-stage.js");
const homeStageSource = fs.readFileSync(homeStagePath, "utf8");
const sharedSource = fs.readFileSync(path.join(root, "script.js"), "utf8");
const plain = (value) => JSON.parse(JSON.stringify(value));

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
      const shouldAdd = force === undefined ? !values.has(name) : Boolean(force);
      if (shouldAdd) {
        values.add(name);
      } else {
        values.delete(name);
      }
      return shouldAdd;
    },
    contains(name) {
      return values.has(name);
    },
  };
}

class FakeElement {
  constructor({ attributes = {}, classes = [], dataset = {}, hidden = false } = {}) {
    this.attributes = new Map(Object.entries(attributes));
    this.classList = createClassList(classes);
    this.dataset = { ...dataset };
    this.disabled = false;
    this.hidden = hidden;
    this.listeners = new Map();
    this.offsetWidth = 100;
    this.queryMap = new Map();
    this.scrollTop = 0;
    this.textContent = "";
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatch(type, properties = {}) {
    const event = {
      type,
      target: this,
      currentTarget: this,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      ...properties,
    };
    (this.listeners.get(type) || []).forEach((listener) => listener(event));
    return event;
  }

  click() {
    return this.dispatch("click");
  }

  focus() {
    this.focused = true;
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  querySelector(selector) {
    return this.queryMap.get(selector) || null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
}

function createTimerHarness() {
  let currentTime = 0;
  let nextTimerId = 1;
  const timers = new Map();

  return {
    clearTimeout(timerId) {
      timers.delete(timerId);
    },
    setTimeout(callback, delay = 0) {
      const timerId = nextTimerId;
      nextTimerId += 1;
      timers.set(timerId, {
        callback,
        time: currentTime + Number(delay),
      });
      return timerId;
    },
    advance(milliseconds) {
      const targetTime = currentTime + milliseconds;
      while (true) {
        const next = [...timers.entries()]
          .filter(([, timer]) => timer.time <= targetTime)
          .sort((left, right) => left[1].time - right[1].time || left[0] - right[0])[0];
        if (!next) {
          break;
        }
        const [timerId, timer] = next;
        timers.delete(timerId);
        currentTime = timer.time;
        timer.callback();
      }
      currentTime = targetTime;
    },
    pendingCount() {
      return timers.size;
    },
  };
}

function createControllerHarness(initialHash = "#contents") {
  const timerHarness = createTimerHarness();
  const windowListeners = new Map();
  const body = new FakeElement();
  const stage = new FakeElement({ hidden: true });
  const legacyHome = new FakeElement();
  const legacyContents = new FakeElement();
  const dataPanel = new FakeElement({ dataset: { stagePanel: "data" } });
  const missionKicker = new FakeElement();
  const missionTitle = new FakeElement();
  const missionDescription = new FakeElement();
  const missionEnter = new FakeElement({ attributes: { href: "website-design.html" } });
  const missionControls = Array.from({ length: 4 }, (_, index) => new FakeElement({
    attributes: { "aria-selected": index === 0 ? "true" : "false" },
    dataset: { missionSelect: String(index + 1) },
  }));
  const missionPreviews = Array.from({ length: 4 }, (_, index) => new FakeElement({
    dataset: { missionPreview: String(index + 1) },
    hidden: index !== 0,
  }));
  const panelControls = [
    new FakeElement({
      attributes: { href: "#contents" },
      dataset: { homePanelOpen: "missions" },
    }),
    new FakeElement({
      attributes: { href: "#data" },
      dataset: { homePanelOpen: "data" },
    }),
  ];
  const resumeControl = new FakeElement();
  const resumeOverlay = new FakeElement();
  const resumeModal = new FakeElement();
  resumeOverlay.queryMap.set(".resume-modal", resumeModal);
  const dataPages = [
    new FakeElement({ dataset: { dataPage: "1" } }),
    new FakeElement({ dataset: { dataPage: "2" } }),
  ];
  const dataPrevious = new FakeElement();
  const dataNext = new FakeElement();
  const dataStatus = new FakeElement();
  const stageWipe = new FakeElement();
  const stageWipeLabel = new FakeElement();
  stageWipe.queryMap.set("span", stageWipeLabel);
  const brandControl = new FakeElement();
  const singleNodes = new Map([
    ["[data-home-stage]", stage],
    ["#home", legacyHome],
    ["#contents", legacyContents],
    ['[data-stage-panel="data"]', dataPanel],
    ["[data-mission-kicker]", missionKicker],
    ["[data-mission-title]", missionTitle],
    ["[data-mission-description]", missionDescription],
    ["[data-mission-enter]", missionEnter],
    ["[data-home-resume]", resumeControl],
    [".resume-overlay", resumeOverlay],
    ["[data-data-prev]", dataPrevious],
    ["[data-data-next]", dataNext],
    ["[data-data-status]", dataStatus],
    [".stage-wipe", stageWipe],
    [".brand-pill", brandControl],
  ]);
  const listNodes = new Map([
    ["[data-mission-select]", missionControls],
    ["[data-mission-preview]", missionPreviews],
    ["[data-home-panel-open]", panelControls],
    ["[data-data-page]", dataPages],
  ]);
  const document = {
    body,
    querySelector(selector) {
      return singleNodes.get(selector) || null;
    },
    querySelectorAll(selector) {
      return listNodes.get(selector) || [];
    },
  };
  const location = {
    assigned: null,
    hash: initialHash,
    assign(href) {
      this.assigned = href;
    },
  };
  const entries = [{ hash: initialHash, state: null }];
  let historyIndex = 0;
  let window;
  const cloneState = (state) => state === null ? null : plain(state);
  const setHashFromUrl = (url) => {
    const hashIndex = String(url).indexOf("#");
    location.hash = hashIndex >= 0 ? String(url).slice(hashIndex) : "";
  };
  const dispatchWindowEvent = (event) => {
    (windowListeners.get(event.type) || []).forEach((listener) => listener(event));
  };
  const history = {
    entries,
    get index() {
      return historyIndex;
    },
    get state() {
      return cloneState(entries[historyIndex].state);
    },
    pushState(state, _title, url) {
      entries.splice(historyIndex + 1);
      setHashFromUrl(url);
      entries.push({ hash: location.hash, state: cloneState(state) });
      historyIndex = entries.length - 1;
    },
    replaceState(state, _title, url) {
      setHashFromUrl(url);
      entries[historyIndex] = { hash: location.hash, state: cloneState(state) };
    },
    back() {
      if (historyIndex === 0) {
        return;
      }
      historyIndex -= 1;
      location.hash = entries[historyIndex].hash;
      dispatchWindowEvent({ type: "popstate", state: history.state });
      dispatchWindowEvent({ type: "hashchange" });
    },
    forward() {
      if (historyIndex >= entries.length - 1) {
        return;
      }
      historyIndex += 1;
      location.hash = entries[historyIndex].hash;
      dispatchWindowEvent({ type: "popstate", state: history.state });
      dispatchWindowEvent({ type: "hashchange" });
    },
    manualHash(hash) {
      entries.splice(historyIndex + 1);
      entries.push({ hash, state: null });
      historyIndex = entries.length - 1;
      location.hash = hash;
      dispatchWindowEvent({ type: "hashchange" });
    },
  };

  window = {
    activateModalDialog() {},
    addEventListener(type, listener) {
      const listeners = windowListeners.get(type) || [];
      listeners.push(listener);
      windowListeners.set(type, listeners);
    },
    clearTimeout: timerHarness.clearTimeout,
    dispatchEvent: dispatchWindowEvent,
    history,
    location,
    lockPreviewScroll() {},
    matchMedia() {
      return { matches: false };
    },
    setTimeout: timerHarness.setTimeout,
  };

  vm.runInNewContext(homeStageSource, {
    console,
    document,
    window,
  }, { filename: homeStagePath });

  return {
    body,
    dataNext,
    dataPages,
    dataPanel,
    dataPrevious,
    dataStatus,
    history,
    location,
    missionControls,
    missionEnter,
    missionPreviews,
    missionTitle,
    panelControls,
    stage,
    stageWipe,
    timerHarness,
    window,
  };
}

const pureHarness = createControllerHarness();
const stateApi = pureHarness.window.HomeStageState;

assert.ok(stateApi, "home-stage.js should export a pure HomeStageState API");
assert.deepStrictEqual(plain(stateApi.parseHash("#contents-m2")), {
  panel: "missions",
  mission: 2,
  dataPage: 1,
});
assert.strictEqual(
  stateApi.formatHash({ panel: "missions", mission: 2, dataPage: 1 }),
  "#contents-m2",
);
assert.deepStrictEqual(plain(stateApi.parseHash("#data-p2")), {
  panel: "data",
  mission: 1,
  dataPage: 2,
});
assert.strictEqual(
  stateApi.formatHash({ panel: "data", mission: 4, dataPage: 2 }),
  "#data-p2",
);
assert.deepStrictEqual(plain(stateApi.parseHash("#unknown-stage")), {
  panel: "missions",
  mission: 1,
  dataPage: 1,
});

const expectedInitialState = {
  portfolioHomeState: {
    panel: "missions",
    mission: 1,
    dataPage: 1,
  },
};
assert.ok(pureHarness.body.classList.contains("stage-ready"), "the complete harness should initialize the stage");
assert.deepStrictEqual(
  pureHarness.history.state,
  expectedInitialState,
  "initial replaceState should seed the complete homepage state",
);
assert.strictEqual(pureHarness.stage.hidden, false, "mission stage should be visible initially");
assert.strictEqual(pureHarness.dataPanel.hidden, true, "data panel should be hidden initially");

pureHarness.missionControls[1].click();
assert.strictEqual(pureHarness.location.hash, "#contents-m2");
assert.deepStrictEqual(pureHarness.history.state, {
  portfolioHomeState: {
    panel: "missions",
    mission: 2,
    dataPage: 1,
  },
});
assert.strictEqual(pureHarness.missionTitle.textContent, "买量图片设计");
assert.strictEqual(pureHarness.missionControls[1].getAttribute("aria-selected"), "true");
assert.strictEqual(pureHarness.missionPreviews[1].hidden, false);

pureHarness.panelControls[1].click();
assert.strictEqual(pureHarness.location.hash, "#data");
assert.deepStrictEqual(pureHarness.history.state, {
  portfolioHomeState: {
    panel: "data",
    mission: 2,
    dataPage: 1,
  },
});
assert.strictEqual(pureHarness.stage.hidden, false, "panel transition should wait for the wipe midpoint");
pureHarness.timerHarness.advance(285);
assert.strictEqual(pureHarness.stage.hidden, true);
assert.strictEqual(pureHarness.dataPanel.hidden, false);

pureHarness.dataNext.click();
assert.strictEqual(pureHarness.location.hash, "#data-p2");
assert.strictEqual(pureHarness.dataPages[1].hidden, false);
assert.strictEqual(pureHarness.dataStatus.textContent, "02 / 02");
assert.deepStrictEqual(pureHarness.history.state, {
  portfolioHomeState: {
    panel: "data",
    mission: 2,
    dataPage: 2,
  },
});

pureHarness.history.back();
assert.strictEqual(pureHarness.location.hash, "#data");
assert.strictEqual(pureHarness.body.dataset.homePanel, "data");
assert.strictEqual(pureHarness.dataPages[0].hidden, false);
assert.strictEqual(
  pureHarness.missionControls[1].getAttribute("aria-selected"),
  "true",
  "popstate followed by hashchange should preserve the stored mission",
);

pureHarness.history.back();
assert.strictEqual(pureHarness.location.hash, "#contents-m2");
assert.strictEqual(pureHarness.body.dataset.homePanel, "missions");
assert.strictEqual(pureHarness.missionControls[1].getAttribute("aria-selected"), "true");

pureHarness.history.forward();
assert.strictEqual(pureHarness.location.hash, "#data");
assert.strictEqual(pureHarness.body.dataset.homePanel, "data");
assert.strictEqual(pureHarness.missionControls[1].getAttribute("aria-selected"), "true");
pureHarness.panelControls[0].click();
pureHarness.timerHarness.advance(285);
assert.strictEqual(pureHarness.missionTitle.textContent, "买量图片设计");

pureHarness.panelControls[1].click();
pureHarness.timerHarness.advance(285);
pureHarness.dataNext.click();
pureHarness.panelControls[0].click();
pureHarness.timerHarness.advance(285);
pureHarness.panelControls[1].click();
pureHarness.timerHarness.advance(285);
assert.strictEqual(pureHarness.dataStatus.textContent, "02 / 02", "data page memory should survive panel changes");
const unchangedHistoryLength = pureHarness.history.entries.length;
pureHarness.panelControls[1].click();
assert.strictEqual(
  pureHarness.history.entries.length,
  unchangedHistoryLength,
  "selecting the current state should not push duplicate history",
);

pureHarness.history.manualHash("#contents-m4");
assert.strictEqual(pureHarness.body.dataset.homePanel, "missions");
assert.strictEqual(pureHarness.missionControls[3].getAttribute("aria-selected"), "true");
assert.deepStrictEqual(pureHarness.history.state, {
  portfolioHomeState: {
    panel: "missions",
    mission: 4,
    dataPage: 1,
  },
});
pureHarness.history.manualHash("#not-a-stage");
assert.strictEqual(pureHarness.location.hash, "#contents");
assert.strictEqual(pureHarness.missionControls[0].getAttribute("aria-selected"), "true");

const raceHarness = createControllerHarness();
raceHarness.panelControls[1].click();
assert.ok(raceHarness.timerHarness.pendingCount() > 0, "Data should start a pending wipe");
raceHarness.panelControls[0].click();
raceHarness.timerHarness.advance(600);
assert.strictEqual(raceHarness.body.dataset.homePanel, "missions");
assert.strictEqual(raceHarness.stage.hidden, false);
assert.strictEqual(raceHarness.dataPanel.hidden, true);
assert.strictEqual(raceHarness.location.hash, "#contents");
assert.strictEqual(raceHarness.stageWipe.classList.contains("is-running"), false);

assert.match(
  sharedSource,
  /function setActiveNav\(id\)\s*{\s*if \(document\.body\.classList\.contains\("stage-ready"\)\) {\s*return;/,
  "all legacy active-nav writes should stop after stage initialization",
);
assert.match(
  sharedSource,
  /const observer = new IntersectionObserver\(\s*\(entries\) => {\s*if \(document\.body\.classList\.contains\("stage-ready"\)\) {\s*return;/,
  "the legacy section observer should stop after stage initialization",
);
assert.match(
  sharedSource,
  /function setActiveFromScroll\(\)\s*{\s*if \(document\.body\.classList\.contains\("stage-ready"\)\) {\s*return;/,
  "legacy scroll navigation should stop after stage initialization",
);
assert.match(
  sharedSource,
  /function syncHashTarget\(\)\s*{\s*if \(document\.body\.classList\.contains\("stage-ready"\)\) {\s*return;/,
  "legacy hash scrolling should stop after stage initialization",
);

console.log("home stage controller checks passed");
