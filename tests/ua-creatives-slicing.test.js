const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "ua-creatives.html"), "utf8").replace(/\r\n/g, "\n");
const js = fs.readFileSync(path.join(root, "ua-creatives.js"), "utf8").replace(/\r\n/g, "\n");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8").replace(/\r\n/g, "\n");
const slicedRoot = path.join(root, "assets", "ua-creatives", "sliced");

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  assert.strictEqual(buffer.toString("ascii", 1, 4), "PNG", `${filePath} should be a PNG`);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function listPngs(folder) {
  return fs.readdirSync(folder).filter((name) => name.endsWith(".png")).sort();
}

function listImages(folder) {
  return fs.readdirSync(folder).filter((name) => /\.(png|jpg)$/i.test(name)).sort();
}

assert.ok(html.includes("横图90 · 竖图54 · 九图20组 = 共164个缩略图"), "UA detail summary should count nine-grid creatives by 3x3 groups");
assert.ok(html.includes('data-ua-gallery="horizontal"'), "horizontal gallery should be generated from a named hook");
assert.ok(html.includes('data-ua-gallery="vertical"'), "vertical gallery should be generated from a named hook");
assert.ok(html.includes('data-ua-gallery="nine-grid"'), "nine-grid gallery should be generated from a named hook");

assert.ok(js.includes("sourceGroups"), "UA detail script should render thumbnails from a source manifest");
assert.ok(js.includes("横图 090"), "horizontal manifest should expose 90 thumbnail entries");
assert.ok(js.includes("竖图 054"), "vertical manifest should expose 54 thumbnail entries");
assert.ok(js.includes("九图5") && js.includes("count: 18"), "nine-grid source sheet should be split into grouped 3x3 thumbnails");
assert.ok(js.includes("九图6") && js.includes("count: 1"), "extra nine-grid source should render as one grouped thumbnail");
assert.ok(js.includes("九图7") && js.includes("count: 1"), "extra nine-grid source should render as one grouped thumbnail");
assert.ok(js.includes(".detail-shot-label"), "generated thumbnails should keep the lightbox caption hook");
assert.ok(js.includes('loading="lazy" decoding="async"'), "generated thumbnails should be lazy and async decoded");
assert.ok(js.includes("IntersectionObserver"), "UA galleries should render only when their section is near the viewport");
assert.ok(js.includes("RENDER_BATCH_SIZE"), "UA galleries should render thumbnails in batches");
assert.ok(
  css.includes(".ua-horizontal-gallery {\n  width: 100%;\n  grid-template-columns: repeat(auto-fit, minmax(clamp(190px, 17vw, 270px), 1fr));"),
  "horizontal UA thumbnails should use larger responsive PC columns",
);
assert.ok(
  css.includes(".ua-horizontal-gallery .detail-shot-frame {\n  padding: 5px;\n  border-width: 2px;"),
  "horizontal UA thumbnails should use a slimmer frame so images read larger",
);
assert.ok(
  css.includes(".ua-horizontal-gallery .pc-shot img {\n  aspect-ratio: 16 / 9;"),
  "horizontal UA thumbnails should keep a broad 16:9 viewport",
);

const horizontal = listPngs(path.join(slicedRoot, "horizontal"));
const vertical = listPngs(path.join(slicedRoot, "vertical"));
const nineGrid = listPngs(path.join(slicedRoot, "nine-grid"));
const horizontalAll = listImages(path.join(slicedRoot, "horizontal"));
const verticalAll = listImages(path.join(slicedRoot, "vertical"));

assert.strictEqual(horizontalAll.length, 90, "horizontal source sheets should produce 90 single creatives");
assert.strictEqual(verticalAll.length, 54, "vertical source sheets should produce 54 single creatives");
assert.strictEqual(horizontal.length, 0, "horizontal thumbnails should now reference compressed jpg creatives");
assert.strictEqual(vertical.length, 0, "vertical thumbnails should now reference compressed jpg creatives");
assert.strictEqual(nineGrid.length, 20, "nine-grid source sheets should produce 20 grouped 3x3 creatives");

nineGrid.forEach((name) => {
  const { width, height } = readPngSize(path.join(slicedRoot, "nine-grid", name));
  assert.ok(width >= 850, `${name} should be one grouped nine-grid thumbnail wide, got ${width}`);
  assert.ok(height >= 850, `${name} should be one grouped nine-grid thumbnail tall, got ${height}`);
});

console.log("ua creatives slicing checks passed");
