const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "community-creatives.html"), "utf8").replace(/\r\n/g, "\n");
const js = fs.readFileSync(path.join(root, "community-creatives.js"), "utf8").replace(/\r\n/g, "\n");
const slicedRoot = path.join(root, "assets", "community-creatives", "sliced");

function listImages(folder) {
  return fs.readdirSync(folder).filter((name) => /\.(png|jpg)$/i.test(name)).sort();
}

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  assert.strictEqual(buffer.toString("ascii", 1, 4), "PNG", `${filePath} should be a PNG`);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

const groups = [
  ["party-feature", "小恐龙派对5图", 5],
  ["party-set", "小恐龙派对套图", 20],
  ["party-misc", "小恐龙派对其他素材", 15],
  ["ulala-anniversary", "不休的乌拉拉周年庆", 2],
  ["ulala-set", "乌拉拉套图", 16],
  ["lili-tangquan", "狸狸汤泉", 25],
];

assert.ok(html.includes("运营图83张 · 小恐龙派对40张 · 乌拉拉18张 · 狸狸汤泉25张"), "NO.3 summary should reflect sliced community assets");
assert.ok(html.includes("data-community-gallery"), "NO.3 detail should render galleries from named hooks");
assert.ok(html.includes("#party-feature"), "NO.3 nav should link to the party feature section");
assert.ok(html.includes("#ulala-set"), "NO.3 nav should link to the ULaLa set section");
assert.ok(html.includes("#lili-tangquan"), "NO.3 nav should link to the lili tangquan section");
assert.ok(js.includes("sourceGroups"), "NO.3 detail script should render thumbnails from a source manifest");
assert.ok(js.includes(".detail-shot-label"), "generated NO.3 thumbnails should keep the lightbox caption hook");

groups.forEach(([folder, label, count]) => {
  assert.ok(html.includes(`data-community-gallery="${folder}"`), `${label} should have a gallery hook`);
  assert.ok(js.includes(`key: "${folder}"`), `${label} should be listed in the JS manifest`);
  assert.ok(js.includes(`count: ${count}`), `${label} should expose the expected image count`);

  const images = listImages(path.join(slicedRoot, folder));
  assert.strictEqual(images.length, count, `${label} should produce ${count} sliced images`);
  images.forEach((name) => {
    const { width, height } = readPngSize(path.join(slicedRoot, folder, name));
    assert.ok(width >= 260, `${name} should be wide enough to show as a thumbnail`);
    assert.ok(height >= 260, `${name} should be tall enough to show as a thumbnail`);
    if (folder === "lili-tangquan") {
      assert.ok(width >= 700, `${name} should not be a partial lili crop, got width ${width}`);
      assert.ok(height >= 850, `${name} should not be a partial lili crop, got height ${height}`);
    }
  });
});

console.log("community creatives slicing checks passed");
