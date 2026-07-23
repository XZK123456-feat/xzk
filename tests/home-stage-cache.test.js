const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const pages = [
  "index.html",
  "website-design.html",
  "ua-creatives.html",
  "community-creatives.html",
  "video-design.html",
];
const serviceWorkerSource = read("sw.js");
const sharedSource = read("script.js");

pages.forEach((page) => {
  const html = read(page);
  assert.ok(
    html.includes('href="click-stage.css?v=click-stage-3"'),
    `${page} should request click-stage.css with the current stage release`,
  );
  assert.ok(
    html.includes('src="click-stage.js?v=click-stage-2"'),
    `${page} should request click-stage.js with the current stage release`,
  );
  assert.ok(
    html.includes('src="script.js?v=stability-2"'),
    `${page} should request script.js with the current shared release`,
  );
});

assert.ok(
  read("index.html").includes('src="home-stage.js?v=click-stage-2"'),
  "index.html should request home-stage.js with the current stage release",
);
assert.ok(
  sharedSource.includes('navigator.serviceWorker.register("sw.js?v=click-stage-2")'),
  "the shared controller should register the current service worker release",
);
assert.ok(
  serviceWorkerSource.includes('const CACHE_VERSION = "zk-portfolio-click-stage-2"'),
  "the service worker should use the current stage cache generation",
);
[
  "./script.js?v=stability-2",
  "./click-stage.css?v=click-stage-3",
  "./click-stage.js?v=click-stage-2",
  "./home-stage.js?v=click-stage-2",
  "./detail-stage.js?v=click-stage-3",
].forEach((asset) => {
  assert.ok(serviceWorkerSource.includes(`"${asset}"`), `the service worker should precache ${asset}`);
});
assert.match(
  serviceWorkerSource,
  /if \(request\.mode === "navigate"\) \{\s*event\.respondWith\(networkFirst\(request\)\);/,
  "page HTML should remain network-first",
);

const fetchListeners = [];
const oldControllerUrl = "http://portfolio.test/home-stage.js?v=click-stage-1";
const newControllerUrl = "http://portfolio.test/home-stage.js?v=click-stage-2";
const oldResponse = {
  ok: true,
  release: "old-controller",
  clone() {
    return this;
  },
};
const newResponse = {
  ok: true,
  release: "new-controller",
  clone() {
    return this;
  },
};
const seededEntries = new Map([[oldControllerUrl, oldResponse]]);
const runtimeCache = {
  match: async (request) => seededEntries.get(request.url),
  put: async (request, response) => {
    seededEntries.set(request.url, response);
  },
};
const context = {
  Promise,
  caches: {
    open: async () => runtimeCache,
    match: async (request) => seededEntries.get(request.url),
    keys: async () => [],
    delete: async () => true,
  },
  fetch: async (request) => {
    assert.strictEqual(request.url, newControllerUrl, "the first reload should request the new controller URL");
    return newResponse;
  },
  self: {
    addEventListener(type, listener) {
      if (type === "fetch") {
        fetchListeners.push(listener);
      }
    },
    skipWaiting: async () => {},
    clients: {
      claim: async () => {},
    },
  },
};

vm.runInNewContext(serviceWorkerSource, context, { filename: "sw.js" });
assert.strictEqual(fetchListeners.length, 1, "the service worker should register one fetch handler");

let responsePromise;
fetchListeners[0]({
  request: {
    method: "GET",
    mode: "same-origin",
    destination: "script",
    url: newControllerUrl,
  },
  respondWith(promise) {
    responsePromise = promise;
  },
});

assert.ok(responsePromise, "the service worker should handle the new controller request");
responsePromise.then((response) => {
  assert.strictEqual(
    response.release,
    "new-controller",
    "an old seeded cache must not satisfy the new controller URL",
  );
  console.log("home stage cache checks passed");
}).catch((error) => {
  process.nextTick(() => {
    throw error;
  });
});
