const sourceGroups = {
  horizontal: {
    label: "横图",
    shotClass: "pc-shot",
    groups: [
      { prefix: "横图1", count: 20, ext: "png" },
      { prefix: "横图2", count: 20, ext: "png" },
      { prefix: "横图3", count: 20, ext: "png" },
      { prefix: "横图4", count: 20, ext: "jpg" },
    ],
  },
  vertical: {
    label: "竖图",
    shotClass: "mobile-shot",
    groups: [
      { prefix: "竖图4", count: 36, ext: "png" },
      { prefix: "竖图5", count: 18, ext: "jpg" },
    ],
  },
  "nine-grid": {
    label: "九图",
    shotClass: "pc-shot square-shot",
    groups: [
      { prefix: "九图5", count: 18, ext: "png" },
      { prefix: "九图6", count: 1, ext: "png" },
      { prefix: "九图7", count: 1, ext: "png" },
    ],
  },
};

function paddedIndex(index) {
  return String(index).padStart(3, "0");
}

function buildFiles(configKey) {
  const config = sourceGroups[configKey];
  return config.groups.flatMap((group) =>
    Array.from({ length: group.count }, (_, index) => ({
      label: `${config.label} ${paddedIndex(index + 1)} / ${group.prefix}`,
      src: `assets/ua-creatives/sliced/${configKey}/${group.prefix}-${paddedIndex(index + 1)}.${group.ext || "png"}`,
    })),
  );
}

function createShot(configKey, item, index) {
  const config = sourceGroups[configKey];
  const button = document.createElement("button");
  button.className = `detail-shot ${config.shotClass}`;
  button.type = "button";
  button.dataset.detailPreview = "";
  button.setAttribute("aria-label", `预览${config.label} ${paddedIndex(index + 1)}`);

  button.innerHTML = `
    <span class="detail-shot-label">${item.label}</span>
    <span class="detail-shot-frame" aria-hidden="true">
      <span class="detail-shot-glass">
        <img src="${item.src}" alt="买量${item.label}" loading="lazy" />
      </span>
      <span class="detail-shot-ui" aria-hidden="true"><i></i><i></i><i></i></span>
    </span>
  `;

  return button;
}

function renderGalleries() {
  Object.keys(sourceGroups).forEach((configKey) => {
    const gallery = document.querySelector(`[data-ua-gallery="${configKey}"]`);
    if (!gallery) {
      return;
    }

    const fragment = document.createDocumentFragment();
    buildFiles(configKey).forEach((item, index) => {
      fragment.append(createShot(configKey, item, index));
    });
    gallery.append(fragment);
  });
}

renderGalleries();

const previewButtons = Array.from(document.querySelectorAll("[data-detail-preview]"));
const lightbox = document.querySelector(".website-lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxCaption = lightbox?.querySelector("figcaption");
const closeButton = lightbox?.querySelector(".lightbox-close");

let zoomState = { scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 };

function applyZoom() {
  if (!lightboxImage) return;
  lightboxImage.style.transform = `translate(${zoomState.x}px, ${zoomState.y}px) scale(${zoomState.scale})`;
  lightboxImage.style.cursor = zoomState.scale > 1 ? (zoomState.dragging ? "grabbing" : "grab") : "default";
  updateZoomHint();
}

function resetZoom() {
  zoomState = { scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 };
  applyZoom();
}

function closePreview() {
  if (!lightbox) {
    return;
  }

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-previewing");
  resetZoom();
}

function openPreview(button) {
  const image = button.querySelector("img");

  if (!lightbox || !lightboxImage || !lightboxCaption || !image) {
    return;
  }

  resetZoom();
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = button.querySelector(".detail-shot-label")?.textContent || image.alt;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-previewing");
  closeButton?.focus();
  showZoomHint();
}

function showZoomHint() {
  if (!lightbox) return;
  let hint = lightbox.querySelector(".zoom-hint");
  if (!hint) {
    hint = document.createElement("div");
    hint.className = "zoom-hint";
    hint.textContent = "滑动鼠标滚轮 / 手指张开放大缩小";
    lightbox.querySelector("figure")?.append(hint);
  }
  hint.classList.remove("is-hidden");
}

function updateZoomHint() {
  if (!lightbox) return;
  const hint = lightbox.querySelector(".zoom-hint");
  if (!hint) return;
  hint.classList.toggle("is-hidden", zoomState.scale > 1);
}

lightboxImage?.addEventListener("wheel", (event) => {
  event.preventDefault();
  const delta = event.deltaY > 0 ? -0.25 : 0.25;
  zoomState.scale = Math.min(5, Math.max(0.5, zoomState.scale + delta));
  if (zoomState.scale <= 1) {
    zoomState.x = 0;
    zoomState.y = 0;
  }
  applyZoom();
});

lightboxImage?.addEventListener("mousedown", (event) => {
  if (zoomState.scale <= 1) return;
  zoomState.dragging = true;
  zoomState.lastX = event.clientX;
  zoomState.lastY = event.clientY;
  applyZoom();
  event.preventDefault();
});

window.addEventListener("mousemove", (event) => {
  if (!zoomState.dragging) return;
  zoomState.x += event.clientX - zoomState.lastX;
  zoomState.y += event.clientY - zoomState.lastY;
  zoomState.lastX = event.clientX;
  zoomState.lastY = event.clientY;
  applyZoom();
});

window.addEventListener("mouseup", () => {
  zoomState.dragging = false;
  applyZoom();
});

lightboxImage?.addEventListener("dblclick", (event) => {
  event.preventDefault();
  if (zoomState.scale > 1) {
    resetZoom();
  } else {
    zoomState.scale = 2;
    zoomState.x = 0;
    zoomState.y = 0;
    applyZoom();
  }
});

previewButtons.forEach((button) => {
  button.addEventListener("click", () => openPreview(button));
});

closeButton?.addEventListener("click", closePreview);

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closePreview();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePreview();
  }
});
