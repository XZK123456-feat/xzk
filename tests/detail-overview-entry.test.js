const assert = require("node:assert/strict");
const fs = require("node:fs");

const pages = {
  "website-design.html": {
    defaultView: "pc",
    entries: ["mobile", "pc", "vibecoding"],
    image: "assets/website-design/pc/thumbnails/顶部+开整-thumb-delivery.webp",
  },
  "ua-creatives.html": {
    defaultView: "horizontal",
    entries: ["horizontal", "vertical", "nine-grid"],
    image: "assets/ua-creatives/sliced/horizontal/new_h_img_001-delivery-480.webp",
  },
  "community-creatives.html": {
    defaultView: "lili-tangquan",
    entries: ["party-all", "ulala-all", "lili-tangquan"],
    image: "assets/community-creatives/sliced/lili-tangquan/1-delivery-480.webp",
  },
  "video-design.html": {
    defaultView: "community-video",
    entries: ["community-video", "video"],
    image: "assets/video/community/posters/community-video-04-delivery-480.webp",
  },
};

for (const [file, config] of Object.entries(pages)) {
  const html = fs.readFileSync(file, "utf8");
  const overview = html.match(/<section\b[^>]*id="overview"[\s\S]*?<\/section>/)?.[0] || "";

  assert.match(overview, /class="overview-stage"/, `${file} needs the shared overview shell`);
  assert.match(overview, /class="overview-identity"/, `${file} needs an identity region`);
  assert.match(overview, /class="overview-index"/, `${file} needs an integrated project index`);
  assert.match(overview, /class="overview-entry-strip"/, `${file} needs a category entry strip`);
  assert.ok(!overview.includes("detail-ticket"), `${file} must remove the detached ticket`);
  assert.ok(!overview.includes("detail-summary"), `${file} must remove the oversized summary card`);
  assert.ok(
    overview.includes(
      `class="overview-preview" href="#${config.defaultView}" data-stage-entry="${config.defaultView}"`,
    ),
    `${file} preview must open ${config.defaultView}`,
  );
  assert.ok(overview.includes(`src="${config.image}"`), `${file} must use the approved representative image`);
  assert.match(
    overview,
    /<img\b[^>]*\bwidth="\d+"[^>]*\bheight="\d+"/,
    `${file} preview needs stable dimensions`,
  );

  for (const view of config.entries) {
    assert.ok(
      overview.includes(`href="#${view}" data-stage-entry="${view}"`),
      `${file} needs a no-JS entry for ${view}`,
    );
  }
}

const videoOverview =
  fs.readFileSync("video-design.html", "utf8").match(/<section\b[^>]*id="overview"[\s\S]*?<\/section>/)?.[0] ||
  "";
assert.ok(!videoOverview.includes("<video"), "video overview must not preload MP4");

console.log("Detail overview entry tests passed.");
