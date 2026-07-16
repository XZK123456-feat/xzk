# Loading Gate Critical Assets Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the loading gate does not reveal the current viewport until the portfolio font is explicitly loaded and visible images are downloaded and decoded.

**Architecture:** Extend the existing shared loader controller with explicit font loading and first-view image decode readiness. Preserve lazy loading outside the viewport, retain the existing fail-open architecture, and update the independent watchdog consistently across all five HTML pages.

**Tech Stack:** Static HTML, CSS Font Loading API, `HTMLImageElement.decode()`, vanilla JavaScript promises, Node `assert` and VM-based behavior tests.

---

## File Map

- Modify `tests/page-loading-gate.test.js`: add red/green behavior coverage for explicit fonts, visible lazy images, decode, and timing.
- Modify `script.js`: explicit font request, first-view image promotion and decode, 12-second controller timeout.
- Modify `index.html`: 12.25-second independent watchdog.
- Modify `website-design.html`: 12.25-second independent watchdog.
- Modify `ua-creatives.html`: 12.25-second independent watchdog.
- Modify `community-creatives.html`: 12.25-second independent watchdog.
- Modify `video-design.html`: 12.25-second independent watchdog.

### Task 1: Reproduce The Premature Reveal With Failing Tests

**Files:**
- Modify: `tests/page-loading-gate.test.js`

- [ ] **Step 1: Extend the test harness for font and image decode observations**

Allow `createResource()` images to expose a supplied `decode()` function. Supply a `document.fonts` object with both `load()` and `ready` in the new test. Record the descriptor and sample text passed to `load()`.

- [ ] **Step 2: Add a failing critical-assets behavior test**

Add a test equivalent to:

```js
async function testExplicitFontAndVisibleImageDecode() {
  const fontLoad = deferred();
  const fontsReady = deferred();
  const imageDecode = deferred();
  const fontCalls = [];
  let visibleDecodeCalls = 0;
  let farDecodeCalls = 0;
  const visibleLazyImage = createResource({
    complete: true,
    loading: "lazy",
    rect: { top: 40, bottom: 340 },
    decode: () => {
      visibleDecodeCalls += 1;
      return imageDecode.promise;
    },
  });
  const farLazyImage = createResource({
    complete: true,
    loading: "lazy",
    rect: { top: 2200, bottom: 2500 },
    decode: () => {
      farDecodeCalls += 1;
      return Promise.resolve();
    },
  });
  const harness = createLoaderHarness({
    fonts: {
      load: (descriptor, sample) => {
        fontCalls.push({ descriptor, sample });
        return fontLoad.promise;
      },
      ready: fontsReady.promise,
    },
    images: [visibleLazyImage, farLazyImage],
    stylesheets: [createResource({ sheet: {} })],
  });

  await flushMicrotasks();
  assert.equal(fontCalls.length, 1, "loader should explicitly request the portfolio font");
  assert.match(fontCalls[0].descriptor, /ZHYuwanPortfolio/, "loader should request the visible body font");
  assert.ok(fontCalls[0].sample.includes("肖子康"), "font request should include representative Chinese glyphs");
  assert.equal(visibleLazyImage.loading, "eager", "visible lazy image should be promoted for the current entry");
  assert.equal(visibleDecodeCalls, 1, "visible image should be decoded before reveal");
  assert.equal(farLazyImage.loading, "lazy", "offscreen image should stay lazy");
  assert.equal(farDecodeCalls, 0, "offscreen image should not block reveal");

  fontLoad.resolve();
  fontsReady.resolve();
  await flushMicrotasks();
  await advance(harness, 350);
  assert.equal(harness.loader.getAttribute("aria-hidden"), null, "decode should still block dismissal");
  imageDecode.resolve();
  await flushMicrotasks();
  assert.equal(harness.percent.textContent, "100%", "decoded first view should complete progress");
}
```

- [ ] **Step 3: Add decode rejection and timeout assertions**

Add a test with a visible complete image whose `decode()` rejects and assert the loader still settles. Update static timing assertions to require `PAGE_LOADER_TIMEOUT_MS = 12000` and every HTML watchdog to use `12250`.

- [ ] **Step 4: Run RED**

Run:

```powershell
node tests/page-loading-gate.test.js
```

Expected: FAIL because `document.fonts.load()` is never called and visible lazy images are currently excluded.

### Task 2: Wait For Explicit Fonts And Decoded First-View Images

**Files:**
- Modify: `script.js`
- Modify: `index.html`
- Modify: `website-design.html`
- Modify: `ua-creatives.html`
- Modify: `community-creatives.html`
- Modify: `video-design.html`
- Test: `tests/page-loading-gate.test.js`

- [ ] **Step 1: Add explicit font readiness**

Add this shared function before `initPageLoader()`:

```js
function waitForPortfolioFonts() {
  if (!document.fonts || typeof document.fonts.load !== "function") {
    return Promise.resolve();
  }

  const request = Promise.resolve()
    .then(() => document.fonts.load('800 16px "ZHYuwanPortfolio"', "肖子康作品集 目录 数据"))
    .catch(() => undefined);

  return request.then(() => document.fonts.ready.catch(() => undefined));
}
```

Replace the existing `document.fonts.ready` expression in `initPageLoader()` with `waitForPortfolioFonts()`.

- [ ] **Step 2: Wait for visible image decode**

Replace the blanket lazy exclusion in `waitForFirstViewImages()` with boundary-first selection. For each selected image:

```js
if (image.loading === "lazy") {
  image.loading = "eager";
}

const loaded = image.complete
  ? Promise.resolve()
  : waitForResourceSettlement(image, run);

return loaded.then(() => {
  if (typeof image.decode !== "function") return undefined;
  return image.decode().catch(() => undefined);
});
```

Keep images whose top is beyond `window.innerHeight * 1.25` outside the selected set so they remain lazy.

- [ ] **Step 3: Update timeout constants**

Change:

```js
const PAGE_LOADER_TIMEOUT_MS = 12000;
```

In all five HTML watchdog blocks change:

```js
window.__pageLoaderWatchdogTimer = window.setTimeout(failOpen, 12250);
```

- [ ] **Step 4: Run GREEN and full regression**

Run:

```powershell
node tests/page-loading-gate.test.js
Get-ChildItem tests -Filter '*.test.js' | Sort-Object Name | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
git diff --check
```

Expected: all nine behavior/structure test files pass and the diff check is clean.

- [ ] **Step 5: Commit**

```powershell
git add script.js index.html website-design.html ua-creatives.html community-creatives.html video-design.html tests/page-loading-gate.test.js
git commit -m "fix: wait for visible fonts and images"
```

### Task 3: Browser And Deployment Verification

**Files:**
- Verify all five HTML pages and `script.js`.

- [ ] **Step 1: Run the local server and capture loading states**

Open `http://127.0.0.1:8768/index.html` and at least one image detail page. Confirm the loading gate remains until the final font is active and first-view images have decoded.

- [ ] **Step 2: Verify desktop and mobile**

At desktop and 390 x 844 viewports, confirm the first frame after dismissal already uses the final typography, visible images do not pop in, and offscreen galleries remain lazy.

- [ ] **Step 3: Verify no regression in exceptional paths**

Confirm reduced-motion, BFCache return, 12-second controller timeout, 12.25-second watchdog, scroll lock, and video `preload="none"` remain intact.

- [ ] **Step 4: Push only after local verification**

Fetch `origin/main`, confirm the branch remains a fast-forward, then push `HEAD:main`. Verify the deployed GitHub Pages HTML contains watchdog `12250` and the deployed `script.js` contains `waitForPortfolioFonts`, `image.decode`, and `PAGE_LOADER_TIMEOUT_MS = 12000`.
