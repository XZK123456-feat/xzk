const previewButtons = Array.from(document.querySelectorAll("[data-detail-preview]"));
const lightbox = document.querySelector(".website-lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxCaption = lightbox?.querySelector("figcaption");
const closeButton = lightbox?.querySelector(".lightbox-close");
const lightboxCounter = lightbox?.querySelector(".lightbox-counter");
const lightboxStrip = lightbox?.querySelector(".lightbox-strip");

let zoomState = { scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 };

function enhanceShotMarkup(button) {
  if (button.querySelector(".detail-shot-frame")) {
    return;
  }

  const image = button.querySelector("img");
  if (!image) {
    return;
  }

  const frame = document.createElement("span");
  frame.className = "detail-shot-frame";

  const glass = document.createElement("span");
  glass.className = "detail-shot-glass";

  const ui = document.createElement("span");
  ui.className = "detail-shot-ui";
  ui.innerHTML = "<i></i><i></i><i></i>";

  image.replaceWith(frame);
  glass.append(image);
  frame.append(glass, ui);
}

previewButtons.forEach(enhanceShotMarkup);

function applyZoom() {
  if (!lightboxImage) return;
  lightboxImage.style.transform = `translate(${zoomState.x}px, ${zoomState.y}px) scale(${zoomState.scale})`;
  lightboxImage.style.cursor = zoomState.scale > 1 ? (zoomState.dragging ? "grabbing" : "grab") : "default";
}

function resetZoom() {
  zoomState = { scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 };
  applyZoom();
}

function getLightboxStripKey(previews) {
  const first = previews[0]?.dataset.full || "";
  const last = previews[previews.length - 1]?.dataset.full || "";
  return `${previews.length}:${first}:${last}`;
}

function updateLightboxStrip(currentIndex) {
  if (!lightboxStrip) {
    return;
  }

  const thumbs = Array.from(lightboxStrip.querySelectorAll(".lightbox-thumb"));
  thumbs.forEach((thumb, index) => {
    thumb.classList.toggle("active", index === currentIndex);
  });
  thumbs[currentIndex]?.scrollIntoView({ inline: "center", block: "nearest", behavior: "auto" });
}

function renderLightboxStrip(previews, currentIndex) {
  if (!lightboxStrip) {
    return;
  }

  const galleryKey = getLightboxStripKey(previews);
  if (lightboxStrip.dataset.galleryKey === galleryKey) {
    updateLightboxStrip(currentIndex);
    return;
  }

  lightboxStrip.dataset.galleryKey = galleryKey;
  lightboxStrip.innerHTML = "";
  previews.forEach((preview, index) => {
    const image = preview.querySelector("img");
    const thumb = document.createElement("button");
    const thumbSource = image?.currentSrc || image?.getAttribute("src") || "";
    thumb.className = `lightbox-thumb${index === currentIndex ? " active" : ""}`;
    thumb.type = "button";
    thumb.setAttribute("aria-label", `切换到${preview.querySelector(".detail-shot-label")?.textContent || image?.alt || "作品"}`);
    thumb.innerHTML = `${thumbSource ? `<img src="${thumbSource}" alt="" />` : ""}<span>${String(index + 1).padStart(2, "0")}</span>`;
    thumb.addEventListener("click", () => openPreview(preview));
    lightboxStrip.append(thumb);
  });

  updateLightboxStrip(currentIndex);
}

const lightboxController = window.PortfolioLightbox?.createController({
  activateModal: (dialog, opener) => window.activateModalDialog?.(dialog, opener),
  deactivateModal: (dialog) => window.deactivateModalDialog?.(dialog),
  image: lightboxImage,
  lightbox,
  lockScroll: () => window.lockPreviewScroll?.(),
  onClose: resetZoom,
  onRender({ index: currentIndex, item: button, items: previews, presentation }) {
    resetZoom();
    lightboxCaption.textContent = button.querySelector(".detail-shot-label")?.textContent || presentation.alt;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(previews.length).padStart(2, "0")}`;
    }
    renderLightboxStrip(previews, currentIndex);
    lightbox.scrollTop = 0;
  },
  unlockScroll: () => window.unlockPreviewScroll?.(),
});

function openPreview(button) {
  lightboxController?.open(button);
}

function closePreview() {
  lightboxController?.close();
}

function shouldCloseFromBackdropClick(event) {
  return lightboxController?.shouldCloseFromBackdropClick(event) || false;
}

previewButtons.forEach((button) => {
  button.addEventListener("click", () => openPreview(button));
});

const mobileGallery = document.querySelector(".mobile-gallery");
const pcGallery = document.querySelector(".pc-gallery");

if (mobileGallery?.querySelector("[data-detail-preview]")) {
  window.DetailStage?.registerGallery("mobile", mobileGallery, {
    kind: "vertical",
  });
}
if (pcGallery?.querySelector("[data-detail-preview]")) {
  window.DetailStage?.registerGallery("pc", pcGallery, {
    kind: "horizontal",
  });
}

document.addEventListener("portfolio:stagechange", (event) => {
  if (event.detail?.view === "mobile") {
    window.DetailStage?.refreshGallery("mobile");
  } else if (event.detail?.view === "pc") {
    window.DetailStage?.refreshGallery("pc");
  }
});

closeButton?.addEventListener("click", closePreview);

lightbox?.addEventListener("click", (event) => {
  if (shouldCloseFromBackdropClick(event)) {
    closePreview();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePreview();
  }
});

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
