# Portfolio Performance Pass Design

## Goal

Reduce first-entry waiting time, gallery preview latency, video startup latency, and repeat-navigation cost without changing the portfolio's visual layout or adding an original-PNG viewing path.

## Critical Path

The entry gate waits for the stylesheet, the subsetted portfolio font, DOM layout, and at most one visible priority image. It no longer waits for every image in the first 1.5 viewports or performs a second blocking media sweep. Remaining images keep lazy loading and receive their existing progressive loaded state after entry.

The five CSS weight aliases continue to point at one static font asset. The portfolio font and resume font are subsetted from all user-visible text in the HTML, CSS, and JavaScript sources. The original font files remain as source artifacts but are not requested by production pages.

## Images

Every referenced PNG or JPEG portfolio asset receives a high-quality WebP delivery copy. Full previews are capped at 2560 pixels on their longest edge and encoded at quality 90. Thumbnail and poster delivery copies are capped at 960 pixels and encoded at quality 84, with a 480-pixel candidate when the source is large enough. Page and manifest references point directly to WebP; no original-PNG button or alternate preview route is added.

Generated and static thumbnail markup uses `srcset`, `sizes`, intrinsic dimensions, lazy loading, and async decoding. Lightbox images continue to use the selected optimized full preview.

## Video

All seven MP4 files remain H.264/AAC and `preload="none"`. They are re-encoded at high-quality 720p settings with a target maximum near 8MB and written with `faststart` so metadata is available before the full file downloads. Existing play and single-active-video behavior is unchanged.

## Repeat Visits

A scoped service worker precaches versioned HTML shell resources, CSS, JavaScript, and subset fonts. Same-origin fonts, scripts, styles, and viewed images use stale-while-revalidate caching; HTML uses network-first with a cached fallback. Video responses are left to normal HTTP range handling and are not stored by the service worker.

## Verification

Automated tests assert subset font references and size budgets, one-image loader gating, optimized image references and files, responsive thumbnail metadata, MP4 size/faststart checks, service-worker registration and strategy, and cache-busted asset versions. Browser verification covers homepage and each detail page at desktop and 390px mobile widths, including broken-resource checks, font readiness, loader completion, lightbox previews, and video startup.

