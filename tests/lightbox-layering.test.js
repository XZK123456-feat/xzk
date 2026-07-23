const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8").replace(/\r\n/g, "\n");
const stageStyles = fs.readFileSync(path.join(root, "click-stage.css"), "utf8").replace(/\r\n/g, "\n");

const lightboxMatch = styles.match(/\.website-lightbox\s*\{[^}]*z-index:\s*(\d+);/);
const railMatch = stageStyles.match(/body\.stage-ready \[data-task-rail\]\s*\{[^}]*z-index:\s*(\d+);/);

assert.ok(lightboxMatch, "Lightbox should define an explicit stacking level");
assert.ok(railMatch, "the task rail should define an explicit stacking level");
assert.ok(
  Number(lightboxMatch[1]) > Number(railMatch[1]),
  "an open Lightbox must cover the fixed task rail and all background controls",
);

console.log("lightbox stacking check passed");
