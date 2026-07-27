// PAGE_LOADER_CONTROLLER_START
const PAGE_LOADER_MIN_MS = 350;
const PAGE_LOADER_TIMEOUT_MS = 12000;
const PAGE_LOADER_EXIT_MS = 400;
const PAGE_LOADER_FONT_WEIGHTS = [400, 700, 900];
const PAGE_LOADER_PROGRESS_WEIGHTS = {
  styles: 24,
  fonts: 48,
  priorityImage: 12,
};

let activePageLoaderRun = null;
let pageLoaderUnlockTimer = null;

function createPageLoaderRun() {
  return {
    active: true,
    lifecycleSettlers: new Set(),
    preparedImages: new WeakSet(),
    progressSettlers: new Set(),
    resourceSettlers: new Set(),
    timerIds: new Set(),
  };
}

function isCurrentPageLoaderRun(run) {
  return run.active && activePageLoaderRun === run;
}

function schedulePageLoaderTimer(run, callback, delay) {
  const timerId = window.setTimeout(() => {
    run.timerIds.delete(timerId);
    callback();
  }, delay);
  run.timerIds.add(timerId);
  return timerId;
}

function clearPageLoaderTimer(run, timerId) {
  if (timerId === null || !run.timerIds.has(timerId)) {
    return;
  }

  window.clearTimeout(timerId);
  run.timerIds.delete(timerId);
}

function settlePageLoaderResources(run) {
  [...run.resourceSettlers].forEach((settle) => settle());
}

function settlePageLoaderLifecycle(run) {
  [...run.lifecycleSettlers].forEach((settle) => settle());
}

function settlePageLoaderProgress(run) {
  [...run.progressSettlers].forEach((settle) => settle());
}

function invalidatePageLoaderRun(run) {
  if (!run || !run.active) {
    return;
  }

  run.active = false;
  settlePageLoaderLifecycle(run);
  run.timerIds.forEach((timerId) => window.clearTimeout(timerId));
  run.timerIds.clear();
  settlePageLoaderResources(run);
  settlePageLoaderProgress(run);
}

function cleanupActivePageLoaderRun() {
  cancelPageLoaderUnlockTimer();
  if (!activePageLoaderRun) {
    return;
  }

  invalidatePageLoaderRun(activePageLoaderRun);
  activePageLoaderRun = null;
}

function cancelPageLoaderUnlockTimer() {
  if (pageLoaderUnlockTimer !== null) {
    window.clearTimeout(pageLoaderUnlockTimer);
    pageLoaderUnlockTimer = null;
  }
}

function waitForResourceSettlement(resource, run) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (completed) => {
      if (settled) {
        return;
      }

      settled = true;
      resource.removeEventListener("load", complete);
      resource.removeEventListener("error", complete);
      run.resourceSettlers.delete(cancel);
      resolve(completed);
    };
    const complete = () => finish(true);
    const cancel = () => finish(false);

    resource.addEventListener("load", complete);
    resource.addEventListener("error", complete);
    run.resourceSettlers.add(cancel);
  });
}

function waitForDomReady(run) {
  if (document.readyState !== "loading") {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (completed) => {
      if (settled) {
        return;
      }

      settled = true;
      document.removeEventListener("DOMContentLoaded", complete);
      run.lifecycleSettlers.delete(cancel);
      resolve(completed);
    };
    const complete = () => finish(true);
    const cancel = () => finish(false);

    document.addEventListener("DOMContentLoaded", complete);
    run.lifecycleSettlers.add(cancel);
  });
}

function waitForPageLoaderFrame(run) {
  return new Promise((resolve) => {
    let settled = false;
    let cancelScheduledFrame = () => {};
    const finish = (completed) => {
      if (settled) {
        return;
      }

      settled = true;
      cancelScheduledFrame();
      run.lifecycleSettlers.delete(cancel);
      resolve(completed);
    };
    const complete = () => finish(true);
    const cancel = () => finish(false);

    run.lifecycleSettlers.add(cancel);
    if (typeof window.requestAnimationFrame === "function"
      && typeof window.cancelAnimationFrame === "function") {
      const frameId = window.requestAnimationFrame(complete);
      cancelScheduledFrame = () => window.cancelAnimationFrame(frameId);
      return;
    }

    const timerId = schedulePageLoaderTimer(run, complete, 0);
    cancelScheduledFrame = () => clearPageLoaderTimer(run, timerId);
  });
}

function waitForStylesheets(run, onProgress = () => {}) {
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  if (stylesheets.length === 0) {
    onProgress(1, 1);
    return Promise.resolve([]);
  }

  let completed = 0;
  const reportSettlement = () => {
    completed += 1;
    onProgress(completed, stylesheets.length);
  };

  return Promise.allSettled(stylesheets.map((link) => {
    if (link.sheet || link.dataset.loaderState === "loaded" || link.dataset.loaderState === "error") {
      return Promise.resolve().then(reportSettlement);
    }

    return waitForResourceSettlement(link, run).then(reportSettlement);
  }));
}

function waitForPortfolioFonts(onProgress = () => {}) {
  if (!document.fonts || typeof document.fonts.load !== "function") {
    onProgress(1, 1);
    return Promise.resolve(true);
  }

  const sample = "肖子康作品集 目录 数据 图片 视频";
  let completed = 0;
  const requests = [
    Promise.resolve(document.fonts.ready),
    Promise.resolve().then(() => document.fonts.load("400 1em ZHYuwanPortfolio", sample)),
    Promise.resolve().then(() => document.fonts.load("700 1em ZHYuwanPortfolio", sample)),
    Promise.resolve().then(() => document.fonts.load("900 1em ZHYuwanPortfolio", sample)),
  ];
  onProgress(0, requests.length);

  return Promise.allSettled(requests.map((request) => request.finally(() => {
    completed += 1;
    onProgress(completed, requests.length);
  }))).then((results) => {
    if (!results.every((result) => result.status === "fulfilled")) {
      return false;
    }

    if (typeof document.fonts.check !== "function") {
      return true;
    }

    return PAGE_LOADER_FONT_WEIGHTS.every((weight) => document.fonts.check(
      `${weight} 1em ZHYuwanPortfolio`,
      sample,
    ));
  });
}

function isLoaderCriticalElementActive(element) {
  let current = element;
  while (current && current !== document.body) {
    if (current.hidden || current.getAttribute?.("aria-hidden") === "true") {
      return false;
    }
    current = current.parentElement;
  }
  return true;
}

function getLoaderCriticalImages() {
  const explicitImages = Array.from(
    document.querySelectorAll("img[data-loader-critical-image]"),
  ).filter(isLoaderCriticalElementActive);
  const generatedImages = Array.from(
    document.querySelectorAll("[data-loader-critical-image-root]"),
  )
    .filter(isLoaderCriticalElementActive)
    .map((root) => root.querySelector("img"))
    .filter(Boolean);

  return [...new Set([...explicitImages, ...generatedImages])].slice(0, 1);
}

function preparePriorityImage(run, onProgress = () => {}) {
  if (!isCurrentPageLoaderRun(run)) {
    return Promise.resolve([]);
  }

  const images = getLoaderCriticalImages()
    .filter((image) => !run.preparedImages.has(image));

  if (images.length === 0) {
    onProgress(1, 1);
    return Promise.resolve([]);
  }

  let completed = 0;
  images.forEach((image) => run.preparedImages.add(image));
  return Promise.allSettled(images.map((image) => {
    if (image.loading === "lazy") {
      image.loading = "eager";
    }

    const loaded = image.complete
      ? Promise.resolve(true)
      : waitForResourceSettlement(image, run);

    return loaded.then((resourceCompleted) => {
      if (!resourceCompleted || !isCurrentPageLoaderRun(run) || typeof image.decode !== "function") {
        return undefined;
      }

      return image.decode().catch(() => undefined);
    }).finally(() => {
      completed += 1;
      onProgress(completed, images.length);
    });
  }));
}

function waitForPriorityImage(run, onProgress = () => {}) {
  return waitForDomReady(run)
    .then((loaded) => loaded && isCurrentPageLoaderRun(run)
      ? waitForPageLoaderFrame(run)
      : false)
    .then((frameRendered) => frameRendered && isCurrentPageLoaderRun(run)
      ? preparePriorityImage(run, onProgress)
      : []);
}

function waitForStageReadyPaint(run) {
  return waitForDomReady(run)
    .then((domReady) => {
      if (!domReady || !isCurrentPageLoaderRun(run)) {
        return false;
      }

      const stageRoot = document.querySelector("[data-home-stage], [data-detail-stage]");
      if (!stageRoot || document.body.classList.contains("stage-ready")) {
        return true;
      }

      if (typeof window.MutationObserver !== "function") {
        return waitForPageLoaderFrame(run)
          .then(() => document.body.classList.contains("stage-ready"));
      }

      return new Promise((resolve) => {
        let settled = false;
        const observer = new window.MutationObserver(() => {
          if (document.body.classList.contains("stage-ready")) {
            finish(true);
          }
        });
        const finish = (completed) => {
          if (settled) {
            return;
          }
          settled = true;
          observer.disconnect();
          run.lifecycleSettlers.delete(cancel);
          resolve(completed);
        };
        const cancel = () => finish(false);

        run.lifecycleSettlers.add(cancel);
        observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
      });
    })
    .then((stageReady) => stageReady && isCurrentPageLoaderRun(run)
      ? waitForPageLoaderFrame(run)
      : false);
}

function createPageLoaderProgress(run, fill, percent) {
  const prefersReducedMotion = typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let displayed = 8;
  let target = 8;
  let frameTimerId = null;
  let finishing = false;
  const finishWaiters = new Set();

  const render = () => {
    const rounded = Math.round(displayed);
    if (fill) {
      fill.style.transform = `scaleX(${displayed / 100})`;
    }
    if (percent) {
      percent.textContent = `${String(rounded).padStart(2, "0")}%`;
    }
  };

  const settleFinishWaiters = (completed) => {
    [...finishWaiters].forEach((resolve) => resolve(completed));
    finishWaiters.clear();
  };

  const tick = () => {
    frameTimerId = null;
    if (!isCurrentPageLoaderRun(run)) {
      settleFinishWaiters(false);
      return;
    }

    const remaining = target - displayed;
    displayed = remaining <= 0.4
      ? target
      : Math.min(target, displayed + Math.max(finishing ? 3 : 0.75, remaining * 0.28));
    render();

    if (displayed < target) {
      frameTimerId = schedulePageLoaderTimer(run, tick, 16);
    } else if (displayed >= 100) {
      settleFinishWaiters(true);
    }
  };

  const setTarget = (nextTarget) => {
    target = Math.max(target, Math.min(100, nextTarget));
    if (prefersReducedMotion) {
      displayed = target;
      render();
      if (displayed >= 100) {
        settleFinishWaiters(true);
      }
      return;
    }

    if (frameTimerId === null && displayed < target) {
      frameTimerId = schedulePageLoaderTimer(run, tick, 16);
    }
  };

  const cancel = () => {
    if (frameTimerId !== null) {
      clearPageLoaderTimer(run, frameTimerId);
      frameTimerId = null;
    }
    run.progressSettlers.delete(cancel);
    settleFinishWaiters(false);
  };
  run.progressSettlers.add(cancel);
  render();

  return {
    finish: () => {
      finishing = true;
      setTarget(100);
      if (displayed >= 100) {
        return Promise.resolve(true);
      }
      return new Promise((resolve) => finishWaiters.add(resolve));
    },
    setTarget,
  };
}

function cancelPageLoaderWatchdog() {
  const watchdogTimer = window.__pageLoaderWatchdogTimer;
  if (watchdogTimer !== null && watchdogTimer !== undefined) {
    window.clearTimeout(watchdogTimer);
  }
  window.__pageLoaderWatchdogTimer = null;
}

function releasePageLoadingState(loader) {
  if (loader) {
    loader.setAttribute("aria-hidden", "true");
  }
  document.documentElement.classList.remove("is-page-loading");
  document.documentElement.removeAttribute("aria-busy");
  document.body.classList.remove("is-page-loading");
  document.body.removeAttribute("aria-busy");
}

function showPageLoaderError(run, loader) {
  if (!isCurrentPageLoaderRun(run) || !loader) {
    return;
  }

  cancelPageLoaderWatchdog();
  settlePageLoaderLifecycle(run);
  settlePageLoaderResources(run);
  loader.dataset.state = "error";
  loader.setAttribute("role", "alert");
  loader.setAttribute("aria-label", "页面加载未完成，请重新加载");
  const label = loader.querySelector("[data-loading-label]");
  const retry = loader.querySelector("[data-loading-retry]");
  if (label) {
    label.textContent = "加载未完成";
  }
  if (retry) {
    retry.hidden = false;
    retry.onclick = () => window.location.reload();
  }

  invalidatePageLoaderRun(run);
  if (activePageLoaderRun === run) {
    activePageLoaderRun = null;
  }
}

function dismissPageLoader(run, loader) {
  if (!isCurrentPageLoaderRun(run)) {
    return;
  }

  cancelPageLoaderUnlockTimer();
  if (loader) {
    loader.setAttribute("aria-hidden", "true");
  }
  cancelPageLoaderWatchdog();
  invalidatePageLoaderRun(run);
  if (activePageLoaderRun === run) {
    activePageLoaderRun = null;
  }

  const release = () => {
    pageLoaderUnlockTimer = null;
    releasePageLoadingState(loader);
    if (window.location && window.location.hash && typeof syncHashTarget === "function") {
      syncHashTarget();
    }
  };

  const prefersReducedMotion = typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    release();
    return;
  }

  pageLoaderUnlockTimer = window.setTimeout(release, PAGE_LOADER_EXIT_MS);
}

function initPageLoader() {
  const loader = document.querySelector(".page-loader");
  cleanupActivePageLoaderRun();
  if (loader) {
    loader.style.display = "";
  }

  if (window.__pageLoaderWatchdogFired || !loader) {
    releasePageLoadingState(loader);
    if (!window.__pageLoaderWatchdogFired) {
      cancelPageLoaderWatchdog();
    }
    return;
  }

  const run = createPageLoaderRun();
  activePageLoaderRun = run;
  const startedAt = performance.now();
  const fill = loader.querySelector(".page-loader__fill");
  const percent = loader.querySelector("[data-loading-percent]");
  const label = loader.querySelector("[data-loading-label]");
  const retry = loader.querySelector("[data-loading-retry]");
  delete loader.dataset.state;
  loader.setAttribute("role", "status");
  loader.setAttribute("aria-label", "页面正在加载");
  if (label) {
    label.textContent = "LOADING";
  }
  if (retry) {
    retry.hidden = true;
    retry.onclick = null;
  }
  const progress = createPageLoaderProgress(run, fill, percent);
  const resourceProgress = {
    styles: 0,
    fonts: 0,
    priorityImage: 0,
  };
  const reportResourceProgress = (key, completed, total) => {
    if (!isCurrentPageLoaderRun(run)) {
      return;
    }

    const fraction = total > 0 ? Math.min(1, completed / total) : 1;
    resourceProgress[key] = Math.max(resourceProgress[key], fraction);
    const nextProgress = 8 + Object.entries(PAGE_LOADER_PROGRESS_WEIGHTS)
      .reduce((sum, [resourceKey, weight]) => sum + resourceProgress[resourceKey] * weight, 0);
    progress.setTarget(nextProgress);
  };

  document.documentElement.classList.add("is-page-loading");
  document.body.classList.add("is-page-loading");
  document.documentElement.setAttribute("aria-busy", "true");
  document.body.setAttribute("aria-busy", "true");
  loader.removeAttribute("aria-hidden");

  const stylesReady = waitForStylesheets(run, (completed, total) => {
    reportResourceProgress("styles", completed, total);
  });
  const fontsReady = waitForPortfolioFonts((completed, total) => {
    reportResourceProgress("fonts", completed, total);
  });
  const priorityImageReady = Promise.all([stylesReady, fontsReady])
    .then(([, fontReady]) => {
      if (!fontReady || !isCurrentPageLoaderRun(run)) {
        return false;
      }

      return waitForPriorityImage(run, (completed, total) => {
        reportResourceProgress("priorityImage", completed, total);
      }).then(() => true);
    });
  const criticalResourcesSettled = Promise.allSettled([
    stylesReady,
    fontsReady,
    priorityImageReady,
  ]);
  const combinedReadiness = criticalResourcesSettled.then((results) => {
    const fontResult = results[1];
    const fontReady = fontResult.status === "fulfilled" && fontResult.value;
    if (!fontReady) {
      return { kind: "font-error" };
    }

    return waitForStageReadyPaint(run)
      .then((painted) => ({ kind: painted ? "ready" : "stage-error" }));
  });
  let hardTimeoutId = null;
  const hardTimeout = new Promise((resolve) => {
    hardTimeoutId = schedulePageLoaderTimer(run, () => resolve({ kind: "timeout" }), PAGE_LOADER_TIMEOUT_MS);
  });

  Promise.race([combinedReadiness, hardTimeout])
    .then((outcome) => {
      if (!isCurrentPageLoaderRun(run)) {
        return false;
      }

      clearPageLoaderTimer(run, hardTimeoutId);
      cancelPageLoaderWatchdog();
      if (outcome.kind !== "ready") {
        showPageLoaderError(run, loader);
        return false;
      }

      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, PAGE_LOADER_MIN_MS - elapsed);
      const minimumDuration = new Promise((resolve) => {
        schedulePageLoaderTimer(run, () => resolve(true), remaining);
      });
      return Promise.all([progress.finish(), minimumDuration])
        .then(([progressCompleted]) => progressCompleted);
    })
    .then((shouldDismiss) => {
      if (!shouldDismiss || !isCurrentPageLoaderRun(run)) {
        return;
      }

      dismissPageLoader(run, loader);
    });
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    cancelPageLoaderWatchdog();
    window.__pageLoaderWatchdogFired = false;
    cancelPageLoaderUnlockTimer();
    const loader = document.querySelector(".page-loader");
    if (loader) {
      loader.style.display = "";
      loader.removeAttribute("aria-hidden");
    }
    const root = document.documentElement;
    const body = document.body;
    root.classList.add("is-page-loading");
    root.setAttribute("aria-busy", "true");
    if (body) {
      body.classList.add("is-page-loading");
      body.setAttribute("aria-busy", "true");
    }
    const shell = document.querySelector(".page-shell");
    if (shell) {
      shell.style.visibility = "";
      shell.removeAttribute("aria-hidden");
    }
    initPageLoader();
  }
});

window.__pageLoaderControllerCleanup = cleanupActivePageLoaderRun;
initPageLoader();
// PAGE_LOADER_CONTROLLER_END

const navLinks = Array.from(document.querySelectorAll(".nav-pill"));
const sections = Array.from(document.querySelectorAll("main section"));
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const prefersReducedMotion = reduceMotionQuery.matches;

document.body.classList.add("motion-ready");

const scrollProgress = document.querySelector(".scroll-progress span");
const backToTopButton = document.querySelector(".back-to-top");

function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;

  if (scrollProgress) {
    scrollProgress.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  }

  document.body.classList.toggle("is-scrolled-deep", window.scrollY > window.innerHeight * 0.72);
}

let previewScrollLockCount = 0;
let previewScrollY = 0;

function lockPreviewScroll() {
  if (previewScrollLockCount === 0) {
    previewScrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    document.documentElement.classList.add("is-previewing");
    document.body.classList.add("is-previewing");
    document.body.style.top = `-${previewScrollY}px`;
  }

  previewScrollLockCount += 1;
}

function unlockPreviewScroll() {
  if (previewScrollLockCount === 0) {
    return;
  }

  previewScrollLockCount -= 1;

  if (previewScrollLockCount > 0) {
    return;
  }

  const previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  document.documentElement.classList.remove("is-previewing");
  document.body.classList.remove("is-previewing");
  document.body.style.top = "";
  window.scrollTo(0, previewScrollY);
  requestAnimationFrame(() => {
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  });
  previewScrollY = 0;
}

window.lockPreviewScroll = lockPreviewScroll;
window.unlockPreviewScroll = unlockPreviewScroll;

const modalDialogStates = new WeakMap();
const MODAL_FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getModalFocusables(dialog) {
  return Array.from(dialog.querySelectorAll(MODAL_FOCUSABLE_SELECTOR))
    .filter((element) => !element.hidden && getComputedStyle(element).visibility !== "hidden");
}

function activateModalDialog(dialog, opener = document.activeElement) {
  if (!dialog || modalDialogStates.has(dialog)) {
    return;
  }

  dialog.removeAttribute("inert");
  const inertElements = Array.from(document.body.children)
    .filter((element) => element !== dialog && !element.matches("script, .page-loader"))
    .map((element) => ({ element, wasInert: element.hasAttribute("inert") }));

  inertElements.forEach(({ element }) => element.setAttribute("inert", ""));
  modalDialogStates.set(dialog, { opener, inertElements });
  const focusTarget = getModalFocusables(dialog)[0];
  focusTarget?.focus({ preventScroll: true });
}

function deactivateModalDialog(dialog) {
  const state = dialog ? modalDialogStates.get(dialog) : null;
  if (!state) {
    return;
  }

  state.inertElements.forEach(({ element, wasInert }) => {
    if (!wasInert) {
      element.removeAttribute("inert");
    }
  });
  modalDialogStates.delete(dialog);
  dialog.setAttribute("inert", "");
  if (state.opener?.isConnected) {
    state.opener.focus({ preventScroll: true });
  }
}

function trapModalFocus(event, dialog) {
  if (event.key !== "Tab" || !dialog) {
    return;
  }

  const focusable = getModalFocusables(dialog);
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || !dialog.contains(active))) {
    event.preventDefault();
    last.focus({ preventScroll: true });
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
}

document.addEventListener("keydown", (event) => {
  const openDialog = document.querySelector(".website-lightbox.is-open, .resume-overlay.is-open");
  if (openDialog) {
    trapModalFocus(event, openDialog);
  }
});

window.activateModalDialog = activateModalDialog;
window.deactivateModalDialog = deactivateModalDialog;

function initBackToTop() {
  if (!backToTopButton) {
    return;
  }

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
}

function setActiveDetailDirectory() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".detail-directory .directory-item").forEach((item) => {
    const itemPage = item.getAttribute("href")?.split("#")[0];
    item.classList.toggle("active", itemPage === currentPage);
  });
}

function initTiltCards() {
  if (prefersReducedMotion) {
    return;
  }

  document.querySelectorAll("[data-tilt-card]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
      card.style.setProperty("--shine-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--shine-y", `${event.clientY - rect.top}px`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
      card.style.removeProperty("--shine-x");
      card.style.removeProperty("--shine-y");
    });
  });
}

function markLoadedImage(image) {
  image.closest(".detail-shot")?.classList.add("is-loaded");
}

const pendingImageLoadStates = new WeakSet();

function initImageLoadStates(root = document) {
  root.querySelectorAll(".detail-shot img").forEach((image) => {
    const hasLoadedSource = Boolean(
      (image.currentSrc || image.getAttribute("src"))
      && image.complete
      && image.naturalWidth > 0
    );
    if (hasLoadedSource) {
      markLoadedImage(image);
      return;
    }

    if (pendingImageLoadStates.has(image)) {
      return;
    }

    pendingImageLoadStates.add(image);
    image.addEventListener("load", () => {
      pendingImageLoadStates.delete(image);
      markLoadedImage(image);
    }, { once: true });
  });
}

window.initImageLoadStates = initImageLoadStates;

initBackToTop();
setActiveDetailDirectory();
initTiltCards();
initImageLoadStates();
updateScrollProgress();

const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

function revealElement(element) {
  element.classList.add("is-revealed");
}

function revealVisibleItems() {
  if (prefersReducedMotion) {
    return;
  }

  const triggerLine = window.innerHeight * 0.92;
  revealItems.forEach((item) => {
    if (item.classList.contains("is-revealed")) {
      return;
    }

    const rect = item.getBoundingClientRect();
    if (rect.top < triggerLine && rect.bottom > 0) {
      revealElement(item);
      revealObserver.unobserve(item);
    }
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      revealElement(entry.target);
      revealObserver.unobserve(entry.target);
    });
  },
  {
    rootMargin: "0px 0px -16% 0px",
    threshold: 0.18,
  },
);

if (prefersReducedMotion) {
  revealItems.forEach(revealElement);
} else {
  revealItems.forEach((item) => revealObserver.observe(item));
  requestAnimationFrame(revealVisibleItems);
}

function setActiveNav(id) {
  if (document.body.classList.contains("stage-ready")) {
    return;
  }

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
}

function setActiveFromScroll() {
  if (document.body.classList.contains("stage-ready")) {
    return;
  }

  const probeY = window.scrollY + window.innerHeight * 0.42;
  let current = sections[0];

  for (let index = sections.length - 1; index >= 0; index -= 1) {
    if (sections[index].offsetTop <= probeY) {
      current = sections[index];
      break;
    }
  }

  setActiveNav(current.id);
}

const observer = new IntersectionObserver(
  (entries) => {
    if (document.body.classList.contains("stage-ready")) {
      return;
    }

    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) {
      setActiveNav(visible.target.id);
    }
  },
  {
    rootMargin: "-35% 0px -45% 0px",
    threshold: [0.15, 0.35, 0.55],
  },
);

sections.forEach((section) => observer.observe(section));
function syncHashTarget() {
  if (document.body.classList.contains("stage-ready")) {
    return;
  }

  const id = window.location.hash.slice(1);
  const target = id ? document.getElementById(id) : null;

  if (target) {
    window.scrollTo({ top: Math.max(0, target.offsetTop), behavior: "auto" });
    setActiveNav(id);
    requestAnimationFrame(revealVisibleItems);
    return;
  }

  setActiveFromScroll();
  requestAnimationFrame(revealVisibleItems);
}

function syncHashTargetWhenUnlocked() {
  if (document.documentElement.classList.contains("is-page-loading")
    || document.body.classList.contains("is-page-loading")) {
    return;
  }

  syncHashTarget();
}

window.addEventListener("load", () => {
  syncHashTargetWhenUnlocked();
  updateScrollProgress();
  window.setTimeout(syncHashTargetWhenUnlocked, 120);
  window.setTimeout(syncHashTargetWhenUnlocked, 420);
});
window.addEventListener("scroll", () => {
  setActiveFromScroll();
  revealVisibleItems();
  updateScrollProgress();
}, { passive: true });
window.addEventListener("resize", updateScrollProgress);
window.addEventListener("hashchange", syncHashTarget);

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setActiveNav(link.getAttribute("href").slice(1));
  });
});

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const target = entry.target;
      const finalValue = Number(target.dataset.count);
      const duration = 900;
      const start = performance.now();

      if (prefersReducedMotion) {
        target.textContent = Math.round(finalValue);
        counterObserver.unobserve(target);
        return;
      }

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        target.textContent = Math.round(finalValue * eased);

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }

      requestAnimationFrame(tick);
      counterObserver.unobserve(target);
    });
  },
  { threshold: 0.6 },
);

document.querySelectorAll("[data-count]").forEach((counter) => counterObserver.observe(counter));

function animateStatNumber(element) {
  const target = Number(element.dataset.countTarget);
  const decimals = Number(element.dataset.decimals || 0);
  const suffix = element.dataset.suffix || "";
  const duration = 620;
  const start = performance.now();

  if (!Number.isFinite(target)) {
    return;
  }

  if (prefersReducedMotion) {
    element.textContent = `${target.toFixed(decimals)}${suffix}`;
    element.classList.add("is-count-complete");
    return;
  }

  if (element.animationFrameId) {
    cancelAnimationFrame(element.animationFrameId);
  }

  function render(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const value = target * eased;
    element.textContent = `${value.toFixed(decimals)}${suffix}`;

    if (progress < 1) {
      element.animationFrameId = requestAnimationFrame(render);
      return;
    }

    element.textContent = `${target.toFixed(decimals)}${suffix}`;
    element.classList.remove("is-counting");
    element.classList.add("is-count-complete");
  }

  element.classList.add("is-counting");
  element.textContent = `${(0).toFixed(decimals)}${suffix}`;
  element.animationFrameId = requestAnimationFrame(render);
}

let dataStatsPlayed = false;
const dataCardsSection = document.querySelector(".data-cards");

const dataStatsObserver = new IntersectionObserver(
  (entries) => {
    const dataEntry = entries.find((entry) => entry.target === dataCardsSection);

    if (!dataEntry?.isIntersecting || dataStatsPlayed) {
      return;
    }

    dataStatsPlayed = true;
    document.querySelectorAll(".stat-number").forEach(animateStatNumber);
    dataStatsObserver.disconnect();
  },
  {
    rootMargin: "-8% 0px -18% 0px",
    threshold: 0.22,
  },
);

if (dataCardsSection) {
  dataStatsObserver.observe(dataCardsSection);
}

const resumeOverlay = document.querySelector(".resume-overlay");
const resumeOpenBtn = document.querySelector(".floating-resume");
const resumeCloseBtn = document.querySelector(".resume-overlay-close");

function openResume(e) {
  const href = resumeOpenBtn?.getAttribute("href");
  if (href && href !== "#") return;
  e.preventDefault();
  if (!resumeOverlay) return;
  const wasOpen = resumeOverlay.classList.contains("is-open");
  resumeOverlay.classList.add("is-open");
  resumeOverlay.setAttribute("aria-hidden", "false");
  if (!wasOpen) {
    resumeOverlay.removeAttribute("inert");
    lockPreviewScroll();
    activateModalDialog(resumeOverlay, resumeOpenBtn);
  }
  resumeOverlay.querySelector(".resume-modal").scrollTop = 0;
}

function closeResume() {
  if (!resumeOverlay) return;
  const wasOpen = resumeOverlay.classList.contains("is-open");
  resumeOverlay.classList.remove("is-open");
  resumeOverlay.setAttribute("aria-hidden", "true");
  if (wasOpen) {
    unlockPreviewScroll();
    deactivateModalDialog(resumeOverlay);
    resumeOverlay.setAttribute("inert", "");
  }
}

if (resumeOpenBtn) {
  resumeOpenBtn.addEventListener("click", openResume);
}

if (resumeCloseBtn) {
  resumeCloseBtn.addEventListener("click", closeResume);
}

if (resumeOverlay) {
  resumeOverlay.addEventListener("click", function(e) {
    if (e.target === resumeOverlay) {
      closeResume();
    }
  });

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && resumeOverlay.classList.contains("is-open")) {
      closeResume();
    }
  });
}

/* ── Lightbox arrow navigation ── */
(function() {
  const lightbox = document.querySelector(".website-lightbox");
  if (!lightbox) return;

  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");
  if (!prevBtn || !nextBtn) return;

  function navigate(direction) {
    lightbox.portfolioLightboxController?.navigate(direction);
  }

  prevBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    navigate(-1);
  });

  nextBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    navigate(1);
  });

  document.addEventListener("keydown", function(e) {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      navigate(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      navigate(1);
    }
  });

  /* ── Touch swipe + pinch zoom ── */
  const lightboxImage = lightbox.querySelector("img");
  if (!lightboxImage) return;

  let touchZoom = { scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 };
  let touchStartDist = 0;
  let touchStartScale = 1;
  let touchStartX = 0;
  let touchStartY = 0;
  let swipeStartX = 0;
  let swipeActive = false;
  let touchCount = 0;
  const SWIPE_THRESHOLD = 60;

  function getTouchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function applyTouchZoom() {
    if (!lightboxImage) return;
    lightboxImage.style.transform = "translate(" + touchZoom.x + "px, " + touchZoom.y + "px) scale(" + touchZoom.scale + ")";
    lightboxImage.style.cursor = touchZoom.scale > 1 ? (touchZoom.dragging ? "grabbing" : "grab") : "default";
    lightboxImage.style.transition = touchZoom.dragging ? "none" : "";
  }

  function resetTouchZoom() {
    touchZoom = { scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 };
    applyTouchZoom();
  }

  lightbox.addEventListener("touchstart", function(e) {
    touchCount = e.touches.length;

    if (e.touches.length === 1) {
      swipeStartX = e.touches[0].clientX;
      swipeActive = true;
      if (touchZoom.scale > 1) {
        touchZoom.dragging = true;
        touchZoom.lastX = e.touches[0].clientX;
        touchZoom.lastY = e.touches[0].clientY;
      }
    } else if (e.touches.length === 2) {
      swipeActive = false;
      touchStartDist = getTouchDist(e.touches);
      touchStartScale = touchZoom.scale;
      var midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      var midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      touchStartX = midX;
      touchStartY = midY;
    }
  }, { passive: false });

  lightbox.addEventListener("touchmove", function(e) {
    if (!lightbox.classList.contains("is-open")) return;

    if (e.touches.length === 2) {
      e.preventDefault();
      var dist = getTouchDist(e.touches);
      var scale = Math.min(5, Math.max(0.5, touchStartScale * (dist / touchStartDist)));
      var midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      var midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      touchZoom.scale = scale;
      if (scale <= 1) {
        touchZoom.x = 0;
        touchZoom.y = 0;
      } else {
        touchZoom.x += midX - touchStartX;
        touchZoom.y += midY - touchStartY;
        touchStartX = midX;
        touchStartY = midY;
      }
      applyTouchZoom();
      return;
    }

    if (e.touches.length === 1 && touchZoom.dragging && touchZoom.scale > 1) {
      e.preventDefault();
      touchZoom.x += e.touches[0].clientX - touchZoom.lastX;
      touchZoom.y += e.touches[0].clientY - touchZoom.lastY;
      touchZoom.lastX = e.touches[0].clientX;
      touchZoom.lastY = e.touches[0].clientY;
      applyTouchZoom();
    }
  }, { passive: false });

  lightbox.addEventListener("touchend", function(e) {
    if (touchCount === 1 && swipeActive && touchZoom.scale <= 1) {
      var dx = (e.changedTouches[0] ? e.changedTouches[0].clientX : 0) - swipeStartX;
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        e.preventDefault();
        navigate(dx < 0 ? 1 : -1);
      }
    }

    if (e.touches.length === 0) {
      touchZoom.dragging = false;
      swipeActive = false;
      applyTouchZoom();
    }

    touchCount = e.touches.length;
  });

  lightbox.addEventListener("portfolio:lightboxchange", resetTouchZoom);
})();

/* ── Video Playback ── */
const videoStage = document.getElementById("videoStage");
const heroVideo = document.getElementById("heroVideo");
const playBtn = document.getElementById("playBtn");
const videoLoading = document.getElementById("videoLoading");
const communityVideoStates = new WeakMap();
let heroPlayAttempt = 0;

function setVideoControlsAccess(video, isActive) {
  if (!video) return;
  video.controls = isActive;
  video.tabIndex = isActive ? 0 : -1;
  video.setAttribute("aria-hidden", isActive ? "false" : "true");
}

function rewindVideo(video) {
  try {
    video.currentTime = 0;
  } catch (error) {
    // Media without loaded metadata cannot always be seeked.
  }
}

function unloadVideoSource(video) {
  if (!video?.getAttribute("src")) return;
  video.removeAttribute("src");
  video.load();
}

function getCommunityVideoState(video) {
  let state = communityVideoStates.get(video);
  if (!state) {
    state = { attempt: 0 };
    communityVideoStates.set(video, state);
  }
  return state;
}

function resetCommunityVideoCard(card, options = {}) {
  const video = card?.querySelector("video[data-src]");
  const button = card?.querySelector(".community-play-btn");
  if (!video) return;

  getCommunityVideoState(video).attempt += 1;
  video.pause();
  if (options.rewind) rewindVideo(video);
  if (options.unload) unloadVideoSource(video);
  setVideoControlsAccess(video, false);

  card.classList.remove("is-playing");
  card.classList.remove("is-loading");
  card.classList.remove("is-error");

  if (button) {
    button.disabled = false;
    if (options.focus) button.focus();
  }
}

function resetHeroVideo(options = {}) {
  if (!heroVideo) return;

  heroPlayAttempt += 1;
  heroVideo.pause();
  if (options.rewind) rewindVideo(heroVideo);
  if (options.unload) unloadVideoSource(heroVideo);
  setVideoControlsAccess(heroVideo, false);
  heroVideo.classList.remove("is-loaded");
  heroVideo.classList.remove("is-error");

  if (playBtn) {
    playBtn.classList.remove("is-hidden");
    playBtn.disabled = false;
    if (options.focus) playBtn.focus();
  }
  if (videoLoading) {
    videoLoading.classList.remove("is-active");
    videoLoading.classList.remove("is-error");
  }
  videoStage?.classList?.remove("is-playing");
  videoStage?.classList?.remove("is-error");
}

function pauseOtherVideos(activeVideo) {
  document.querySelectorAll("video").forEach((video) => {
    if (video === activeVideo) return;
    const card = video.closest(".community-video-card");
    if (card) {
      resetCommunityVideoCard(card);
    } else if (video === heroVideo) {
      resetHeroVideo();
    } else {
      video.pause();
    }
  });
}

function pauseAllPortfolioVideos() {
  pauseOtherVideos(null);
}

function resetPortfolioVideoUi() {
  document.querySelectorAll(".community-video-card").forEach((card) => {
    resetCommunityVideoCard(card, { rewind: true, unload: true });
  });
  resetHeroVideo({ rewind: true, unload: true });
}

if (playBtn && heroVideo) {
  setVideoControlsAccess(heroVideo, false);

  playBtn.addEventListener("click", () => {
    const attempt = ++heroPlayAttempt;
    playBtn.disabled = true;
    playBtn.classList.add("is-hidden");
    if (videoLoading) videoLoading.classList.add("is-active");

    if (!heroVideo.getAttribute("src") && heroVideo.dataset.src) {
      heroVideo.setAttribute("src", heroVideo.dataset.src);
      heroVideo.load();
    }

    heroVideo.classList.add("is-loaded");
    setVideoControlsAccess(heroVideo, true);
    pauseOtherVideos(heroVideo);

    heroVideo.addEventListener("playing", function onPlay() {
      heroVideo.removeEventListener("playing", onPlay);
      if (attempt !== heroPlayAttempt) return;
      if (videoLoading) videoLoading.classList.remove("is-active");
      playBtn.disabled = false;
    });

    heroVideo.play().catch(() => {
      if (attempt !== heroPlayAttempt) return;
      resetHeroVideo({ rewind: true, unload: true, focus: true });
    });
  });

  heroVideo.addEventListener("play", () => pauseOtherVideos(heroVideo));
}

function initCommunityVideoCards() {
  document.querySelectorAll(".community-video-card").forEach((card) => {
    const video = card.querySelector("video[data-src]");
    const playButton = card.querySelector(".community-play-btn");

    if (!video || !playButton) return;
    const state = getCommunityVideoState(video);
    setVideoControlsAccess(video, false);

    const loadAndPlay = () => {
      const attempt = ++state.attempt;
      pauseOtherVideos(video);

      card.classList.remove("is-error");
      card.classList.add("is-loading");
      playButton.disabled = true;
      setVideoControlsAccess(video, true);

      if (!video.getAttribute("src") && video.dataset.src) {
        video.setAttribute("src", video.dataset.src);
        video.load();
      }

      video.play().catch(() => {
        if (attempt !== state.attempt) return;
        resetCommunityVideoCard(card, { rewind: true, unload: true, focus: true });
      });
    };

    playButton.addEventListener("click", loadAndPlay);
    video.addEventListener("play", () => {
      pauseOtherVideos(video);
      card.classList.remove("is-loading");
      card.classList.add("is-playing");
      playButton.disabled = false;
      setVideoControlsAccess(video, true);
    });
    video.addEventListener("pause", () => {
      card.classList.remove("is-playing");
      if (!card.classList.contains("is-loading")) setVideoControlsAccess(video, false);
    });
    video.addEventListener("ended", () => {
      rewindVideo(video);
      card.classList.remove("is-playing");
      card.classList.remove("is-loading");
      setVideoControlsAccess(video, false);
      playButton.focus();
    });
  });
}

initCommunityVideoCards();

const communityVideoGrid = document.querySelector(".community-video-grid");
if (communityVideoGrid) {
  window.DetailStage?.registerGallery("community-video", communityVideoGrid, {
    kind: "video",
    itemSelector: "[data-video-page-item]",
  });
}

document.addEventListener("portfolio:stagechange", resetPortfolioVideoUi);

if ("serviceWorker" in navigator && /^https?:$/.test(window.location.protocol)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js?v=click-stage-11").catch(() => {});
  });
}
