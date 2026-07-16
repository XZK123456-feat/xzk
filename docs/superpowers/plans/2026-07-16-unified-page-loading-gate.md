# Unified Page Loading Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a minimal black-and-yellow progress gate to every portfolio page so fonts and first-view resources are ready before the existing interface is revealed.

**Architecture:** All five HTML documents receive the same immediately available loader markup and loading state classes. `styles.css` owns the complete responsive visual treatment, while `script.js` owns one idempotent controller that tracks stylesheet, font, and first-view image readiness, enforces minimum and maximum durations, and re-arms on back-forward cache restoration.

**Tech Stack:** Static HTML5, CSS, browser Font Loading API, vanilla JavaScript promises/events, Node `assert` regression tests.

---

## File Map

- Create `tests/page-loading-gate.test.js`: structural and behavioral regression contract for the loader.
- Modify `index.html`: homepage loading state and loader markup.
- Modify `website-design.html`: NO.1 loading state and loader markup.
- Modify `ua-creatives.html`: NO.2 loading state and loader markup.
- Modify `community-creatives.html`: NO.3 loading state and loader markup.
- Modify `video-design.html`: NO.4 loading state and loader markup.
- Modify `styles.css`: shared loader visuals, exit state, responsive sizing, and reduced-motion behavior.
- Modify `script.js`: resource readiness, monotonic progress, timeout release, and back-forward cache handling.

### Task 1: Lock The Loading Contract With A Failing Test

**Files:**
- Create: `tests/page-loading-gate.test.js`

- [ ] **Step 1: Write the failing test**

Create a Node assertion test that reads the five HTML files plus `styles.css` and `script.js`. Use these contracts:

```js
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const pages = [
  "index.html",
  "website-design.html",
  "ua-creatives.html",
  "community-creatives.html",
  "video-design.html",
];
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  assert.ok(html.includes("is-page-loading"), `${page} should start in the loading state`);
  assert.ok(html.includes('class="page-loader"'), `${page} should include the loading gate`);
  assert.ok(html.includes('data-loader-critical'), `${page} should include critical loader CSS before the external stylesheet`);
  assert.ok(html.includes('role="status"'), `${page} loader should expose status semantics`);
  assert.ok(html.includes('data-loading-percent'), `${page} should expose the visual percentage`);
  assert.ok(html.indexOf('class="page-loader"') < html.indexOf('class="page-shell"'), `${page} loader should precede visible page content`);
}

[
  ".page-loader",
  ".page-loader__track",
  ".page-loader__fill",
  ".page-loader__meta",
  "body.is-page-loading",
  "@media (max-width: 620px)",
  "@media (prefers-reduced-motion: reduce)",
].forEach((token) => assert.ok(css.includes(token), `styles should include ${token}`));

[
  "initPageLoader",
  "PAGE_LOADER_MIN_MS",
  "PAGE_LOADER_TIMEOUT_MS",
  "document.fonts.ready",
  "waitForFirstViewImages",
  "Promise.race",
  'window.addEventListener("pageshow"',
  "Math.max(currentProgress",
  'loader.setAttribute("aria-hidden", "true")',
].forEach((token) => assert.ok(script.includes(token), `loader script should include ${token}`));

assert.ok(script.includes('image.loading === "lazy"'), "lazy images must not block the loading gate");
assert.ok(fs.readFileSync(path.join(root, "video-design.html"), "utf8").includes('preload="none"'), "videos must remain lazy");

console.log("page loading gate checks passed");
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```powershell
node tests/page-loading-gate.test.js
```

Expected: FAIL because the current online baseline has no `is-page-loading` class or `.page-loader` markup.

### Task 2: Add The Static Loader To All Five Pages

**Files:**
- Modify: `index.html`
- Modify: `website-design.html`
- Modify: `ua-creatives.html`
- Modify: `community-creatives.html`
- Modify: `video-design.html`
- Test: `tests/page-loading-gate.test.js`

- [ ] **Step 1: Add the loading state to every document**

Change the opening tags to include the same initial state while preserving existing body classes:

```html
<html lang="zh-CN" class="is-page-loading">
```

Homepage:

```html
<body class="is-page-loading">
```

Detail pages:

```html
<body class="detail-page is-page-loading">
```

- [ ] **Step 2: Add the critical loader cover before the external stylesheet**

Insert this exact block in each `<head>` before the `styles.css` link so an unfinished interface can never paint while shared CSS is in transit:

```html
<style data-loader-critical>
  html.is-page-loading,
  body.is-page-loading { overflow: hidden; }
  .page-loader {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: grid;
    place-items: center;
    color: #fff;
    background: #111;
  }
</style>
```

- [ ] **Step 3: Insert identical loader markup as the first body child**

```html
<div class="page-loader" role="status" aria-label="页面正在加载">
  <div class="page-loader__inner">
    <strong class="page-loader__brand">ZK.PORTFOLIO</strong>
    <div class="page-loader__track" aria-hidden="true">
      <span class="page-loader__fill"></span>
    </div>
    <div class="page-loader__meta" aria-hidden="true">
      <span>LOADING</span>
      <span data-loading-percent>08%</span>
    </div>
  </div>
</div>
```

- [ ] **Step 4: Run the test and confirm it still fails for missing CSS/JS**

Run `node tests/page-loading-gate.test.js`.

Expected: FAIL on the first missing `.page-loader` CSS or `initPageLoader` JavaScript assertion, proving the HTML portion now satisfies its contract.

### Task 3: Implement The Responsive Loader Visuals

**Files:**
- Modify: `styles.css`
- Test: `tests/page-loading-gate.test.js`

- [ ] **Step 1: Add shared loader styles near the global base styles**

Implement these states and dimensions:

```css
html.is-page-loading,
body.is-page-loading {
  overflow: hidden;
}

.page-loader {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  color: #fff;
  background: #111;
  opacity: 1;
  visibility: visible;
  transition: opacity 400ms ease, visibility 0s linear 400ms;
}

.page-loader[aria-hidden="true"] {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.page-loader__inner {
  width: min(320px, calc(100vw - 56px));
}

.page-loader__brand {
  display: block;
  margin-bottom: 22px;
  font-family: Impact, "Microsoft YaHei", sans-serif;
  font-size: 24px;
  line-height: 1;
  text-align: center;
}

.page-loader__track {
  height: 5px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.18);
}

.page-loader__fill {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--yellow);
  transform: scaleX(0.08);
  transform-origin: left center;
  transition: transform 180ms ease-out;
}

.page-loader__meta {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.66);
  font-family: "Microsoft YaHei", sans-serif;
  font-size: 11px;
  font-weight: 800;
}
```

Add a `max-width: 620px` override that reduces the inner width and brand to 21 px. Extend the existing reduced-motion block so the loader has no animated fade and the fill has no transition.

- [ ] **Step 2: Run the test and verify the remaining failure is JavaScript-only**

Run `node tests/page-loading-gate.test.js`.

Expected: FAIL on `initPageLoader` while all HTML and CSS assertions pass.

### Task 4: Implement Readiness Tracking And Dismissal

**Files:**
- Modify: `script.js`
- Test: `tests/page-loading-gate.test.js`

- [ ] **Step 1: Add the shared controller before unrelated page interactions**

Define constants `PAGE_LOADER_MIN_MS = 350` and `PAGE_LOADER_TIMEOUT_MS = 5000`. Implement:

```js
function waitForStylesheets() {
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  return Promise.allSettled(links.map((link) => {
    if (link.sheet) return Promise.resolve();
    return new Promise((resolve) => {
      link.addEventListener("load", resolve, { once: true });
      link.addEventListener("error", resolve, { once: true });
    });
  }));
}

function waitForFirstViewImages() {
  const limit = window.innerHeight * 1.25;
  const images = Array.from(document.images).filter((image) => {
    if (image.loading === "lazy") return false;
    const rect = image.getBoundingClientRect();
    return rect.top < limit && rect.bottom > 0;
  });

  return Promise.allSettled(images.map((image) => {
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  }));
}
```

`initPageLoader()` must reset the visible state, track a local `currentProgress`, and update both the fill transform and `data-loading-percent`. Set progress with `Math.max(currentProgress, nextProgress)` so it never moves backward.

Track stylesheet, font, and first-view image promises as weighted milestones. Race their combined settlement against the five-second timeout. After the race, wait for the remaining part of the 350 ms minimum, set 100 percent, mark the loader `aria-hidden="true"`, and remove `is-page-loading` from both root elements.

Use `document.fonts ? document.fonts.ready.catch(() => undefined) : Promise.resolve()` so unsupported or failed font APIs cannot trap the page. Guard initialization so repeated calls cancel the prior timeout and do not retain obsolete completion callbacks.

- [ ] **Step 2: Re-arm on back-forward cache restoration**

```js
window.addEventListener("pageshow", (event) => {
  if (event.persisted) initPageLoader();
});
```

Call `initPageLoader()` once during normal script startup.

- [ ] **Step 3: Run the loading gate test and verify GREEN**

Run `node tests/page-loading-gate.test.js`.

Expected: `page loading gate checks passed`.

- [ ] **Step 4: Run the full Node suite**

```powershell
Get-ChildItem tests -Filter '*.test.js' | Sort-Object Name | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
```

Expected: all nine test files exit successfully.

- [ ] **Step 5: Commit the feature**

```powershell
git add index.html website-design.html ua-creatives.html community-creatives.html video-design.html styles.css script.js tests/page-loading-gate.test.js
git commit -m "feat: add unified page loading gate"
```

### Task 5: Browser Verification

**Files:**
- Verify: all five HTML pages

- [ ] **Step 1: Start a static server from the isolated worktree**

```powershell
python -m http.server 8768 --bind 127.0.0.1
```

Expected: pages are available at `http://127.0.0.1:8768/`.

- [ ] **Step 2: Verify desktop behavior**

Open each page at a desktop viewport. Reload and confirm the loader fully covers the page, progress only advances, percentage reaches 100, the gate fades out, scrolling returns, and no console errors appear.

- [ ] **Step 3: Verify mobile behavior**

Repeat at a 390 x 844 viewport. Confirm the brand, progress line, and percentage remain centered and within the viewport, and the underlying UI never flashes through.

- [ ] **Step 4: Verify navigation and restoration**

Navigate from the homepage to a detail page, then use browser Back. Confirm each page entry shows the loader, cached transitions remain brief, and the restored scroll position does not jump.

- [ ] **Step 5: Verify lazy media remains lazy**

On `video-design.html`, confirm video requests do not begin before play. On gallery pages, confirm offscreen lazy thumbnails do not block loader dismissal.

- [ ] **Step 6: Record final repository state**

Run:

```powershell
git status --short
git log -2 --oneline
```

Expected: clean working tree with the loading gate feature commit above the design/specification commits. Do not push or publish.
