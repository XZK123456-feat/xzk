const previewButtons = Array.from(document.querySelectorAll("[data-detail-preview]"));
const lightbox = document.querySelector(".website-lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxCaption = lightbox?.querySelector("figcaption");
const closeButton = lightbox?.querySelector(".lightbox-close");

function closePreview() {
  if (!lightbox) {
    return;
  }

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-previewing");
}

function openPreview(button) {
  const image = button.querySelector("img");

  if (!lightbox || !lightboxImage || !lightboxCaption || !image) {
    return;
  }

  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = button.querySelector(".detail-shot-label")?.textContent || image.alt;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-previewing");
  closeButton?.focus();
}

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
