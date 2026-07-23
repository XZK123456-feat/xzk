const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const homeStagePath = path.join(root, "home-stage.js");
const homeStageSource = fs.readFileSync(homeStagePath, "utf8");
const sharedSource = fs.readFileSync(path.join(root, "script.js"), "utf8");
const context = {
  window: {
    matchMedia: () => ({ matches: false }),
  },
  document: {
    body: null,
    querySelector: () => null,
    querySelectorAll: () => [],
  },
};

vm.runInNewContext(homeStageSource, context, { filename: homeStagePath });

const stateApi = context.window.HomeStageState;
const plain = (value) => JSON.parse(JSON.stringify(value));

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

let state = stateApi.reduce(stateApi.DEFAULT_STATE, {
  type: "selectMission",
  mission: 2,
});
assert.deepStrictEqual(plain(state), {
  panel: "missions",
  mission: 2,
  dataPage: 1,
});

state = stateApi.reduce(state, {
  type: "selectPanel",
  panel: "data",
});
assert.deepStrictEqual(plain(state), {
  panel: "data",
  mission: 2,
  dataPage: 1,
});

state = stateApi.reduce(state, {
  type: "selectDataPage",
  dataPage: 2,
});
assert.deepStrictEqual(plain(state), {
  panel: "data",
  mission: 2,
  dataPage: 2,
});

const restored = stateApi.reduce(state, {
  type: "restore",
  state: stateApi.parseHash("#contents-m3"),
});
assert.deepStrictEqual(plain(restored), {
  panel: "missions",
  mission: 3,
  dataPage: 1,
});

let raceState = stateApi.reduce(stateApi.DEFAULT_STATE, {
  type: "selectPanel",
  panel: "data",
});
raceState = stateApi.reduce(raceState, {
  type: "selectPanel",
  panel: "missions",
});
assert.strictEqual(raceState.panel, "missions", "the latest panel action should win");

assert.match(
  homeStageSource,
  /window\.addEventListener\("popstate",\s*restoreFromLocation\)/,
  "the controller should restore state on popstate",
);
assert.match(
  homeStageSource,
  /window\.addEventListener\("hashchange",\s*restoreFromLocation\)/,
  "the controller should restore stage-aware hash changes",
);
assert.ok(
  homeStageSource.includes("window.history.pushState"),
  "the controller should push changed click states into history",
);
assert.ok(
  homeStageSource.includes("window.clearTimeout"),
  "the controller should cancel obsolete wipe timers",
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
