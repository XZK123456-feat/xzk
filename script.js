// PAGE_LOADER_CONTROLLER_START
const PAGE_LOADER_MIN_MS = 350;
const PAGE_LOADER_TIMEOUT_MS = 5000;
const PAGE_LOADER_EXIT_MS = 400;

let activePageLoaderRun = null;
let pageLoaderUnlockTimer = null;

function createPageLoaderRun() {
  return {
    active: true,
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

function invalidatePageLoaderRun(run) {
  if (!run || !run.active) {
    return;
  }

  run.active = false;
  run.timerIds.forEach((timerId) => window.clearTimeout(timerId));
  run.timerIds.clear();
  settlePageLoaderResources(run);
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
    const settle = () => {
      if (settled) {
        return;
      }

      settled = true;
      resource.removeEventListener("load", settle);
      resource.removeEventListener("error", settle);
      run.resourceSettlers.delete(settle);
      resolve();
    };

    resource.addEventListener("load", settle);
    resource.addEventListener("error", settle);
    run.resourceSettlers.add(settle);
  });
}

function waitForStylesheets(run) {
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

  return Promise.allSettled(stylesheets.map((link) => {
    if (link.sheet || link.dataset.loaderState === "loaded" || link.dataset.loaderState === "error") {
      return Promise.resolve();
    }

    return waitForResourceSettlement(link, run);
  }));
}

function waitForFirstViewImages(run) {
  const firstViewLimit = window.innerHeight * 1.25;
  const images = Array.from(document.images).filter((image) => {
    if (image.loading === "lazy") {
      return false;
    }

    const rect = image.getBoundingClientRect();
    return rect.top < firstViewLimit && rect.bottom > 0;
  });

  return Promise.allSettled(images.map((image) => {
    if (image.complete) {
      return Promise.resolve();
    }

    return waitForResourceSettlement(image, run);
  }));
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
  let currentProgress = 8;

  const setProgress = (nextProgress) => {
    if (!isCurrentPageLoaderRun(run)) {
      return;
    }

    currentProgress = Math.max(currentProgress, Math.min(100, nextProgress));
    const normalizedProgress = currentProgress / 100;

    if (fill) {
      fill.style.transform = `scaleX(${normalizedProgress})`;
    }

    if (percent) {
      percent.textContent = `${String(Math.round(currentProgress)).padStart(2, "0")}%`;
    }
  };

  document.documentElement.classList.add("is-page-loading");
  document.body.classList.add("is-page-loading");
  document.documentElement.setAttribute("aria-busy", "true");
  document.body.setAttribute("aria-busy", "true");
  loader.removeAttribute("aria-hidden");
  setProgress(8);

  const stylesReady = waitForStylesheets(run).then(() => setProgress(38));
  const fontsReady = (document.fonts
    ? document.fonts.ready.catch(() => undefined)
    : Promise.resolve())
    .then(() => setProgress(68));
  const imagesReady = waitForFirstViewImages(run).then(() => setProgress(92));
  const combinedReadiness = Promise.allSettled([stylesReady, fontsReady, imagesReady]);
  let hardTimeoutId = null;
  const hardTimeout = new Promise((resolve) => {
    hardTimeoutId = schedulePageLoaderTimer(run, resolve, PAGE_LOADER_TIMEOUT_MS);
  });

  Promise.race([combinedReadiness, hardTimeout])
    .then(() => {
      if (!isCurrentPageLoaderRun(run)) {
        return false;
      }

      clearPageLoaderTimer(run, hardTimeoutId);
      settlePageLoaderResources(run);
      setProgress(100);
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, PAGE_LOADER_MIN_MS - elapsed);

      return new Promise((resolve) => {
        schedulePageLoaderTimer(run, () => resolve(true), remaining);
      });
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

function initImageLoadStates(root = document) {
  root.querySelectorAll(".detail-shot img").forEach((image) => {
    if (image.complete) {
      markLoadedImage(image);
      return;
    }

    image.addEventListener("load", () => markLoadedImage(image), { once: true });
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
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
}

function setActiveFromScroll() {
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

window.addEventListener("load", () => {
  syncHashTarget();
  updateScrollProgress();
  window.setTimeout(syncHashTarget, 120);
  window.setTimeout(syncHashTarget, 420);
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
    lockPreviewScroll();
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

  let currentButton = null;

  // Track which button opened the lightbox, prevent old-image flash
  document.addEventListener("click", function(e) {
    const previewBtn = e.target.closest("[data-detail-preview]");
    if (previewBtn) {
      currentButton = previewBtn;
      var img = lightbox.querySelector("img");
      if (img) {
        img.style.opacity = "0";
        img.style.transition = "opacity 0.12s ease";
      }
    }
  }, true);

  var lbImg = lightbox.querySelector("img");
  if (lbImg) {
    lbImg.addEventListener("load", function() {
      this.style.opacity = "1";
    });
    lbImg.addEventListener("error", function() {
      this.style.opacity = "1";
    });
  }

  function getAllPreviews() {
    if (!currentButton) return [];
    const gallery = currentButton.closest(".detail-gallery");
    if (!gallery) return [];
    return Array.from(gallery.querySelectorAll("[data-detail-preview]"));
  }

  function navigate(direction) {
    if (!lightbox.classList.contains("is-open")) return;
    const all = getAllPreviews();
    if (all.length === 0) return;
    const idx = all.indexOf(currentButton);
    if (idx === -1) return;
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= all.length) return;

    currentButton = all[nextIdx];
    currentButton.click();
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

  // Reset zoom when opening a new image
  document.addEventListener("click", function(e) {
    var previewBtn = e.target.closest("[data-detail-preview]");
    if (previewBtn) {
      resetTouchZoom();
    }
  }, true);
})();

/* ── Video Playback ── */
const videoStage = document.getElementById("videoStage");
const heroVideo = document.getElementById("heroVideo");
const playBtn = document.getElementById("playBtn");
const videoLoading = document.getElementById("videoLoading");

function pauseOtherVideos(activeVideo) {
  document.querySelectorAll("video").forEach((video) => {
    if (video !== activeVideo) {
      video.pause();
      video.closest(".community-video-card")?.classList.remove("is-playing");
    }
  });
}

if (playBtn && heroVideo) {
  playBtn.addEventListener("click", () => {
    playBtn.classList.add("is-hidden");
    if (videoLoading) videoLoading.classList.add("is-active");

    if (!heroVideo.src) {
      heroVideo.src = "assets/video/买量视频混剪.mp4";
      heroVideo.load();
    }

    heroVideo.classList.add("is-loaded");
    pauseOtherVideos(heroVideo);

    heroVideo.addEventListener("playing", function onPlay() {
      if (videoLoading) videoLoading.classList.remove("is-active");
      heroVideo.removeEventListener("playing", onPlay);
    });

    heroVideo.play().catch(() => {
      if (videoLoading) videoLoading.classList.remove("is-active");
    });
  });

  heroVideo.addEventListener("play", () => pauseOtherVideos(heroVideo));
}

function initCommunityVideoCards() {
  document.querySelectorAll(".community-video-card").forEach((card) => {
    const video = card.querySelector("video[data-src]");
    const playButton = card.querySelector(".community-play-btn");

    if (!video || !playButton) return;

    const loadAndPlay = () => {
      if (!video.src) {
        video.src = video.dataset.src;
        video.load();
      }

      card.classList.add("is-playing");
      pauseOtherVideos(video);

      video.play().catch(() => {});
    };

    playButton.addEventListener("click", loadAndPlay);
    video.addEventListener("play", () => {
      pauseOtherVideos(video);
      card.classList.add("is-playing");
    });
    video.addEventListener("pause", () => card.classList.remove("is-playing"));
    video.addEventListener("ended", () => card.classList.remove("is-playing"));
  });
}

initCommunityVideoCards();
