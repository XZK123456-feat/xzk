const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const normalize = (content) => content.replace(/\r\n/g, "\n");
const html = normalize(fs.readFileSync(path.join(root, "website-design.html"), "utf8"));
const css = normalize(fs.readFileSync(path.join(root, "styles.css"), "utf8"));
const js = normalize(fs.readFileSync(path.join(root, "website-design.js"), "utf8"));

assert.ok(html.includes("detail-shot-label"), "thumbnail labels should use a dedicated status label hook");
assert.ok(html.includes("detail-shot-frame"), "thumbnails should wrap screenshots in a dark game-panel frame");
assert.ok(html.includes("detail-shot-glass"), "screenshots should sit inside an inset viewport layer");
assert.ok(html.includes("detail-shot-ui"), "thumbnails should include decorative UI controls inspired by the reference");
assert.ok(css.includes(".detail-shot-frame"), "frame layer should be styled");
assert.ok(css.includes(".detail-shot-glass"), "viewport layer should be styled");
assert.ok(css.includes(".detail-shot-ui"), "decorative UI controls should be styled");
assert.ok(css.includes(".detail-shot:focus-visible"), "keyboard focus should get the same polished affordance as hover");
assert.ok(css.includes(".detail-shot:active"), "thumbnail press feedback should be styled");
assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"), "thumbnail motion should respect reduced motion");
assert.ok(css.includes("@keyframes detailScanline"), "thumbnail cards should include a subtle scanline/glint motion");
assert.ok(js.includes(".detail-shot-label"), "lightbox captions should read the dedicated label instead of the first span");
