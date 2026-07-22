const fs = require("fs");
const path = require("path");
const assert = require("assert");

const css = fs.readFileSync(path.resolve(__dirname, "..", "styles.css"), "utf8").replace(/\r\n/g, "\n");

assert.match(
  css,
  /@media \(min-width:\s*1101px\) and \(max-width:\s*1320px\)[\s\S]*?\.topbar\s*{[\s\S]*?padding:\s*0 24px;[\s\S]*?\.brand-pill\s*{[\s\S]*?min-width:\s*240px;[\s\S]*?\.nav-pill\s*{[\s\S]*?min-width:\s*100px;/,
  "mid-size desktop should use a compact topbar that stays inside the viewport",
);

console.log("responsive topbar checks passed");
