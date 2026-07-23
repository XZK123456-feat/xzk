const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const pages = [
  "index.html",
  "website-design.html",
  "ua-creatives.html",
  "community-creatives.html",
  "video-design.html",
];

pages.forEach((page) => {
  const html = fs.readFileSync(path.join(root, page), "utf8");

  assert.ok(
    html.includes('href="click-stage.css?v=click-stage-1"'),
    `${page} should load the click-stage stylesheet`,
  );
  assert.ok(
    html.includes('src="click-stage.js?v=click-stage-1"'),
    `${page} should load the click-stage script`,
  );
  assert.ok(html.includes('class="stage-wipe"'), `${page} should include the shared stage wipe`);
  assert.ok(!html.includes('class="scroll-progress"'), `${page} should remove the scroll progress markup`);
  assert.ok(!html.includes('class="back-to-top"'), `${page} should remove the back-to-top markup`);
});

const cssPath = path.join(root, "click-stage.css");
assert.ok(fs.existsSync(cssPath), "click-stage.css should exist");

const css = fs.readFileSync(cssPath, "utf8");
assert.ok(css.includes("body.stage-ready"), "click-stage.css should define the enhanced stage state");
assert.ok(css.includes(".stage-wipe.is-running"), "click-stage.css should define the running wipe state");
assert.ok(
  css.includes("@media (prefers-reduced-motion: reduce)"),
  "click-stage.css should disable wipe animation for reduced motion",
);

console.log(`click stage structure checks passed (${pages.length} pages)`);
