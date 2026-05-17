const sourceGroups = [
  {
    key: "party-all",
    label: "小恐龙派对",
    files: [
      { label: '小恐龙派对 001', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (1)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (1).png' },
      { label: '小恐龙派对 002', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (10)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (10).png' },
      { label: '小恐龙派对 003', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (11)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (11).png' },
      { label: '小恐龙派对 004', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (12)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (12).png' },
      { label: '小恐龙派对 005', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (13)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (13).png' },
      { label: '小恐龙派对 006', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (14)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (14).png' },
      { label: '小恐龙派对 007', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (15)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (15).png' },
      { label: '小恐龙派对 008', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (16)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (16).png' },
      { label: '小恐龙派对 009', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (17)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (17).png' },
      { label: '小恐龙派对 010', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (18)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (18).png' },
      { label: '小恐龙派对 011', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (19)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (19).png' },
      { label: '小恐龙派对 012', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (2)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (2).png' },
      { label: '小恐龙派对 013', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (20)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (20).png' },
      { label: '小恐龙派对 014', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (21)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (21).png' },
      { label: '小恐龙派对 015', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (22)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (22).png' },
      { label: '小恐龙派对 016', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (23)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (23).png' },
      { label: '小恐龙派对 017', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (24)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (24).png' },
      { label: '小恐龙派对 018', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (25)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (25).png' },
      { label: '小恐龙派对 019', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (26)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (26).png' },
      { label: '小恐龙派对 020', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (27)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (27).png' },
      { label: '小恐龙派对 021', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (28)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (28).png' },
      { label: '小恐龙派对 022', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (29)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (29).png' },
      { label: '小恐龙派对 023', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (3)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (3).png' },
      { label: '小恐龙派对 024', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (30)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (30).png' },
      { label: '小恐龙派对 025', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (31)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (31).png' },
      { label: '小恐龙派对 026', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (32)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (32).png' },
      { label: '小恐龙派对 027', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (33)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (33).png' },
      { label: '小恐龙派对 028', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (34)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (34).png' },
      { label: '小恐龙派对 029', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (35)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (35).png' },
      { label: '小恐龙派对 030', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (36)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (36).png' },
      { label: '小恐龙派对 031', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (4)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (4).png' },
      { label: '小恐龙派对 032', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (5)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (5).png' },
      { label: '小恐龙派对 033', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (6)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (6).png' },
      { label: '小恐龙派对 034', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (7)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (7).png' },
      { label: '小恐龙派对 035', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对 (8)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对 (8).png' },
      { label: '小恐龙派对 036', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对五图 (5)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对五图 (5).png' },
      { label: '小恐龙派对 037', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对五图 (6)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对五图 (6).png' },
      { label: '小恐龙派对 038', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对五图 (7)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对五图 (7).png' },
      { label: '小恐龙派对 039', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对五图 (8)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对五图 (8).png' },
      { label: '小恐龙派对 040', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对五图 (9)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对五图 (9).png' },
      { label: '小恐龙派对 041', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对娜比-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对娜比.png' },
      { label: '小恐龙派对 042', src: 'assets/community-creatives/sliced/party-all/thumbnails/小恐龙派对直播间背景-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/party-all/小恐龙派对直播间背景.png' },
    ],
  },
  {
    key: "ulala-all",
    label: "不休的乌拉拉",
    files: [
      { label: '不休的乌拉拉 001', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (1)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (1).jpg' },
      { label: '不休的乌拉拉 002', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (1)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (1).png' },
      { label: '不休的乌拉拉 003', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (10)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (10).png' },
      { label: '不休的乌拉拉 004', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (11)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (11).png' },
      { label: '不休的乌拉拉 005', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (12)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (12).png' },
      { label: '不休的乌拉拉 006', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (13)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (13).png' },
      { label: '不休的乌拉拉 007', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (14)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (14).png' },
      { label: '不休的乌拉拉 008', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (15)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (15).png' },
      { label: '不休的乌拉拉 009', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (16)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (16).png' },
      { label: '不休的乌拉拉 010', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (17)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (17).png' },
      { label: '不休的乌拉拉 011', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (18)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (18).png' },
      { label: '不休的乌拉拉 012', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (19)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (19).png' },
      { label: '不休的乌拉拉 013', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (2)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (2).png' },
      { label: '不休的乌拉拉 014', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (20)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (20).png' },
      { label: '不休的乌拉拉 015', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (21)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (21).png' },
      { label: '不休的乌拉拉 016', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (22)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (22).png' },
      { label: '不休的乌拉拉 017', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (3)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (3).png' },
      { label: '不休的乌拉拉 018', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (4)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (4).png' },
      { label: '不休的乌拉拉 019', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (5)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (5).png' },
      { label: '不休的乌拉拉 020', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (6)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (6).png' },
      { label: '不休的乌拉拉 021', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (7)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (7).png' },
      { label: '不休的乌拉拉 022', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (8)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (8).png' },
      { label: '不休的乌拉拉 023', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/不休的乌拉拉 (9)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/ulala-all/不休的乌拉拉 (9).png' },
    ],
  },
  {
    key: "lili-tangquan",
    label: "狸狸汤泉",
    files: [
      { label: '狸狸汤泉 001', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (1)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (1).jpg' },
      { label: '狸狸汤泉 002', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (1)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (1).png' },
      { label: '狸狸汤泉 003', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (10)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (10).png' },
      { label: '狸狸汤泉 004', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (11)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (11).png' },
      { label: '狸狸汤泉 005', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (12)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (12).png' },
      { label: '狸狸汤泉 006', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (13)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (13).png' },
      { label: '狸狸汤泉 007', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (14)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (14).png' },
      { label: '狸狸汤泉 008', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (15)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (15).png' },
      { label: '狸狸汤泉 009', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (16)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (16).png' },
      { label: '狸狸汤泉 010', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (17)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (17).png' },
      { label: '狸狸汤泉 011', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (2)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (2).jpg' },
      { label: '狸狸汤泉 012', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (2)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (2).png' },
      { label: '狸狸汤泉 013', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (3)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (3).jpg' },
      { label: '狸狸汤泉 014', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (3)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (3).png' },
      { label: '狸狸汤泉 015', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (4)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (4).png' },
      { label: '狸狸汤泉 016', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (5)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (5).png' },
      { label: '狸狸汤泉 017', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (6)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (6).png' },
      { label: '狸狸汤泉 018', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (7)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (7).png' },
      { label: '狸狸汤泉 019', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (8)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (8).png' },
      { label: '狸狸汤泉 020', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/狸狸汤泉 (9)-thumb.jpg', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/狸狸汤泉 (9).png' },
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
    <img src="${item.src}" alt="${item.label}" />
  `;

  return button;
}

function renderGalleries() {
  sourceGroups.forEach((group) => {
    const gallery = document.querySelector(`[data-community-gallery="${group.key}"]`);
    if (!gallery) { return; }

    const fragment = document.createDocumentFragment();
    group.files.forEach((item, index) => {
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

previewButtons.forEach((button) => {
  button.addEventListener("click", () => openPreview(button));
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
