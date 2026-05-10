# Website Gallery Thumbnails Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the website detail page mobile and PC thumbnail cards into a portfolio-fused game UI panel style.

**Architecture:** Keep the existing static HTML/CSS/JS structure and the existing `data-detail-preview` lightbox API. Add explicit thumbnail chrome wrappers in `website-design.html`, style them in the existing detail-page section of `styles.css`, and make the lightbox caption lookup class-based in `website-design.js`.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node-based structure tests.

---

### Task 1: Add Failing Redesign Test

**Files:**
- Create: `tests/detail-gallery-redesign.test.js`

- [ ] **Step 1: Write the failing test**

```js
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "website-design.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "website-design.js"), "utf8");

assert.ok(html.includes("detail-shot-label"), "thumbnail labels should use a dedicated status label hook");
assert.ok(html.includes("detail-shot-frame"), "thumbnails should wrap screenshots in a dark game-panel frame");
assert.ok(html.includes("detail-shot-glass"), "screenshots should sit inside an inset viewport layer");
assert.ok(html.includes("detail-shot-ui"), "thumbnails should include decorative UI controls inspired by the reference");
assert.ok(css.includes(".detail-shot-frame"), "frame layer should be styled");
assert.ok(css.includes(".detail-shot-glass"), "viewport layer should be styled");
assert.ok(css.includes(".detail-shot-ui"), "decorative UI controls should be styled");
assert.ok(css.includes(".detail-shot:focus-visible"), "keyboard focus should get the same polished affordance as hover");
assert.ok(css.includes(".detail-shot:active"), "thumbnail press feedback should be styled");
assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"), "thumbnail motion should respect reduced motion");
assert.ok(css.includes("@keyframes detailScanline"), "thumbnail cards should include a subtle scanline/glint motion");
assert.ok(js.includes(".detail-shot-label"), "lightbox captions should read the dedicated label instead of the first span");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node .\tests\detail-gallery-redesign.test.js`

Expected: FAIL with "thumbnail labels should use a dedicated status label hook".

### Task 2: Add Thumbnail Chrome Markup

**Files:**
- Modify: `website-design.html`

- [ ] **Step 1: Wrap each screenshot**

For every `.detail-shot`, change the body from:

```html
<span>移动端 01</span>
<img src="assets/website-design/mobile/移动端%20(1).png" alt="移动端官网视觉 01" loading="lazy" />
```

to:

```html
<span class="detail-shot-label">移动端 01</span>
<span class="detail-shot-frame" aria-hidden="true">
  <span class="detail-shot-glass">
    <img src="assets/website-design/mobile/移动端%20(1).png" alt="移动端官网视觉 01" loading="lazy" />
  </span>
  <span class="detail-shot-ui" aria-hidden="true">
    <i></i>
    <i></i>
    <i></i>
  </span>
</span>
```

Repeat the same structure for all mobile and PC thumbnails, preserving existing image `src`, `alt`, `loading`, button classes, and `aria-label` values.

### Task 3: Style The Game-Panel Thumbnail System

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Replace the `.detail-shot` block**

Style `.detail-shot` as a dark outlined game panel with yellow status label, inset viewport, small UI controls, hover/focus lift, active press feedback, and scanline/glint animation.

- [ ] **Step 2: Add responsive and reduced-motion support**

Keep existing one-column media behavior. Add reduced motion rules that disable scanline animation and remove hover tilt while preserving readable focus states.

### Task 4: Keep Lightbox Caption Stable

**Files:**
- Modify: `website-design.js`

- [ ] **Step 1: Use the dedicated label hook**

Change:

```js
lightboxCaption.textContent = button.querySelector("span")?.textContent || image.alt;
```

to:

```js
lightboxCaption.textContent = button.querySelector(".detail-shot-label")?.textContent || image.alt;
```

### Task 5: Verify And Fix Baseline Structure Test

**Files:**
- Modify if needed: `styles.css`

- [ ] **Step 1: Run the redesign test**

Run: `node .\tests\detail-gallery-redesign.test.js`

Expected: PASS.

- [ ] **Step 2: Run the existing structure test**

Run: `node .\tests\structure.test.js`

Expected: PASS. If it fails on the existing channel-name font assertion, adjust the relevant `dd:first-of-type` CSS block to include `font-family: "ZHYuwanPortfolio", "Microsoft YaHei", "PingFang SC", sans-serif;`.

- [ ] **Step 3: Browser verify**

Reload `http://127.0.0.1:5500/website-design.html`, inspect the mobile and PC galleries, open one thumbnail in the lightbox, and confirm there are no console errors.
