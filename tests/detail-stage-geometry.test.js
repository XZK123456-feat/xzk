const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "click-stage.js"), "utf8");
const stageCss = fs.readFileSync(path.join(root, "click-stage.css"), "utf8");
const context = { document: {}, window: {} };
vm.runInNewContext(source, context, { filename: "click-stage.js" });

const { getGalleryLayout } = context.window.PortfolioStage;
assert.strictEqual(typeof getGalleryLayout, "function", "gallery layout should be executable outside the controller");

const requiredViewports = [
  { width: 844, height: 390, stageWidth: 640, galleryHeight: 220 },
  { width: 375, height: 667, stageWidth: 327, galleryHeight: 490 },
  { width: 390, height: 844, stageWidth: 342, galleryHeight: 660 },
  { width: 360, height: 800, stageWidth: 312, galleryHeight: 616 },
  { width: 320, height: 568, stageWidth: 272, galleryHeight: 384 },
];
const kinds = ["horizontal", "vertical", "square"];

assert.match(
  stageCss,
  /@media \(max-height: 390px\) \{[\s\S]*?body\.stage-ready \[data-stage-view\] \.battle-header \{[\s\S]*?padding: 4px 7px;/,
  "short landscape stages should compact gallery headers before sizing artwork",
);

requiredViewports.forEach((viewport) => {
  kinds.forEach((kind) => {
    const layout = getGalleryLayout(kind, viewport.width, viewport.height, {
      width: viewport.stageWidth,
      height: viewport.galleryHeight,
    });

    assert.strictEqual(
      layout.pageSize,
      1,
      `${kind} should use one readable item at ${viewport.width}x${viewport.height}`,
    );
    assert.strictEqual(layout.columns, 1);
    assert.ok(
      layout.itemWidth <= viewport.stageWidth,
      `${kind} width should stay within the gallery at ${viewport.width}x${viewport.height}`,
    );
    assert.ok(
      layout.itemHeight <= viewport.galleryHeight,
      `${kind} height should stay within the gallery at ${viewport.width}x${viewport.height}`,
    );
    assert.ok(layout.itemWidth >= 120, `${kind} should remain readable at ${viewport.width}x${viewport.height}`);
  });
});

const desktopCases = [
  ["horizontal", 6],
  ["vertical", 4],
  ["square", 4],
];
desktopCases.forEach(([kind, expectedPageSize]) => {
  const layout = getGalleryLayout(kind, 1440, 900, { width: 1180, height: 620 });
  assert.strictEqual(layout.pageSize, expectedPageSize, `${kind} should retain its desktop density`);
  assert.ok(layout.itemWidth * layout.columns + layout.gap * (layout.columns - 1) <= 1180);
  assert.ok(layout.itemHeight <= 620);
});

console.log("detail stage geometry checks passed");
