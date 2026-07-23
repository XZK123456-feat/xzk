const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const scriptPath = path.resolve(__dirname, "..", "click-stage.js");
const source = fs.readFileSync(scriptPath, "utf8");
const context = {
  window: {},
  document: {},
};

vm.runInNewContext(source, context, { filename: scriptPath });

const { parseHash, formatHash, getPageSize, paginate } = context.window.PortfolioStage;
const plain = (value) => JSON.parse(JSON.stringify(value));
const paginateWithTimeout = (items, pageSize) => {
  context.testItems = items;
  context.testPageSize = pageSize;
  return vm.runInContext(
    "window.PortfolioStage.paginate(testItems, testPageSize)",
    context,
    { timeout: 100 },
  );
};

assert.deepStrictEqual(plain(parseHash("#horizontal-p2", "overview")), {
  view: "horizontal",
  page: 2,
});
assert.deepStrictEqual(plain(parseHash("", "overview")), {
  view: "overview",
  page: 1,
});

assert.strictEqual(formatHash("lili-tangquan", 3), "#lili-tangquan-p3");
assert.strictEqual(formatHash("overview", 1), "#overview");

assert.strictEqual(getPageSize("horizontal", 1440, 900), 6);
assert.strictEqual(getPageSize("horizontal", 390, 844), 1);
assert.strictEqual(getPageSize("vertical", 1440, 900), 4);
assert.strictEqual(getPageSize("video", 1440, 900), 3);
assert.strictEqual(getPageSize("video", 390, 844), 1);

assert.deepStrictEqual(plain(paginate(["a", "b", "c"], 2)), [
  ["a", "b"],
  ["c"],
]);
assert.deepStrictEqual(plain(paginateWithTimeout(["a", "b", "c"], 0)), [
  ["a"],
  ["b"],
  ["c"],
]);
assert.deepStrictEqual(plain(paginateWithTimeout(["a", "b", "c"], -1)), [
  ["a"],
  ["b"],
  ["c"],
]);
assert.deepStrictEqual(plain(paginateWithTimeout(["a", "b", "c"], "invalid")), [
  ["a"],
  ["b"],
  ["c"],
]);
assert.deepStrictEqual(plain(paginateWithTimeout(["a", "b", "c"], 2.9)), [
  ["a", "b"],
  ["c"],
]);

console.log("click stage utility checks passed");
