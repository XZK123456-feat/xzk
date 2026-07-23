(function (window, document) {
  "use strict";

  function normalizeAllowedViews(allowedViews, fallback) {
    const views = Array.from(allowedViews || [])
      .map((view) => String(view || ""))
      .filter(Boolean);
    const fallbackView = views.includes(fallback)
      ? fallback
      : (views[0] || String(fallback || "overview"));
    return { views, fallbackView };
  }

  function parse(hash, allowedViews, fallback = "overview") {
    const { views, fallbackView } = normalizeAllowedViews(allowedViews, fallback);
    const rawValue = String(hash || "").replace(/^#/, "");
    const rawMatch = rawValue.match(/^(.*)-p(\d+)$/);
    const parsed = {
      view: rawMatch ? rawMatch[1] : (rawValue || fallbackView),
      page: rawMatch ? Number(rawMatch[2]) : 1,
    };
    const view = views.includes(parsed?.view) ? parsed.view : fallbackView;
    const page = Number(parsed?.page);

    return {
      view,
      page: view === parsed?.view && Number.isInteger(page) && page >= 1 ? page : 1,
    };
  }

  function format(state) {
    const view = String(state?.view || "overview");
    const page = Number(state?.page);
    const normalizedPage = Number.isInteger(page) && page >= 1 ? page : 1;
    return `#${view}${normalizedPage > 1 ? `-p${normalizedPage}` : ""}`;
  }

  function pageLimitFor(view, limits) {
    const limit = Number(limits?.[view]);
    return Number.isInteger(limit) && limit >= 1 ? limit : Number.POSITIVE_INFINITY;
  }

  function clampPage(page, limit) {
    const numeric = Number(page);
    const normalized = Number.isInteger(numeric) ? numeric : 1;
    return Math.min(Math.max(normalized, 1), limit);
  }

  function reduce(state, action, limits = {}) {
    const currentView = String(state?.view || "overview");
    const current = {
      view: currentView,
      page: clampPage(state?.page, pageLimitFor(currentView, limits)),
    };

    switch (action?.type) {
      case "SELECT_VIEW": {
        const view = String(action.view || current.view);
        return {
          view,
          page: clampPage(action.page, pageLimitFor(view, limits)),
        };
      }
      case "SET_PAGE":
        return {
          view: current.view,
          page: clampPage(action.page, pageLimitFor(current.view, limits)),
        };
      case "NEXT_PAGE":
        return {
          view: current.view,
          page: clampPage(current.page + 1, pageLimitFor(current.view, limits)),
        };
      case "PREVIOUS_PAGE":
        return {
          view: current.view,
          page: clampPage(current.page - 1, pageLimitFor(current.view, limits)),
        };
      default:
        return current;
    }
  }

  function statesEqual(left, right) {
    return left?.view === right?.view && left?.page === right?.page;
  }

  window.DetailStageState = Object.freeze({
    parse,
    format,
    reduce,
  });

  let controller = null;
  const pendingGalleries = [];
  const publicApi = {
    registerGallery(viewId, root, options = {}) {
      if (controller) {
        return controller.registerGallery(viewId, root, options);
      }
      pendingGalleries.push([viewId, root, options]);
      return false;
    },
    refreshGallery(viewId) {
      return controller ? controller.refreshGallery(viewId) : false;
    },
  };
  window.DetailStage = Object.freeze(publicApi);

  if (!document?.body || typeof document.querySelector !== "function") {
    return;
  }

  const body = document.body;
  const root = document.querySelector("[data-detail-stage]");
  const tablist = document.querySelector('[role="tablist"]');
  const pager = document.querySelector("[data-stage-pager]");
  const rail = document.querySelector("[data-task-rail]");
  const stageWipe = document.querySelector(".stage-wipe");
  const panels = Array.from(root?.querySelectorAll("[data-stage-view]") || []);
  const tabs = Array.from(tablist?.querySelectorAll("[data-stage-tab]") || []);
  const previous = pager?.querySelector("[data-stage-previous]");
  const status = pager?.querySelector("[data-stage-status]");
  const next = pager?.querySelector("[data-stage-next]");
  const railToggle = rail?.querySelector("[data-task-rail-toggle]");
  const taskLinks = Array.from(rail?.querySelectorAll(".directory-item") || []);
  const stageWipeLabel = stageWipe?.querySelector("span");
  const allowedViews = panels.map((panel) => panel.dataset.stageView);
  const defaultView = root?.dataset.defaultView || "overview";
  const panelByView = new Map(panels.map((panel) => [panel.dataset.stageView, panel]));
  const tabByView = new Map(tabs.map((tab) => [tab.dataset.stageTab, tab]));

  const validStructure = Boolean(
    root
    && tablist
    && pager
    && rail
    && previous
    && status
    && next
    && railToggle
    && stageWipe
    && stageWipeLabel
    && panels.length > 0
    && tabs.length === panels.length
    && taskLinks.length === 4
    && allowedViews.includes(defaultView)
    && allowedViews.every((view) => tabByView.has(view))
    && typeof window.PortfolioStage?.getPageSize === "function"
    && typeof window.history?.pushState === "function"
    && typeof window.history?.replaceState === "function"
  );

  if (!validStructure) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const galleries = new Map();
  const limits = {};
  const pagesByView = Object.fromEntries(allowedViews.map((view) => [view, 1]));
  let desiredState;
  let appliedState = null;
  let wipeGeneration = 0;
  let wipeMidpointTimer = null;
  let wipeEndTimer = null;
  let pageTimer = null;
  let pendingCategoryView = null;

  function isStoredStateValid(value) {
    return Boolean(
      value
      && allowedViews.includes(value.view)
      && Number.isInteger(value.page)
      && value.page >= 1
    );
  }

  function readStoredState(historyState) {
    const stored = historyState?.portfolioDetailState;
    return isStoredStateValid(stored) ? { view: stored.view, page: stored.page } : null;
  }

  function writeHistory(state, mode) {
    const normalized = reduce(state, { type: "SET_PAGE", page: state.page }, limits);
    const historyState = {
      portfolioDetailState: {
        view: normalized.view,
        page: normalized.page,
      },
    };
    window.history[mode === "push" ? "pushState" : "replaceState"](
      historyState,
      "",
      format(normalized),
    );
  }

  function pauseAllVideos() {
    Array.from(document.querySelectorAll("video") || []).forEach((video) => {
      if (typeof video.pause === "function") {
        video.pause();
      }
      video.closest?.(".community-video-card")?.classList.remove("is-playing");
    });
  }

  function setElementVisibility(element, visible) {
    element.hidden = !visible;
    if (visible) {
      element.removeAttribute("inert");
      element.removeAttribute("aria-hidden");
    } else {
      element.setAttribute("inert", "");
      element.setAttribute("aria-hidden", "true");
    }
  }

  function renderGallery(gallery, page) {
    const firstIndex = (page - 1) * gallery.pageSize;
    const lastIndex = firstIndex + gallery.pageSize;
    gallery.items.forEach((item, index) => {
      setElementVisibility(item, index >= firstIndex && index < lastIndex);
    });
    gallery.page = page;
  }

  function renderPager(state) {
    const gallery = galleries.get(state.view);
    const pageCount = gallery?.pageCount || 1;
    const showPager = Boolean(gallery && pageCount > 1);
    pager.hidden = !showPager;
    pager.setAttribute("aria-hidden", String(!showPager));
    previous.disabled = !showPager || state.page <= 1;
    next.disabled = !showPager || state.page >= pageCount;
    status.textContent = `${String(state.page).padStart(2, "0")} / ${String(pageCount).padStart(2, "0")}`;
  }

  function dispatchStageChange(state) {
    document.dispatchEvent(new window.CustomEvent("portfolio:stagechange", {
      detail: {
        view: state.view,
        page: state.page,
      },
    }));
  }

  function applyState(state) {
    const normalized = reduce(state, { type: "SET_PAGE", page: state.page }, limits);
    if (appliedState && !statesEqual(appliedState, normalized)) {
      pauseAllVideos();
    }

    tabs.forEach((tab) => {
      const active = tab.dataset.stageTab === normalized.view;
      tab.classList.toggle("active", active);
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.setAttribute("tabindex", active ? "0" : "-1");
    });
    panels.forEach((panel) => {
      const active = panel.dataset.stageView === normalized.view;
      panel.classList.toggle("active", active);
      panel.classList.toggle("is-active", active);
      setElementVisibility(panel, active);
    });

    const gallery = galleries.get(normalized.view);
    if (gallery) {
      renderGallery(gallery, normalized.page);
    }
    renderPager(normalized);
    pagesByView[normalized.view] = normalized.page;
    desiredState = normalized;
    appliedState = normalized;
    dispatchStageChange(normalized);
  }

  function cancelWipe() {
    wipeGeneration += 1;
    if (wipeMidpointTimer !== null) {
      window.clearTimeout(wipeMidpointTimer);
      wipeMidpointTimer = null;
    }
    if (wipeEndTimer !== null) {
      window.clearTimeout(wipeEndTimer);
      wipeEndTimer = null;
    }
    stageWipe.classList.remove("is-running");
  }

  function runWipe(label, action) {
    cancelWipe();
    const generation = wipeGeneration;
    stageWipeLabel.textContent = label;
    if (prefersReducedMotion.matches) {
      action();
      return;
    }

    void stageWipe.offsetWidth;
    stageWipe.classList.add("is-running");
    wipeMidpointTimer = window.setTimeout(() => {
      wipeMidpointTimer = null;
      if (generation === wipeGeneration) {
        action();
      }
    }, 275);
    wipeEndTimer = window.setTimeout(() => {
      wipeEndTimer = null;
      if (generation === wipeGeneration) {
        stageWipe.classList.remove("is-running");
      }
    }, 550);
  }

  function runPageTransition(action) {
    if (pageTimer !== null) {
      window.clearTimeout(pageTimer);
    }
    root.classList.remove("is-page-transitioning");
    void root.offsetWidth;
    root.classList.add("is-page-transitioning");
    action();
    pageTimer = window.setTimeout(() => {
      pageTimer = null;
      root.classList.remove("is-page-transitioning");
    }, 210);
  }

  function commitCategory(view) {
    const nextState = reduce(desiredState, {
      type: "SELECT_VIEW",
      view,
      page: pagesByView[view] || 1,
    }, limits);
    if (statesEqual(nextState, desiredState)) {
      return false;
    }

    desiredState = nextState;
    writeHistory(nextState, "push");
    pendingCategoryView = view;
    runWipe(tabByView.get(view)?.textContent || "MISSION SWITCH", () => {
      pendingCategoryView = null;
      applyState(desiredState);
    });
    return true;
  }

  function commitPage(action) {
    if (pendingCategoryView !== null) {
      return false;
    }
    const nextState = reduce(desiredState, action, limits);
    if (statesEqual(nextState, desiredState)) {
      return false;
    }

    desiredState = nextState;
    writeHistory(nextState, "push");
    runPageTransition(() => applyState(desiredState));
    return true;
  }

  function closeRail(restoreFocus) {
    const wasOpen = rail.classList.contains("is-open");
    rail.classList.remove("is-open");
    railToggle.setAttribute("aria-expanded", "false");
    railToggle.setAttribute("aria-label", "展开任务目录");
    if (wasOpen && restoreFocus) {
      railToggle.focus();
    }
  }

  function restoreLocation(event) {
    cancelWipe();
    pendingCategoryView = null;
    if (pageTimer !== null) {
      window.clearTimeout(pageTimer);
      pageTimer = null;
      root.classList.remove("is-page-transitioning");
    }

    const stored = event?.type === "popstate" ? readStoredState(event.state) : null;
    const restored = stored || parse(window.location.hash, allowedViews, defaultView);
    desiredState = reduce(restored, { type: "SET_PAGE", page: restored.page }, limits);
    applyState(desiredState);
    if (!stored) {
      writeHistory(desiredState, "replace");
    }
  }

  function pageSizeFor(gallery) {
    const size = Number(window.PortfolioStage.getPageSize(
      gallery.kind || gallery.viewId,
      window.innerWidth,
      window.innerHeight,
    ));
    return Number.isInteger(size) && size >= 1 ? size : 1;
  }

  function refreshGallery(viewId, preserveFirst = true) {
    const gallery = galleries.get(String(viewId));
    if (!gallery) {
      return false;
    }

    const previousSize = gallery.pageSize || 1;
    const isAppliedView = gallery.viewId === appliedState?.view;
    const canApplyGallery = pendingCategoryView === null
      && isAppliedView
      && gallery.viewId === desiredState.view;
    const previousPage = isAppliedView ? appliedState.page : gallery.page;
    const firstVisibleIndex = Math.max(0, (previousPage - 1) * previousSize);
    gallery.items = Array.from(gallery.root.querySelectorAll(gallery.itemSelector) || []);
    gallery.pageSize = pageSizeFor(gallery);
    gallery.pageCount = Math.max(1, Math.ceil(gallery.items.length / gallery.pageSize));
    limits[gallery.viewId] = gallery.pageCount;

    if (canApplyGallery) {
      const requestedPage = preserveFirst
        ? Math.floor(firstVisibleIndex / gallery.pageSize) + 1
        : desiredState.page;
      desiredState = reduce(desiredState, {
        type: "SET_PAGE",
        page: requestedPage,
      }, limits);
      applyState(desiredState);
      writeHistory(desiredState, "replace");
    } else {
      gallery.page = Math.min(Math.max(gallery.page || 1, 1), gallery.pageCount);
      renderGallery(gallery, gallery.page);
    }
    return true;
  }

  function registerGallery(viewId, galleryRoot, options = {}) {
    const view = String(viewId || "");
    if (!allowedViews.includes(view) || !galleryRoot || typeof galleryRoot.querySelectorAll !== "function") {
      return false;
    }

    galleries.set(view, {
      viewId: view,
      root: galleryRoot,
      kind: String(options.kind || view),
      itemSelector: String(options.itemSelector || "[data-detail-preview]"),
      items: [],
      page: 1,
      pageSize: 1,
      pageCount: 1,
    });
    return refreshGallery(view, false);
  }

  function registerDeclarativeGalleries() {
    panels.forEach((panel) => {
      const galleryRoot = panel.querySelector("[data-stage-gallery]");
      if (!galleryRoot) {
        return;
      }
      const view = galleryRoot.dataset.stageGallery || panel.dataset.stageView;
      const options = {
        kind: galleryRoot.dataset.stageGalleryKind,
        itemSelector: galleryRoot.dataset.stageGalleryItems,
      };
      const syncGallery = () => {
        const itemSelector = options.itemSelector || "[data-detail-preview]";
        if (
          galleryRoot.classList.contains("is-gallery-loading")
          || galleryRoot.querySelectorAll(itemSelector).length === 0
        ) {
          return;
        }
        if (galleries.has(view)) {
          refreshGallery(view);
        } else {
          registerGallery(view, galleryRoot, options);
        }
      };

      syncGallery();
      if (typeof window.MutationObserver === "function") {
        const observer = new window.MutationObserver(syncGallery);
        observer.observe(galleryRoot, { childList: true });
      }
    });
  }

  controller = {
    registerGallery,
    refreshGallery,
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", (event) => {
      event.preventDefault();
      commitCategory(tab.dataset.stageTab);
    });
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }
      event.preventDefault();
      event.stopPropagation?.();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + direction + tabs.length) % tabs.length;
      commitCategory(tabs[nextIndex].dataset.stageTab);
      tabs[nextIndex].focus();
    });
  });

  previous.addEventListener("click", () => commitPage({ type: "PREVIOUS_PAGE" }));
  next.addEventListener("click", () => commitPage({ type: "NEXT_PAGE" }));

  railToggle.addEventListener("click", () => {
    const open = !rail.classList.contains("is-open");
    rail.classList.toggle("is-open", open);
    railToggle.setAttribute("aria-expanded", String(open));
    railToggle.setAttribute("aria-label", open ? "收起任务目录" : "展开任务目录");
  });

  taskLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.getAttribute("aria-current") === "page") {
        event.preventDefault();
        closeRail(true);
        return;
      }
      event.preventDefault();
      closeRail(true);
      const href = link.getAttribute("href");
      runWipe(link.textContent || "MISSION SWITCH", () => window.location.assign(href));
    });
  });

  document.addEventListener("click", (event) => {
    if (rail.classList.contains("is-open") && !rail.contains(event.target)) {
      closeRail(true);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeRail(true);
      return;
    }
    if (
      event.key !== "ArrowLeft"
      && event.key !== "ArrowRight"
    ) {
      return;
    }
    if (
      event.target?.dataset?.stageTab !== undefined
      || event.target?.closest?.("input, textarea, select, button, video, audio, [contenteditable=\"true\"]")
      || document.querySelector('.website-lightbox.is-open, .resume-overlay.is-open, [role="dialog"].is-open')
    ) {
      return;
    }

    event.preventDefault();
    commitPage({
      type: event.key === "ArrowRight" ? "NEXT_PAGE" : "PREVIOUS_PAGE",
    });
  });

  window.addEventListener("popstate", restoreLocation);
  window.addEventListener("hashchange", restoreLocation);
  window.addEventListener("resize", () => {
    galleries.forEach((gallery) => refreshGallery(gallery.viewId, true));
  });

  desiredState = readStoredState(window.history.state)
    || parse(window.location.hash, allowedViews, defaultView);
  applyState(desiredState);
  writeHistory(desiredState, "replace");
  body.classList.add("stage-ready");

  pendingGalleries.splice(0).forEach(([viewId, galleryRoot, options]) => {
    registerGallery(viewId, galleryRoot, options);
  });
  registerDeclarativeGalleries();
})(window, document);
