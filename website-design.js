const previewButtons = Array.from(document.querySelectorAll("[data-detail-preview]"));
const lightbox = document.querySelector(".website-lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxCaption = lightbox?.querySelector("figcaption");
const closeButton = lightbox?.querySelector(".lightbox-close");
const lightboxCounter = lightbox?.querySelector(".lightbox-counter");
const lightboxStrip = lightbox?.querySelector(".lightbox-strip");

let zoomState = { scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 };
let lastPreviewIndex = -1;
const LIGHTBOX_BACKDROP_SAFE_GAP = 28;

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

function closePreview() {
  if (!lightbox) {
    return;
  }

  const wasOpen = lightbox.classList.contains("is-open");
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  if (wasOpen) {
    window.unlockPreviewScroll?.();
  }
  lightbox?.removeAttribute("data-direction");
  resetZoom();
}

function isWithinExpandedRect(event, element, gap = 0) {
  if (!element) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  return (
    event.clientX >= rect.left - gap &&
    event.clientX <= rect.right + gap &&
    event.clientY >= rect.top - gap &&
    event.clientY <= rect.bottom + gap
  );
}

function shouldCloseFromBackdropClick(event) {
  if (!lightbox || event.defaultPrevented) {
    return false;
  }

  if (event.target.closest(".lightbox-image-row, .lightbox-meta, .lightbox-strip, .lightbox-arrow, .lightbox-close")) {
    return false;
  }

  const figure = lightbox.querySelector("figure");
  if (isWithinExpandedRect(event, figure, LIGHTBOX_BACKDROP_SAFE_GAP)) {
    return false;
  }

  return event.target === lightbox || !figure;
}

function getPreviewGroup(button) {
  const gallery = button.closest(".detail-gallery");
  return gallery ? Array.from(gallery.querySelectorAll("[data-detail-preview]")) : previewButtons;
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
    thumb.className = `lightbox-thumb${index === currentIndex ? " active" : ""}`;
    thumb.type = "button";
    thumb.setAttribute("aria-label", `切换到${preview.querySelector(".detail-shot-label")?.textContent || image?.alt || "作品"}`);
    thumb.innerHTML = `<img src="${image?.currentSrc || image?.src || ""}" alt="" /><span>${String(index + 1).padStart(2, "0")}</span>`;
    thumb.addEventListener("click", () => openPreview(preview));
    lightboxStrip.append(thumb);
  });

  updateLightboxStrip(currentIndex);
}

function openPreview(button) {
  const image = button.querySelector("img");

  if (!lightbox || !lightboxImage || !lightboxCaption || !image) {
    return;
  }

  const wasOpen = lightbox.classList.contains("is-open");
  const previews = getPreviewGroup(button);
  const currentIndex = Math.max(0, previews.indexOf(button));
  lightbox.dataset.direction = lastPreviewIndex <= currentIndex ? "next" : "prev";
  lastPreviewIndex = currentIndex;
  resetZoom();
  const fullSource = button.dataset.full || image.currentSrc || image.src;
  const fullSmallSource = button.dataset.fullSmall;
  if (fullSmallSource && button.dataset.fullWidth) {
    lightboxImage.srcset = `${encodeURI(fullSmallSource)} 480w, ${encodeURI(fullSource)} ${button.dataset.fullWidth}w`;
    lightboxImage.sizes = "100vw";
  } else {
    lightboxImage.removeAttribute("srcset");
    lightboxImage.removeAttribute("sizes");
  }
  lightboxImage.src = fullSource;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = button.querySelector(".detail-shot-label")?.textContent || image.alt;
  if (lightboxCounter) {
    lightboxCounter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(previews.length).padStart(2, "0")}`;
  }
  renderLightboxStrip(previews, currentIndex);
  lightbox.scrollTop = 0;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  if (!wasOpen) {
    window.lockPreviewScroll?.();
  }
  closeButton?.focus();
}

previewButtons.forEach((button) => {
  button.addEventListener("click", () => openPreview(button));
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
