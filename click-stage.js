(function (window, document) {
  "use strict";

  function parseHash(hash, fallbackView) {
    const value = String(hash || "").replace(/^#/, "");
    const match = value.match(/^(.*)-p(\d+)$/);

    if (match) {
      return {
        view: match[1],
        page: Number(match[2]),
      };
    }

    return {
      view: value || fallbackView,
      page: 1,
    };
  }

  function formatHash(view, page) {
    return `#${view}${page > 1 ? `-p${page}` : ""}`;
  }

  const galleryLayouts = {
    horizontal: { aspectRatio: 16 / 9, maxColumns: 6, minWidth: 180 },
    vertical: { aspectRatio: 9 / 16, maxColumns: 4, minWidth: 150 },
    square: { aspectRatio: 1, maxColumns: 4, minWidth: 150 },
    video: { aspectRatio: 16 / 9, maxColumns: 3, minWidth: 220 },
  };

  function resolveGalleryKind(kind, items = []) {
    const normalized = String(kind || "horizontal");
    if (normalized !== "mixed") {
      return galleryLayouts[normalized] ? normalized : "horizontal";
    }

    const dimensions = Array.from(items || []).map((item) => ({
      height: Number(item?.naturalHeight || item?.height || item?.getAttribute?.("height") || 0),
      width: Number(item?.naturalWidth || item?.width || item?.getAttribute?.("width") || 0),
    }));
    const portraitCount = dimensions.filter(({ height, width }) => height > width && width > 0).length;
    return dimensions.length > 0 && portraitCount > dimensions.length / 2
      ? "vertical"
      : "horizontal";
  }

  function getGalleryLayout(kind, width, height, bounds = {}) {
    const resolvedKind = resolveGalleryKind(kind);
    const config = galleryLayouts[resolvedKind];
    const measuredAspectRatio = Number(bounds.aspectRatio);
    const aspectRatio = Number.isFinite(measuredAspectRatio) && measuredAspectRatio > 0
      ? measuredAspectRatio
      : config.aspectRatio;
    const viewportWidth = Math.max(1, Number(width) || 1);
    const viewportHeight = Math.max(1, Number(height) || 1);
    const availableWidth = Math.max(
      1,
      Number(bounds.width) || Math.max(1, viewportWidth - (viewportWidth <= 620 ? 48 : 220)),
    );
    const availableHeight = Math.max(
      1,
      Number(bounds.height) || Math.max(1, viewportHeight - (viewportWidth <= 620 ? 184 : 220)),
    );
    const gap = 10;
    const forceSingle = viewportWidth <= 900;
    let columns = 1;

    if (!forceSingle) {
      for (let candidate = config.maxColumns; candidate >= 2; candidate -= 1) {
        const columnWidth = (availableWidth - gap * (candidate - 1)) / candidate;
        const containedWidth = Math.min(columnWidth, availableHeight * aspectRatio);
        if (containedWidth >= config.minWidth) {
          columns = candidate;
          break;
        }
      }
    }

    const columnWidth = (availableWidth - gap * (columns - 1)) / columns;
    const itemWidth = Math.max(1, Math.floor(Math.min(columnWidth, availableHeight * aspectRatio)));
    const itemHeight = Math.max(1, Math.floor(Math.min(availableHeight, itemWidth / aspectRatio)));

    return {
      aspectRatio,
      columns,
      gap,
      itemHeight,
      itemWidth,
      kind: resolvedKind,
      pageSize: columns,
    };
  }

  function getPageSize(view, width, height, bounds) {
    return getGalleryLayout(view, width, height, bounds).pageSize;
  }

  function paginate(items, pageSize) {
    const pages = [];
    const numericPageSize = Number(pageSize);
    const normalizedPageSize = Number.isFinite(numericPageSize)
      ? Math.max(1, Math.floor(numericPageSize))
      : 1;

    for (let index = 0; index < items.length; index += normalizedPageSize) {
      pages.push(items.slice(index, index + normalizedPageSize));
    }

    return pages;
  }

  const LIGHTBOX_PREFETCH_OFFSETS = [-2, -1, 1, 2];
  const LIGHTBOX_INTERACTIVE_SELECTOR = [
    ".lightbox-image-row",
    ".lightbox-meta",
    ".lightbox-strip",
    ".lightbox-arrow",
    ".lightbox-close",
  ].join(", ");

  function getLightboxSource(item) {
    if (!item) {
      return "";
    }

    const small = String(item.dataset?.fullSmall || "");
    if (small) {
      return /\.png(?:$|[?#])/i.test(small) ? "" : small;
    }

    const full = String(item.dataset?.full || "");
    return /\.png(?:$|[?#])/i.test(full) ? "" : full;
  }

  function getAdjacentSources(items, currentIndex) {
    const group = Array.from(items || []);
    const index = Math.max(0, Math.min(group.length - 1, Number(currentIndex) || 0));
    const currentSource = getLightboxSource(group[index]);
    const sources = [];
    const seen = new Set(currentSource ? [currentSource] : []);

    LIGHTBOX_PREFETCH_OFFSETS.forEach((offset) => {
      const source = getLightboxSource(group[index + offset]);
      if (!source || seen.has(source)) {
        return;
      }
      seen.add(source);
      sources.push(source);
    });

    return sources;
  }

  function getPresentation(item) {
    const thumb = item?.querySelector?.("img");
    const full = String(item?.dataset?.full || thumb?.currentSrc || thumb?.src || "");
    const fullSmall = String(item?.dataset?.fullSmall || "");
    const fullWidth = Number(item?.dataset?.fullWidth || 0);
    return {
      alt: String(thumb?.alt || ""),
      full,
      fullSmall,
      fullWidth,
    };
  }

  function createLightboxController(options = {}) {
    const lightbox = options.lightbox;
    const image = options.image;
    const schedule = options.schedule
      || ((callback) => {
        if (typeof window.requestIdleCallback === "function") {
          window.requestIdleCallback(callback, { timeout: 500 });
        } else {
          window.setTimeout(callback, 0);
        }
      });
    const createPrefetchImage = options.createPrefetchImage || (() => new window.Image());
    const prefetched = new Set();
    let group = [];
    let currentIndex = -1;
    let opener = null;
    let imageRequest = 0;
    let removeImageListeners = null;

    function dispatch(type, detail) {
      lightbox?.dispatchEvent?.(new window.CustomEvent(type, {
        bubbles: true,
        detail,
      }));
    }

    function resolveGroup(item) {
      const gallery = item?.closest?.(".detail-gallery");
      return gallery
        ? Array.from(gallery.querySelectorAll("[data-detail-preview]"))
        : [item].filter(Boolean);
    }

    function revealWhenCurrent(request) {
      if (request !== imageRequest || !image) {
        return;
      }
      image.style.opacity = "1";
    }

    function assignImage(presentation) {
      if (!image) {
        return;
      }

      imageRequest += 1;
      const request = imageRequest;
      removeImageListeners?.();
      image.style.opacity = "0";
      image.style.transition = "opacity 0.12s ease";

      const handleLoad = () => revealWhenCurrent(request);
      const handleError = () => revealWhenCurrent(request);
      image.addEventListener("load", handleLoad);
      image.addEventListener("error", handleError);
      removeImageListeners = () => {
        image.removeEventListener("load", handleLoad);
        image.removeEventListener("error", handleError);
      };

      if (presentation.fullSmall && presentation.fullWidth) {
        image.setAttribute(
          "srcset",
          `${presentation.fullSmall} 480w, ${presentation.full} ${presentation.fullWidth}w`,
        );
        image.setAttribute("sizes", "100vw");
      } else {
        image.removeAttribute("srcset");
        image.removeAttribute("sizes");
      }

      image.alt = presentation.alt;
      image.src = presentation.full;
      if (image.complete && image.naturalWidth > 0) {
        window.queueMicrotask?.(() => revealWhenCurrent(request));
      }
    }

    function queueAdjacentPrefetch(items, index, presentation) {
      const currentSource = presentation.fullSmall || presentation.full;
      if (currentSource) {
        prefetched.add(currentSource);
      }
      const sources = getAdjacentSources(items, index)
        .filter((source) => !prefetched.has(source));
      if (sources.length === 0) {
        return;
      }

      sources.forEach((source) => prefetched.add(source));
      schedule(() => {
        sources.forEach((source) => {
          const prefetchImage = createPrefetchImage();
          prefetchImage.src = source;
        });
      });
    }

    function open(item) {
      if (!lightbox || !image || !item) {
        return false;
      }

      const wasOpen = lightbox.classList.contains("is-open");
      const nextGroup = resolveGroup(item);
      const nextIndex = nextGroup.indexOf(item);
      if (nextIndex < 0) {
        return false;
      }

      if (!wasOpen) {
        opener = item;
      }
      group = nextGroup;
      const direction = currentIndex <= nextIndex ? "next" : "prev";
      currentIndex = nextIndex;
      const presentation = (options.getPresentation || getPresentation)(item);

      assignImage(presentation);
      lightbox.dataset.direction = direction;
      options.onRender?.({
        direction,
        index: currentIndex,
        item,
        items: group,
        presentation,
        wasOpen,
      });

      if (!wasOpen) {
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        options.lockScroll?.();
        options.activateModal?.(lightbox, opener);
        dispatch("portfolio:lightboxopen", { index: currentIndex, item, items: group });
      }
      dispatch("portfolio:lightboxchange", { index: currentIndex, item, items: group });
      queueAdjacentPrefetch(group, currentIndex, presentation);
      return true;
    }

    function navigate(direction) {
      if (!lightbox?.classList.contains("is-open") || group.length === 0) {
        return false;
      }
      const nextIndex = currentIndex + Number(direction || 0);
      if (nextIndex < 0 || nextIndex >= group.length) {
        return false;
      }
      return open(group[nextIndex]);
    }

    function close() {
      if (!lightbox?.classList.contains("is-open")) {
        return false;
      }

      const closedOpener = opener;
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      lightbox.removeAttribute?.("data-direction");
      options.unlockScroll?.();
      options.deactivateModal?.(lightbox);
      options.onClose?.({ opener: closedOpener });
      dispatch("portfolio:lightboxclose", { opener: closedOpener });
      group = [];
      currentIndex = -1;
      opener = null;
      return true;
    }

    function shouldCloseFromBackdropClick(event, gap = 28) {
      if (!lightbox || event?.defaultPrevented) {
        return false;
      }
      if (event.target?.closest?.(LIGHTBOX_INTERACTIVE_SELECTOR)) {
        return false;
      }

      const figure = lightbox.querySelector?.("figure");
      if (figure) {
        const rect = figure.getBoundingClientRect();
        const withinSafeArea = (
          event.clientX >= rect.left - gap
          && event.clientX <= rect.right + gap
          && event.clientY >= rect.top - gap
          && event.clientY <= rect.bottom + gap
        );
        if (withinSafeArea) {
          return false;
        }
      }
      return event.target === lightbox;
    }

    const controller = {
      close,
      navigate,
      open,
      shouldCloseFromBackdropClick,
    };
    if (lightbox) {
      lightbox.portfolioLightboxController = controller;
    }
    return controller;
  }

  window.PortfolioStage = {
    parseHash,
    formatHash,
    getGalleryLayout,
    getPageSize,
    paginate,
    resolveGalleryKind,
  };
  window.PortfolioLightbox = {
    createController: createLightboxController,
    getAdjacentSources,
  };
})(window, document);
