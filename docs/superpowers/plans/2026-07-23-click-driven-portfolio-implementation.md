# Click-Driven Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing five-page portfolio from long-scroll navigation to a fixed, click-driven mission stage while preserving the approved visual identity, URLs, media, Lightbox behavior, loading gate, and no-JavaScript access.

**Architecture:** Keep the five static HTML documents and existing gallery data scripts. Add a small shared state/history utility (`click-stage.js`), a detail-page controller (`detail-stage.js`), a home mission controller (`home-stage.js`), and an isolated visual layer (`click-stage.css`). Existing sections remain in the DOM as progressive-enhancement content; JavaScript adds `stage-ready` only after successful initialization and then turns sections into tabs and paginated panels.

**Tech Stack:** Static HTML5, CSS, vanilla JavaScript, Node built-in test runner style (`assert` scripts), Service Worker, in-app browser/Playwright visual checks.

---

## File Structure

### New files

- `click-stage.js`: pure hash/page-size helpers, transition coordinator, current-screen prefetch helper.
- `detail-stage.js`: shared detail-page tabs, pagination, task rail, keyboard and history controller.
- `home-stage.js`: D2 mission-stage selection, entry transitions, data panel and resume panel behavior.
- `click-stage.css`: fixed-stage layout, D2/B2/W1/M1/N2 presentation and responsive rules.
- `tests/click-stage-utils.test.js`: pure state, hash and page-size tests.
- `tests/click-stage-structure.test.js`: five-page markup and progressive-enhancement contract.
- `tests/click-stage-galleries.test.js`: gallery pagination, Lightbox and video integration contract.
- `tests/click-stage-loader.test.js`: current-screen loader and font-settlement contract.
- `tests/click-stage-accessibility.test.js`: focus, ARIA and media-failure recovery contract.

### Existing files to modify

- `index.html:88-435`: replace scroll-first home composition with D2 stage markup while retaining data and resume content.
- `website-design.html:88-410`: add B2 shell and W1 categories for overview/mobile/PC/VibeCoding.
- `ua-creatives.html:88-294`: add B2 shell and W1 categories for overview/horizontal/vertical/nine-grid.
- `community-creatives.html:88-294`: add B2 shell and W1 categories for overview/party/Ulala/Lili.
- `video-design.html:88-260`: add B2 shell and video pagination categories.
- `styles.css:425-498`: retire scroll progress/back-to-top presentation and keep legacy fallback styles.
- `script.js:1-610`: update the loading gate to settle fonts and current-screen media.
- `script.js:619-1370`: disable scroll-only behavior in stage mode and preserve resume/video/modal utilities.
- `website-design.js:1-250`: mount static galleries into shared pagination and prefetch adjacent Lightbox images.
- `ua-creatives.js:228-520`: mount generated UA galleries after rendering.
- `community-creatives.js:139-390`: mount generated community galleries after rendering.
- `sw.js:1-18`: bump cache version and cache the new shared files.
- Existing regression tests: update assertions that intentionally require scroll navigation.

## Task 1: Add Pure Stage State Utilities

**Files:**
- Create: `tests/click-stage-utils.test.js`
- Create: `click-stage.js`

- [ ] **Step 1: Write the failing utility tests**

```js
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const source = fs.readFileSync(path.join(__dirname, "..", "click-stage.js"), "utf8");
const window = {};
vm.runInNewContext(source, { window, document: {}, URLSearchParams });
const utils = window.PortfolioStage;

assert.deepEqual(
  JSON.parse(JSON.stringify(utils.parseHash("#horizontal-p2", "overview"))),
  { view: "horizontal", page: 2 },
);
assert.deepEqual(
  JSON.parse(JSON.stringify(utils.parseHash("", "overview"))),
  { view: "overview", page: 1 },
);
assert.equal(utils.formatHash("lili-tangquan", 3), "#lili-tangquan-p3");
assert.equal(utils.formatHash("overview", 1), "#overview");
assert.equal(utils.getPageSize({ kind: "horizontal", width: 1440, height: 900 }), 6);
assert.equal(utils.getPageSize({ kind: "horizontal", width: 390, height: 844 }), 1);
assert.equal(utils.getPageSize({ kind: "vertical", width: 1440, height: 900 }), 4);
assert.equal(utils.getPageSize({ kind: "video", width: 1440, height: 900 }), 3);
assert.equal(utils.getPageSize({ kind: "video", width: 390, height: 844 }), 1);
assert.deepEqual(
  JSON.parse(JSON.stringify(utils.paginate(["a", "b", "c"], 2))),
  [["a", "b"], ["c"]],
);

console.log("click stage utility checks passed");
```

- [ ] **Step 2: Run the test and verify the missing module failure**

Run: `node tests/click-stage-utils.test.js`  
Expected: FAIL with `ENOENT` for `click-stage.js`.

- [ ] **Step 3: Implement the pure utilities**

```js
(function exposePortfolioStage(global) {
  const HASH_PATTERN = /^#?([a-z0-9-]+?)(?:-p([1-9]\d*))?$/i;

  function parseHash(hash, fallbackView) {
    const match = String(hash || "").match(HASH_PATTERN);
    return {
      view: match?.[1] || fallbackView,
      page: Math.max(1, Number(match?.[2] || 1)),
    };
  }

  function formatHash(view, page) {
    const safePage = Math.max(1, Number(page) || 1);
    return `#${view}${safePage > 1 ? `-p${safePage}` : ""}`;
  }

  function getPageSize({ kind, width, height }) {
    const compact = width < 700;
    if (compact) return kind === "vertical" && height >= 760 ? 2 : 1;
    if (kind === "video") return 3;
    if (kind === "vertical" || kind === "square") return height < 760 ? 3 : 4;
    return height < 760 || width < 1200 ? 4 : 6;
  }

  function paginate(items, pageSize) {
    const pages = [];
    for (let index = 0; index < items.length; index += pageSize) {
      pages.push(items.slice(index, index + pageSize));
    }
    return pages;
  }

  global.PortfolioStage = { formatHash, getPageSize, paginate, parseHash };
})(window);
```

- [ ] **Step 4: Run the utility test**

Run: `node tests/click-stage-utils.test.js`  
Expected: `click stage utility checks passed`.

- [ ] **Step 5: Commit**

```powershell
git add click-stage.js tests/click-stage-utils.test.js
git commit -m "feat: add click stage state utilities"
```

## Task 2: Establish the Progressive-Enhancement Shell

**Files:**
- Create: `tests/click-stage-structure.test.js`
- Create: `click-stage.css`
- Modify: `index.html`
- Modify: `website-design.html`
- Modify: `ua-creatives.html`
- Modify: `community-creatives.html`
- Modify: `video-design.html`
- Modify: `styles.css`

- [ ] **Step 1: Write the failing structure contract**

```js
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const root = path.resolve(__dirname, "..");
const pages = ["index.html", "website-design.html", "ua-creatives.html", "community-creatives.html", "video-design.html"];

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  assert.ok(html.includes('href="click-stage.css?v=click-stage-1"'), `${page} loads stage CSS`);
  assert.ok(html.includes('src="click-stage.js?v=click-stage-1"'), `${page} loads state utilities`);
  assert.ok(html.includes('class="stage-wipe"'), `${page} includes the M1 transition layer`);
  assert.ok(!html.includes('class="scroll-progress"'), `${page} removes scroll progress`);
  assert.ok(!html.includes('class="back-to-top"'), `${page} removes back-to-top`);
}

const css = fs.readFileSync(path.join(root, "click-stage.css"), "utf8");
assert.ok(css.includes("body.stage-ready"));
assert.ok(css.includes(".stage-wipe.is-running"));
assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
console.log("click stage structure checks passed");
```

- [ ] **Step 2: Run the structure test**

Run: `node tests/click-stage-structure.test.js`  
Expected: FAIL because `click-stage.css` and stage markup do not exist.

- [ ] **Step 3: Add the shared shell to all five pages**

Add after `styles.css`:

```html
<link rel="stylesheet" href="click-stage.css?v=click-stage-1" />
```

Add as the final shared scripts before page-specific scripts:

```html
<script src="click-stage.js?v=click-stage-1"></script>
```

Add immediately inside `.page-shell`:

```html
<div class="stage-wipe" aria-hidden="true">
  <span>MISSION SWITCH</span>
</div>
```

Remove `.scroll-progress` and `.back-to-top` markup from every page. Keep their legacy CSS temporarily so no-JavaScript fallback diffs remain narrow.

- [ ] **Step 4: Add the fixed-stage base CSS**

```css
body.stage-ready {
  height: 100dvh;
  overflow: hidden;
}

body.stage-ready .page-shell {
  min-height: 100dvh;
  overflow: hidden;
}

.stage-wipe {
  position: fixed;
  z-index: 9000;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--ink);
  background: var(--yellow);
  transform: translateX(-102%);
  pointer-events: none;
}

.stage-wipe span {
  font-size: clamp(18px, 2vw, 32px);
  font-weight: 900;
}

.stage-wipe.is-running {
  animation: mission-wipe 550ms cubic-bezier(.77, 0, .18, 1);
}

@keyframes mission-wipe {
  0% { transform: translateX(-102%); }
  42%, 58% { transform: translateX(0); }
  100% { transform: translateX(102%); }
}

@media (prefers-reduced-motion: reduce) {
  .stage-wipe.is-running { animation: none; }
}
```

- [ ] **Step 5: Run structure and existing smoke tests**

Run: `node tests/click-stage-structure.test.js`  
Expected: `click stage structure checks passed`.

Run: `node tests/structure.test.js`  
Expected: FAIL only on assertions that explicitly require smooth scrolling, sticky scroll navigation, scroll progress, or back-to-top.

- [ ] **Step 6: Update obsolete scroll assertions**

Replace scroll-only assertions with:

```js
assert.ok(css.includes("body.stage-ready"), "enhanced pages should use a fixed click stage");
assert.ok(html.includes("stage-wipe"), "home page should expose the shared transition layer");
assert.ok(!html.includes('class="scroll-progress"'), "scroll progress should be retired");
assert.ok(!html.includes('class="back-to-top"'), "back-to-top should be retired");
```

- [ ] **Step 7: Commit**

```powershell
git add click-stage.css styles.css index.html website-design.html ua-creatives.html community-creatives.html video-design.html tests/click-stage-structure.test.js tests/structure.test.js tests/premium-interactions.test.js
git commit -m "feat: establish fixed portfolio stage shell"
```

## Task 3: Build the D2 Homepage Mission Stage

**Files:**
- Create: `home-stage.js`
- Modify: `index.html:88-435`
- Modify: `click-stage.css`
- Modify: `tests/click-stage-structure.test.js`

- [ ] **Step 1: Add failing home-stage assertions**

```js
const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert.ok(home.includes('data-home-stage'), "home exposes the D2 stage");
assert.equal((home.match(/data-mission-select=/g) || []).length, 4, "home exposes four mission selectors");
assert.equal((home.match(/data-mission-preview=/g) || []).length, 4, "home includes four real preview images");
assert.ok(home.includes('src="home-stage.js?v=click-stage-1"'), "home loads its controller");
assert.ok(home.includes('data-stage-panel="data"'), "home keeps data in a full-screen panel");
```

- [ ] **Step 2: Run the structure test**

Run: `node tests/click-stage-structure.test.js`  
Expected: FAIL on `data-home-stage`.

- [ ] **Step 3: Replace the home main area with the mission stage**

Use this structure and the existing representative assets:

```html
<main class="home-stage" data-home-stage>
  <section class="mission-stage-panel is-active" data-stage-panel="missions">
    <div class="mission-copy" aria-live="polite">
      <span data-mission-kicker>MISSION 01 / WEBSITE</span>
      <h1 data-mission-title>官网视觉设计</h1>
      <p data-mission-description>游戏官网与 AI 官网视觉交互设计</p>
      <a class="mission-enter" data-mission-enter href="website-design.html">进入任务</a>
    </div>
    <div class="mission-preview-stack">
      <img data-mission-preview="0" class="is-active" src="assets/website-design/pc/顶部+开整-delivery.webp" alt="官网视觉设计代表作品" width="1920" height="1080" />
      <img data-mission-preview="1" src="assets/ua-creatives/sliced/horizontal/new_h_img_001-delivery.webp" alt="买量图片设计代表作品" width="1280" height="720" />
      <img data-mission-preview="2" src="assets/community-creatives/sliced/lili-tangquan/1-delivery.webp" alt="运营图片设计代表作品" width="1080" height="1440" />
      <img data-mission-preview="3" src="assets/video/community/posters/community-video-04-delivery.webp" alt="AI 视频设计代表作品" width="960" height="540" />
    </div>
    <div class="mission-rail" role="tablist" aria-label="作品任务">
      <button role="tab" aria-selected="true" data-mission-select="0">01</button>
      <button role="tab" aria-selected="false" data-mission-select="1">02</button>
      <button role="tab" aria-selected="false" data-mission-select="2">03</button>
      <button role="tab" aria-selected="false" data-mission-select="3">04</button>
    </div>
  </section>
  <section class="home-full-panel" data-stage-panel="data" hidden><!-- retain current data content --></section>
  <section class="home-full-panel" data-stage-panel="resume" hidden><!-- retain current resume UI and PDF link --></section>
</main>
```

Move the existing data markup into `data-stage-panel="data"` without changing metrics or copy. Keep the existing PDF link in the resume panel.

- [ ] **Step 4: Implement mission selection and M1 entry**

```js
(function initHomeStage() {
  const root = document.querySelector("[data-home-stage]");
  if (!root || !window.PortfolioStage) return;

  const missions = [
    ["MISSION 01 / WEBSITE", "官网视觉设计", "游戏官网与 AI 官网视觉交互设计", "website-design.html"],
    ["MISSION 02 / UA", "买量图片设计", "横版、竖版与九图买量素材", "ua-creatives.html"],
    ["MISSION 03 / COMMUNITY", "运营图片设计", "小恐龙派对、不休的乌拉拉与狸狸汤泉", "community-creatives.html"],
    ["MISSION 04 / VIDEO", "AI 视频设计", "运营社群视频与买量视频混剪", "video-design.html"],
  ];
  const buttons = [...root.querySelectorAll("[data-mission-select]")];
  const previews = [...root.querySelectorAll("[data-mission-preview]")];
  const title = root.querySelector("[data-mission-title]");
  const kicker = root.querySelector("[data-mission-kicker]");
  const description = root.querySelector("[data-mission-description]");
  const enter = root.querySelector("[data-mission-enter]");

  function select(index) {
    const mission = missions[index];
    buttons.forEach((button, itemIndex) => {
      button.setAttribute("aria-selected", String(itemIndex === index));
    });
    previews.forEach((image, itemIndex) => image.classList.toggle("is-active", itemIndex === index));
    [kicker.textContent, title.textContent, description.textContent, enter.href] = mission;
  }

  buttons.forEach((button) => button.addEventListener("click", () => select(Number(button.dataset.missionSelect))));
  enter.addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelector(".stage-wipe")?.classList.add("is-running");
    window.setTimeout(() => { window.location.href = enter.href; }, 285);
  });
  select(0);
  document.body.classList.add("stage-ready");
})();
```

- [ ] **Step 5: Add D2 layout styles and verify**

Implement a two-column stage above 900px and a single-column preview/copy composition below 900px. Use stable grid tracks, `object-fit: cover` for the main preview, `object-fit: contain` only where the representative image would otherwise lose essential content, and a fixed-height numbered rail.

Run: `node tests/click-stage-structure.test.js`  
Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add index.html home-stage.js click-stage.css tests/click-stage-structure.test.js
git commit -m "feat: build homepage mission stage"
```

## Task 4: Add the Shared B2 Detail Controller

**Files:**
- Create: `detail-stage.js`
- Create: `tests/click-stage-galleries.test.js`
- Modify: four detail HTML files
- Modify: `click-stage.css`

- [ ] **Step 1: Write failing detail-stage contracts**

```js
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const root = path.resolve(__dirname, "..");
const pages = ["website-design.html", "ua-creatives.html", "community-creatives.html", "video-design.html"];

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  assert.ok(html.includes("data-detail-stage"), `${page} exposes B2 stage`);
  assert.ok(html.includes('role="tablist"'), `${page} exposes W1 category tabs`);
  assert.ok(html.includes("data-task-rail"), `${page} exposes the task rail`);
  assert.ok(html.includes('src="detail-stage.js?v=click-stage-1"'), `${page} loads the detail controller`);
  assert.ok(html.includes("data-stage-pager"), `${page} exposes fixed pagination`);
}

const source = fs.readFileSync(path.join(root, "detail-stage.js"), "utf8");
assert.ok(source.includes("history.pushState"));
assert.ok(source.includes("popstate"));
assert.ok(source.includes("hashchange"));
assert.ok(source.includes("aria-selected"));
assert.ok(source.includes("pauseAllVideos"));
console.log("detail stage contract checks passed");
```

- [ ] **Step 2: Run the contract test**

Run: `node tests/click-stage-galleries.test.js`  
Expected: FAIL on missing `data-detail-stage`.

- [ ] **Step 3: Add the shared detail shell**

Wrap each existing detail `<main>`:

```html
<main class="detail-stage" data-detail-stage data-default-view="overview">
  <div class="detail-stage-tabs" role="tablist" aria-label="作品分类">
    <button role="tab" aria-selected="true" data-stage-tab="overview">项目概览</button>
  </div>
  <div class="detail-stage-viewport"><!-- existing sections remain here --></div>
  <nav class="stage-pager" data-stage-pager aria-label="作品分页">
    <button type="button" data-page-prev aria-label="上一页">‹</button>
    <span data-page-status aria-live="polite">01 / 01</span>
    <button type="button" data-page-next aria-label="下一页">›</button>
  </nav>
</main>
```

Replace `.detail-directory` with:

```html
<nav class="task-rail" data-task-rail aria-label="任务切换">
  <a href="website-design.html" aria-label="NO.01 官网视觉设计"><b>01</b><span>官网视觉</span></a>
  <a href="ua-creatives.html" aria-label="NO.02 买量图片设计"><b>02</b><span>买量图片</span></a>
  <a href="community-creatives.html" aria-label="NO.03 运营图片设计"><b>03</b><span>运营图片</span></a>
  <a href="video-design.html" aria-label="NO.04 AI 视频设计"><b>04</b><span>AI 视频</span></a>
</nav>
```

- [ ] **Step 4: Implement the detail controller**

The controller must:

- Build the tab set from `[data-stage-view]`.
- Parse the initial Hash with `PortfolioStage.parseHash`.
- Toggle `hidden`, `aria-selected`, current page items and pager disabled states.
- Write state with `history.pushState`.
- Restore state on `popstate` and `hashchange`.
- Pause all videos before changing view or page.
- Add `stage-ready` only after all required nodes exist.
- Run M1 for main category/task transitions and use a 200ms content transition for pagination.

Use this public registration API for static and generated galleries:

```js
window.DetailStage = {
  registerGallery(viewId, root, options = {}) {
    galleries.set(viewId, {
      kind: options.kind || "horizontal",
      root,
      items: [...root.querySelectorAll(options.itemSelector || "[data-detail-preview]")],
      page: 1,
    });
    renderCurrentView({ replaceHistory: true });
  },
  refreshGallery(viewId) {
    const gallery = galleries.get(viewId);
    if (!gallery) return;
    gallery.items = [...gallery.root.querySelectorAll("[data-detail-preview]")];
    renderCurrentView({ replaceHistory: true });
  },
};
```

- [ ] **Step 5: Add B2, W1 and N2 CSS**

Implement:

- Fixed top task bar.
- Central `minmax(0, 1fr)` viewport.
- Fixed category tab row and pager.
- Desktop narrow task rail.
- Mobile right rail at 34px collapsed width; `.is-expanded` overlays the stage with labels.
- `@media (max-height: 680px)` rules that reduce gallery page size through JS rather than font scaling.

- [ ] **Step 6: Run the contract test**

Run: `node tests/click-stage-galleries.test.js`  
Expected: `detail stage contract checks passed`.

- [ ] **Step 7: Commit**

```powershell
git add detail-stage.js click-stage.css website-design.html ua-creatives.html community-creatives.html video-design.html tests/click-stage-galleries.test.js
git commit -m "feat: add shared detail mission stage"
```

## Task 5: Adapt NO.1, NO.2 and NO.3 Image Galleries

**Files:**
- Modify: `website-design.js`
- Modify: `ua-creatives.js`
- Modify: `community-creatives.js`
- Modify: `website-design.html`
- Modify: `ua-creatives.html`
- Modify: `community-creatives.html`
- Modify: `tests/click-stage-galleries.test.js`

- [ ] **Step 1: Add failing registration assertions**

```js
const websiteScript = fs.readFileSync(path.join(root, "website-design.js"), "utf8");
const uaScript = fs.readFileSync(path.join(root, "ua-creatives.js"), "utf8");
const communityScript = fs.readFileSync(path.join(root, "community-creatives.js"), "utf8");

assert.ok(websiteScript.includes('registerGallery("mobile"'));
assert.ok(websiteScript.includes('registerGallery("pc"'));
assert.ok(websiteScript.includes('registerGallery("vibecoding"'));
assert.ok(uaScript.includes("DetailStage.refreshGallery(configKey)"));
assert.ok(communityScript.includes("DetailStage.refreshGallery(group)"));
```

- [ ] **Step 2: Run the gallery test**

Run: `node tests/click-stage-galleries.test.js`  
Expected: FAIL on the first registration assertion.

- [ ] **Step 3: Register static website galleries**

After existing preview-button listeners are attached:

```js
window.DetailStage?.registerGallery("mobile", document.querySelector(".mobile-gallery"), {
  kind: "vertical",
});
window.DetailStage?.registerGallery("pc", document.querySelector(".pc-gallery"), {
  kind: "horizontal",
});
window.DetailStage?.registerGallery("vibecoding", document.querySelector(".vibecoding-gallery"), {
  kind: "horizontal",
});
```

- [ ] **Step 4: Refresh generated UA and community galleries**

At the end of `renderGallery(configKey, gallery)`:

```js
window.DetailStage?.registerGallery(configKey, gallery, {
  kind: configKey === "vertical" ? "vertical" : configKey === "nine-grid" ? "square" : "horizontal",
});
window.DetailStage?.refreshGallery(configKey);
```

At the end of `renderGallery(group, gallery)`:

```js
window.DetailStage?.registerGallery(group, gallery, { kind: "mixed" });
window.DetailStage?.refreshGallery(group);
```

Make `getPageSize` treat `mixed` as `vertical` when more than half the current items are portrait; otherwise treat it as horizontal.

- [ ] **Step 5: Ensure hidden pages are non-interactive**

For every gallery render, apply:

```js
item.hidden = !visible;
item.toggleAttribute("inert", !visible);
item.setAttribute("aria-hidden", String(!visible));
```

Only visible-page images keep their normal `src`; the next page is prefetched with `new Image()` using thumbnail sources. Full-size Lightbox sources are not prefetched until a preview opens.

- [ ] **Step 6: Run gallery and slicing tests**

Run: `node tests/click-stage-galleries.test.js`  
Expected: PASS.

Run: `node tests/ua-creatives-slicing.test.js`  
Expected: PASS.

Run: `node tests/community-creatives-slicing.test.js`  
Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add website-design.js ua-creatives.js community-creatives.js website-design.html ua-creatives.html community-creatives.html click-stage.js tests/click-stage-galleries.test.js
git commit -m "feat: paginate portfolio image galleries"
```

## Task 6: Adapt NO.4 Video Browsing

**Files:**
- Modify: `video-design.html`
- Modify: `script.js:1301-1370`
- Modify: `detail-stage.js`
- Modify: `click-stage.css`
- Modify: `tests/click-stage-galleries.test.js`

- [ ] **Step 1: Add failing video-stage assertions**

```js
const videoHtml = fs.readFileSync(path.join(root, "video-design.html"), "utf8");
const sharedScript = fs.readFileSync(path.join(root, "script.js"), "utf8");
assert.ok(videoHtml.includes('data-stage-view="community-video"'));
assert.ok(videoHtml.includes('data-stage-view="video"'));
assert.ok(videoHtml.includes('data-video-page-item'));
assert.ok(sharedScript.includes('document.addEventListener("portfolio:stagechange"'));
```

- [ ] **Step 2: Run the gallery test**

Run: `node tests/click-stage-galleries.test.js`  
Expected: FAIL on `data-video-page-item`.

- [ ] **Step 3: Mark video panels and items**

Keep the six existing 16:9 cards, adding `data-video-page-item` to each article. Mark the section panels:

```html
<section id="community-video" data-stage-view="community-video" data-stage-kind="video">
```

```html
<section id="video" data-stage-view="video" data-stage-kind="video-feature">
```

- [ ] **Step 4: Register the community video gallery**

```js
const communityVideoGrid = document.querySelector(".community-video-grid");
if (communityVideoGrid) {
  window.DetailStage?.registerGallery("community-video", communityVideoGrid, {
    kind: "video",
    itemSelector: "[data-video-page-item]",
  });
}
```

- [ ] **Step 5: Pause video on every stage change**

```js
document.addEventListener("portfolio:stagechange", () => {
  document.querySelectorAll("video").forEach((video) => {
    video.pause();
    video.closest(".community-video-card")?.classList.remove("is-playing");
  });
});
```

Preserve `preload="none"` and assign `src` only from the existing play handlers.

- [ ] **Step 6: Run video regressions**

Run: `node tests/structure.test.js`  
Expected: PASS for six videos, 3-column desktop layout and one active playback rule.

Run: `node tests/click-stage-galleries.test.js`  
Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add video-design.html script.js detail-stage.js click-stage.css tests/click-stage-galleries.test.js tests/structure.test.js
git commit -m "feat: paginate click-driven video showcase"
```

## Task 7: Harden Lightbox Navigation and Adjacent Prefetch

**Files:**
- Modify: `website-design.js`
- Modify: `ua-creatives.js`
- Modify: `community-creatives.js`
- Modify: `script.js:1111-1300`
- Modify: `tests/bug-regressions.test.js`
- Modify: `tests/premium-interactions.test.js`

- [ ] **Step 1: Add failing Lightbox prefetch assertions**

```js
for (const file of ["website-design.js", "ua-creatives.js", "community-creatives.js"]) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  assert.ok(source.includes("prefetchAdjacentFullImages"), `${file} prefetches adjacent full images`);
  assert.ok(source.includes("window.activateModalDialog"), `${file} traps focus`);
  assert.ok(source.includes("window.lockPreviewScroll"), `${file} locks background`);
}
```

- [ ] **Step 2: Run the premium interaction test**

Run: `node tests/premium-interactions.test.js`  
Expected: FAIL on adjacent prefetch.

- [ ] **Step 3: Add bounded adjacent prefetch**

Add the same helper to the shared Lightbox path or expose it from `click-stage.js`:

```js
function prefetchAdjacentFullImages(previews, index) {
  [-2, -1, 1, 2].forEach((offset) => {
    const preview = previews[(index + offset + previews.length) % previews.length];
    const source = preview?.dataset.fullSmall || preview?.dataset.full;
    if (!source) return;
    const image = new Image();
    image.decoding = "async";
    image.src = source;
  });
}
```

Call it after the current Lightbox image has received its source. Do not prefetch original PNG files.

- [ ] **Step 4: Preserve modal boundaries**

Retain:

- `role="dialog"` and `aria-modal="true"`.
- Background scroll lock and inert shell.
- Narrow backdrop-close safety gap.
- Focus trap and close-button focus on open.
- Trigger focus restoration on close.

Dispatch `portfolio:lightboxopen` and `portfolio:lightboxclose` so the stage controller never reacts to arrow keys while the Lightbox is active.

- [ ] **Step 5: Run Lightbox regressions**

Run: `node tests/premium-interactions.test.js`  
Expected: PASS.

Run: `node tests/bug-regressions.test.js`  
Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add click-stage.js website-design.js ua-creatives.js community-creatives.js script.js tests/bug-regressions.test.js tests/premium-interactions.test.js
git commit -m "fix: keep lightbox paging responsive and modal"
```

## Task 8: Make the Loading Gate Stage-Aware

**Files:**
- Create: `tests/click-stage-loader.test.js`
- Modify: `script.js:1-610`
- Modify: five HTML loader blocks/version strings
- Modify: `click-stage.css`
- Modify: `tests/page-loading-gate.test.js`

- [ ] **Step 1: Write the failing loader contract**

```js
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const root = path.resolve(__dirname, "..");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");

assert.ok(script.includes('document.fonts.load("900 1em ZHYuwanPortfolio")'));
assert.ok(script.includes("[data-loader-critical-image]"));
assert.ok(script.includes("criticalResourcesSettled"));
assert.ok(script.includes("Promise.allSettled"));
assert.ok(!script.includes('querySelectorAll("img")'), "loader must not wait for every gallery image");

for (const page of ["index.html", "website-design.html", "ua-creatives.html", "community-creatives.html", "video-design.html"]) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  assert.ok(html.includes("data-loader-critical-image"), `${page} identifies current-screen critical media`);
}

console.log("click stage loader checks passed");
```

- [ ] **Step 2: Run the loader contract**

Run: `node tests/click-stage-loader.test.js`  
Expected: FAIL on the font-load assertion.

- [ ] **Step 3: Replace all-image readiness with explicit critical resources**

Use:

```js
const criticalImages = [...document.querySelectorAll("[data-loader-critical-image]")];
const fontLoads = [
  document.fonts.ready,
  document.fonts.load("400 1em ZHYuwanPortfolio"),
  document.fonts.load("700 1em ZHYuwanPortfolio"),
  document.fonts.load("900 1em ZHYuwanPortfolio"),
];
const criticalResourcesSettled = Promise.allSettled([
  ...fontLoads,
  ...criticalImages.map(waitForImage),
  waitForStylesheet(),
]);
```

Each settled resource increments the visible percentage. Reserve the final 8% for one paint after `stage-ready`; never animate fake timer-only progress. Keep the watchdog and retry control.

- [ ] **Step 4: Mark the critical image on every page**

- Home: active mission preview 01.
- Website detail: first overview/representative image.
- UA detail: first horizontal delivery thumbnail.
- Community detail: first active project thumbnail.
- Video detail: first community poster.

Only these images receive `data-loader-critical-image` on initial HTML. Generated galleries notify the loader only when their active first item is required by the initial Hash.

- [ ] **Step 5: Run loader tests**

Run: `node tests/click-stage-loader.test.js`  
Expected: `click stage loader checks passed`.

Run: `node tests/page-loading-gate.test.js`  
Expected: PASS after updating the resource-selection assertions and cache-bust version.

- [ ] **Step 6: Commit**

```powershell
git add script.js click-stage.css index.html website-design.html ua-creatives.html community-creatives.html video-design.html tests/click-stage-loader.test.js tests/page-loading-gate.test.js
git commit -m "fix: settle stage fonts and visible media before reveal"
```

## Task 9: Add Media Failure Recovery and Accessibility Completion

**Files:**
- Create: `tests/click-stage-accessibility.test.js`
- Modify: `detail-stage.js`
- Modify: `home-stage.js`
- Modify: `click-stage.css`
- Modify: four detail HTML files

- [ ] **Step 1: Write the failing accessibility and recovery contract**

```js
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const root = path.resolve(__dirname, "..");
const detail = fs.readFileSync(path.join(root, "detail-stage.js"), "utf8");
const home = fs.readFileSync(path.join(root, "home-stage.js"), "utf8");
const css = fs.readFileSync(path.join(root, "click-stage.css"), "utf8");

assert.ok(detail.includes("installMediaRecovery"));
assert.ok(detail.includes("data-media-retry"));
assert.ok(detail.includes('addEventListener("error"'));
assert.ok(detail.includes('event.key === "Escape"'));
assert.ok(detail.includes("portfolio:stagechange"));
assert.ok(home.includes("activateModalDialog"));
assert.ok(home.includes("deactivateModalDialog"));
assert.ok(css.includes(":focus-visible"));

for (const page of ["website-design.html", "ua-creatives.html", "community-creatives.html", "video-design.html"]) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  assert.ok(html.includes('aria-live="polite"'), `${page} announces page changes`);
}

console.log("click stage accessibility checks passed");
```

- [ ] **Step 2: Run the accessibility test**

Run: `node tests/click-stage-accessibility.test.js`  
Expected: FAIL on `installMediaRecovery`.

- [ ] **Step 3: Add bounded image and video recovery**

```js
function installMediaRecovery(root) {
  root.querySelectorAll("img, video").forEach((media) => {
    media.addEventListener("error", () => {
      const frame = media.closest(".detail-shot, .community-video-stage, .video-stage");
      if (!frame || frame.querySelector("[data-media-retry]")) return;
      frame.classList.add("has-media-error");
      const retry = document.createElement("button");
      retry.type = "button";
      retry.dataset.mediaRetry = "";
      retry.textContent = "重新加载";
      retry.addEventListener("click", () => {
        retry.remove();
        frame.classList.remove("has-media-error");
        if (media instanceof HTMLVideoElement) {
          media.load();
        } else {
          const source = media.currentSrc || media.src;
          media.removeAttribute("src");
          requestAnimationFrame(() => { media.src = source; });
        }
      });
      frame.append(retry);
    });
  });
}
```

Call `installMediaRecovery()` after static gallery initialization and after each generated gallery render. The retry control must stay inside the fixed media frame so errors cannot resize the layout.

- [ ] **Step 4: Complete panel focus behavior**

For the resume panel:

```js
function openResume(trigger) {
  resumePanel.hidden = false;
  window.activateModalDialog?.(resumePanel, trigger);
}

function closeResume() {
  resumePanel.hidden = true;
  window.deactivateModalDialog?.(resumePanel);
}
```

For the N2 rail, close on outside click, task selection, or Escape and restore focus to the rail toggle. Category/page changes update the existing polite live region without moving focus.

- [ ] **Step 5: Add focus and failure presentation**

```css
.stage-ready :where(a, button, [tabindex]):focus-visible {
  outline: 3px solid var(--yellow);
  outline-offset: 3px;
}

.has-media-error {
  position: relative;
  min-height: 120px;
  background: #1a1a1a;
}

[data-media-retry] {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  min-width: 110px;
  min-height: 40px;
  border: 2px solid #fff;
  color: var(--ink);
  background: var(--yellow);
  font-weight: 800;
}
```

- [ ] **Step 6: Run accessibility and modal regressions**

Run:

```powershell
node tests/click-stage-accessibility.test.js
node tests/bug-regressions.test.js
node tests/mobile-resume-ui.test.js
```

Expected: all three scripts print their PASS message.

- [ ] **Step 7: Commit**

```powershell
git add detail-stage.js home-stage.js click-stage.css website-design.html ua-creatives.html community-creatives.html video-design.html tests/click-stage-accessibility.test.js tests/bug-regressions.test.js tests/mobile-resume-ui.test.js
git commit -m "feat: add stage recovery and accessible focus"
```

## Task 10: Complete Visual Hierarchy and Responsive Behavior

**Files:**
- Modify: `click-stage.css`
- Modify: `styles.css`
- Modify: `tests/responsive-topbar.test.js`
- Modify: `tests/mobile-detail-performance.test.js`
- Modify: `tests/detail-gallery-compact.test.js`

- [ ] **Step 1: Add failing responsive assertions**

```js
assert.ok(stageCss.includes("@media (max-width: 700px)"));
assert.ok(stageCss.includes(".task-rail.is-expanded"));
assert.ok(stageCss.includes("width: 34px"));
assert.ok(stageCss.includes("env(safe-area-inset-right)"));
assert.ok(stageCss.includes("@media (max-height: 680px)"));
assert.ok(stageCss.includes("minmax(0, 1fr)"));
assert.ok(!stageCss.includes("border-style: dashed"));
```

- [ ] **Step 2: Run responsive tests**

Run: `node tests/responsive-topbar.test.js`  
Expected: FAIL until the new stage selectors are asserted.

- [ ] **Step 3: Finish the approved visual system**

Apply these invariants with the following stable shell:

- White/gray is the main canvas; black frames navigation/active layers; yellow is limited to active state and transition.
- Gallery images are unframed or use one restrained 1–2px boundary.
- No card is nested inside another card.
- Buttons and labels do not inherit the old oversized global minimums.
- Stage tracks use stable `minmax(0, 1fr)` and fixed control rows.
- No dashed borders remain in enhanced mode.
- Mobile task rail expands as an overlay and collapses after selection/outside click/Escape.
- Horizontal media uses the full available width without a permanent black matte.

```css
.stage-ready .detail-stage {
  height: 100dvh;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  background: #f4f4ee;
}

.stage-ready .detail-stage-viewport {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.stage-ready .detail-gallery {
  height: 100%;
  display: grid;
  grid-template-columns: repeat(var(--stage-columns, 3), minmax(0, 1fr));
  grid-template-rows: repeat(var(--stage-rows, 2), minmax(0, 1fr));
  gap: clamp(8px, 1vw, 16px);
}

.stage-ready .detail-shot {
  min-width: 0;
  min-height: 0;
  border: 1px solid rgba(17, 17, 17, .28);
  box-shadow: none;
}

.stage-ready .detail-shot img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: transparent;
}

@media (max-width: 700px) {
  .stage-ready .task-rail {
    right: max(8px, env(safe-area-inset-right));
    width: 34px;
  }
  .stage-ready .task-rail.is-expanded {
    width: min(220px, calc(100vw - 32px));
  }
}
```

- [ ] **Step 4: Run responsive and gallery tests**

Run:

```powershell
node tests/responsive-topbar.test.js
node tests/mobile-detail-performance.test.js
node tests/detail-gallery-compact.test.js
node tests/detail-gallery-redesign.test.js
```

Expected: all four scripts print their PASS message.

- [ ] **Step 5: Commit**

```powershell
git add click-stage.css styles.css tests/responsive-topbar.test.js tests/mobile-detail-performance.test.js tests/detail-gallery-compact.test.js tests/detail-gallery-redesign.test.js
git commit -m "style: refine fixed-stage visual hierarchy"
```

## Task 11: Update Cache, Run Full Regression, and Verify Visually

**Files:**
- Modify: `sw.js`
- Modify: cache-bust query strings in five HTML files
- Modify: performance/structure tests as required by intentional architecture changes

- [ ] **Step 1: Bump the cache version**

```js
const CACHE_VERSION = "zk-portfolio-click-stage-1";
```

Add to `CORE_ASSETS`:

```js
"./click-stage.css?v=click-stage-1",
"./click-stage.js?v=click-stage-1",
"./detail-stage.js?v=click-stage-1",
"./home-stage.js?v=click-stage-1",
```

Use the same `click-stage-1` query version in all five HTML files.

- [ ] **Step 2: Run every Node regression test**

Run:

```powershell
$failed = @()
Get-ChildItem -LiteralPath tests -Filter '*.test.js' | Sort-Object Name | ForEach-Object {
  node $_.FullName
  if ($LASTEXITCODE -ne 0) { $failed += $_.Name }
}
if ($failed.Count -gt 0) { throw "Failed tests: $($failed -join ', ')" }
```

Expected: every test prints its PASS message and the command exits with code 0.

- [ ] **Step 3: Start a local preview**

Run:

```powershell
python -m http.server 8767 --bind 127.0.0.1
```

Expected: server stays running at `http://127.0.0.1:8767/index.html`.

- [ ] **Step 4: Perform browser verification**

Capture and inspect:

- `1920×1080`, `1440×900`, `1280×720`.
- `390×844`, `360×800`, `320×568`.
- Home mission 01 and mission 04.
- Every detail overview and one non-first page.
- N2 rail collapsed and expanded.
- Lightbox first image, next image and close restoration.
- Video page with one playing video, then another selected.

Verify:

- `document.documentElement.scrollWidth === window.innerWidth`.
- `document.body.scrollHeight <= window.innerHeight + 1` when `stage-ready`.
- No text/control overlap.
- No black matte around horizontal gallery cards beyond the media itself.
- Main font is active before the loader exits.
- Browser back/forward restores category and page.
- No console errors and no unexpected eager video requests.

- [ ] **Step 5: Verify no-JavaScript fallback**

Disable JavaScript and reload each page. Confirm all sections remain in normal document flow and every work is reachable by scrolling.

- [ ] **Step 6: Run final diff checks**

Run:

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors; status only lists intentional implementation files.

- [ ] **Step 7: Commit the release state**

```powershell
git add index.html website-design.html ua-creatives.html community-creatives.html video-design.html click-stage.css click-stage.js detail-stage.js home-stage.js styles.css script.js website-design.js ua-creatives.js community-creatives.js sw.js tests
git commit -m "feat: launch click-driven portfolio experience"
```

- [ ] **Step 8: Sync GitHub Pages after verification**

Run:

```powershell
git push origin HEAD:main
```

Expected: remote `main` advances to the verified release commit. Check `https://xzk123456-feat.github.io/xzk/` after GitHub Pages finishes deployment and confirm the live cache version is `zk-portfolio-click-stage-1`.
