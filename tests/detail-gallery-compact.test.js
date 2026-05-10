const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const normalize = (content) => content.replace(/\r\n/g, "\n");
const css = normalize(fs.readFileSync(path.join(root, "styles.css"), "utf8"));
const js = normalize(fs.readFileSync(path.join(root, "website-design.js"), "utf8"));

assert.ok(
  css.includes(".detail-shot-label {\n  position: absolute;\n  width: 1px;\n  height: 1px;"),
  "thumbnail labels should be visually hidden to remove per-image titles",
);
assert.ok(
  css.includes(".detail-gallery {\n  position: relative;\n  z-index: 1;\n  display: grid;\n  gap: 22px;"),
  "gallery item gap should be tighter",
);
assert.ok(
  css.includes(".project-gallery-section {\n  min-height: auto;\n  padding-top: 96px;"),
  "gallery sections should start closer together",
);
assert.ok(css.includes(".detail-shot::before {\n  content: none;"), "old title-space panel backing should be removed");
assert.ok(
  css.includes(".detail-board .section-ribbon {\n  min-height: 88px;\n  margin-bottom: 34px;"),
  "detail gallery ribbon should sit closer to the thumbnails",
);
assert.ok(js.includes(".detail-shot-label"), "hidden labels should still power lightbox captions");
