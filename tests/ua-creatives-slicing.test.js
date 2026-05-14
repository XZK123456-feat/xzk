const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "ua-creatives.html"), "utf8").replace(/\r\n/g, "\n");
const js = fs.readFileSync(path.join(root, "ua-creatives.js"), "utf8").replace(/\r\n/g, "\n");
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

assert.ok(html.includes("横图80 · 竖图54 · 九图20组 = 共154个缩略图"), "UA detail summary should count nine-grid creatives by 3x3 groups");
assert.ok(html.includes('data-ua-gallery="horizontal"'), "horizontal gallery should be generated from a named hook");
assert.ok(html.includes('data-ua-gallery="vertical"'), "vertical gallery should be generated from a named hook");
assert.ok(html.includes('data-ua-gallery="nine-grid"'), "nine-grid gallery should be generated from a named hook");

assert.ok(js.includes("sourceGroups"), "UA detail script should render thumbnails from a source manifest");
assert.ok(js.includes("横图1") && js.includes("count: 20"), "horizontal source sheets should be split into individual tiles");
assert.ok(js.includes("横图4") && js.includes('ext: "jpg"'), "horizontal jpg source sheet should stay in the manifest");
assert.ok(js.includes("竖图4") && js.includes("count: 36"), "vertical png source sheet should be split into individual tiles");
assert.ok(js.includes("竖图5") && js.includes('ext: "jpg"'), "vertical jpg source sheet should stay in the manifest");
assert.ok(js.includes("九图5") && js.includes("count: 18"), "nine-grid source sheet should be split into grouped 3x3 thumbnails");
assert.ok(js.includes("九图6") && js.includes("count: 1"), "extra nine-grid source should render as one grouped thumbnail");
assert.ok(js.includes("九图7") && js.includes("count: 1"), "extra nine-grid source should render as one grouped thumbnail");
assert.ok(js.includes(".detail-shot-label"), "generated thumbnails should keep the lightbox caption hook");

const horizontal = listPngs(path.join(slicedRoot, "horizontal"));
const vertical = listPngs(path.join(slicedRoot, "vertical"));
const nineGrid = listPngs(path.join(slicedRoot, "nine-grid"));
const horizontalAll = listImages(path.join(slicedRoot, "horizontal"));
const verticalAll = listImages(path.join(slicedRoot, "vertical"));

assert.strictEqual(horizontalAll.length, 80, "horizontal source sheets should produce 80 single creatives");
assert.strictEqual(verticalAll.length, 54, "vertical source sheets should produce 54 single creatives");
assert.strictEqual(horizontal.length, 60, "horizontal png source sheets should produce 60 single creatives");
assert.strictEqual(vertical.length, 36, "vertical png source sheet should produce 36 single creatives");
assert.strictEqual(nineGrid.length, 20, "nine-grid source sheets should produce 20 grouped 3x3 creatives");

horizontal.forEach((name) => {
  const { width, height } = readPngSize(path.join(slicedRoot, "horizontal", name));
  assert.ok(width >= 960 && width <= 1030, `${name} should be one horizontal tile wide, got ${width}`);
  assert.ok(height >= 540 && height <= 590, `${name} should be one horizontal tile tall, got ${height}`);
});

vertical.forEach((name) => {
  const { width, height } = readPngSize(path.join(slicedRoot, "vertical", name));
  assert.ok(width >= 400 && width <= 450, `${name} should be one vertical tile wide, got ${width}`);
  assert.ok(height >= 730 && height <= 770, `${name} should be one vertical tile tall, got ${height}`);
});

nineGrid.forEach((name) => {
  const { width, height } = readPngSize(path.join(slicedRoot, "nine-grid", name));
  assert.ok(width >= 850, `${name} should be one grouped nine-grid thumbnail wide, got ${width}`);
  assert.ok(height >= 850, `${name} should be one grouped nine-grid thumbnail tall, got ${height}`);
});

console.log("ua creatives slicing checks passed");
