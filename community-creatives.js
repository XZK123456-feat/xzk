const sourceGroups = [
  {
    key: "party-all",
    label: "小恐龙派对",
    files: [
      { label: '小恐龙派对 001', src: 'assets/community-creatives/sliced/party-all/thumbnails/1-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/1.png' },
      { label: '小恐龙派对 002', src: 'assets/community-creatives/sliced/party-all/thumbnails/2-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/2.png' },
      { label: '小恐龙派对 003', src: 'assets/community-creatives/sliced/party-all/thumbnails/3-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/3.png' },
      { label: '小恐龙派对 004', src: 'assets/community-creatives/sliced/party-all/thumbnails/4-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/4.png' },
      { label: '小恐龙派对 005', src: 'assets/community-creatives/sliced/party-all/thumbnails/5-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/5.png' },
      { label: '小恐龙派对 006', src: 'assets/community-creatives/sliced/party-all/thumbnails/6-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/6.png' },
      { label: '小恐龙派对 007', src: 'assets/community-creatives/sliced/party-all/thumbnails/7-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/7.png' },
      { label: '小恐龙派对 008', src: 'assets/community-creatives/sliced/party-all/thumbnails/8-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/8.png' },
      { label: '小恐龙派对 009', src: 'assets/community-creatives/sliced/party-all/thumbnails/9-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/9.png' },
      { label: '小恐龙派对 010', src: 'assets/community-creatives/sliced/party-all/thumbnails/10-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/10.png' },
      { label: '小恐龙派对 011', src: 'assets/community-creatives/sliced/party-all/thumbnails/11-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/11.png' },
      { label: '小恐龙派对 012', src: 'assets/community-creatives/sliced/party-all/thumbnails/12-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/12.png' },
      { label: '小恐龙派对 013', src: 'assets/community-creatives/sliced/party-all/thumbnails/13-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/13.png' },
      { label: '小恐龙派对 014', src: 'assets/community-creatives/sliced/party-all/thumbnails/14-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/14.png' },
      { label: '小恐龙派对 015', src: 'assets/community-creatives/sliced/party-all/thumbnails/15-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/15.png' },
      { label: '小恐龙派对 016', src: 'assets/community-creatives/sliced/party-all/thumbnails/16-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/16.png' },
      { label: '小恐龙派对 017', src: 'assets/community-creatives/sliced/party-all/thumbnails/17-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/17.png' },
      { label: '小恐龙派对 018', src: 'assets/community-creatives/sliced/party-all/thumbnails/18-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/18.png' },
      { label: '小恐龙派对 019', src: 'assets/community-creatives/sliced/party-all/thumbnails/19-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/19.png' },
      { label: '小恐龙派对 020', src: 'assets/community-creatives/sliced/party-all/thumbnails/20-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/20.png' },
      { label: '小恐龙派对 021', src: 'assets/community-creatives/sliced/party-all/thumbnails/21-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/21.png' },
      { label: '小恐龙派对 022', src: 'assets/community-creatives/sliced/party-all/thumbnails/22-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/22.png' },
      { label: '小恐龙派对 023', src: 'assets/community-creatives/sliced/party-all/thumbnails/23-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/23.png' },
      { label: '小恐龙派对 024', src: 'assets/community-creatives/sliced/party-all/thumbnails/24-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/24.png' },
      { label: '小恐龙派对 025', src: 'assets/community-creatives/sliced/party-all/thumbnails/25-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/25.png' },
      { label: '小恐龙派对 026', src: 'assets/community-creatives/sliced/party-all/thumbnails/26-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/26.png' },
      { label: '小恐龙派对 027', src: 'assets/community-creatives/sliced/party-all/thumbnails/27-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/27.png' },
      { label: '小恐龙派对 028', src: 'assets/community-creatives/sliced/party-all/thumbnails/28-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/28.png' },
      { label: '小恐龙派对 029', src: 'assets/community-creatives/sliced/party-all/thumbnails/29-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/29.png' },
      { label: '小恐龙派对 030', src: 'assets/community-creatives/sliced/party-all/thumbnails/30-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/30.png' },
      { label: '小恐龙派对 031', src: 'assets/community-creatives/sliced/party-all/thumbnails/31-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/31.png' },
      { label: '小恐龙派对 032', src: 'assets/community-creatives/sliced/party-all/thumbnails/32-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/32.png' },
      { label: '小恐龙派对 033', src: 'assets/community-creatives/sliced/party-all/thumbnails/33-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/33.png' },
      { label: '小恐龙派对 034', src: 'assets/community-creatives/sliced/party-all/thumbnails/34-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/34.png' },
      { label: '小恐龙派对 035', src: 'assets/community-creatives/sliced/party-all/thumbnails/35-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/35.png' },
      { label: '小恐龙派对 036', src: 'assets/community-creatives/sliced/party-all/thumbnails/36-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/36.png' },
      { label: '小恐龙派对 037', src: 'assets/community-creatives/sliced/party-all/thumbnails/37-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/37.png' },
      { label: '小恐龙派对 038', src: 'assets/community-creatives/sliced/party-all/thumbnails/38-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/38.png' },
      { label: '小恐龙派对 039', src: 'assets/community-creatives/sliced/party-all/thumbnails/39-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/39.png' },
      { label: '小恐龙派对 040', src: 'assets/community-creatives/sliced/party-all/thumbnails/40-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/40.png' },
    ],
  },
  {
    key: "ulala-all",
    label: "不休的乌拉拉",
    files: [
      { label: '不休的乌拉拉 001', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/1-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/1.png' },
      { label: '不休的乌拉拉 002', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/2-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/2.png' },
      { label: '不休的乌拉拉 003', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/3-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/3.png' },
      { label: '不休的乌拉拉 004', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/4-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/4.png' },
      { label: '不休的乌拉拉 005', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/5-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/5.png' },
      { label: '不休的乌拉拉 006', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/6-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/6.png' },
      { label: '不休的乌拉拉 007', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/7-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/7.png' },
      { label: '不休的乌拉拉 008', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/8-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/8.png' },
      { label: '不休的乌拉拉 009', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/9-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/9.png' },
      { label: '不休的乌拉拉 010', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/10-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/10.png' },
      { label: '不休的乌拉拉 011', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/11-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/11.png' },
      { label: '不休的乌拉拉 012', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/12-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/12.png' },
      { label: '不休的乌拉拉 013', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/13-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/13.png' },
      { label: '不休的乌拉拉 014', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/14-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/14.png' },
      { label: '不休的乌拉拉 015', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/15-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/15.png' },
      { label: '不休的乌拉拉 016', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/16-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/16.png' },
      { label: '不休的乌拉拉 017', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/17-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/17.png' },
      { label: '不休的乌拉拉 018', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/18-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/18.png' },
      { label: '不休的乌拉拉 019', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/19-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/19.jpg' },
      { label: '不休的乌拉拉 020', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/20-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/20.png' },
      { label: '不休的乌拉拉 021', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/21-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/21.png' },
      { label: '不休的乌拉拉 022', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/22-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/22.png' },
      { label: '不休的乌拉拉 023', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/023-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/023.png' },
      { label: '不休的乌拉拉 024', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/024-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/024.png' },
    ],
  },
  {
    key: "lili-tangquan",
    label: "狸狸汤泉",
    files: [
      { label: '狸狸汤泉 001', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/1-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/1.png' },
      { label: '狸狸汤泉 002', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/2-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/2.png' },
      { label: '狸狸汤泉 003', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/3-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/3.png' },
      { label: '狸狸汤泉 004', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/4-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/4.png' },
      { label: '狸狸汤泉 005', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/5-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/5.png' },
      { label: '狸狸汤泉 006', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/6-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/6.png' },
      { label: '狸狸汤泉 007', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/7-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/7.png' },
      { label: '狸狸汤泉 008', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/8-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/8.png' },
      { label: '狸狸汤泉 009', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/9-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/9.png' },
      { label: '狸狸汤泉 010', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/10-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/10.png' },
      { label: '狸狸汤泉 011', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/11-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/11.png' },
      { label: '狸狸汤泉 012', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/12-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/12.png' },
      { label: '狸狸汤泉 013', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/13-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/13.jpg' },
      { label: '狸狸汤泉 014', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/14-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/14.jpg' },
      { label: '狸狸汤泉 015', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/15-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/15.jpg' },
      { label: '狸狸汤泉 016', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/16-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/16.png' },
      { label: '狸狸汤泉 017', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/17-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/17.png' },
      { label: '狸狸汤泉 018', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/18-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/18.png' },
      { label: '狸狸汤泉 019', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/19-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/19.png' },
      { label: '狸狸汤泉 020', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/20-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/20.png' },
    ],
  },
];

function createShot(group, item, index) {
  const button = document.createElement("button");
  button.className = "detail-shot community-shot";
  button.type = "button";
  button.dataset.detailPreview = "";
  button.dataset.full = item.fullSrc;
  button.setAttribute("aria-label", `预览${item.label}`);

  button.innerHTML = `
    <span class="detail-shot-label">${item.label}</span>
    <img src="${item.src}" alt="${item.label}" loading="lazy" decoding="async" />
  `;

  return button;
}

const RENDER_BATCH_SIZE = 16;
const scheduleIdle = window.requestIdleCallback
  ? (task) => window.requestIdleCallback(task, { timeout: 180 })
  : (task) => window.setTimeout(task, 24);

function renderGallery(group, gallery) {
  if (!group || !gallery || gallery.dataset.rendered === "true") {
    return;
  }

  let cursor = 0;
  gallery.dataset.rendered = "true";
  gallery.classList.add("is-gallery-loading");

  function renderBatch() {
    const fragment = document.createDocumentFragment();
    const limit = Math.min(cursor + RENDER_BATCH_SIZE, group.files.length);

    for (; cursor < limit; cursor += 1) {
      fragment.append(createShot(group, group.files[cursor], cursor));
    }

    gallery.append(fragment);

    if (cursor < group.files.length) {
      scheduleIdle(renderBatch);
      return;
    }

    gallery.classList.remove("is-gallery-loading");
    gallery.classList.add("is-gallery-ready");
  }

  renderBatch();
}

function renderGalleries() {
  const galleries = sourceGroups
    .map((group) => ({
      group,
      gallery: document.querySelector(`[data-community-gallery="${group.key}"]`),
    }))
    .filter((entry) => entry.gallery);

  if (!("IntersectionObserver" in window)) {
    galleries.forEach(({ group, gallery }) => renderGallery(group, gallery));
    return;
  }

  const lazyGalleryObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const group = sourceGroups.find((item) => item.key === entry.target.dataset.communityGallery);
        renderGallery(group, entry.target);
        lazyGalleryObserver.unobserve(entry.target);
      });
    },
    {
      rootMargin: "520px 0px",
      threshold: 0.01,
    },
  );

  galleries.forEach(({ group, gallery }) => {
    const section = gallery.closest("section");
    if (section && `#${section.id}` === window.location.hash) {
      renderGallery(group, gallery);
      return;
    }

    lazyGalleryObserver.observe(gallery);
  });
}

renderGalleries();

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
  if (!lightbox) { return; }
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-previewing");
  resetZoom();
}

function openPreview(button) {
  const image = button.querySelector("img");
  if (!lightbox || !lightboxImage || !lightboxCaption || !image) { return; }
  resetZoom();
  lightboxImage.src = button.dataset.full || image.currentSrc || image.src;
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

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-detail-preview]");
  if (button) {
    openPreview(button);
  }
});

closeButton?.addEventListener("click", closePreview);

lightbox?.addEventListener("click", (event) => {
  if (!event.target.closest("img, .lightbox-arrow, .lightbox-close")) {
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
