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
  ["party-all", "小恐龙派对", 40],
  ["ulala-all", "不休的乌拉拉", 24],
  ["lili-tangquan", "狸狸汤泉", 20],
];

assert.ok(html.includes("社群视觉 / 活动运营"), "NO.3 overview should retain concise project scope metadata");
assert.ok(html.includes('class="overview-entry-strip"'), "NO.3 overview should expose the three verified gallery groups");
assert.ok(html.includes("data-community-gallery"), "NO.3 detail should render galleries from named hooks");
assert.ok(html.includes("#party-all"), "NO.3 nav should link to the party section");
assert.ok(html.includes("#ulala-all"), "NO.3 nav should link to the ULaLa section");
assert.ok(html.includes("#lili-tangquan"), "NO.3 nav should link to the lili tangquan section");
assert.ok(js.includes("sourceGroups"), "NO.3 detail script should render thumbnails from a source manifest");
assert.ok(js.includes(".detail-shot-label"), "generated NO.3 thumbnails should keep the lightbox caption hook");
assert.ok(js.includes('loading="lazy" decoding="async"'), "generated NO.3 thumbnails should be lazy and async decoded");
assert.ok(js.includes("portfolio:stagechange"), "NO.3 galleries should render when their hidden stage panel becomes active");
assert.ok(!js.includes("IntersectionObserver"), "NO.3 gallery rendering should not depend on hidden-panel intersection");
assert.ok(js.includes("DetailStage?.registerGallery(group.key"), "NO.3 galleries should register after batched rendering");
assert.ok(js.includes('kind: "mixed"'), "NO.3 galleries should derive layout from their image orientations");
assert.ok(js.includes("RENDER_BATCH_SIZE"), "NO.3 galleries should render thumbnails in batches");

groups.forEach(([folder, label, count]) => {
  assert.ok(html.includes(`data-community-gallery="${folder}"`), `${label} should have a gallery hook`);
  assert.ok(js.includes(`key: "${folder}"`), `${label} should be listed in the JS manifest`);

  const images = listImages(path.join(slicedRoot, folder));
  assert.strictEqual(images.length, count, `${label} should produce ${count} sliced images`);
  images.forEach((name) => {
    if (!name.endsWith(".png")) {
      return;
    }

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
