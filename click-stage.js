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

  window.PortfolioStage = {
    parseHash,
    formatHash,
    getGalleryLayout,
    getPageSize,
    paginate,
    resolveGalleryKind,
  };
})(window, document);
