const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const normalize = (content) => content.replace(/\r\n/g, "\n");

const pages = [
  "index.html",
  "website-design.html",
  "ua-creatives.html",
  "community-creatives.html",
];

const htmlByPage = Object.fromEntries(
  pages.map((page) => [page, normalize(fs.readFileSync(path.join(root, page), "utf8"))]),
);
const css = normalize(fs.readFileSync(path.join(root, "styles.css"), "utf8"));
const script = normalize(fs.readFileSync(path.join(root, "script.js"), "utf8"));
const websiteScript = normalize(fs.readFileSync(path.join(root, "website-design.js"), "utf8"));
const uaScript = normalize(fs.readFileSync(path.join(root, "ua-creatives.js"), "utf8"));
const communityScript = normalize(fs.readFileSync(path.join(root, "community-creatives.js"), "utf8"));

pages.forEach((page) => {
  assert.ok(htmlByPage[page].includes("scroll-progress"), `${page} should include a scroll progress indicator`);
  assert.ok(htmlByPage[page].includes("back-to-top"), `${page} should include a back-to-top control`);
});

assert.ok(htmlByPage["index.html"].includes("AIGC 买量视觉 / 运营与品宣素材设计"), "hero should state a professional portfolio positioning");
assert.ok(htmlByPage["index.html"].includes("data-tilt-card"), "mission cards should expose restrained 3D hover hooks");

["website-design.html", "ua-creatives.html", "community-creatives.html"].forEach((page) => {
  assert.ok(htmlByPage[page].includes("lightbox-meta"), `${page} lightbox should include image metadata`);
  assert.ok(htmlByPage[page].includes("lightbox-counter"), `${page} lightbox should include a current-image counter`);
  assert.ok(htmlByPage[page].includes("lightbox-strip"), `${page} lightbox should include a thumbnail strip`);
});

assert.ok(script.includes("updateScrollProgress"), "global script should update scroll progress");
assert.ok(script.includes("initBackToTop"), "global script should control the back-to-top affordance");
assert.ok(script.includes("initTiltCards"), "global script should add restrained 3D hover to core cards");
assert.ok(script.includes("setActiveDetailDirectory"), "global script should sync detail directory state");
assert.ok(script.includes("lockPreviewScroll"), "global script should expose a page scroll lock for modal previews");
assert.ok(script.includes("unlockPreviewScroll"), "global script should restore page scrolling after modal previews close");
assert.ok(
  script.includes("document.documentElement.style.scrollBehavior = \"auto\""),
  "modal scroll restore should temporarily disable smooth scrolling to avoid jumping to top before returning",
);
assert.ok(
  script.includes("requestAnimationFrame(() => {\n    document.documentElement.style.scrollBehavior = previousScrollBehavior;"),
  "modal scroll restore should restore the previous inline scroll behavior after the instant position reset",
);
assert.ok(!script.includes("NAV_COOLDOWN_MS = 800"), "lightbox arrow navigation should not impose an 800ms click cooldown");
assert.ok(!script.includes("navigateFrameLocked"), "lightbox arrow navigation should not drop adjacent arrow clicks behind a frame lock");

assert.ok(websiteScript.includes("renderLightboxStrip"), "website lightbox should render a thumbnail strip");
assert.ok(uaScript.includes("renderLightboxStrip"), "UA lightbox should render a thumbnail strip");
assert.ok(communityScript.includes("renderLightboxStrip"), "community lightbox should render a thumbnail strip");
assert.ok(websiteScript.includes("lightbox.dataset.direction"), "website lightbox should expose navigation direction for motion");
assert.ok(uaScript.includes("lightbox.dataset.direction"), "UA lightbox should expose navigation direction for motion");
assert.ok(communityScript.includes("lightbox.dataset.direction"), "community lightbox should expose navigation direction for motion");
assert.ok(websiteScript.includes("updateLightboxStrip"), "website lightbox should update thumbnail active state without rebuilding every arrow click");
assert.ok(uaScript.includes("updateLightboxStrip"), "UA lightbox should update thumbnail active state without rebuilding every arrow click");
assert.ok(communityScript.includes("updateLightboxStrip"), "community lightbox should update thumbnail active state without rebuilding every arrow click");
assert.ok(uaScript.includes("lightboxStrip.dataset.galleryKey"), "large UA galleries should cache the thumbnail strip per gallery");
assert.ok(websiteScript.includes("window.lockPreviewScroll?.()"), "website lightbox should lock the background page while open");
assert.ok(uaScript.includes("window.lockPreviewScroll?.()"), "UA lightbox should lock the background page while open");
assert.ok(communityScript.includes("window.lockPreviewScroll?.()"), "community lightbox should lock the background page while open");
assert.ok(websiteScript.includes("window.unlockPreviewScroll?.()"), "website lightbox should unlock the background page when closed");
assert.ok(uaScript.includes("window.unlockPreviewScroll?.()"), "UA lightbox should unlock the background page when closed");
assert.ok(communityScript.includes("window.unlockPreviewScroll?.()"), "community lightbox should unlock the background page when closed");
assert.ok(websiteScript.includes("shouldCloseFromBackdropClick"), "website lightbox should use a narrow backdrop close guard");
assert.ok(uaScript.includes("shouldCloseFromBackdropClick"), "UA lightbox should use a narrow backdrop close guard");
assert.ok(communityScript.includes("shouldCloseFromBackdropClick"), "community lightbox should use a narrow backdrop close guard");
assert.ok(
  [websiteScript, uaScript, communityScript].every((detailScript) =>
    detailScript.includes(".lightbox-image-row, .lightbox-meta, .lightbox-strip, .lightbox-arrow, .lightbox-close"),
  ),
  "lightbox backdrop close should exclude the image, controls, metadata, thumbnails, arrows, and close button",
);
assert.ok(
  [websiteScript, uaScript, communityScript].every((detailScript) =>
    detailScript.includes("LIGHTBOX_BACKDROP_SAFE_GAP"),
  ),
  "lightbox backdrop close should keep a safety gap around the figure content",
);
assert.ok(!websiteScript.includes("zoom-hint"), "website lightbox should not render the old zoom hint pill");
assert.ok(!uaScript.includes("zoom-hint"), "UA lightbox should not render the old zoom hint pill");
assert.ok(!communityScript.includes("zoom-hint"), "community lightbox should not render the old zoom hint pill");
assert.ok(!css.includes(".zoom-hint"), "styles should not include the removed zoom hint UI");
assert.ok(![websiteScript, uaScript, communityScript].join("\n").includes("滑动鼠标滚轮"), "zoom hint copy should be removed from lightboxes");

[
  ".scroll-progress",
  ".back-to-top",
  ".lightbox-meta",
  ".lightbox-strip",
  ".lightbox-thumb",
  ".mission-card[data-tilt-card]",
  "@view-transition",
  "navigation: auto",
].forEach((selector) => {
  assert.ok(css.includes(selector), `styles should include ${selector}`);
});

assert.ok(css.includes("backdrop-filter"), "premium controls should use restrained translucent depth");
assert.ok(css.includes("filter: blur(10px)"), "gallery images should use blur-up loading polish");
assert.ok(css.includes(".detail-shot.is-loaded img"), "loaded gallery images should settle into a crisp state");
assert.ok(css.includes("body.is-scrolled-deep .back-to-top"), "back-to-top button should appear only after scrolling");
assert.ok(css.includes("html.is-previewing,\nbody.is-previewing"), "modal preview state should lock both html and body scrolling");
assert.ok(css.includes("body.is-previewing {\n  position: fixed;"), "modal preview state should pin the page to prevent background scroll");
assert.ok(css.includes(".back-to-top {\n  position: fixed;\n  right: 22px;\n  bottom: 22px;"), "back-to-top button should stay compact and tucked into the corner");
assert.ok(
  css.includes("width: 34px;\n  height: 34px;\n  min-width: 34px;\n  min-height: 34px;\n  max-width: 34px;\n  max-height: 34px;\n  padding: 0;"),
  "back-to-top button should use a compact square hit target without inherited sizing",
);
assert.ok(css.includes(".back-to-top span {\n  position: absolute;\n  inset: 0;\n  display: grid;\n  place-items: center;"), "back-to-top arrow should be centered within the frame");
assert.ok(css.includes("prefers-reduced-motion: reduce"), "new motion should respect reduced-motion preferences");
assert.ok(css.includes(".website-lightbox .lightbox-arrow {\n  flex: 0 0 64px;"), "desktop lightbox arrows should not inherit wide global button sizing");
assert.ok(css.includes(".website-lightbox .lightbox-arrow {\n  padding: 0;"), "lightbox arrows should clear global button padding");
assert.ok(css.includes(".website-lightbox .lightbox-arrow::before"), "lightbox arrows should disable inherited button pseudo decoration");

console.log("premium interaction checks passed");
