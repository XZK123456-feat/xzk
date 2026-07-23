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

  function getPageSize(view, width, height) {
    if (width <= 767) {
      return 1;
    }

    const desktopSizes = {
      horizontal: 6,
      vertical: 4,
      video: 3,
    };

    return desktopSizes[view] || 1;
  }

  function paginate(items, pageSize) {
    const pages = [];

    for (let index = 0; index < items.length; index += pageSize) {
      pages.push(items.slice(index, index + pageSize));
    }

    return pages;
  }

  window.PortfolioStage = {
    parseHash,
    formatHash,
    getPageSize,
    paginate,
  };
})(window, document);
