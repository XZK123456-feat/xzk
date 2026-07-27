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
const detailPages = ["website-design.html", "ua-creatives.html", "community-creatives.html"];
const detailScripts = ["website-design.js", "ua-creatives.js", "community-creatives.js"];
const script = read("script.js");
const css = read("styles.css");
const serviceWorker = read("sw.js");
const releaseVersion = "stability-1";

detailScripts.forEach((file) => {
  const source = read(file);
  assert.ok(!source.includes("encodeURI(fullSmallSource)"), `${file} must not double-encode prepared image URLs`);
  assert.ok(!source.includes("encodeURI(fullSource)"), `${file} must not double-encode prepared image URLs`);
  assert.ok(source.includes("window.activateModalDialog?.(lightbox, button)"), `${file} should activate shared dialog focus handling`);
  assert.ok(source.includes("window.deactivateModalDialog?.(lightbox)"), `${file} should restore focus after closing`);
});

assert.ok(
  script.includes('lightbox.querySelectorAll(".lightbox-thumb")') && script.includes("findIndex"),
  "arrow navigation should derive its index from the active lightbox thumbnail",
);
assert.ok(script.includes("function activateModalDialog"), "shared script should activate modal semantics and focus containment");
assert.ok(script.includes("function deactivateModalDialog"), "shared script should restore the opener after closing");
assert.ok(script.includes("function trapModalFocus"), "shared script should keep Tab navigation inside an open modal");
assert.ok(script.includes('dialog.removeAttribute("inert")'), "opening a modal should restore its focusable controls");
assert.ok(script.includes('dialog.setAttribute("inert", "")'), "closing a modal should remove its controls from the tab order");

detailPages.forEach((page) => {
  const html = read(page);
  assert.match(
    html,
    /<div class="website-lightbox" role="dialog" aria-modal="true" aria-label="作品大图预览" aria-hidden="true" inert>/,
    `${page} lightbox should expose dialog semantics`,
  );
});

assert.ok(!/\b(?:dashed|dotted)\b/.test(css), "portfolio CSS should not contain residual dashed or dotted borders");
assert.match(css, /\.resume-overlay\s*{[\s\S]*?visibility:\s*hidden;/, "closed resume overlay should not receive keyboard focus");
assert.match(css, /\.resume-overlay\.is-open\s*{[\s\S]*?visibility:\s*visible;/, "open resume overlay should become visible");
assert.match(css, /\.website-lightbox\s*{[\s\S]*?visibility:\s*hidden;/, "closed lightbox should not receive keyboard focus");
assert.match(css, /\.website-lightbox\.is-open\s*{[\s\S]*?visibility:\s*visible;/, "open lightbox should become visible");

pages.forEach((page) => {
  const html = read(page);
  assert.ok(html.includes('<meta name="description"'), `${page} should include a meta description`);
  assert.ok(html.includes('<meta property="og:title"'), `${page} should include an Open Graph title`);
  assert.ok(html.includes('<meta property="og:image"'), `${page} should include a share image`);
  assert.ok(html.includes('<link rel="canonical"'), `${page} should include a canonical URL`);
  assert.ok(html.includes('<link rel="icon" href="favicon.ico"'), `${page} should include a favicon`);
  assert.ok(html.includes(`styles.css?v=${releaseVersion}`), `${page} should request the current stylesheet release`);
  assert.ok(html.includes(`script.js?v=${releaseVersion}`), `${page} should request the current shared script release`);
});

assert.ok(script.includes(`sw.js?v=${releaseVersion}`), "service worker registration should use the current release version");
assert.ok(serviceWorker.includes(`zk-portfolio-${releaseVersion}`), "service worker caches should use the current release version");

["favicon.ico", "robots.txt", "sitemap.xml", "404.html", "assets/share-cover.webp"].forEach((file) => {
  assert.ok(fs.existsSync(path.join(root, file)), `${file} should exist`);
});

console.log("bug regression checks passed");
