const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const pages = [
  "index.html",
  "website-design.html",
  "ua-creatives.html",
  "community-creatives.html",
  "video-design.html",
];
const productionSources = [
  ...pages,
  "styles.css",
  "script.js",
  "website-design.js",
  "ua-creatives.js",
  "community-creatives.js",
];

const portfolioSubset = path.join(root, "assets", "fonts", "ZHYuwanPortfolio-subset.woff2");
const resumeSubset = path.join(root, "assets", "fonts", "AlibabaPuHuiTi-Bold-subset.woff2");
assert.ok(fs.existsSync(portfolioSubset), "portfolio subset font should exist");
assert.ok(fs.existsSync(resumeSubset), "resume subset font should exist");
assert.ok(fs.statSync(portfolioSubset).size < 100 * 1024, "portfolio subset font should stay below 100KB");
assert.ok(fs.statSync(resumeSubset).size < 150 * 1024, "resume subset font should stay below 150KB");

const css = read("styles.css");
assert.ok(css.includes('url("assets/fonts/ZHYuwanPortfolio-subset.woff2")'), "CSS should use the portfolio subset");
assert.ok(css.includes('url("assets/fonts/AlibabaPuHuiTi-Bold-subset.woff2")'), "CSS should use the resume subset");
assert.ok(!css.includes("ZHYuwanPortfolio.ttf"), "production CSS should not retain the TTF fallback");
assert.ok(!css.includes("AlibabaPuHuiTi-3-85-Bold.woff2"), "production CSS should not request the 5MB resume font");

pages.forEach((page) => {
  const html = read(page);
  assert.ok(html.includes('href="assets/fonts/ZHYuwanPortfolio-subset.woff2"'), `${page} should preload the subset font`);
  assert.ok(html.includes('styles.css?v=stability-1'), `${page} should cache-bust optimized styles`);
  assert.ok(html.includes('script.js?v=stability-1'), `${page} should cache-bust optimized scripts`);
});

const sourceText = productionSources.map(read).join("\n");
const legacyMediaRefs = sourceText.match(/assets\/[^"'`)<>]+\.(?:png|jpe?g)(?![-.\w])/gi) || [];
assert.deepEqual(legacyMediaRefs, [], "production pages and manifests should deliver WebP instead of PNG/JPEG");

const webpRefs = [...new Set(sourceText.match(/assets\/[^"'`)<>]+?\.webp/gi) || [])]
  .filter((reference) => !reference.includes("${"));
assert.ok(webpRefs.length >= 400, "optimized production sources should reference the complete WebP portfolio");
webpRefs.forEach((reference) => {
  const decoded = decodeURIComponent(reference);
  assert.ok(fs.existsSync(path.join(root, decoded)), `optimized media should exist: ${decoded}`);
});

[["九图5", 18, "-delivery.webp"], ["九图6", 1, "-png-delivery.webp"], ["九图7", 1, "-png-delivery.webp"]]
  .forEach(([prefix, count, suffix]) => {
    for (let index = 1; index <= count; index += 1) {
      const padded = String(index).padStart(3, "0");
      const base = path.join(root, "assets", "ua-creatives", "sliced", "nine-grid");
      assert.ok(fs.existsSync(path.join(base, `${prefix}-${padded}${suffix}`)), `dynamic full image should exist: ${prefix}-${padded}`);
      assert.ok(fs.existsSync(path.join(base, `${prefix}-${padded}${suffix.replace(".webp", "-480.webp")}`)), `dynamic mobile full image should exist: ${prefix}-${padded}`);
      assert.ok(fs.existsSync(path.join(base, "thumbnails", `${prefix}-${padded}-thumb-delivery.webp`)), `dynamic thumbnail should exist: ${prefix}-${padded}`);
    }
  });

const responsiveSources = [read("website-design.html"), read("video-design.html"), read("ua-creatives.js"), read("community-creatives.js")].join("\n");
assert.ok(responsiveSources.includes("srcset"), "static and generated thumbnails should expose responsive WebP candidates");
assert.ok(responsiveSources.includes("sizes="), "responsive thumbnails should tell the browser their display size");
assert.ok(responsiveSources.includes("width="), "thumbnail markup should reserve intrinsic width");
assert.ok(responsiveSources.includes("height="), "thumbnail markup should reserve intrinsic height");
assert.ok(read("website-design.html").includes("data-full-small="), "static previews should expose a mobile lightbox candidate");
["website-design.js", "ua-creatives.js", "community-creatives.js"].forEach((file) => {
  assert.ok(read(file).includes("lightboxImage.srcset"), `${file} should select a responsive lightbox image`);
});
assert.ok(read("ua-creatives.js").includes("fullSmallSrc"), "dynamic UA previews should expose mobile full-image candidates");
assert.ok(read("community-creatives.js").includes("fullSmallSrc"), "dynamic community previews should expose mobile full-image candidates");

const videoFiles = [
  path.join(root, "assets", "video", "买量视频混剪.mp4"),
  ...Array.from({ length: 6 }, (_, index) => path.join(
    root,
    "assets",
    "video",
    "community",
    `community-video-${String(index + 1).padStart(2, "0")}.mp4`,
  )),
];
videoFiles.forEach((file) => {
  const buffer = fs.readFileSync(file);
  const name = path.basename(file);
  assert.ok(buffer.length <= 8.2 * 1024 * 1024, `${name} should stay within the 8MB delivery budget`);
  const moov = buffer.indexOf(Buffer.from("moov"));
  const mdat = buffer.indexOf(Buffer.from("mdat"));
  assert.ok(moov >= 0 && mdat >= 0 && moov < mdat, `${name} should place moov before mdat for faststart`);
});

const script = read("script.js");
const swPath = path.join(root, "sw.js");
assert.ok(fs.existsSync(swPath), "service worker should exist");
assert.ok(script.includes('navigator.serviceWorker.register("sw.js?v=stability-1")'), "shared script should register the versioned service worker");
const serviceWorker = read("sw.js");
assert.ok(serviceWorker.includes("staleWhileRevalidate"), "service worker should cache repeat static requests");
assert.ok(serviceWorker.includes("networkFirst"), "service worker should keep HTML network-first");
assert.ok(serviceWorker.includes('request.destination === "video"'), "service worker should explicitly bypass video requests");
assert.ok(serviceWorker.includes("ZHYuwanPortfolio-subset.woff2"), "service worker should precache the critical font");

console.log(`performance asset checks passed (${webpRefs.length} WebP references, ${videoFiles.length} videos)`);
