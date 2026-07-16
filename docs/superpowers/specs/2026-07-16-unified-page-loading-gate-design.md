# Unified Page Loading Gate Design

## Goal

Add a restrained loading gate to the current GitHub Pages baseline so partially loaded fonts and interface elements never appear before the portfolio is visually ready. The gate must appear whenever the visitor enters the homepage or any of the four detail pages.

## Pages In Scope

- `index.html`
- `website-design.html`
- `ua-creatives.html`
- `community-creatives.html`
- `video-design.html`

## Visual Direction

Use the selected **Option A: Minimal Brand Line** treatment:

- Full-viewport dark background.
- Centered `ZK.PORTFOLIO` wordmark.
- Thin yellow progress bar.
- Small `LOADING` label and numeric percentage.
- Black, white, and existing portfolio yellow only.
- No illustrations, secondary panels, decorative particles, explanatory copy, or heavy animation.

The loading gate must visually match the portfolio while remaining quieter than the work itself. Its dimensions must remain stable on desktop and mobile.

## Rendering Strategy

Each page will contain the loader markup at the beginning of `<body>`. A small critical loader style block will be placed in `<head>` before the external stylesheet so the loader renders correctly even while `styles.css` is still in transit.

The page starts in a loading state that:

- Fixes the loader above all page content.
- Locks document scrolling without changing the saved scroll position.
- Prevents unfinished UI and fallback typography from becoming visible.

Shared behavior will live in `script.js`; page-specific scripts remain unchanged unless verification exposes a conflict.

## Resource Readiness

The loader represents resources needed for the current page's first useful view:

1. Parsed document structure.
2. Applied external stylesheet.
3. Portfolio font readiness through the Font Loading API when available.
4. Images in or immediately near the initial viewport.

Lazy gallery images and every video file are explicitly excluded. Existing image and video lazy-loading behavior must remain intact.

Failed images or font requests settle their step instead of blocking forever. A hard timeout of approximately five seconds releases the page even if a browser API or resource does not settle.

## Progress Behavior

Progress is deterministic and monotonic rather than a fabricated timer:

- Initial HTML state starts above zero.
- Document, stylesheet, font, and first-view image readiness advance weighted milestones.
- Percentage never moves backward.
- Completion reaches 100 percent before dismissal.

The gate remains visible for at least approximately 350 ms to avoid a single-frame flash on cached visits. After completion it fades out over approximately 400 ms, then becomes non-rendering and releases the scroll lock.

The `pageshow` event handles restored back-forward cache entries so returning to a page also receives a brief cached loading transition, matching the requirement that every page entry shows the gate.

## Accessibility And Motion

- Use `role="status"` with a concise accessible label.
- Keep the loader non-interactive and outside the tab order.
- Update the percentage without repeatedly announcing every incremental change.
- Apply `aria-hidden="true"` after dismissal.
- Respect `prefers-reduced-motion`; skip or shorten the fade while preserving correct state changes.
- Maintain sufficient contrast between yellow, white, and the dark background.

## Failure Handling

- No individual image, font, stylesheet, or optional browser API may trap the visitor.
- Browsers without `document.fonts` treat the font step as settled.
- If `script.js` is delayed, the critical loader remains styled and continues hiding unfinished content.
- The hard timeout always completes the transition and restores scrolling.
- Repeated initialization must be idempotent and must not add duplicate listeners or timers.

## Testing

Add a Node-based regression test covering all five pages and the shared assets. It will assert:

- Every page includes the critical loader class and accessible loader markup before visible page content.
- Every page includes the shared stylesheet and shared script.
- Critical CSS covers fixed positioning, stacking, stable progress dimensions, loading scroll lock, completion state, mobile sizing, and reduced motion.
- Shared JavaScript includes readiness tracking, monotonic progress, minimum duration, timeout release, `pageshow` handling, and final cleanup.
- Existing lazy video and lazy gallery contracts remain present.

Run the complete existing Node test suite after implementation. Perform browser verification at desktop and mobile widths, including an uncached or delayed-resource pass, to confirm the loader fully covers unfinished UI, exits correctly, and does not cause layout or scroll jumps.

## Out Of Scope

- Preloading or downloading every portfolio image.
- Preloading video files.
- Redesigning existing page content or navigation.
- Adding a loading logo animation, sound, background art, or multiple loading screens.
- Publishing or pushing the branch to GitHub.
