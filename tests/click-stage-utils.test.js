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

const {
  parseHash,
  formatHash,
  getGalleryLayout,
  getPageSize,
  paginate,
  resolveGalleryKind,
} = context.window.PortfolioStage;
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
assert.strictEqual(getPageSize("square", 1440, 900), 4);
assert.strictEqual(
  getPageSize("horizontal", 844, 390, { width: 640, height: 220 }),
  1,
  "short landscape stages should reduce image pages to one contained item",
);
assert.strictEqual(
  getPageSize("vertical", 1024, 768, { width: 800, height: 240 }),
  1,
  "measured gallery height should cap the page before thumbnails become unreadably small",
);

assert.strictEqual(
  resolveGalleryKind("mixed", [
    { width: 600, height: 900 },
    { width: 600, height: 900 },
    { width: 1200, height: 675 },
  ]),
  "vertical",
  "mixed galleries should use the vertical layout when portraits are the majority",
);
assert.strictEqual(
  resolveGalleryKind("mixed", [
    { width: 600, height: 900 },
    { width: 1200, height: 675 },
    { width: 1200, height: 675 },
  ]),
  "horizontal",
  "mixed galleries should otherwise use the horizontal layout",
);
assert.strictEqual(resolveGalleryKind("square", []), "square");

const shortLayout = getGalleryLayout("horizontal", 844, 390, {
  width: 640,
  height: 220,
});
assert.strictEqual(shortLayout.pageSize, 1);
assert.ok(shortLayout.itemWidth <= 640, "layout width should fit the measured gallery");
assert.ok(shortLayout.itemHeight <= 220, "layout height should fit the measured gallery");
assert.strictEqual(shortLayout.columns, 1);

const measuredRatioLayout = getGalleryLayout("vertical", 390, 844, {
  width: 317,
  height: 465,
  aspectRatio: 3 / 4,
});
assert.strictEqual(
  measuredRatioLayout.aspectRatio,
  3 / 4,
  "mixed galleries should be able to fit their measured artwork ratio instead of a fixed 9:16 frame",
);
assert.strictEqual(measuredRatioLayout.itemWidth, 317);
assert.strictEqual(measuredRatioLayout.itemHeight, 422);

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
