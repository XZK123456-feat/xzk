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
    html.includes('href="click-stage.css?v=click-stage-5"'),
    `${page} should load the click-stage stylesheet`,
  );
  assert.ok(
    html.includes('src="click-stage.js?v=click-stage-5"'),
    `${page} should load the click-stage script`,
  );
  assert.ok(html.includes('class="stage-wipe"'), `${page} should include the shared stage wipe`);
  assert.ok(!html.includes('class="scroll-progress"'), `${page} should remove the scroll progress markup`);
  assert.ok(!html.includes('class="back-to-top"'), `${page} should remove the back-to-top markup`);
});

const homepage = fs.readFileSync(path.join(root, "index.html"), "utf8");
const homeStageSource = fs.readFileSync(path.join(root, "home-stage.js"), "utf8");
const missionSelects = homepage.match(/\bdata-mission-select(?:="[^"]*")?/g) || [];
const missionPreviews = homepage.match(/<img\b[^>]*\bdata-mission-preview(?:="[^"]*")?[^>]*>/g) || [];
const dataPages = homepage.match(/\bdata-data-page="[^"]+"/g) || [];
const mainElements = homepage.match(/<main\b/g) || [];

assert.ok(homepage.includes("data-home-stage"), "index.html should include the enhanced home stage");
assert.strictEqual(missionSelects.length, 4, "index.html should include exactly four mission controls");
assert.strictEqual(missionPreviews.length, 4, "index.html should include exactly four mission previews");
missionPreviews.forEach((preview, index) => {
  const src = preview.match(/\bsrc="([^"]+)"/);
  const alt = preview.match(/\balt="([^"]+)"/);

  assert.ok(src && src[1].startsWith("assets/"), `mission preview ${index + 1} should use a real asset`);
  assert.ok(alt && alt[1].trim().length >= 4, `mission preview ${index + 1} should have useful alt text`);
});
assert.ok(
  homepage.indexOf('src="home-stage.js?v=click-stage-2"') >
    homepage.indexOf('src="click-stage.js?v=click-stage-5"'),
  "index.html should load home-stage.js after click-stage.js",
);
assert.ok(
  homepage.includes('id="data" class="data section-panel" data-stage-panel="data"'),
  "the existing data section should be the enhanced data panel",
);
assert.strictEqual(dataPages.length, 2, "index.html should include exactly two data page wrappers");
assert.ok(homepage.includes("data-home-fallback"), "index.html should mark the fallback main content");
assert.strictEqual(mainElements.length, 1, "index.html should include exactly one main element");
["目录", "数据", "简历"].forEach((label) => {
  assert.ok(
    new RegExp(`<a\\b[^>]*>\\s*${label}\\s*</a>`).test(homepage),
    `index.html should include a top navigation control for ${label}`,
  );
});
assert.match(
  homepage,
  /mission-card mission-video[\s\S]*?<h2>AI 视频设计<\/h2>/,
  "the homepage mission 04 title should use the exact spaced copy",
);
assert.ok(
  homeStageSource.includes('title: "AI 视频设计"'),
  "the mission 04 record should use the exact spaced copy",
);

const cssPath = path.join(root, "click-stage.css");
assert.ok(fs.existsSync(cssPath), "click-stage.css should exist");

const css = fs.readFileSync(cssPath, "utf8");
assert.ok(css.includes("body.stage-ready"), "click-stage.css should define the enhanced stage state");
assert.ok(css.includes(".stage-wipe.is-running"), "click-stage.css should define the running wipe state");
assert.ok(
  css.includes("@media (prefers-reduced-motion: reduce)"),
  "click-stage.css should disable wipe animation for reduced motion",
);
assert.match(
  css,
  /\.data-stage-pager button\s*{[^}]*padding:\s*0;/,
  "data pager controls should reset legacy button padding",
);
assert.match(
  css,
  /body\.stage-ready #data \.data-stage-page:not\(\[hidden\]\) \[data-reveal\]\s*{[^}]*opacity:\s*1;[^}]*transform:\s*none;[^}]*animation:\s*none;/,
  "active enhanced data pages should neutralize inherited reveal motion",
);
assert.match(
  css,
  /body\.stage-ready #data \.battle-board\s*{[^}]*border:\s*0;[^}]*background:\s*transparent;[^}]*box-shadow:\s*none;/,
  "the enhanced data board should be an unframed layout",
);
assert.ok(
  css.includes("@media (min-width: 621px) and (max-height: 520px)"),
  "the mission stage should include a compact landscape-height layout",
);
assert.ok(
  css.includes("@media (max-width: 620px) and (max-height: 700px)"),
  "the data stage should include a compact short-phone layout",
);

console.log(`click stage structure checks passed (${pages.length} pages)`);
