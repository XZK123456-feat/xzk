const sourceGroups = [
  {
    key: "party-feature",
    label: "小恐龙派对5图",
    prefix: "小恐龙派对5图",
    count: 5,
  },
  {
    key: "party-set",
    label: "小恐龙派对套图",
    prefix: "小恐龙派对套图",
    count: 20,
  },
  {
    key: "party-misc",
    label: "小恐龙派对其他素材",
    prefix: "小恐龙派对其他素材",
    count: 15,
  },
  {
    key: "ulala-anniversary",
    label: "不休的乌拉拉周年庆",
    prefix: "不休的乌拉拉周年庆",
    count: 2,
  },
  {
    key: "ulala-set",
    label: "乌拉拉套图",
    prefix: "乌拉拉套图",
    count: 16,
  },
];

function paddedIndex(index) {
  return String(index).padStart(3, "0");
}

function buildFiles(group) {
  return Array.from({ length: group.count }, (_, index) => ({
    label: `${group.label} ${paddedIndex(index + 1)}`,
    src: `assets/community-creatives/sliced/${group.key}/${group.prefix}-${paddedIndex(index + 1)}.png`,
  }));
}

function createShot(group, item, index) {
  const button = document.createElement("button");
  button.className = "detail-shot community-shot";
  button.type = "button";
  button.dataset.detailPreview = "";
  button.setAttribute("aria-label", `预览${group.label} ${paddedIndex(index + 1)}`);

  button.innerHTML = `
    <span class="detail-shot-label">${item.label}</span>
    <span class="detail-shot-frame" aria-hidden="true">
      <span class="detail-shot-glass">
        <img src="${item.src}" alt="${item.label}" loading="lazy" />
      </span>
      <span class="detail-shot-ui" aria-hidden="true"><i></i><i></i><i></i></span>
    </span>
  `;

  return button;
}

function renderGalleries() {
  sourceGroups.forEach((group) => {
    const gallery = document.querySelector(`[data-community-gallery="${group.key}"]`);
    if (!gallery) {
      return;
    }

    const fragment = document.createDocumentFragment();
    buildFiles(group).forEach((item, index) => {
      fragment.append(createShot(group, item, index));
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
