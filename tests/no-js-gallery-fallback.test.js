const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function sourceItems(script, rootFolder) {
  const manifest = script.slice(0, script.indexOf("function createShot"));
  const context = {};
  vm.runInNewContext(
    `${manifest}
globalThis.__fallbackSourceGroups = typeof buildFiles === "function"
  ? Object.fromEntries(Object.keys(sourceGroups).map((key) => [key, buildFiles(key)]))
  : Object.fromEntries(sourceGroups.map((group) => [group.key, group.files]));`,
    context,
  );

  const groups = new Map();
  for (const [sourceCategory, entries] of Object.entries(context.__fallbackSourceGroups)) {
    const items = [];
    for (const item of entries) {
      const { label, src: thumbnail, fullSrc, width, height } = item;
    const prefix = `${rootFolder}/`;
    assert.ok(fullSrc.startsWith(prefix), `${fullSrc} should belong to ${rootFolder}`);
    const category = fullSrc.slice(prefix.length).split("/")[0];
      assert.strictEqual(category, sourceCategory, `${label} should stay in ${sourceCategory}`);
    items.push({ label, thumbnail, fullSrc, width: Number(width), height: Number(height) });
    }
    groups.set(sourceCategory, items);
  }

  return groups;
}

function fallbackItems(html, category) {
  const block = html.match(
    new RegExp(
      `<noscript\\s+data-noscript-gallery="${category}">([\\s\\S]*?)<\\/noscript>`,
    ),
  );
  assert.ok(block, `${category} should have a no-JS gallery fallback`);

  const itemPattern =
    /<a\s+class="noscript-gallery__item"\s+href="([^"]+)">\s*<img\s+src="([^"]+)"\s+loading="lazy"\s+decoding="async"\s+width="(\d+)"\s+height="(\d+)"\s+alt="([^"]+)"\s*\/?>\s*<\/a>/g;

  return Array.from(block[1].matchAll(itemPattern), (match) => ({
    fullSrc: match[1],
    thumbnail: match[2],
    width: Number(match[3]),
    height: Number(match[4]),
    label: match[5],
  }));
}

const cases = [
  {
    html: "ua-creatives.html",
    script: "ua-creatives.js",
    rootFolder: "assets/ua-creatives/sliced",
    expected: { horizontal: 90, vertical: 54, "nine-grid": 20 },
  },
  {
    html: "community-creatives.html",
    script: "community-creatives.js",
    rootFolder: "assets/community-creatives/sliced",
    expected: { "party-all": 40, "ulala-all": 24, "lili-tangquan": 20 },
  },
];

let grandTotal = 0;

for (const testCase of cases) {
  const html = read(testCase.html);
  const groups = sourceItems(read(testCase.script), testCase.rootFolder);
  let pageTotal = 0;

  assert.deepStrictEqual(
    Object.fromEntries(Array.from(groups, ([category, items]) => [category, items.length])),
    testCase.expected,
    `${testCase.script} source categories should keep their expected totals`,
  );

  for (const [category, source] of groups) {
    const fallback = fallbackItems(html, category);
    assert.deepStrictEqual(
      fallback,
      source,
      `${testCase.html} ${category} fallback should exactly mirror its JS data`,
    );
    pageTotal += fallback.length;
  }

  assert.ok(
    html.includes(".noscript-gallery {"),
    `${testCase.html} should scope responsive no-JS gallery styles`,
  );
  assert.ok(
    html.includes("body.is-page-loading [data-stage-view] { display: block !important;"),
    `${testCase.html} should expose every category when JavaScript is disabled`,
  );
  assert.strictEqual(
    (html.match(/<noscript\s+data-noscript-gallery=/g) || []).length,
    groups.size,
    `${testCase.html} should not contain stale fallback categories`,
  );

  grandTotal += pageTotal;
}

assert.strictEqual(
  grandTotal,
  248,
  "all 164 UA and 84 community works should be reachable without JavaScript",
);

console.log("no-js gallery fallback tests passed");
