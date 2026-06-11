const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const normalize = (content) => content.replace(/\r\n/g, "\n");
const css = normalize(fs.readFileSync(path.join(root, "styles.css"), "utf8"));
const uaJs = normalize(fs.readFileSync(path.join(root, "ua-creatives.js"), "utf8"));
const communityJs = normalize(fs.readFileSync(path.join(root, "community-creatives.js"), "utf8"));
const websiteHtml = normalize(fs.readFileSync(path.join(root, "website-design.html"), "utf8"));

assert.ok(css.includes("@media (max-width: 620px)"), "mobile-specific layout overrides should exist");
assert.ok(css.includes(".detail-ticket {\n    justify-self: center;"), "mobile detail tickets should stay inside the viewport");
assert.ok(css.includes("width: calc(100% - 8px);"), "mobile detail tickets should reserve room for their comic shadow");
assert.ok(css.includes("content-visibility: auto;"), "offscreen detail sections should avoid eager rendering work");
assert.ok(css.includes(".detail-gallery.is-gallery-loading::after"), "lazy galleries should show a lightweight loading state");
assert.ok(css.includes(".website-lightbox .lightbox-image-row {\n    display: grid;"), "mobile lightbox should stop using a horizontal arrow/image row");
assert.ok(css.includes(".lightbox-image-row > img {\n    max-width: 100%;"), "mobile lightbox image should use the full available width");
assert.ok(css.includes(".website-lightbox .lightbox-arrow {\n    position: fixed;"), "mobile lightbox arrows should float instead of shrinking the image");
assert.ok(css.includes("min-height: 44px;"), "mobile lightbox arrows should override global button minimum height");
assert.ok(css.includes("padding: 0;"), "mobile lightbox controls should not inherit wide button padding");
assert.ok(css.includes(".lightbox-strip {\n    max-width: calc(100vw - 24px);"), "mobile lightbox thumbnail strip should fit within the viewport");
assert.ok(css.includes(".lightbox-meta {\n    max-width: calc(100vw - 24px);"), "mobile lightbox metadata should fit within the viewport");
assert.ok(css.includes(".website-lightbox .lightbox-close {\n    right: 12px;"), "mobile lightbox close button should stay inside the viewport");

assert.ok(uaJs.includes("IntersectionObserver"), "NO.2 should defer gallery rendering until near viewport");
assert.ok(uaJs.includes("RENDER_BATCH_SIZE"), "NO.2 should batch large gallery rendering");
assert.ok(uaJs.includes('loading="lazy" decoding="async"'), "NO.2 generated thumbnails should use lazy loading");

assert.ok(communityJs.includes("IntersectionObserver"), "NO.3 should defer gallery rendering until near viewport");
assert.ok(communityJs.includes("RENDER_BATCH_SIZE"), "NO.3 should batch large gallery rendering");
assert.ok(communityJs.includes('loading="lazy" decoding="async"'), "NO.3 generated thumbnails should use lazy loading");

assert.ok(
  (websiteHtml.match(/loading="lazy" decoding="async"/g) || []).length >= 20,
  "NO.1 static thumbnails should also be lazy and async decoded",
);

console.log("mobile detail performance checks passed");
