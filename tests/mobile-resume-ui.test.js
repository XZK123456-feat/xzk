const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8").replace(/\r\n/g, "\n");

const baseFloatingIndex = css.indexOf(".floating-widget {\n  position: fixed;");
const mobileFloatingIndex = css.lastIndexOf("@media (max-width: 860px)");

assert.ok(baseFloatingIndex >= 0, "base floating widget styles should exist");
assert.ok(mobileFloatingIndex > baseFloatingIndex, "mobile floating widget overrides should come after base styles");

const mobileCss = css.slice(mobileFloatingIndex);

assert.ok(mobileCss.includes("transform: translateY(-50%) scale(0.58);"), "mobile floating resume widget should be proportionally smaller");
assert.ok(mobileCss.includes("transform-origin: right center;"), "mobile floating resume widget should scale from the right edge");
assert.ok(mobileCss.includes(".resume-header-card"), "mobile resume header should reserve space for the photo");
assert.ok(mobileCss.includes("padding-right: 70px;"), "mobile resume header text should avoid the top-right photo");
assert.ok(mobileCss.includes("width: 53px;"), "mobile resume photo should be about 50% of the desktop width");
assert.ok(mobileCss.includes("height: 64px;"), "mobile resume photo should be about 50% of the desktop height");
assert.ok(mobileCss.includes("right: 14px;"), "mobile resume photo should stay inside the dashed frame");
assert.ok(mobileCss.includes("top: 14px;"), "mobile resume photo should stay inside the dashed frame");

console.log("mobile resume UI checks passed");
