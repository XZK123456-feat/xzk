# Mobile Font And Live Loader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make mobile pages reveal with the portfolio font applied and show continuously updating, resource-backed loading progress.

**Architecture:** Keep the existing page-loader lifecycle and add a small progress controller that separates confirmed resource progress from displayed progress. Correct the static font metadata and make each critical font weight and first-view image report completion to that controller.

**Tech Stack:** Static HTML/CSS, vanilla JavaScript, Node.js test harness.

---

### Task 1: Lock Font Matching With Regression Tests

**Files:**
- Modify: `tests/page-loading-gate.test.js`
- Modify: `styles.css`
- Modify: `script.js`

- [ ] Add assertions that `ZHYuwanPortfolio` has explicit static 400, 500, 700, 800, and 900 faces and no ranged `400 900` descriptor.
- [ ] Add a loader test that records `document.fonts.load` calls and expects all five critical weights before `document.fonts.ready` is read.
- [ ] Run `node --test tests/page-loading-gate.test.js` and confirm the new assertions fail for the current single ranged face and single 800 request.
- [ ] Add the explicit static font faces and request all critical weights with `Promise.allSettled`.
- [ ] Re-run the focused test and confirm it passes.

### Task 2: Add Resource-Backed Progress Tests

**Files:**
- Modify: `tests/page-loading-gate.test.js`
- Modify: `script.js`

- [ ] Add a fake-frame test proving displayed progress advances through intermediate values while a resource stage is pending and remains below that stage cap.
- [ ] Add tests proving individual first-view image settlements advance the confirmed target and 100% is withheld until all critical resources settle.
- [ ] Add lifecycle assertions proving animation frames and timers are cancelled on watchdog completion and back-forward-cache re-entry.
- [ ] Run `node --test tests/page-loading-gate.test.js` and confirm the new progress tests fail against fixed milestone behavior.
- [ ] Implement a per-run progress controller, resource settlement callbacks, reduced-motion handling, and cleanup.
- [ ] Re-run the focused suite until all loader tests pass.

### Task 3: Verify And Publish

**Files:**
- Verify: `index.html`, `community-creatives.html`, `ad-creatives.html`, `website-design.html`, `video-design.html`

- [ ] Run the repository's complete automated test command and confirm zero failures.
- [ ] Start a local static server and inspect desktop plus 390x844 mobile views in the in-app browser.
- [ ] Confirm the loader shows intermediate percentages, the content is hidden until critical font readiness, and computed typography uses `ZHYuwanPortfolio` at representative weights.
- [ ] Review `git diff --check` and the final diff for unrelated changes.
- [ ] Commit the implementation, push the current branch to `main`, and verify the GitHub Pages deployment serves the new commit.
