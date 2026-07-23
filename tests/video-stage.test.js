const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "video-design.html"), "utf8");
const clickStageSource = fs.readFileSync(path.join(root, "click-stage.js"), "utf8");
const sharedSource = fs.readFileSync(path.join(root, "script.js"), "utf8");

const cards = html.match(/<article class="community-video-card[^>]*>[\s\S]*?<\/article>/g) || [];
assert.strictEqual(cards.length, 6, "NO.4 should retain exactly six community video cards");
cards.forEach((card, index) => {
  assert.match(card, /\bdata-video-page-item(?:=""|\s|>)/, `community video ${index + 1} should be a page item`);
  assert.match(card, new RegExp(`COMMUNITY ${String(index + 1).padStart(2, "0")}`));
  assert.match(card, /<video data-src="[^"]+\.mp4" preload="none" playsinline controls><\/video>/);
  assert.doesNotMatch(card, /<video[^>]*\ssrc=/, "community MP4 sources must remain lazy");
});

const sourceOrder = cards.map((card) => card.match(/community-video-(\d{2})\.mp4/)[1]);
assert.deepStrictEqual(sourceOrder, ["04", "05", "03", "01", "02", "06"]);
assert.match(
  sharedSource,
  /DetailStage\?\.registerGallery\("community-video",\s*communityVideoGrid,\s*\{[\s\S]*?kind:\s*"video"[\s\S]*?itemSelector:\s*"\[data-video-page-item\]"/,
  "the community videos should register explicitly with the detail stage",
);

const clickStageWindow = {};
vm.runInNewContext(clickStageSource, {
  document: {},
  window: clickStageWindow,
}, { filename: "click-stage.js" });
assert.strictEqual(
  clickStageWindow.PortfolioStage.getPageSize("video", 1366, 768, { width: 1080, height: 420 }),
  3,
  "desktop video stage should show exactly three cards",
);
for (const [width, height] of [[844, 390], [390, 844], [375, 667], [320, 568]]) {
  assert.strictEqual(
    clickStageWindow.PortfolioStage.getPageSize("video", width, height, { width: width - 32, height: height - 180 }),
    1,
    `${width}x${height} video stage should show one card`,
  );
}

class FakeClassList {
  constructor() {
    this.values = new Set();
  }
  add(name) {
    this.values.add(name);
  }
  remove(name) {
    this.values.delete(name);
  }
  contains(name) {
    return this.values.has(name);
  }
}

class FakeTarget {
  constructor() {
    this.listeners = new Map();
  }
  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }
  removeEventListener(type, listener) {
    this.listeners.set(type, (this.listeners.get(type) || []).filter((item) => item !== listener));
  }
  dispatch(type) {
    (this.listeners.get(type) || []).slice().forEach((listener) => listener({ currentTarget: this, target: this }));
  }
}

class FakeVideo extends FakeTarget {
  constructor(card = null) {
    super();
    this.card = card;
    this.dataset = {};
    this.attributes = new Map();
    this.loadCount = 0;
    this.pauseCount = 0;
    this.playCount = 0;
    this.src = "";
    this.currentTime = 0;
    this.tabIndex = 0;
    this.controls = true;
    this.classList = new FakeClassList();
    this.playResults = [];
  }
  closest(selector) {
    return selector === ".community-video-card" ? this.card : null;
  }
  load() {
    this.loadCount += 1;
  }
  getAttribute(name) {
    if (name === "src") return this.attributes.get(name) || null;
    return this.attributes.get(name) || null;
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === "src") this.src = String(value);
  }
  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === "src") this.src = "";
  }
  pause() {
    this.pauseCount += 1;
    this.dispatch("pause");
  }
  play() {
    this.playCount += 1;
    const result = this.playResults.length ? this.playResults.shift() : Promise.resolve();
    return Promise.resolve(result).then(() => {
      this.dispatch("play");
    });
  }
}

class FakeButton extends FakeTarget {
  constructor() {
    super();
    this.classList = new FakeClassList();
    this.focusCount = 0;
    this.tabIndex = 0;
  }
  click() {
    this.dispatch("click");
  }
  focus() {
    this.focusCount += 1;
  }
}

function createCard(source) {
  const card = {
    classList: new FakeClassList(),
    querySelector(selector) {
      if (selector === "video[data-src]") return this.video;
      if (selector === ".community-play-btn") return this.button;
      return null;
    },
  };
  card.video = new FakeVideo(card);
  card.video.dataset.src = source;
  card.button = new FakeButton();
  return card;
}

const cardsForRuntime = [
  createCard("assets/video/community/community-video-04.mp4"),
  createCard("assets/video/community/community-video-05.mp4"),
];
const heroVideo = new FakeVideo();
heroVideo.dataset.src = "assets/video/买量视频混剪.mp4";
const playBtn = new FakeButton();
const videoLoading = { classList: new FakeClassList() };
const communityVideoGrid = {};
const documentListeners = new Map();
const document = {
  addEventListener(type, listener) {
    const listeners = documentListeners.get(type) || [];
    listeners.push(listener);
    documentListeners.set(type, listeners);
  },
  dispatch(type, detail = {}) {
    (documentListeners.get(type) || []).slice().forEach((listener) => listener({ type, detail }));
  },
  getElementById(id) {
    return {
      heroVideo,
      playBtn,
      videoLoading,
      videoStage: {},
    }[id] || null;
  },
  querySelector(selector) {
    return selector === ".community-video-grid" ? communityVideoGrid : null;
  },
  querySelectorAll(selector) {
    if (selector === ".community-video-card") return cardsForRuntime;
    if (selector === "video") return [heroVideo, ...cardsForRuntime.map((card) => card.video)];
    return [];
  },
};
const registrations = [];
const window = {
  DetailStage: {
    registerGallery(view, rootElement, options) {
      registrations.push({ options, rootElement, view });
    },
  },
};

const playbackStart = sharedSource.indexOf("/* ── Video Playback ── */");
const playbackEnd = sharedSource.indexOf('if ("serviceWorker" in navigator', playbackStart);
assert.ok(playbackStart >= 0 && playbackEnd > playbackStart, "video playback runtime should remain extractable");
vm.runInNewContext(sharedSource.slice(playbackStart, playbackEnd), {
  console,
  document,
  window,
}, { filename: "video-playback.js" });

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

async function run() {
assert.strictEqual(registrations.length, 1);
assert.strictEqual(registrations[0].view, "community-video");
assert.strictEqual(registrations[0].rootElement, communityVideoGrid);
assert.strictEqual(registrations[0].options.kind, "video");
assert.strictEqual(registrations[0].options.itemSelector, "[data-video-page-item]");
assert.strictEqual(cardsForRuntime[0].video.src, "", "community source should be absent before activation");
assert.strictEqual(heroVideo.src, "", "montage source should be absent before activation");
assert.strictEqual(cardsForRuntime[0].video.tabIndex, -1, "an unplayed community video should not be keyboard focusable");
assert.strictEqual(cardsForRuntime[0].video.controls, false, "an unplayed community video should not expose native controls");
assert.strictEqual(cardsForRuntime[0].video.getAttribute("aria-hidden"), "true");
assert.strictEqual(heroVideo.tabIndex, -1, "the lazy montage should not be keyboard focusable before play");
assert.strictEqual(heroVideo.controls, false, "the lazy montage should not expose native controls before play");
assert.strictEqual(heroVideo.getAttribute("aria-hidden"), "true");

cardsForRuntime[0].button.click();
await flushPromises();
assert.strictEqual(cardsForRuntime[0].video.src, cardsForRuntime[0].video.dataset.src);
assert.strictEqual(cardsForRuntime[0].video.playCount, 1);
assert.strictEqual(cardsForRuntime[0].classList.contains("is-playing"), true);
assert.strictEqual(cardsForRuntime[0].video.tabIndex, 0, "the active community video should expose native controls");
assert.strictEqual(cardsForRuntime[0].video.controls, true);
assert.strictEqual(cardsForRuntime[0].video.getAttribute("aria-hidden"), "false");

cardsForRuntime[0].video.currentTime = 5;
cardsForRuntime[1].button.click();
await flushPromises();
assert.ok(cardsForRuntime[0].video.pauseCount >= 1, "starting a second card should pause the first");
assert.strictEqual(cardsForRuntime[0].video.currentTime, 5, "single-play enforcement should pause without rewinding the previous card");
assert.strictEqual(cardsForRuntime[0].classList.contains("is-playing"), false);
assert.strictEqual(cardsForRuntime[1].classList.contains("is-playing"), true);

playBtn.click();
await flushPromises();
assert.strictEqual(heroVideo.src, "assets/video/买量视频混剪.mp4", "montage remains an independent lazy source");
assert.ok(cardsForRuntime[1].video.pauseCount >= 1, "starting the montage should pause a community video");
assert.strictEqual(playBtn.classList.contains("is-hidden"), true);
assert.strictEqual(heroVideo.classList.contains("is-loaded"), true);
heroVideo.currentTime = 12;

document.dispatch("portfolio:stagechange", { view: "community-video", page: 2 });
for (const video of [heroVideo, ...cardsForRuntime.map((card) => card.video)]) {
  assert.ok(video.pauseCount >= 1, "every stage change should pause every video");
  assert.strictEqual(video.currentTime, 0, "every stage change should rewind every video");
  assert.strictEqual(video.src, "", "every stage change should unload every assigned MP4 source");
  assert.ok(video.loadCount >= 1, "unloading an assigned source should abort its media buffer");
}
assert.ok(cardsForRuntime.every((card) => !card.classList.contains("is-playing")));
assert.ok(cardsForRuntime.every((card) => !card.classList.contains("is-loading")));
assert.ok(cardsForRuntime.every((card) => card.video.tabIndex === -1));
assert.ok(cardsForRuntime.every((card) => card.video.controls === false));
assert.strictEqual(playBtn.classList.contains("is-hidden"), false, "stage changes should restore the montage play button");
assert.strictEqual(heroVideo.classList.contains("is-loaded"), false, "stage changes should hide the paused montage");
assert.strictEqual(videoLoading.classList.contains("is-active"), false, "stage changes should clear the loading overlay");
assert.strictEqual(heroVideo.currentTime, 0, "stage changes should rewind the montage");

const montageLoadCount = heroVideo.loadCount;
playBtn.click();
await flushPromises();
assert.strictEqual(heroVideo.loadCount, montageLoadCount + 1, "replay should explicitly mount the lazy montage source again");
assert.strictEqual(heroVideo.playCount, 2, "the restored play control should replay the montage");

const failingCard = cardsForRuntime[0];
let rejectOldPlay;
failingCard.video.playResults.push(new Promise((resolve, reject) => {
  rejectOldPlay = reject;
}));
failingCard.button.click();
assert.strictEqual(failingCard.classList.contains("is-loading"), true, "a pending play should expose a loading state");
document.dispatch("portfolio:stagechange", { view: "overview", page: 1 });
failingCard.button.click();
await flushPromises();
assert.strictEqual(failingCard.classList.contains("is-playing"), true, "a retry should be able to start after reset");
rejectOldPlay(new Error("stale play failure"));
await flushPromises();
assert.strictEqual(failingCard.classList.contains("is-playing"), true, "an older rejected play must not reset newer playback");
assert.strictEqual(failingCard.video.src, failingCard.video.dataset.src);

const retryCard = cardsForRuntime[1];
retryCard.video.playResults.push(Promise.reject(new Error("decode failure")));
retryCard.button.click();
await flushPromises();
assert.strictEqual(retryCard.classList.contains("is-playing"), false, "a rejected play should not leave a playing state");
assert.strictEqual(retryCard.classList.contains("is-loading"), false, "a rejected play should clear loading state");
assert.strictEqual(retryCard.video.src, "", "a rejected play should release the failed source");
assert.strictEqual(retryCard.video.currentTime, 0, "a rejected play should rewind for retry");
assert.strictEqual(retryCard.video.tabIndex, -1, "a failed video should return focus access to its play control");
assert.strictEqual(retryCard.video.getAttribute("aria-hidden"), "true");
assert.ok(retryCard.button.focusCount >= 1, "a rejected play should restore focus to the retry button");

console.log("video stage behavior passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
