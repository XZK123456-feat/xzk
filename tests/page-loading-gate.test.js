const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const pages = [
  "index.html",
  "website-design.html",
  "ua-creatives.html",
  "community-creatives.html",
  "video-design.html",
];
const detailPages = new Set(pages.slice(1));
const read = (file) => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const css = read("styles.css");
const script = read("script.js");
const loaderBlocks = [];

for (const page of pages) {
  const html = read(page);
  const htmlTag = html.match(/<html\b[^>]*>/)?.[0] || "";
  const bodyTag = html.match(/<body\b[^>]*>/)?.[0] || "";
  const expectedBodyClass = detailPages.has(page)
    ? 'class="detail-page is-page-loading"'
    : 'class="is-page-loading"';
  const criticalStyleIndex = html.indexOf("<style data-loader-critical>");
  const stylesheetIndex = html.indexOf('<link rel="stylesheet"');

  assert.ok(htmlTag.includes('class="is-page-loading"'), `${page} html should start in the loading state`);
  assert.ok(bodyTag.includes(expectedBodyClass), `${page} body should preserve its page class and start loading`);
  assert.ok(criticalStyleIndex >= 0, `${page} should include marked critical loader CSS`);
  assert.ok(criticalStyleIndex < stylesheetIndex, `${page} critical loader CSS should precede the external stylesheet`);
  assert.match(html, /<style data-loader-critical>[\s\S]*?overflow:\s*hidden;[\s\S]*?position:\s*fixed;[\s\S]*?z-index:\s*10000;[\s\S]*?background:\s*#111;[\s\S]*?<\/style>/, `${page} critical CSS should lock scrolling behind a dark fixed cover`);

  const firstBodyChild = html.slice(html.indexOf(bodyTag) + bodyTag.length).match(/^\s*(<[^>]+>)/)?.[1];
  assert.equal(firstBodyChild, '<div class="page-loader" role="status" aria-label="页面正在加载">', `${page} loader should be the first body child`);
  assert.ok(html.indexOf('class="page-loader"') < html.indexOf('class="page-shell"'), `${page} loader should precede visible page content`);
  assert.ok(html.includes('data-loading-percent>08%</span>'), `${page} should expose the initial visual percentage`);
  assert.ok(html.includes('<script src="script.js"></script>'), `${page} should load the shared controller`);

  const loaderBlock = html.match(/<div class="page-loader"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)?.[0];
  assert.ok(loaderBlock, `${page} should include the complete loader markup`);
  loaderBlocks.push(loaderBlock.replace(/\s+/g, " "));

  assert.doesNotMatch(html, /<link\b[^>]*rel="preload"[^>]*as="(?:image|video)"/i, `${page} should not preload galleries or videos`);
}

loaderBlocks.slice(1).forEach((block) => {
  assert.equal(block, loaderBlocks[0], "all pages should use identical loader markup");
});

[
  [".page-loader", "fixed loader"],
  ["position: fixed;", "fixed positioning"],
  ["inset: 0;", "full-screen inset"],
  ["z-index: 10000;", "loader stacking"],
  ["background: #111;", "dark loader background"],
  ["color: #fff;", "white loader text"],
  ["width: min(320px,", "stable inner width"],
  ["font-size: 24px;", "desktop brand size"],
  ["height: 5px;", "progress track height"],
  ["transform: scaleX(0.08);", "initial progress scale"],
  ["font-size: 11px;", "loader metadata size"],
  ["transition: opacity 400ms", "exit fade"],
  ['.page-loader[aria-hidden="true"]', "dismissed loader state"],
  ["@media (max-width: 620px)", "mobile breakpoint"],
  ["font-size: 21px;", "mobile brand size"],
  ["@media (prefers-reduced-motion: reduce)", "reduced-motion query"],
].forEach(([token, label]) => assert.ok(css.includes(token), `styles should include ${label}`));

const brandRule = css.match(/\.page-loader__brand\s*{([\s\S]*?)}/)?.[1] || "";
assert.ok(brandRule.includes("font-family:"), "loader brand should define a local/system font stack");
assert.ok(!brandRule.includes("ZHYuwanPortfolio"), "loader brand should not wait for the portfolio font");
assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.page-loader__inner\s*{[\s\S]*?width:[^;}]+;[\s\S]*?\.page-loader__brand\s*{[\s\S]*?font-size:\s*21px;/, "mobile loader should reduce inner width and brand size");
assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.page-loader[\s\S]*?transition:\s*none;[\s\S]*?\.page-loader__fill[\s\S]*?transition:\s*none;/, "reduced motion should disable loader exit and fill transitions");

[
  "const PAGE_LOADER_MIN_MS = 350",
  "const PAGE_LOADER_TIMEOUT_MS = 5000",
  "function waitForStylesheets",
  "document.fonts.ready",
  "function waitForFirstViewImages",
  'image.loading === "lazy"',
  "window.innerHeight * 1.25",
  'image.addEventListener("load"',
  'image.addEventListener("error"',
  "Promise.allSettled",
  "Promise.race",
  "Math.max(currentProgress",
  'loader.setAttribute("aria-hidden", "true")',
  'document.documentElement.classList.remove("is-page-loading")',
  'document.body.classList.remove("is-page-loading")',
  'window.addEventListener("pageshow"',
  "event.persisted",
  "clearTimeout",
].forEach((token) => assert.ok(script.includes(token), `loader controller should include ${token}`));

const loaderController = script.slice(0, script.indexOf('const navLinks ='));
assert.ok(loaderController.includes("function initPageLoader"), "loader controller should precede unrelated interactions");
assert.ok(loaderController.includes("currentProgress"), "loader initialization should own progress state");
assert.ok(loaderController.includes("PAGE_LOADER_MIN_MS"), "loader initialization should enforce its minimum duration");
assert.ok(loaderController.includes("PAGE_LOADER_TIMEOUT_MS"), "loader initialization should enforce its hard timeout");
assert.match(script, /document\.fonts\s*\?[\s\S]*?document\.fonts\.ready\.catch\([\s\S]*?:\s*Promise\.resolve\(\)/, "font readiness should have failure and unsupported-browser fallbacks");

for (const page of ["website-design.html", "video-design.html"]) {
  assert.ok(read(page).includes('loading="lazy"'), `${page} should preserve lazy gallery media`);
}
assert.ok(read("ua-creatives.js").includes('loading="lazy"'), "UA generated galleries should preserve lazy images");
assert.ok(read("community-creatives.js").includes('loading="lazy"'), "community generated galleries should preserve lazy images");

const videoHtml = read("video-design.html");
const videoTags = videoHtml.match(/<video\b[\s\S]*?<\/video>/g) || [];
assert.ok(videoTags.length > 0, "video page should retain video elements");
videoTags.forEach((video, index) => {
  assert.ok(video.includes('preload="none"'), `video ${index + 1} should preserve preload=none`);
});

console.log(`page loading gate checks passed (${pages.length} pages, ${videoTags.length} videos)`);
