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
