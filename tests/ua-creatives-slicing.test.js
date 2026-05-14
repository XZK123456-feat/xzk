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

assert.ok(html.includes("横图60 · 竖图36 · 九图162 = 共258张"), "UA detail summary should count every individual creative");
assert.ok(html.includes('data-ua-gallery="horizontal"'), "horizontal gallery should be generated from a named hook");
assert.ok(html.includes('data-ua-gallery="vertical"'), "vertical gallery should be generated from a named hook");
assert.ok(html.includes('data-ua-gallery="nine-grid"'), "nine-grid gallery should be generated from a named hook");

assert.ok(js.includes("sourceGroups"), "UA detail script should render thumbnails from a source manifest");
assert.ok(js.includes("横图1") && js.includes("count: 20"), "horizontal source sheets should be split into individual tiles");
assert.ok(js.includes("竖图4") && js.includes("count: 36"), "vertical source sheet should be split into individual tiles");
assert.ok(js.includes("九图5") && js.includes("count: 162"), "nine-grid source sheet should be split into individual tiles");
assert.ok(js.includes(".detail-shot-label"), "generated thumbnails should keep the lightbox caption hook");

const horizontal = listPngs(path.join(slicedRoot, "horizontal"));
const vertical = listPngs(path.join(slicedRoot, "vertical"));
const nineGrid = listPngs(path.join(slicedRoot, "nine-grid"));

assert.strictEqual(horizontal.length, 60, "horizontal source sheets should produce 60 single creatives");
assert.strictEqual(vertical.length, 36, "vertical source sheet should produce 36 single creatives");
assert.strictEqual(nineGrid.length, 162, "nine-grid source sheet should produce 162 single creatives");

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
  assert.ok(width >= 270 && width <= 320, `${name} should be one nine-grid tile wide, got ${width}`);
  assert.ok(height >= 270 && height <= 320, `${name} should be one nine-grid tile tall, got ${height}`);
});

console.log("ua creatives slicing checks passed");
