const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const script = read("script.js");

assert.match(
  script,
  /const PAGE_LOADER_FONT_WEIGHTS = \[400,\s*700,\s*900\];/,
  "the loader should request only the three production font weights",
);
for (const fontRequest of [
  'document.fonts.load("400 1em ZHYuwanPortfolio"',
  'document.fonts.load("700 1em ZHYuwanPortfolio"',
  'document.fonts.load("900 1em ZHYuwanPortfolio"',
]) {
  assert.ok(script.includes(fontRequest), `the loader should issue ${fontRequest}`);
}
assert.ok(
  script.includes('querySelectorAll("img[data-loader-critical-image]")'),
  "the loader should read explicitly marked critical images",
);
assert.ok(
  script.includes("[data-loader-critical-image-root]"),
  "the loader should support generated critical media inside the active stage panel",
);
assert.ok(
  !script.includes("Array.from(document.images)"),
  "the loader must not scan every image to guess the current screen",
);
assert.ok(script.includes("criticalResourcesSettled"), "critical resource settlement should be explicit");
assert.ok(script.includes("Promise.allSettled"), "resource failures should settle without deadlocking");
assert.ok(script.includes("waitForStageReadyPaint"), "the final progress segment should wait for the stage paint");

const pages = [
  "index.html",
  "website-design.html",
  "ua-creatives.html",
  "community-creatives.html",
  "video-design.html",
];
for (const page of pages) {
  const html = read(page);
  assert.ok(
    html.includes("data-loader-critical-image"),
    `${page} should identify its current-stage critical media`,
  );
}

console.log("click stage loader checks passed");
