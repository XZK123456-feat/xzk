# NO.01-04 Overview Entry Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four crowded project overview screens with responsive, image-led entry screens that expose every work category without changing the existing fixed-stage navigation model.

**Architecture:** Each detail page keeps its existing `data-stage-view` panels and hash URLs. The `#overview` panel receives a shared three-part structure (identity, representative preview, category entry strip), while `detail-stage.js` routes preview and entry clicks through the existing `commitCategory(view)` transition path. `click-stage.css` owns desktop, portrait-mobile, and low-height-landscape layouts without changing gallery, Lightbox, pagination, or video behavior.

**Tech Stack:** Static HTML5, CSS Grid/Flexbox, vanilla JavaScript, Node.js built-in test runner/assertions, existing browser-control QA workflow, GitHub Pages service worker.

## Global Constraints

- Work only in `C:\Users\xiaozikang\.config\superpowers\worktrees\xzk\online-page-base` on branch `codex/online-page-base`.
- Preserve the current black, white, and yellow visual language and the existing 550ms mechanical wipe.
- Preserve current category IDs, page URLs, Lightbox, pagination, video mutual-exclusion playback, and back-navigation behavior.
- Use native hash links with `aria-label`; the entries must remain usable when JavaScript is unavailable.
- NO.04 overview loads a poster image only and must not preload an MP4.
- The 1280x720, 1366x768, 320x568, 390x844, and 844x390 viewports must have no clipped index, horizontal overflow, task-rail overlap, or hidden category entry.
- Release all changed stage assets as `click-stage-12`.

---

### Task 1: Lock The Overview Content Contract

**Files:**
- Create: `tests/detail-overview-entry.test.js`
- Modify: `website-design.html:99-123`
- Modify: `ua-creatives.html:133-154`
- Modify: `community-creatives.html:133-154`
- Modify: `video-design.html:98-122`

**Interfaces:**
- Consumes: Existing `section[data-stage-view="overview"]` panels and category IDs.
- Produces: `.overview-stage`, `.overview-identity`, `.overview-preview[data-stage-entry]`, and `.overview-entry[data-stage-entry]` links consumed by CSS and `detail-stage.js`.

- [ ] **Step 1: Write the failing structural test**

Create `tests/detail-overview-entry.test.js` with a page map containing the exact defaults and category IDs:

```js
const assert = require("node:assert/strict");
const fs = require("node:fs");

const pages = {
  "website-design.html": {
    defaultView: "pc",
    entries: ["mobile", "pc", "vibecoding"],
    image: "assets/website-design/pc/thumbnails/顶部+开整-thumb-delivery.webp",
  },
  "ua-creatives.html": {
    defaultView: "horizontal",
    entries: ["horizontal", "vertical", "nine-grid"],
    image: "assets/ua-creatives/sliced/horizontal/new_h_img_001-delivery-480.webp",
  },
  "community-creatives.html": {
    defaultView: "lili-tangquan",
    entries: ["party-all", "ulala-all", "lili-tangquan"],
    image: "assets/community-creatives/sliced/lili-tangquan/1-delivery-480.webp",
  },
  "video-design.html": {
    defaultView: "community-video",
    entries: ["community-video", "video"],
    image: "assets/video/community/posters/community-video-04-delivery-480.webp",
  },
};

for (const [file, config] of Object.entries(pages)) {
  const html = fs.readFileSync(file, "utf8");
  const overview = html.match(/<section\b[^>]*id="overview"[\s\S]*?<\/section>/)?.[0] || "";
  assert.match(overview, /class="overview-stage"/, `${file} needs the shared overview shell`);
  assert.match(overview, /class="overview-identity"/, `${file} needs an identity region`);
  assert.match(overview, /class="overview-index"/, `${file} needs an integrated project index`);
  assert.match(overview, /class="overview-entry-strip"/, `${file} needs a category entry strip`);
  assert.ok(!overview.includes("detail-ticket"), `${file} must remove the detached ticket`);
  assert.ok(!overview.includes("detail-summary"), `${file} must remove the oversized summary card`);
  assert.ok(
    overview.includes(`class="overview-preview" href="#${config.defaultView}" data-stage-entry="${config.defaultView}"`),
    `${file} preview must open ${config.defaultView}`,
  );
  assert.ok(overview.includes(`src="${config.image}"`), `${file} must use the approved representative image`);
  assert.match(overview, /<img\b[^>]*\bwidth="\d+"[^>]*\bheight="\d+"/, `${file} preview needs stable dimensions`);
  for (const view of config.entries) {
    assert.ok(
      overview.includes(`href="#${view}" data-stage-entry="${view}"`),
      `${file} needs a no-JS entry for ${view}`,
    );
  }
}

const videoOverview = fs
  .readFileSync("video-design.html", "utf8")
  .match(/<section\b[^>]*id="overview"[\s\S]*?<\/section>/)?.[0] || "";
assert.ok(!videoOverview.includes("<video"), "video overview must not preload MP4");
```

- [ ] **Step 2: Run the structural test and confirm the old overview fails**

Run: `node tests/detail-overview-entry.test.js`

Expected: FAIL at `needs the shared overview shell`.

- [ ] **Step 3: Replace all four overview blocks**

Use this exact shared shape, filling the page-specific copy, image dimensions, default target, and entries from the approved design specification:

```html
<section id="overview" class="detail-view is-active" data-stage-view="overview" role="tabpanel" aria-labelledby="detail-tab-overview">
  <div class="overview-stage">
    <header class="overview-identity">
      <span class="overview-index">NO.<strong>01</strong></span>
      <p class="overview-kicker">OFFICIAL WEBSITE</p>
      <h1>官网视觉设计</h1>
      <p class="overview-role">负责移动端、PC 端官网视觉与 VibeCoding 页面制作</p>
      <p class="overview-meta"><span>2023-2026</span><span>UI / Web / AIGC</span></p>
    </header>
    <a class="overview-preview" href="#pc" data-stage-entry="pc" aria-label="查看 PC 端官网视觉作品">
      <img src="assets/website-design/pc/thumbnails/顶部+开整-thumb-delivery.webp" width="400" height="225" alt="PC 端官网视觉代表作品" data-loader-critical-image decoding="async" />
      <span class="overview-preview-label">精选作品</span>
      <span class="overview-preview-action">查看作品 <span aria-hidden="true">→</span></span>
    </a>
    <nav class="overview-entry-strip" aria-label="官网视觉作品分类">
      <a class="overview-entry" href="#mobile" data-stage-entry="mobile" aria-label="查看移动端作品">
        <span>01</span><strong>移动端</strong><small>查看作品</small>
      </a>
      <a class="overview-entry" href="#pc" data-stage-entry="pc" aria-label="查看 PC 端作品">
        <span>02</span><strong>PC 端</strong><small>查看作品</small>
      </a>
      <a class="overview-entry" href="#vibecoding" data-stage-entry="vibecoding" aria-label="查看 VibeCoding 作品">
        <span>03</span><strong>VibeCoding</strong><small>查看作品</small>
      </a>
    </nav>
  </div>
</section>
```

Page-specific content:

```text
NO.01: OFFICIAL WEBSITE / 官网视觉设计 / 2023-2026 / UI · Web · AIGC
NO.02: USER ACQUISITION / 买量图片设计 / 2023-2026 / 600+ 图片素材
NO.03: COMMUNITY CREATIVE / 运营图片设计 / 2023-2026 / 社群视觉 · 活动运营
NO.04: AI VIDEO DESIGN / AI 视频设计 / 2024-2026 / 6 条精选社群视频
```

Use the approved representative paths from Step 1. Use `width="480" height="270"` for the NO.02 and NO.04 landscape posters, and `width="480" height="640"` for the NO.03 portrait poster.

- [ ] **Step 4: Run the structural test**

Run: `node tests/detail-overview-entry.test.js`

Expected: PASS.

- [ ] **Step 5: Commit the content contract**

```powershell
git add tests/detail-overview-entry.test.js website-design.html ua-creatives.html community-creatives.html video-design.html
git commit -m "feat: add work-led project overview entries"
```

### Task 2: Route Overview Entries Through The Existing Stage Controller

**Files:**
- Modify: `tests/detail-stage-controller.test.js`
- Modify: `detail-stage.js:270-285`
- Modify: `detail-stage.js:808-827`

**Interfaces:**
- Consumes: Anchor elements matching `[data-stage-entry]` and existing `commitCategory(view)`.
- Produces: Click routing that updates history, selected tab, active panel, and ARIA status through the current transition controller.

- [ ] **Step 1: Add failing controller cases**

Extend the controller harness so the document returns two overview entry links for `[data-stage-entry]`. Add assertions equivalent to:

```js
const previewEntry = new FakeElement("a");
previewEntry.dataset.stageEntry = "horizontal";
previewEntry.setAttribute("href", "#horizontal");
const invalidEntry = new FakeElement("a");
invalidEntry.dataset.stageEntry = "missing";
invalidEntry.setAttribute("href", "#missing");
document.queryAllMap.set("[data-stage-entry]", [previewEntry, invalidEntry]);

previewEntry.dispatch("click", { preventDefault() {} });
assert.equal(history.pushStateCalls.at(-1)[2], "#horizontal");
assert.equal(document.body.dataset.stageView, "horizontal");

invalidEntry.dispatch("click", { preventDefault() {} });
assert.equal(document.body.dataset.stageView, "horizontal");
```

Keep the existing wipe-timer helpers in the test and advance the timer to the current commit midpoint before asserting the active view.

- [ ] **Step 2: Run the controller test and confirm entry clicks are unhandled**

Run: `node tests/detail-stage-controller.test.js`

Expected: FAIL because `[data-stage-entry]` has no bound handler.

- [ ] **Step 3: Bind valid entry links**

Add the collection beside the existing tabs:

```js
const entries = Array.from(document.querySelectorAll("[data-stage-entry]"));
```

Add this binding beside the existing tab click binding:

```js
entries.forEach((entry) => {
  entry.addEventListener("click", (event) => {
    const view = entry.dataset.stageEntry;
    if (!view || !allowedViews.has(view)) return;
    event.preventDefault();
    commitCategory(view);
  });
});
```

The handler must not implement a second transition path; all valid entries call `commitCategory(view)`.

- [ ] **Step 4: Run the controller and overview tests**

Run:

```powershell
node tests/detail-stage-controller.test.js
node tests/detail-overview-entry.test.js
```

Expected: both PASS.

- [ ] **Step 5: Commit the routing behavior**

```powershell
git add tests/detail-stage-controller.test.js detail-stage.js
git commit -m "feat: route overview entries through stage navigation"
```

### Task 3: Build Responsive Entry-First Layouts

**Files:**
- Create: `tests/detail-overview-layout.test.js`
- Modify: `tests/click-stage-galleries.test.js`
- Modify: `tests/mobile-detail-performance.test.js`
- Modify: `click-stage.css:105-145`
- Modify: `click-stage.css:395-445`
- Modify: `click-stage.css:600-885`

**Interfaces:**
- Consumes: The shared overview class names from Task 1.
- Produces: Desktop two-column layout, portrait stack, and low-height-landscape three-column layout.

- [ ] **Step 1: Write failing CSS contract tests**

Create `tests/detail-overview-layout.test.js`:

```js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const css = fs.readFileSync("click-stage.css", "utf8");

assert.match(css, /\.overview-stage\s*\{[^}]*display:\s*grid;[^}]*grid-template-areas:\s*"identity preview"\s*"entries entries";/s);
assert.match(css, /\.overview-preview\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9;[^}]*overflow:\s*hidden;/s);
assert.match(css, /\.overview-preview img\s*\{[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*object-fit:\s*cover;/s);
assert.match(css, /\.overview-entry-strip\s*\{[^}]*display:\s*grid;/s);
assert.match(css, /\.overview-entry:focus-visible[\s\S]*outline:/s);
assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*grid-template-areas:\s*"identity"\s*"preview"\s*"entries";/s);
assert.match(css, /@media \(max-height:\s*540px\) and \(orientation:\s*landscape\)[\s\S]*grid-template-areas:\s*"identity preview entries";/s);
assert.ok(!css.includes('[data-stage-view="overview"] .detail-ticket'), "overview must not position a detached ticket");
```

Update the old gallery and mobile tests to assert the new overview shell instead of requiring `.detail-hero-card`, `.detail-summary`, or centered `.detail-ticket`.

- [ ] **Step 2: Run the CSS tests and confirm the old layout fails**

Run:

```powershell
node tests/detail-overview-layout.test.js
node tests/click-stage-galleries.test.js
node tests/mobile-detail-performance.test.js
```

Expected: the new layout test FAILS on `.overview-stage`.

- [ ] **Step 3: Replace overview-only stage styles**

Implement these stable layout rules in `click-stage.css`:

```css
body.stage-ready [data-stage-view="overview"] {
  padding: clamp(14px, 2vw, 28px);
}

.overview-stage {
  min-height: 100%;
  display: grid;
  grid-template-columns: minmax(250px, 34%) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) auto;
  grid-template-areas:
    "identity preview"
    "entries entries";
  gap: clamp(14px, 1.7vw, 24px);
}

.overview-identity {
  grid-area: identity;
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  padding: clamp(18px, 2.6vw, 38px);
  background: var(--ink);
  color: white;
  border-left: 8px solid var(--yellow);
}

.overview-index {
  align-self: flex-start;
  padding: 6px 10px;
  background: var(--yellow);
  color: var(--ink);
  font-size: 0.78rem;
}

.overview-preview {
  grid-area: preview;
  position: relative;
  min-width: 0;
  aspect-ratio: 16 / 9;
  max-height: 100%;
  overflow: hidden;
  border: 3px solid var(--ink);
  background: #171717;
  color: white;
}

.overview-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 260ms ease;
}

.overview-entry-strip {
  grid-area: entries;
  display: grid;
  grid-template-columns: repeat(var(--overview-entry-count, 3), minmax(0, 1fr));
  border: 3px solid var(--ink);
  background: var(--ink);
  gap: 2px;
}

.overview-entry {
  min-width: 0;
  min-height: 70px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: white;
  color: var(--ink);
}

.overview-entry:hover,
.overview-entry:focus-visible {
  background: var(--yellow);
}

.overview-entry:focus-visible {
  outline: 3px solid white;
  outline-offset: -6px;
}
```

Set `--overview-entry-count: 2` on the NO.04 entry strip. Add restrained typography and hover/active states without shadows, nested cards, or decorative lines.

Portrait mobile:

```css
@media (max-width: 760px) {
  .overview-stage {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto auto;
    grid-template-areas:
      "identity"
      "preview"
      "entries";
    align-content: start;
  }

  .overview-identity {
    padding: 14px 16px;
  }

  .overview-preview {
    width: 100%;
    max-height: min(31vh, 220px);
  }

  .overview-entry-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .overview-entry {
    min-height: 58px;
    grid-template-columns: auto minmax(0, 1fr);
  }

  .overview-entry small {
    grid-column: 2;
  }
}
```

Low-height landscape:

```css
@media (max-height: 540px) and (orientation: landscape) {
  .overview-stage {
    grid-template-columns: minmax(180px, 28%) minmax(240px, 1fr) minmax(170px, 26%);
    grid-template-rows: minmax(0, 1fr);
    grid-template-areas: "identity preview entries";
  }

  .overview-entry-strip {
    grid-template-columns: 1fr;
    align-content: center;
  }
}
```

- [ ] **Step 4: Run focused and full tests**

Run:

```powershell
node tests/detail-overview-layout.test.js
node tests/click-stage-galleries.test.js
node tests/mobile-detail-performance.test.js
Get-ChildItem tests -Filter *.test.js | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
```

Expected: all tests PASS.

- [ ] **Step 5: Commit responsive layout**

```powershell
git add tests/detail-overview-layout.test.js tests/click-stage-galleries.test.js tests/mobile-detail-performance.test.js click-stage.css
git commit -m "feat: redesign responsive project overview layouts"
```

### Task 4: Release Stage Assets As Click Stage 12

**Files:**
- Modify: `tests/bug-regressions.test.js`
- Modify: `tests/click-stage-galleries.test.js`
- Modify: `tests/click-stage-structure.test.js`
- Modify: `tests/home-stage-cache.test.js`
- Modify: `tests/performance-assets.test.js`
- Modify: `index.html`
- Modify: `website-design.html`
- Modify: `ua-creatives.html`
- Modify: `community-creatives.html`
- Modify: `video-design.html`
- Modify: `script.js:1533`
- Modify: `sw.js:1-19`

**Interfaces:**
- Consumes: Updated HTML, CSS, and controller files from Tasks 1-3.
- Produces: A single `click-stage-12` cache key and matching HTML/service-worker asset URLs.

- [ ] **Step 1: Change release assertions to click-stage-12**

Replace every test expectation of `click-stage-11` with `click-stage-12` in the five listed test files.

- [ ] **Step 2: Run cache tests and confirm stale production references fail**

Run:

```powershell
node tests/home-stage-cache.test.js
node tests/bug-regressions.test.js
node tests/performance-assets.test.js
```

Expected: FAIL because production files still reference `click-stage-11`.

- [ ] **Step 3: Update all release references**

Change all stage stylesheet/script query strings, service-worker registration, `CACHE_VERSION`, and precache URLs from `click-stage-11` to `click-stage-12`. Verify with:

```powershell
rg -n "click-stage-11|click-stage-12" index.html website-design.html ua-creatives.html community-creatives.html video-design.html script.js sw.js
```

Expected: no `click-stage-11`; every stage reference is `click-stage-12`.

- [ ] **Step 4: Run the complete test suite**

Run:

```powershell
Get-ChildItem tests -Filter *.test.js | Sort-Object Name | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
```

Expected: every test exits 0.

- [ ] **Step 5: Commit the cache release**

```powershell
git add tests index.html website-design.html ua-creatives.html community-creatives.html video-design.html script.js sw.js
git commit -m "chore: release click stage 12"
```

### Task 5: Browser QA, Production Push, And Online Verification

**Files:**
- Verify only: all changed files

**Interfaces:**
- Consumes: Completed click-stage-12 implementation.
- Produces: Browser evidence at required viewports and a deployed `main` branch.

- [ ] **Step 1: Start a local HTTP server**

Run from the worktree:

```powershell
python -m http.server 8767 --bind 127.0.0.1
```

If 8767 is occupied, select the next free port and use it consistently.

- [ ] **Step 2: Verify desktop geometry and entry behavior**

Open `http://127.0.0.1:8767/website-design.html#overview` at 1366x768 and 1280x720. For each detail page, verify:

```js
const panel = document.querySelector('[data-stage-view="overview"]');
const index = panel.querySelector(".overview-index");
const preview = panel.querySelector(".overview-preview");
const entries = [...panel.querySelectorAll(".overview-entry")];
({
  bodyOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  indexVisible: index.getBoundingClientRect().left >= 0 && index.getBoundingClientRect().right <= innerWidth,
  previewLoaded: preview.querySelector("img").complete && preview.querySelector("img").naturalWidth > 0,
  entryCount: entries.length,
  entriesVisible: entries.every((entry) => entry.getBoundingClientRect().width > 0 && entry.getBoundingClientRect().height > 0),
});
```

Expected: `bodyOverflow: 0`, `indexVisible: true`, `previewLoaded: true`, and all expected entries visible.

Click the preview and each category entry. Confirm the existing wipe runs, the hash changes to the requested category, the matching top tab is selected, and browser Back restores `#overview` without jumping to the top.

- [ ] **Step 3: Verify portrait and low-height landscape layouts**

Repeat the four pages at 320x568, 390x844, and 844x390. Capture screenshots and verify:

- At least one `.overview-entry` is fully visible without scrolling.
- `.overview-index` has `scrollWidth <= clientWidth`.
- `.overview-stage` and its descendants do not exceed the content viewport.
- The task rail does not cover the preview or entry strip.
- The representative image is visible before navigation.

- [ ] **Step 4: Verify regression-sensitive behavior**

Open one image category on NO.02 and NO.03, then verify gallery pagination and Lightbox open/close still work. Open NO.04 and verify no MP4 network request occurs while `#overview` is active; after starting one video and then another, the first video pauses.

- [ ] **Step 5: Run final verification and inspect the diff**

Run:

```powershell
node --check detail-stage.js
node --check click-stage.js
node --check script.js
Get-ChildItem tests -Filter *.test.js | Sort-Object Name | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
git diff --check
git status --short
git log -5 --oneline
```

Expected: syntax checks and tests pass, `git diff --check` is clean, and only intentional files are changed.

- [ ] **Step 6: Push the verified branch to GitHub Pages**

Run:

```powershell
git push origin HEAD:main
```

Expected: push succeeds and GitHub Pages starts deploying the new commit.

- [ ] **Step 7: Verify the production release**

Open `https://xzk123456-feat.github.io/xzk/website-design.html#overview` with a cache-busting query. Confirm:

- The stylesheet and scripts request `click-stage-12`.
- The new overview DOM is present on all four detail pages.
- Representative images load and entry clicks reach the expected hashes.
- Production has no horizontal overflow at 390x844 and 844x390.

Stop the local server after online verification.
