const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "video-design.html"), "utf8");
const stageCss = fs.readFileSync(path.join(root, "click-stage.css"), "utf8");

const runtimeSources = Array.from(
  html.matchAll(/<video[^>]*\bdata-src="([^"]+\.mp4)"[^>]*>/g),
  (match) => match[1],
);
runtimeSources.push("assets/video/买量视频混剪.mp4");

assert.strictEqual(runtimeSources.length, 7, "the video page should expose seven runtime MP4 paths");
assert.strictEqual(new Set(runtimeSources).size, 7, "the seven runtime MP4 paths should be unique");

const fallback = html.match(
  /<noscript\s+data-noscript-video-fallback>([\s\S]*?)<\/noscript>/,
);
assert.ok(fallback, "the video page should provide a dedicated no-JS video fallback");

const fallbackMarkup = fallback[1];
const fallbackSources = Array.from(
  fallbackMarkup.matchAll(/<a[^>]*\bhref="([^"]+\.mp4)"[^>]*>/g),
  (match) => match[1],
);

assert.deepStrictEqual(
  fallbackSources.slice().sort(),
  runtimeSources.slice().sort(),
  "no-JS MP4 links must stay in sync with all seven runtime video sources",
);
fallbackSources.forEach((source) => {
  assert.ok(fs.existsSync(path.join(root, source)), `no-JS video target should exist: ${source}`);
});
assert.doesNotMatch(fallbackMarkup, /<(?:video|source)\b/i, "the no-JS fallback must not create media elements");
assert.match(
  fallbackMarkup,
  /<section[^>]*aria-labelledby="noscript-community-videos"[\s\S]*?<\/section>[\s\S]*?<section[^>]*aria-labelledby="noscript-montage-video"/,
  "community videos and the montage should be grouped separately",
);

assert.match(
  stageCss,
  /body\.stage-ready\s+#video\s+\.detail-board\s*\{[^}]*grid-template-rows:\s*auto\s+minmax\(0,\s*1fr\)/s,
  "the montage board should reserve one bounded flexible row for the player",
);
assert.match(
  stageCss,
  /body\.stage-ready\s+#video\s+\.video-stage\s*\{[^}]*height:\s*100%[^}]*aspect-ratio:\s*auto/s,
  "fixed-stage mode should replace the legacy 16:9 montage height",
);
assert.match(
  stageCss,
  /\.detail-stage-pager\s+button::before,\s*\.detail-stage-pager\s+button::after\s*\{[^}]*content:\s*none/s,
  "detail pager buttons should suppress inherited decorations",
);

console.log("video stage presentation passed");
