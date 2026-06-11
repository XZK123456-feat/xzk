const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "index.html");
const websiteDetailPath = path.join(root, "website-design.html");
const cssPath = path.join(root, "styles.css");
const jsPath = path.join(root, "script.js");
const detailJsPath = path.join(root, "website-design.js");
const normalize = (content) => content.replace(/\r\n/g, "\n");

assert.ok(fs.existsSync(htmlPath), "index.html should exist");
assert.ok(fs.existsSync(websiteDetailPath), "website-design.html should exist");
assert.ok(fs.existsSync(cssPath), "styles.css should exist");
assert.ok(fs.existsSync(jsPath), "script.js should exist");
assert.ok(fs.existsSync(detailJsPath), "website-design.js should exist");

const html = normalize(fs.readFileSync(htmlPath, "utf8"));
const websiteDetailHtml = normalize(fs.readFileSync(websiteDetailPath, "utf8"));
const css = normalize(fs.readFileSync(cssPath, "utf8"));
const js = normalize(fs.readFileSync(jsPath, "utf8"));
const detailJs = normalize(fs.readFileSync(detailJsPath, "utf8"));

[
  "ZK.PORTFOLIO",
  "肖子康作品集",
  "AI工具参与",
  "官网视觉设计",
  "买量图片设计",
  "运营图片设计",
  "项目素材产出概览",
  "分阶段全渠道广告素材投放数据",
].forEach((text) => {
  assert.ok(html.includes(text), `page should include ${text}`);
});

["#home", "#contents", "#data"].forEach((href) => {
  assert.ok(html.includes(`href="${href}"`), `nav should link to ${href}`);
});

["halftone", "ticket", "comic-card", "fixed-nav"].forEach((className) => {
  assert.ok(html.includes(className) || css.includes(className), `should define ${className}`);
});

assert.ok(css.includes("position: sticky") || css.includes("position: fixed"), "navigation should stay visible while scrolling");
assert.ok(css.includes("scroll-behavior: smooth"), "page should scroll smoothly");
assert.ok(css.includes("@font-face"), "custom font should be declared");
assert.ok(css.includes("ZHYuwanPortfolio"), "custom font should be used");
assert.ok(js.includes("IntersectionObserver"), "script should update active nav while scrolling");
assert.ok(html.includes('data-count-target="604.25"'), "ad spend numbers should expose count-up targets");
assert.ok(html.includes('data-count-target="8.88"'), "ROI numbers should expose count-up targets");
assert.ok(html.includes('data-count-target="2160.14"'), "merged Tencent ad spend should be summed");
assert.ok(html.includes("1.42% - 1.85%"), "merged click rate should render as a range");
assert.ok(html.includes("7.96% - 8.88%"), "merged ROI should render as a range");
assert.ok(!html.includes('data-count-target="976.61"'), "second Tencent card should be merged away");
assert.ok(html.includes("overview-category image-category"), "overview should have an image category panel");
assert.ok(html.includes("overview-category video-category"), "overview should have a video category panel");
assert.ok(html.includes("图片素材"), "overview should label image assets clearly");
assert.ok(html.includes("视频素材"), "overview should label video assets clearly");
assert.ok(html.includes("asset-caption"), "non-interactive asset descriptions should not be real buttons");
assert.ok(!html.includes("<button type=\"button\">优质买量图片</button>"), "asset descriptions should not look like clickable buttons");
assert.ok(!html.includes("<button type=\"button\">买量视频素材</button>"), "video descriptions should not look like clickable buttons");
assert.ok(html.includes("primary-metric"), "main output numbers should be marked as primary metrics");
assert.ok(html.includes("Claude Code + Codex 进行 vibe coding"), "AI tools should include Claude Code and Codex vibe coding");
assert.ok(html.indexOf("Claude Code + Codex 进行 vibe coding") < html.indexOf("Nanobanana系列"), "Claude Code and Codex vibe coding should be the first AI tool");
assert.ok(html.includes("AIGC / 买量 / 运营 / 品宣"), "hero category should keep AIGC, buying, operation, and branding");
assert.ok(html.includes("2024.08 - 至今"), "hero date should start at 2024.08");
assert.ok(html.includes("hero-dashboard"), "hero should include an outcome dashboard");
assert.ok(html.includes("AIGC 买量视觉 / 运营与品宣素材设计"), "hero should state the portfolio positioning");
assert.ok(html.includes("600+ 图片素材"), "hero dashboard should preview image output");
assert.ok(html.includes("50+ 视频素材"), "hero dashboard should preview video output");
assert.ok(!html.includes("ticket-zero"), "NO.00 ticket should be removed");
assert.ok(!html.includes("NO.<strong>00"), "NO.00 label should be removed");
assert.ok(html.includes("mission-list"), "contents should use a high-density mission list");
assert.ok(html.includes("mission-card mission-website"), "website work should be a mission card");
assert.ok(html.includes('href="website-design.html"'), "website mission card should link to its detail page");
assert.ok(html.includes("进入详情"), "website mission card should expose an entry call-to-action");
assert.ok(html.includes("mission-card mission-ua"), "UA work should be a mission card");
assert.ok(html.includes("mission-card mission-community"), "community work should be a mission card");
assert.ok(html.includes("battle-board"), "data section should use a battle/result board");
assert.ok(html.includes("战绩结算面板"), "data section should frame metrics as results");
assert.ok(!html.includes("result-callout"), "data section should not include the removed conclusion callout");
assert.ok(css.includes("--black-ui-texture"), "black UI texture should be centralized");
assert.ok(css.includes("--black-ui-speckles"), "black UI texture should include speckles");
assert.ok(css.includes("--black-ui-grain"), "black UI texture should include fine grain");
assert.ok(css.includes("--pop-dot-yellow"), "UI should include yellow pop-dot decoration");
assert.ok(css.includes(".section-ribbon::before"), "black ribbon buttons should have a yellow side tab");
assert.ok(css.includes(".section-ribbon::after"), "black ribbon buttons should have pop-dot decoration");
assert.ok(css.includes("inset 0 3px 0"), "black UI should use a beveled button highlight");
assert.ok(!css.includes("--black-ui-panel-band"), "black UI should not use the old gray panel band");
assert.ok(!css.includes("118deg"), "black UI texture should not use the old obvious diagonal stripe angle");
assert.ok(css.includes(".section-ribbon,"), "section ribbons should receive black texture");
assert.ok(css.includes(".date-chip,"), "date chips should receive black texture");
assert.ok(!css.includes(".mini-label,"), "small labels should not use the heavy black texture group");
assert.ok(!css.includes(".metric-kicker,"), "metric helper labels should not use the heavy black texture group");
assert.ok(css.includes(".asset-caption"), "asset captions should have their own non-button styling");
assert.ok(css.includes("scroll-margin-top: 150px"), "hash navigation should leave room for the sticky nav");
assert.ok(!css.includes("text-shadow: 2px 2px 0 white"), "stat numbers should not use white shadow backing");
assert.ok(!css.includes("text-shadow: 3px 3px 0 white"), "ticket numbers should not use white shadow backing");
assert.ok(!css.includes("text-shadow: 4px 4px 0 white"), "burst numbers should not use white shadow backing");
assert.ok(css.includes("-webkit-text-stroke"), "important numbers should use real stroke for readability");
assert.ok(css.includes("paint-order: stroke fill"), "important numbers should render stroke behind fill");
assert.ok(css.includes("-webkit-text-stroke: 5px var(--ink)"), "large metric numbers should have a heavier stroke");
assert.ok(css.includes("-webkit-text-stroke: 4px var(--ink)"), "ticket and mobile metric numbers should have a heavier stroke");
assert.ok(css.includes("-webkit-text-stroke: 3px var(--ink)"), "data stat numbers should use a stronger readable stroke");
assert.ok(!css.includes("dd {\n  margin: 0;\n  font-size: clamp(28px, 2.5vw, 48px);\n  color: var(--yellow);\n  -webkit-text-stroke: 4px var(--ink);"), "data stat stroke should not get as heavy as large metric numbers");
assert.ok(css.includes("min-width: 410px"), "date chips should be wider for longer numeric dates");
assert.ok(css.includes("font-size: clamp(20px, 1.45vw, 27px)"), "date chips should use larger date text");
assert.ok(css.includes("background: var(--yellow);"), "channel names should use a yellow badge for readability");
assert.ok(css.includes("border: 4px solid var(--ink);"), "channel name badges should keep a clear black outline");
assert.ok(css.includes("font-size: clamp(30px, 2.25vw, 44px)"), "channel names should be larger and clearer");
assert.ok(css.includes("box-shadow: 5px 5px 0 rgba(16, 16, 16, 0.22)"), "channel name badges should have a light comic shadow");
assert.ok(css.includes("dd:first-of-type {\n  color: var(--ink);\n  font-family: \"ZHYuwanPortfolio\", \"Microsoft YaHei\", \"PingFang SC\", sans-serif;"), "channel names should use the same ZHYuwanPortfolio font as the rest of the page");
assert.ok(css.includes("letter-spacing: 0.08em;"), "channel names should add spacing between Chinese characters");
assert.ok(css.includes("-webkit-text-stroke: 0;"), "channel names should remove inherited text stroke");
assert.ok(!css.includes(".burst::before"), "metric numbers should not keep the old burst background pattern");
assert.ok(!css.includes("clip-path: polygon"), "metric numbers should not have a polygon pattern behind them");
assert.ok(!css.includes("text-shadow: 4px 4px 0 var(--yellow), 8px 8px 0 var(--ink)"), "burst numbers should not use stacked offset shadows");
assert.ok(!css.includes("text-shadow: 4px 4px 0 var(--ink), 7px 7px 0 rgba(255, 196, 0, 0.36)"), "ticket numbers should not use stacked offset shadows");
assert.ok(js.includes("animateStatNumber"), "script should animate statistic numbers");
assert.ok(js.includes("dataStatsPlayed"), "statistic numbers should animate only once");
assert.ok(js.includes("dataCardsSection"), "statistic numbers should wait for the data cards block");
assert.ok(js.includes("dataStatsObserver"), "statistic numbers should animate when data cards enter view");
assert.ok(!js.includes("pointerenter"), "statistic numbers should not animate from hover");
assert.ok(html.includes('data-reveal="hero-panel"'), "hero should opt into scroll reveal animation");
assert.ok(html.includes('data-reveal="mission-card"'), "mission cards should opt into task unlock animation");
assert.ok(html.includes('data-reveal="battle-board"'), "data board should opt into result-board animation");
assert.ok(!html.includes('data-reveal="result-callout"'), "removed conclusion callout should not keep reveal hooks");
assert.ok(css.includes("@keyframes uiTextureDrift"), "black UI texture should have subtle motion");
assert.ok(css.includes("@keyframes ticketUnlock"), "mission tickets should have unlock motion");
assert.ok(css.includes("@keyframes resultSweep"), "result panels should include a sweep highlight");
assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"), "animations should respect reduced motion");
assert.ok(css.includes(".is-revealed"), "scroll reveal should use a visible state class");
assert.ok(css.includes(".is-count-complete"), "counting numbers should get a completion pop state");
assert.ok(js.includes("revealObserver"), "script should reveal animated panels on scroll");
assert.ok(js.includes("revealItems"), "script should collect scroll reveal targets");
assert.ok(js.includes("prefers-reduced-motion"), "script should respect reduced motion preferences");

assert.ok(websiteDetailHtml.includes("NO.<strong>01</strong>"), "website detail should keep the NO.01 ticket");
assert.ok(websiteDetailHtml.includes("官网视觉设计"), "website detail should title the project");
assert.ok(websiteDetailHtml.includes("移动端"), "website detail should include a mobile section");
assert.ok(websiteDetailHtml.includes("PC端"), "website detail should include a PC section");
assert.ok(websiteDetailHtml.includes('href="index.html#contents"'), "website detail should link back to the portfolio contents");
assert.strictEqual((websiteDetailHtml.match(/data-full="assets\/website-design\/mobile\//g) || []).length, 7, "website detail should render 7 mobile images");
assert.strictEqual((websiteDetailHtml.match(/data-full="assets\/website-design\/pc\//g) || []).length, 17, "website detail should render 17 PC images");
assert.ok(websiteDetailHtml.indexOf("移动端 01") < websiteDetailHtml.indexOf("移动端 07"), "mobile images should follow the display order");
assert.ok(websiteDetailHtml.indexOf("预览PC端 01") < websiteDetailHtml.indexOf("预览PC端 17"), "PC images should follow the display order");
assert.ok(websiteDetailHtml.includes("website-lightbox"), "website detail should include an image preview lightbox");
assert.ok(detailJs.includes("detail-preview"), "website detail script should wire preview buttons");
assert.ok(detailJs.includes("Escape"), "website detail script should close previews with Escape");
assert.ok(css.includes(".mobile-shot img {\n  aspect-ratio: 9 / 16;\n  object-fit: contain;"), "mobile thumbnails should show the full image without cropping");

console.log("structure checks passed");
