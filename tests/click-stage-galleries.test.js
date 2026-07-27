const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const pages = {
  "website-design.html": {
    back: "index.html#contents",
    current: "website-design.html",
    views: [
      ["overview", "项目概览"],
      ["mobile", "移动端"],
      ["pc", "PC 端"],
      ["vibecoding", "VibeCoding"],
    ],
    scriptGalleries: [
      ["mobile", "vertical"],
      ["pc", "horizontal"],
    ],
  },
  "ua-creatives.html": {
    back: "index.html#contents-m2",
    current: "ua-creatives.html",
    views: [
      ["overview", "项目概览"],
      ["horizontal", "横图素材"],
      ["vertical", "竖图素材"],
      ["nine-grid", "九图素材"],
    ],
    scriptGalleries: [
      ["horizontal", "horizontal"],
      ["vertical", "vertical"],
      ["nine-grid", "square"],
    ],
  },
  "community-creatives.html": {
    back: "index.html#contents-m3",
    current: "community-creatives.html",
    views: [
      ["overview", "项目概览"],
      ["party-all", "小恐龙派对"],
      ["ulala-all", "不休的乌拉拉"],
      ["lili-tangquan", "狸狸汤泉"],
    ],
    scriptGalleries: [
      ["party-all", "mixed"],
      ["ulala-all", "mixed"],
      ["lili-tangquan", "mixed"],
    ],
  },
  "video-design.html": {
    back: "index.html#contents-m4",
    current: "video-design.html",
    views: [
      ["overview", "项目概览"],
      ["community-video", "运营社群视频"],
      ["video", "买量视频混剪"],
    ],
    scriptGalleries: [
      ["community-video", "video", ".community-video-card"],
    ],
  },
};

Object.entries(pages).forEach(([file, contract]) => {
  const html = read(file);
  const mains = html.match(/<main\b/g) || [];
  const mainTag = html.match(/<main\b[^>]*>/)?.[0] || "";
  const tablist = html.match(/<nav\b[^>]*class="nav-pills"[^>]*role="tablist"[^>]*>[\s\S]*?<\/nav>/)?.[0] || "";
  const rail = html.match(/<nav\b[^>]*data-task-rail[^>]*>[\s\S]*?<\/nav>/)?.[0] || "";

  assert.strictEqual(mains.length, 1, `${file} should keep exactly one main element`);
  assert.match(mainTag, /\bdata-detail-stage(?:=""|\s|>)/, `${file} should mark the detail stage root`);
  assert.match(mainTag, /\bdata-default-view="overview"/, `${file} should default to overview`);
  assert.ok(tablist, `${file} should expose the category navigation as a tablist`);

  contract.views.forEach(([view, label]) => {
    const section = html.match(new RegExp(`<section\\b[^>]*\\bid="${view}"[^>]*>`))?.[0] || "";
    const tab = tablist.match(new RegExp(`<a\\b[^>]*\\bdata-stage-tab="${view}"[^>]*>[\\s\\S]*?<\\/a>`))?.[0] || "";

    assert.ok(section, `${file} should keep the ${view} section in the DOM`);
    assert.match(section, new RegExp(`\\bdata-stage-view="${view}"`), `${file} should map ${view} to its panel`);
    assert.match(section, /\brole="tabpanel"/, `${file} ${view} should be a tabpanel`);
    assert.match(section, new RegExp(`\\baria-labelledby="detail-tab-${view}"`), `${file} ${view} should have a stable label`);
    assert.doesNotMatch(section, /\b(?:hidden|inert|aria-hidden)=?/, `${file} ${view} should remain visible without JS`);

    assert.ok(tab, `${file} should include a tab for ${view}`);
    assert.match(tab, new RegExp(`\\bid="detail-tab-${view}"`), `${file} ${view} tab should own the stable label id`);
    assert.match(tab, /\brole="tab"/, `${file} ${view} control should be a tab`);
    assert.match(tab, new RegExp(`\\baria-controls="${view}"`), `${file} ${view} tab should control its panel`);
    assert.match(tab, /\baria-selected="(?:true|false)"/, `${file} ${view} tab should seed selection semantics`);
    assert.ok(tab.includes(`>${label}</a>`), `${file} ${view} should use the required label`);
  });

  (contract.declarativeGalleries || []).forEach(([view, kind, itemSelector]) => {
    const gallery = html.match(new RegExp(`<[^>]+\\bdata-stage-gallery="${view}"[^>]*>`))?.[0] || "";
    assert.ok(gallery, `${file} should declaratively register the ${view} gallery`);
    assert.match(
      gallery,
      new RegExp(`\\bdata-stage-gallery-kind="${kind}"`),
      `${file} ${view} should use the ${kind} page-size contract`,
    );
    assert.ok(
      gallery.includes(`data-stage-gallery-items="${itemSelector}"`),
      `${file} ${view} should declare its paged item selector`,
    );
  });

  if (contract.scriptGalleries) {
    assert.doesNotMatch(
      html,
      /\bdata-stage-gallery(?:=|\s)/,
      `${file} should leave registration to its page script without declarative duplicates`,
    );
  }

  assert.match(
    html,
    /<div\b[^>]*data-stage-pager[^>]*\bhidden[^>]*>[\s\S]*data-stage-previous[\s\S]*data-stage-status[\s\S]*data-stage-next[\s\S]*<\/div>/,
    `${file} should include the initially hidden shared pager`,
  );
  assert.ok(rail, `${file} should include the N2 task rail`);
  assert.match(rail, /\bclass="[^"]*\bdetail-directory\b[^"]*"/, `${file} should retain the directory compatibility class on the rail`);
  assert.match(rail, /\bdata-task-rail-toggle/, `${file} should include the rail toggle`);
  assert.strictEqual((rail.match(/\bclass="[^"]*\bdirectory-item\b[^"]*"/g) || []).length, 4, `${file} should keep four task links`);
  assert.match(
    rail,
    new RegExp(`<a\\b[^>]*href="${contract.current.replace(".", "\\.")}"[^>]*aria-current="page"`),
    `${file} should identify the current task`,
  );
  assert.strictEqual((html.match(/\bclass="[^"]*\bdetail-directory\b[^"]*"/g) || []).length, 1, `${file} should not retain a second standalone directory`);
  assert.ok(html.includes(`class="brand-pill back-brand" href="${contract.back}"`), `${file} should use the mission-specific top back target`);
  assert.ok(html.includes(`class="back-link" href="${contract.back}"`) || file === "video-design.html", `${file} should use the mission-specific section back target`);
  assert.ok(html.includes('href="click-stage.css?v=click-stage-11"'), `${file} should request click-stage.css release 11`);
  assert.ok(html.includes('src="click-stage.js?v=click-stage-11"'), `${file} should request click-stage.js release 11`);
  assert.ok(
    html.indexOf('src="detail-stage.js?v=click-stage-11"') > html.indexOf('src="click-stage.js?v=click-stage-11"'),
    `${file} should load detail-stage.js after click-stage.js`,
  );

  const pageSpecificScript = html.search(/src="(?:website-design|ua-creatives|community-creatives)\.js\?/);
  if (pageSpecificScript >= 0) {
    assert.ok(
      html.indexOf('src="detail-stage.js?v=click-stage-11"') < pageSpecificScript,
      `${file} should initialize the stage before its gallery script`,
    );
  }
});

const homepage = read("index.html");
assert.ok(homepage.includes('href="click-stage.css?v=click-stage-11"'), "index.html should request click-stage.css release 11");
assert.ok(homepage.includes('src="click-stage.js?v=click-stage-11"'), "index.html should request click-stage.js release 11");
assert.ok(homepage.includes('src="home-stage.js?v=click-stage-2"'), "index.html should keep home-stage.js release 2");

const websiteScript = read("website-design.js");
const uaScript = read("ua-creatives.js");
const communityScript = read("community-creatives.js");

assert.match(websiteScript, /DetailStage\?\.registerGallery\("mobile"[\s\S]*?kind:\s*"vertical"/);
assert.match(websiteScript, /DetailStage\?\.registerGallery\("pc"[\s\S]*?kind:\s*"horizontal"/);
assert.doesNotMatch(
  websiteScript,
  /registerGallery\("vibecoding"/,
  "the placeholder-only VibeCoding panel must not be registered as an empty gallery",
);
assert.match(websiteScript, /portfolio:stagechange/, "website galleries should refresh after their panel becomes measurable");

assert.match(uaScript, /portfolio:stagechange/, "UA galleries should render from stage activation");
assert.match(uaScript, /DetailStage\?\.registerGallery\(configKey/);
assert.match(uaScript, /DetailStage\?\.refreshGallery\(configKey\)/);
assert.match(uaScript, /configKey === "nine-grid"\s*\?\s*"square"/);
assert.doesNotMatch(
  uaScript,
  /IntersectionObserver/,
  "hidden UA panels must not rely on viewport intersection to render",
);

assert.match(communityScript, /portfolio:stagechange/, "community galleries should render from stage activation");
assert.match(communityScript, /DetailStage\?\.registerGallery\(group\.key[\s\S]*?kind:\s*"mixed"/);
assert.match(communityScript, /DetailStage\?\.refreshGallery\(group\.key\)/);
assert.doesNotMatch(
  communityScript,
  /IntersectionObserver/,
  "hidden community panels must not rely on viewport intersection to render",
);

[uaScript, communityScript].forEach((script) => {
  assert.match(script, /data-stage-thumb-src/, "generated images should defer thumbnail URLs to the stage controller");
  assert.match(script, /data-stage-thumb-srcset/, "generated responsive thumbnails should be restored only when visible");
});

const css = read("click-stage.css");
assert.match(css, /body\.stage-ready \[data-detail-stage\]\s*\{[^}]*position:\s*fixed;[^}]*display:\s*grid;[^}]*grid-template-rows:[^;}]*minmax\(0,\s*1fr\)[^;}]*;/s);
assert.match(css, /body\.stage-ready \[data-stage-view\]\s*\{[^}]*min-width:\s*0;[^}]*min-height:\s*0;[^}]*overflow:\s*hidden;/s);
assert.match(
  css,
  /body\.stage-ready \[data-stage-view\] \.detail-board\s*\{[^}]*display:\s*grid;[^}]*grid-template-rows:\s*auto auto minmax\(0,\s*1fr\);/s,
  "gallery boards should reserve a bounded row for thumbnails",
);
assert.match(
  css,
  /body\.stage-ready \[data-stage-view\] \.detail-gallery\s*\{[^}]*height:\s*100%;[^}]*grid-template-columns:\s*repeat\(var\(--stage-gallery-columns\),\s*var\(--stage-item-width\)\);/s,
  "measured gallery dimensions should drive a centered contained grid",
);
assert.match(css, /body\.stage-ready \[data-task-rail\][\s\S]*?width:\s*34px;/);
assert.match(css, /max-width:\s*220px;/, "expanded mobile task rail should stay compact");
assert.match(
  css,
  /body\.stage-ready \[data-stage-view="overview"\] \.detail-hero-card\s*\{[^}]*background:\s*var\(--ink\);[^}]*color:\s*white;/s,
  "overview title/date should sit on an explicit readable band",
);
assert.match(
  css,
  /body\.stage-ready \[data-stage-view="overview"\] \.detail-summary\s*\{[^}]*background:\s*var\(--ink\);[^}]*color:\s*white;/s,
  "overview summary text should sit on an explicit readable band",
);
assert.match(
  css,
  /body\.stage-ready \[data-stage-view="overview"\] \.back-link\s*\{[^}]*background:\s*var\(--yellow\);[^}]*color:\s*var\(--ink\);/s,
  "overview back links should retain high contrast",
);
assert.doesNotMatch(
  css,
  /body\.stage-ready \[data-task-rail\] \.directory-item\[aria-current="page"\]\s*\{[^}]*pointer-events:\s*none;/s,
  "the current task must remain clickable so it can close the rail",
);
assert.match(
  css,
  /body\.stage-ready \[data-task-rail\] \.directory-item\[aria-current="page"\]\s*\{[^}]*pointer-events:\s*auto;/s,
  "the enhanced current task should override the legacy inactive-link rule",
);
assert.ok(css.includes("@media (max-height: 390px)"), "CSS should include a compact 844x390 treatment");
assert.ok(css.includes("@media (max-width: 375px) and (max-height: 667px)"), "CSS should include a compact 375x667 treatment");
assert.match(
  css,
  /@media \(max-height:\s*390px\)[\s\S]*?body\.stage-ready \[data-detail-stage\]\s*\{[^}]*top:\s*56px;/,
  "compact landscape stages should start below the measured topbar",
);
assert.match(
  css,
  /@media \(max-width:\s*375px\) and \(max-height:\s*667px\)[\s\S]*?body\.stage-ready \[data-detail-stage\]\s*\{[^}]*top:\s*56px;/,
  "short-phone stages should start below the measured topbar",
);
assert.match(
  css,
  /@media \(max-width:\s*620px\)[\s\S]*?\.detail-stage-pager\s*\{[^}]*padding-bottom:\s*env\(safe-area-inset-bottom\);/s,
  "the mobile pager should reserve the bottom safe area inside the stage grid",
);
assert.match(
  css,
  /@media \(max-width:\s*420px\)[\s\S]*?body\.stage-ready \.topbar \.nav-pill\s*\{[^}]*font-size:\s*10px;/,
  "compact detail tabs should fit the longest category label",
);
assert.match(
  css,
  /@media \(max-width:\s*375px\)[\s\S]*?body\.stage-ready \.topbar \.nav-pill\s*\{[^}]*font-size:\s*8px;[^}]*overflow:\s*hidden;/,
  "small-phone detail tabs should keep long labels inside their controls",
);
assert.match(
  css,
  /@media \(max-width:\s*340px\)[\s\S]*?body\.stage-ready \.topbar \.nav-pill\s*\{[^}]*padding:\s*0;[^}]*font-size:\s*8px;/,
  "the narrowest required viewport should further compact long detail labels",
);
assert.ok(
  css.lastIndexOf("@media (max-width: 375px)") > css.lastIndexOf("@media (max-width: 620px)"),
  "the small-phone tab override should follow the shared mobile topbar rules",
);
assert.doesNotMatch(css, /font-size:\s*[^;]*vw/, "click-stage.css should not size text with viewport width");
assert.doesNotMatch(css, /border[^;]*dashed/, "click-stage.css should not use dashed borders");

console.log("detail click-stage static contracts passed");
