const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8").replace(/\r\n/g, "\n");
const stageStyles = fs.readFileSync(path.join(root, "click-stage.css"), "utf8").replace(/\r\n/g, "\n");

const lightboxMatch = styles.match(/\.website-lightbox\s*\{[^}]*z-index:\s*(\d+);/);
const railMatch = stageStyles.match(/body\.stage-ready \[data-task-rail\]\s*\{[^}]*z-index:\s*(\d+);/);
const compactLightboxMatch = styles.match(
  /@media \(max-width:\s*860px\)\s*\{([\s\S]*?)\n\}/,
);

assert.ok(lightboxMatch, "Lightbox should define an explicit stacking level");
assert.ok(railMatch, "the task rail should define an explicit stacking level");
assert.ok(
  Number(lightboxMatch[1]) > Number(railMatch[1]),
  "an open Lightbox must cover the fixed task rail and all background controls",
);
assert.ok(compactLightboxMatch, "Lightbox should define a compact viewport breakpoint");
assert.match(
  compactLightboxMatch[1],
  /\.website-lightbox\s*\{[^}]*padding-inline:\s*20px;[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/,
  "the compact Lightbox must expose a shrinkable content track inside its padding",
);
assert.match(
  compactLightboxMatch[1],
  /\.website-lightbox figure\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*100%;[^}]*min-width:\s*0;/,
  "621-860px Lightbox figures must use the available grid width instead of viewport units",
);
assert.match(
  compactLightboxMatch[1],
  /\.lightbox-strip\s*\{[^}]*max-width:\s*100%;[^}]*min-width:\s*0;/,
  "the thumbnail strip must not expand the compact Lightbox figure",
);

console.log("lightbox stacking check passed");
