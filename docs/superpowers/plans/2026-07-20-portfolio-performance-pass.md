# Portfolio Performance Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make first entry, media previews, playback, and repeat visits materially faster while preserving the current interface.

**Architecture:** Shrink blocking resources, narrow the loader to one priority image, deliver WebP variants through existing manifests, optimize MP4 streaming, and add a scoped runtime cache. Existing page and lightbox ownership boundaries remain intact.

**Tech Stack:** Static HTML/CSS/JavaScript, fontTools, Pillow/WebP, FFmpeg, Node.js tests, Service Worker API.

---

### Task 1: Critical Resource Tests

**Files:**
- Modify: `tests/page-loading-gate.test.js`
- Create: `tests/performance-assets.test.js`

- [ ] Assert production CSS and preload tags use subset font files within their byte budgets.
- [ ] Assert loader image preparation selects at most one priority image and has no blocking final sweep.
- [ ] Assert font and critical-image failure behavior remains deterministic.
- [ ] Run focused tests and confirm failure against the current resources.

### Task 2: Fonts And Loader

**Files:**
- Create: `assets/fonts/ZHYuwanPortfolio-subset.woff2`
- Create: `assets/fonts/AlibabaPuHuiTi-Bold-subset.woff2`
- Modify: `styles.css`
- Modify: `script.js`
- Modify: all five production HTML pages

- [ ] Generate deterministic subsets from all user-visible source text.
- [ ] Point CSS and preloads to subset WOFF2 files without TTF fallback.
- [ ] Replace multi-image/two-pass readiness with one post-font priority-image decode.
- [ ] Run the focused tests until green.

### Task 3: Image Delivery

**Files:**
- Create: `optimize_web_assets.py`
- Create: optimized WebP files beside referenced source assets
- Modify: production HTML, CSS, and gallery manifest JavaScript
- Modify: gallery tests

- [ ] Generate capped full-preview WebP files and responsive thumbnail/poster variants.
- [ ] Rewrite direct media references to optimized WebP files.
- [ ] Add `srcset`, `sizes`, width, and height to static and generated thumbnails.
- [ ] Verify every rewritten path exists and every lightbox opens its optimized preview.

### Task 4: Video And Runtime Cache

**Files:**
- Replace: seven referenced MP4 files
- Create: `sw.js`
- Modify: `script.js`
- Modify: all five production HTML pages
- Modify: `tests/performance-assets.test.js`

- [ ] Re-encode MP4 files with H.264/AAC, 720p, quality-preserving settings, and `faststart`.
- [ ] Assert each MP4 is within budget and has `moov` before `mdat`.
- [ ] Implement core precache, HTML network-first fallback, and non-video stale-while-revalidate caching.
- [ ] Register the service worker and bump resource versions.

### Task 5: Verify And Publish

**Files:**
- Verify all production pages and optimized assets

- [ ] Run all Node.js tests and `git diff --check`.
- [ ] Run local desktop/mobile browser checks for loader, fonts, previews, and video playback.
- [ ] Compare critical transfer sizes with the baseline.
- [ ] Commit, push to `main`, wait for GitHub Pages, and repeat the online mobile check.

