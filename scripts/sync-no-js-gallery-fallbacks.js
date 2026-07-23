const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function readManifest(file) {
  const script = read(file);
  const manifest = script.slice(0, script.indexOf("function createShot"));
  const context = {};

  vm.runInNewContext(
    `${manifest}
globalThis.__fallbackSourceGroups = typeof buildFiles === "function"
  ? Object.fromEntries(Object.keys(sourceGroups).map((key) => [key, buildFiles(key)]))
  : Object.fromEntries(sourceGroups.map((group) => [group.key, group.files]));`,
    context,
  );

  return context.__fallbackSourceGroups;
}

function renderFallback(category, items) {
  const links = items
    .map(
      (item) =>
        `                <a class="noscript-gallery__item" href="${escapeHtml(item.fullSrc)}">\n` +
        `                  <img src="${escapeHtml(item.src)}" loading="lazy" decoding="async" width="${item.width}" height="${item.height}" alt="${escapeHtml(item.label)}" />\n` +
        "                </a>",
    )
    .join("\n");

  return (
    `<!-- noscript-gallery:${category}:start -->\n` +
    `            <noscript data-noscript-gallery="${category}">\n` +
    `              <div class="noscript-gallery" aria-label="${category} 无 JavaScript 作品列表">\n` +
    `${links}\n` +
    "              </div>\n" +
    "            </noscript>\n" +
    `            <!-- noscript-gallery:${category}:end -->`
  );
}

function syncPage(htmlFile, scriptFile) {
  let html = read(htmlFile);
  const manifest = readManifest(scriptFile);

  for (const [category, items] of Object.entries(manifest)) {
    const pattern = new RegExp(
      `<!-- noscript-gallery:${category}:start -->[\\s\\S]*?<!-- noscript-gallery:${category}:end -->`,
    );
    if (!pattern.test(html)) {
      throw new Error(`${htmlFile} is missing the ${category} fallback markers`);
    }
    html = html.replace(pattern, renderFallback(category, items));
  }

  fs.writeFileSync(path.join(root, htmlFile), html);
}

syncPage("ua-creatives.html", "ua-creatives.js");
syncPage("community-creatives.html", "community-creatives.js");
