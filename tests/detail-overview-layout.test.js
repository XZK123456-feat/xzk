const assert = require("node:assert/strict");
const fs = require("node:fs");

const css = fs.readFileSync("click-stage.css", "utf8");

assert.match(
  css,
  /\.overview-stage\s*\{[^}]*display:\s*grid;[^}]*grid-template-areas:\s*"identity preview"\s*"entries entries";/s,
  "desktop overview should use identity, preview, and full-width entry areas",
);
assert.match(
  css,
  /\.overview-preview\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9;[^}]*overflow:\s*hidden;/s,
  "the representative preview should reserve a stable frame",
);
assert.match(
  css,
  /\.overview-preview img\s*\{[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*object-fit:\s*cover;/s,
  "representative images should cover their frame without layout shifts",
);
assert.match(css, /\.overview-entry-strip\s*\{[^}]*display:\s*grid;/s, "category entries should use a stable grid");
assert.match(css, /\.overview-entry:focus-visible[\s\S]*?outline:/s, "category entries need a visible keyboard focus");
assert.match(
  css,
  /@media \(max-width:\s*760px\)[\s\S]*?grid-template-areas:\s*"identity"\s*"preview"\s*"entries";/s,
  "portrait mobile should stack identity, preview, and entries",
);
assert.match(
  css,
  /@media \(max-height:\s*540px\) and \(orientation:\s*landscape\)[\s\S]*?grid-template-areas:\s*"identity preview entries";/s,
  "low-height landscape should use three columns",
);
assert.ok(
  !css.includes('[data-stage-view="overview"] .detail-ticket'),
  "enhanced overview CSS must not position a detached ticket",
);

console.log("Detail overview layout tests passed.");
