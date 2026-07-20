const sourceGroups = [
  {
    key: "party-all",
    label: "小恐龙派对",
    files: [
      { label: '小恐龙派对 001', src: 'assets/community-creatives/sliced/party-all/thumbnails/1-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/1-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/1-thumb-480.webp', fullWidth: 1280, fullHeight: 720, fullSmallSrc: 'assets/community-creatives/sliced/party-all/1-delivery-480.webp'},
      { label: '小恐龙派对 002', src: 'assets/community-creatives/sliced/party-all/thumbnails/2-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/2-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/2-thumb-480.webp', fullWidth: 1280, fullHeight: 720, fullSmallSrc: 'assets/community-creatives/sliced/party-all/2-delivery-480.webp'},
      { label: '小恐龙派对 003', src: 'assets/community-creatives/sliced/party-all/thumbnails/3-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/3-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/3-thumb-480.webp', fullWidth: 1280, fullHeight: 720, fullSmallSrc: 'assets/community-creatives/sliced/party-all/3-delivery-480.webp'},
      { label: '小恐龙派对 004', src: 'assets/community-creatives/sliced/party-all/thumbnails/4-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/4-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/4-thumb-480.webp', fullWidth: 1280, fullHeight: 720, fullSmallSrc: 'assets/community-creatives/sliced/party-all/4-delivery-480.webp'},
      { label: '小恐龙派对 005', src: 'assets/community-creatives/sliced/party-all/thumbnails/5-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/5-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/5-thumb-480.webp', fullWidth: 1280, fullHeight: 720, fullSmallSrc: 'assets/community-creatives/sliced/party-all/5-delivery-480.webp'},
      { label: '小恐龙派对 006', src: 'assets/community-creatives/sliced/party-all/thumbnails/6-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/6-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/6-thumb-480.webp', fullWidth: 1280, fullHeight: 720, fullSmallSrc: 'assets/community-creatives/sliced/party-all/6-delivery-480.webp'},
      { label: '小恐龙派对 007', src: 'assets/community-creatives/sliced/party-all/thumbnails/7-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/7-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/7-thumb-480.webp', fullWidth: 1280, fullHeight: 720, fullSmallSrc: 'assets/community-creatives/sliced/party-all/7-delivery-480.webp'},
      { label: '小恐龙派对 008', src: 'assets/community-creatives/sliced/party-all/thumbnails/8-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/8-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/8-thumb-480.webp', fullWidth: 1280, fullHeight: 720, fullSmallSrc: 'assets/community-creatives/sliced/party-all/8-delivery-480.webp'},
      { label: '小恐龙派对 009', src: 'assets/community-creatives/sliced/party-all/thumbnails/9-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/9-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/9-thumb-480.webp', fullWidth: 1280, fullHeight: 720, fullSmallSrc: 'assets/community-creatives/sliced/party-all/9-delivery-480.webp'},
      { label: '小恐龙派对 010', src: 'assets/community-creatives/sliced/party-all/thumbnails/10-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/10-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/10-thumb-480.webp', fullWidth: 1280, fullHeight: 720, fullSmallSrc: 'assets/community-creatives/sliced/party-all/10-delivery-480.webp'},
      { label: '小恐龙派对 011', src: 'assets/community-creatives/sliced/party-all/thumbnails/11-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/11-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/11-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/11-delivery-480.webp'},
      { label: '小恐龙派对 012', src: 'assets/community-creatives/sliced/party-all/thumbnails/12-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/12-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/12-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/12-delivery-480.webp'},
      { label: '小恐龙派对 013', src: 'assets/community-creatives/sliced/party-all/thumbnails/13-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/13-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/13-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/13-delivery-480.webp'},
      { label: '小恐龙派对 014', src: 'assets/community-creatives/sliced/party-all/thumbnails/14-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/14-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/14-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/14-delivery-480.webp'},
      { label: '小恐龙派对 015', src: 'assets/community-creatives/sliced/party-all/thumbnails/15-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/15-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/15-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/15-delivery-480.webp'},
      { label: '小恐龙派对 016', src: 'assets/community-creatives/sliced/party-all/thumbnails/16-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/16-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/16-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/16-delivery-480.webp'},
      { label: '小恐龙派对 017', src: 'assets/community-creatives/sliced/party-all/thumbnails/17-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/17-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/17-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/17-delivery-480.webp'},
      { label: '小恐龙派对 018', src: 'assets/community-creatives/sliced/party-all/thumbnails/18-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/18-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/18-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/18-delivery-480.webp'},
      { label: '小恐龙派对 019', src: 'assets/community-creatives/sliced/party-all/thumbnails/19-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/19-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/19-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/19-delivery-480.webp'},
      { label: '小恐龙派对 020', src: 'assets/community-creatives/sliced/party-all/thumbnails/20-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/20-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/20-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/20-delivery-480.webp'},
      { label: '小恐龙派对 021', src: 'assets/community-creatives/sliced/party-all/thumbnails/21-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/21-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/21-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/21-delivery-480.webp'},
      { label: '小恐龙派对 022', src: 'assets/community-creatives/sliced/party-all/thumbnails/22-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/22-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/22-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/22-delivery-480.webp'},
      { label: '小恐龙派对 023', src: 'assets/community-creatives/sliced/party-all/thumbnails/23-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/23-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/23-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/23-delivery-480.webp'},
      { label: '小恐龙派对 024', src: 'assets/community-creatives/sliced/party-all/thumbnails/24-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/24-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/24-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/24-delivery-480.webp'},
      { label: '小恐龙派对 025', src: 'assets/community-creatives/sliced/party-all/thumbnails/25-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/25-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/25-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/25-delivery-480.webp'},
      { label: '小恐龙派对 026', src: 'assets/community-creatives/sliced/party-all/thumbnails/26-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/26-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/26-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/26-delivery-480.webp'},
      { label: '小恐龙派对 027', src: 'assets/community-creatives/sliced/party-all/thumbnails/27-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/27-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/27-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/27-delivery-480.webp'},
      { label: '小恐龙派对 028', src: 'assets/community-creatives/sliced/party-all/thumbnails/28-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/28-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/28-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/28-delivery-480.webp'},
      { label: '小恐龙派对 029', src: 'assets/community-creatives/sliced/party-all/thumbnails/29-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/29-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/29-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/29-delivery-480.webp'},
      { label: '小恐龙派对 030', src: 'assets/community-creatives/sliced/party-all/thumbnails/30-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/30-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/30-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/30-delivery-480.webp'},
      { label: '小恐龙派对 031', src: 'assets/community-creatives/sliced/party-all/thumbnails/31-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/31-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/31-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/31-delivery-480.webp'},
      { label: '小恐龙派对 032', src: 'assets/community-creatives/sliced/party-all/thumbnails/32-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/32-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/32-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/32-delivery-480.webp'},
      { label: '小恐龙派对 033', src: 'assets/community-creatives/sliced/party-all/thumbnails/33-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/33-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/33-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/33-delivery-480.webp'},
      { label: '小恐龙派对 034', src: 'assets/community-creatives/sliced/party-all/thumbnails/34-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/34-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/34-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/34-delivery-480.webp'},
      { label: '小恐龙派对 035', src: 'assets/community-creatives/sliced/party-all/thumbnails/35-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/35-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/35-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/35-delivery-480.webp'},
      { label: '小恐龙派对 036', src: 'assets/community-creatives/sliced/party-all/thumbnails/36-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/36-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/36-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/36-delivery-480.webp'},
      { label: '小恐龙派对 037', src: 'assets/community-creatives/sliced/party-all/thumbnails/37-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/37-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/37-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/37-delivery-480.webp'},
      { label: '小恐龙派对 038', src: 'assets/community-creatives/sliced/party-all/thumbnails/38-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/38-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/38-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/38-delivery-480.webp'},
      { label: '小恐龙派对 039', src: 'assets/community-creatives/sliced/party-all/thumbnails/39-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/39-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/39-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/39-delivery-480.webp'},
      { label: '小恐龙派对 040', src: 'assets/community-creatives/sliced/party-all/thumbnails/40-thumb.webp', fullSrc: 'assets/community-creatives/sliced/party-all/40-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/party-all/thumbnails/40-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/party-all/40-delivery-480.webp'},
    ],
  },
  {
    key: "ulala-all",
    label: "不休的乌拉拉",
    files: [
      { label: '不休的乌拉拉 001', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/1-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/1-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/1-thumb-480.webp', fullWidth: 1686, fullHeight: 948, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/1-delivery-480.webp'},
      { label: '不休的乌拉拉 002', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/2-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/2-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/2-thumb-480.webp', fullWidth: 1686, fullHeight: 948, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/2-delivery-480.webp'},
      { label: '不休的乌拉拉 003', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/3-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/3-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/3-thumb-480.webp', fullWidth: 2108, fullHeight: 1185, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/3-delivery-480.webp'},
      { label: '不休的乌拉拉 004', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/4-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/4-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/4-thumb-480.webp', fullWidth: 1686, fullHeight: 948, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/4-delivery-480.webp'},
      { label: '不休的乌拉拉 005', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/5-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/5-delivery.webp', width: 685, height: 800, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/5-thumb-480.webp', fullWidth: 1686, fullHeight: 1968, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/5-delivery-480.webp'},
      { label: '不休的乌拉拉 006', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/6-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/6-delivery.webp', width: 685, height: 800, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/6-thumb-480.webp', fullWidth: 1686, fullHeight: 1968, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/6-delivery-480.webp'},
      { label: '不休的乌拉拉 007', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/7-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/7-delivery.webp', width: 685, height: 800, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/7-thumb-480.webp', fullWidth: 1686, fullHeight: 1968, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/7-delivery-480.webp'},
      { label: '不休的乌拉拉 008', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/8-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/8-delivery.webp', width: 685, height: 800, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/8-thumb-480.webp', fullWidth: 1686, fullHeight: 1968, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/8-delivery-480.webp'},
      { label: '不休的乌拉拉 009', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/9-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/9-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/9-thumb-480.webp', fullWidth: 1265, fullHeight: 711, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/9-delivery-480.webp'},
      { label: '不休的乌拉拉 010', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/10-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/10-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/10-thumb-480.webp', fullWidth: 1265, fullHeight: 711, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/10-delivery-480.webp'},
      { label: '不休的乌拉拉 011', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/11-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/11-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/11-thumb-480.webp', fullWidth: 1265, fullHeight: 711, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/11-delivery-480.webp'},
      { label: '不休的乌拉拉 012', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/12-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/12-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/12-thumb-480.webp', fullWidth: 1265, fullHeight: 711, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/12-delivery-480.webp'},
      { label: '不休的乌拉拉 013', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/13-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/13-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/13-thumb-480.webp', fullWidth: 1265, fullHeight: 711, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/13-delivery-480.webp'},
      { label: '不休的乌拉拉 014', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/14-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/14-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/14-thumb-480.webp', fullWidth: 1265, fullHeight: 711, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/14-delivery-480.webp'},
      { label: '不休的乌拉拉 015', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/15-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/15-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/15-thumb-480.webp', fullWidth: 1265, fullHeight: 711, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/15-delivery-480.webp'},
      { label: '不休的乌拉拉 016', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/16-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/16-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/16-thumb-480.webp', fullWidth: 1265, fullHeight: 711, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/16-delivery-480.webp'},
      { label: '不休的乌拉拉 017', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/17-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/17-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/17-thumb-480.webp', fullWidth: 1265, fullHeight: 711, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/17-delivery-480.webp'},
      { label: '不休的乌拉拉 018', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/18-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/18-delivery.webp', width: 800, height: 450, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/18-thumb-480.webp', fullWidth: 1265, fullHeight: 711, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/18-delivery-480.webp'},
      { label: '不休的乌拉拉 019', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/19-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/19-delivery.webp', width: 800, height: 452, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/19-thumb-480.webp', fullWidth: 1062, fullHeight: 600, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/19-delivery-480.webp'},
      { label: '不休的乌拉拉 020', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/20-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/20-delivery.webp', width: 800, height: 600, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/20-thumb-480.webp', fullWidth: 1440, fullHeight: 1080, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/20-delivery-480.webp'},
      { label: '不休的乌拉拉 021', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/21-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/21-delivery.webp', width: 800, height: 200, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/21-thumb-480.webp', fullWidth: 1080, fullHeight: 270, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/21-delivery-480.webp'},
      { label: '不休的乌拉拉 022', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/22-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/22-delivery.webp', width: 800, height: 437, smallSrc: 'assets/community-creatives/sliced/ulala-all/thumbnails/22-thumb-480.webp', fullWidth: 828, fullHeight: 452, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/22-delivery-480.webp'},
      { label: '不休的乌拉拉 023', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/023-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/023-delivery.webp', width: 400, height: 225, fullWidth: 1265, fullHeight: 711, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/023-delivery-480.webp'},
      { label: '不休的乌拉拉 024', src: 'assets/community-creatives/sliced/ulala-all/thumbnails/024-thumb.webp', fullSrc: 'assets/community-creatives/sliced/ulala-all/024-delivery.webp', width: 400, height: 225, fullWidth: 1265, fullHeight: 711, fullSmallSrc: 'assets/community-creatives/sliced/ulala-all/024-delivery-480.webp'},
    ],
  },
  {
    key: "lili-tangquan",
    label: "狸狸汤泉",
    files: [
      { label: '狸狸汤泉 001', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/1-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/1-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/1-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/1-delivery-480.webp'},
      { label: '狸狸汤泉 002', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/2-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/2-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/2-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/2-delivery-480.webp'},
      { label: '狸狸汤泉 003', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/3-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/3-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/3-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/3-delivery-480.webp'},
      { label: '狸狸汤泉 004', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/4-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/4-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/4-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/4-delivery-480.webp'},
      { label: '狸狸汤泉 005', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/5-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/5-delivery.webp', width: 617, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/5-thumb-480.webp', fullWidth: 1080, fullHeight: 1400, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/5-delivery-480.webp'},
      { label: '狸狸汤泉 006', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/6-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/6-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/6-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/6-delivery-480.webp'},
      { label: '狸狸汤泉 007', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/7-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/7-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/7-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/7-delivery-480.webp'},
      { label: '狸狸汤泉 008', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/8-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/8-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/8-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/8-delivery-480.webp'},
      { label: '狸狸汤泉 009', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/9-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/9-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/9-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/9-delivery-480.webp'},
      { label: '狸狸汤泉 010', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/10-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/10-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/10-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/10-delivery-480.webp'},
      { label: '狸狸汤泉 011', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/11-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/11-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/11-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/11-delivery-480.webp'},
      { label: '狸狸汤泉 012', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/12-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/12-delivery.webp', width: 600, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/12-thumb-480.webp', fullWidth: 1080, fullHeight: 1440, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/12-delivery-480.webp'},
      { label: '狸狸汤泉 013', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/13-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/13-delivery.webp', width: 800, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/13-thumb-480.webp', fullWidth: 1024, fullHeight: 1024, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/13-delivery-480.webp'},
      { label: '狸狸汤泉 014', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/14-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/14-delivery.webp', width: 800, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/14-thumb-480.webp', fullWidth: 1024, fullHeight: 1024, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/14-delivery-480.webp'},
      { label: '狸狸汤泉 015', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/15-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/15-delivery.webp', width: 800, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/15-thumb-480.webp', fullWidth: 1024, fullHeight: 1024, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/15-delivery-480.webp'},
      { label: '狸狸汤泉 016', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/16-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/16-delivery.webp', width: 800, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/16-thumb-480.webp', fullWidth: 1024, fullHeight: 1024, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/16-delivery-480.webp'},
      { label: '狸狸汤泉 017', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/17-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/17-delivery.webp', width: 800, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/17-thumb-480.webp', fullWidth: 1024, fullHeight: 1024, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/17-delivery-480.webp'},
      { label: '狸狸汤泉 018', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/18-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/18-delivery.webp', width: 800, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/18-thumb-480.webp', fullWidth: 1024, fullHeight: 1024, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/18-delivery-480.webp'},
      { label: '狸狸汤泉 019', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/19-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/19-delivery.webp', width: 800, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/19-thumb-480.webp', fullWidth: 1024, fullHeight: 1024, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/19-delivery-480.webp'},
      { label: '狸狸汤泉 020', src: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/20-thumb.webp', fullSrc: 'assets/community-creatives/sliced/lili-tangquan/20-delivery.webp', width: 800, height: 800, smallSrc: 'assets/community-creatives/sliced/lili-tangquan/thumbnails/20-thumb-480.webp', fullWidth: 1024, fullHeight: 1024, fullSmallSrc: 'assets/community-creatives/sliced/lili-tangquan/20-delivery-480.webp'},
    ],
  },
];

function createShot(group, item, index) {
  const button = document.createElement("button");
  button.className = "detail-shot community-shot";
  button.type = "button";
  button.dataset.detailPreview = "";
  button.dataset.full = item.fullSrc;
  button.dataset.fullWidth = item.fullWidth;
  if (item.fullSmallSrc) {
    button.dataset.fullSmall = item.fullSmallSrc;
  }
  button.setAttribute("aria-label", `预览${item.label}`);
  const srcset = item.smallSrc
    ? `${encodeURI(item.smallSrc)} 480w, ${encodeURI(item.src)} ${item.width}w`
    : `${encodeURI(item.src)} ${item.width}w`;

  button.innerHTML = `
    <span class="detail-shot-label">${item.label}</span>
    <span class="detail-shot-frame">
      <span class="detail-shot-glass">
        <img src="${item.src}" srcset="${srcset}" sizes="(max-width: 700px) 44vw, 260px" width="${item.width}" height="${item.height}" alt="${item.label}" loading="lazy" decoding="async" />
      </span>
      <span class="detail-shot-ui"><i></i><i></i><i></i></span>
    </span>
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
    window.initImageLoadStates?.(gallery);

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
const lightboxCounter = lightbox?.querySelector(".lightbox-counter");
const lightboxStrip = lightbox?.querySelector(".lightbox-strip");

let zoomState = { scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 };
let lastPreviewIndex = -1;
const LIGHTBOX_BACKDROP_SAFE_GAP = 28;

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
  if (!lightbox) { return; }
  const wasOpen = lightbox.classList.contains("is-open");
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  if (wasOpen) {
    window.unlockPreviewScroll?.();
  }
  lightbox.removeAttribute("data-direction");
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
  return gallery ? Array.from(gallery.querySelectorAll("[data-detail-preview]")) : [];
}

function getLightboxStripKey(previews) {
  const first = previews[0]?.dataset.full || "";
  const last = previews[previews.length - 1]?.dataset.full || "";
  return `${previews.length}:${first}:${last}`;
}

function updateLightboxStrip(currentIndex) {
  if (!lightboxStrip) { return; }
  const thumbs = Array.from(lightboxStrip.querySelectorAll(".lightbox-thumb"));
  thumbs.forEach((thumb, index) => {
    thumb.classList.toggle("active", index === currentIndex);
  });
  thumbs[currentIndex]?.scrollIntoView({ inline: "center", block: "nearest", behavior: "auto" });
}

function renderLightboxStrip(previews, currentIndex) {
  if (!lightboxStrip) { return; }
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
  if (!lightbox || !lightboxImage || !lightboxCaption || !image) { return; }
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

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-detail-preview]");
  if (button) {
    openPreview(button);
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
