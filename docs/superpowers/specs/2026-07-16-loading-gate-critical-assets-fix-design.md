# Loading Gate Critical Assets Fix Design

## Problem

The loading gate can reach 100 percent and reveal the portfolio before the visible interface has finished applying its custom font or decoding its first-view images. The current controller waits for `document.fonts.ready`, but it does not explicitly request the font used by the hidden page shell. It also excludes every `loading="lazy"` image, including lazy images that are already inside the initial viewport.

## Desired Behavior

When the loading gate finishes, the visitor's current viewport must already have stable typography and decoded images. Images outside the current viewport remain lazy and may load later as the visitor scrolls.

## Font Readiness

- Explicitly request the visible portfolio font through `document.fonts.load()` before relying on `document.fonts.ready`.
- Load `ZHYuwanPortfolio` at the body weight used by the interface and provide representative Chinese text so the required glyphs are requested.
- Treat unsupported Font Loading APIs or rejected font promises as settled failures so the page cannot remain trapped.
- Do not preload the 5.5 MB `Alibaba PuHuiTi` file on every page because it is only used inside the closed resume modal and is not part of the initial viewport.

## First-View Image Readiness

- Select images whose layout boxes intersect the viewport or a small buffer below it.
- Include visible images even when their HTML uses `loading="lazy"`.
- Promote only those selected visible images to eager loading for the current entry.
- Wait for both network settlement and `HTMLImageElement.decode()` when supported.
- Treat image errors and decode rejection as settled failures.
- Preserve lazy loading for all images outside the first-view boundary.

## Timing And Failure Handling

- Keep the existing minimum loading duration and 400 ms exit fade.
- Increase the controller timeout from 5 seconds to 12 seconds so normal font and first-view image requests are not prematurely released on slower GitHub Pages connections.
- Move the independent HTML watchdog to slightly after the controller timeout so it remains a last-resort fail-open path.
- A timeout remains an exceptional fallback; successful loads must not reveal the page until explicit font readiness and first-view image decode have settled.
- The existing BFCache, reduced-motion, scroll-lock, and watchdog cleanup behavior remains unchanged.

## Progress

- Stylesheet readiness advances the first milestone.
- Explicit font readiness advances the font milestone.
- First-view image load and decode readiness advances the image milestone.
- Progress remains monotonic and reaches 100 percent only when all critical milestones settle or the safety timeout fires.

## Testing

Extend `tests/page-loading-gate.test.js` before production changes. Tests must prove:

- The controller calls `document.fonts.load()` for `ZHYuwanPortfolio` before awaiting `document.fonts.ready`.
- A lazy image inside the first-view boundary participates in readiness and decode.
- A lazy image outside the boundary remains untouched and does not block.
- Decode rejection settles safely.
- The controller and watchdog use the updated timeout values.
- Existing BFCache, fade, watchdog, lazy video, and full repository tests continue to pass.

Perform browser verification on the deployed-style local server at desktop and mobile widths. Capture the loading moment and confirm that the first revealed frame already uses the final font and decoded first-view images.

## Out Of Scope

- Eager loading every gallery image.
- Preloading videos.
- Preloading the resume-only Alibaba font on every page.
- Redesigning the loading gate or other portfolio UI.
