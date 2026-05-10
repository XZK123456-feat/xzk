# Website Gallery Thumbnail Redesign

## Scope

Redesign the thumbnail cards in `website-design.html` for the mobile and PC asset galleries. The chosen direction is "portfolio fusion": keep the real project screenshots as the main content, while borrowing the reference image's game UI language through dark device panels, item-slot framing, status chips, thick outlines, and snappy hover/click motion.

## Visual Design

- Keep the current comic portfolio system: heavy black strokes, yellow accents, halftone texture, and rounded panels.
- Change each `.detail-shot` from a bright plain card into a compact game-panel thumbnail:
  - a dark header/status strip with the existing item label;
  - a dark inset screenshot viewport with subtle grid/slot texture;
  - small UI badges or corner controls that reference the inventory-panel style without hiding the actual screenshot;
  - stronger depth using layered outlines and comic shadows.
- Treat mobile and PC thumbnails differently:
  - mobile cards should feel like a phone preview mounted inside a dark panel;
  - PC cards should feel like a widescreen terminal mounted inside the same panel system.

## Interaction

- Keep the existing lightbox behavior and `data-detail-preview` API.
- Add polished micro-interactions to thumbnail cards:
  - hover lift, slight tilt, stronger shadow, and image saturation;
  - keyboard focus styling equivalent to hover;
  - active press feedback;
  - a subtle animated scan/glint layer, disabled for reduced motion users.
- Improve the lightbox entrance so previewing a screenshot feels connected to the new thumbnail style.

## Accessibility And Responsiveness

- Preserve button semantics, current `aria-label` values, and click-to-preview behavior.
- Respect `prefers-reduced-motion`.
- Keep the gallery responsive:
  - desktop mobile-gallery remains multi-column;
  - desktop PC gallery remains wide-card oriented;
  - tablet and phone layouts collapse cleanly to one column without text or image overlap.

## Testing

- Extend `tests/structure.test.js` with checks for the new structural/style hooks:
  - detail thumbnail viewport wrappers;
  - status/header labels;
  - reduced-motion handling;
  - focus/active interaction styles.
- Run the structure test after implementation.
- Verify the detail page visually in the in-app browser at desktop and a narrow/mobile viewport if supported.
