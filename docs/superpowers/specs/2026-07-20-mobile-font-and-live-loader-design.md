# Mobile Font And Live Loader Design

## Goal

Ensure every page reveals with the portfolio font already matched on mobile, and make the loading percentage visibly follow the settlement of current-page critical resources instead of jumping between fixed milestones.

## Root Causes

- `ZHYuwanPortfolio.woff2` is a static weight-400 font, while CSS declares it as a `400 900` variable range. Some mobile engines do not reliably match that static file for the requested 500, 700, and 800 weights.
- The loader explicitly requests only weight 800, so success does not prove that every critical UI weight can be matched.
- The current percentage has only five fixed values: 8, 38, 68, 92, and 100. Concurrent promise completion can update several values before the browser paints, which produces a visible 38-to-100 jump.

## Design

Declare separate static font faces for weights 400, 500, 700, and 800, all referencing the same cached WOFF2/TTF asset. The loader explicitly requests those four weights and waits for `document.fonts.ready` before font readiness is complete.

Represent loading as resource tasks. Stylesheets, critical font weights, and images within the current first-view range report settlement individually. Each settlement advances a confirmed target percentage. The displayed percentage eases toward that target on animation frames and is capped below 100 until all critical readiness promises settle. The existing watchdog remains an emergency release path, but normal completion reaches 100 only after the critical tasks settle.

Video files remain lazy-loaded and are excluded from the entry gate. Image failures count as settled so one unavailable decorative asset cannot permanently block navigation.

## Accessibility And Lifecycle

- Keep `aria-busy` and the existing page lock until dismissal.
- Keep the visible numeric percentage synchronized with the bar transform.
- Cancel progress animation frames and resource listeners when the run is invalidated or restored from the back-forward cache.
- Respect reduced motion by applying confirmed progress directly instead of animating between values.

## Verification

- Automated tests cover explicit static font weights, all critical font requests, incremental resource progress, no premature 100%, watchdog cleanup, and back-forward-cache re-entry.
- Run the complete loader test suite.
- Verify desktop and 390px mobile views against the local server, including computed font usage and visible progress changes.

