const sourceGroups = {
  horizontal: {
    label: "横图",
    shotClass: "pc-shot",
    files: [
      { label: '横图 001', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/im2313131ge-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/im2313131ge.jpg' },
      { label: '横图 002', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK108_H_暗黑人宠对决_250213-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK108_H_暗黑人宠对决_250213.jpg' },
      { label: '横图 003', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK10A_人宠大作战1_241009-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK10A_人宠大作战1_241009.jpg' },
      { label: '横图 004', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK10D_人宠大作战1_241021-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK10D_人宠大作战1_241021.jpg' },
      { label: '横图 005', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK10E_人宠大作战1_241022-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK10E_人宠大作战1_241022.jpg' },
      { label: '横图 006', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK117_H_2D卡通沙滩玩_250218-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK117_H_2D卡通沙滩玩_250218.jpg' },
      { label: '横图 007', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK118_H_女朋友抽卡对比_250219-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK118_H_女朋友抽卡对比_250219.jpg' },
      { label: '横图 008', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK125_H_火龙对战_250224-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK125_H_火龙对战_250224.jpg' },
      { label: '横图 009', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK128_H_手机屏幕篝火_250226-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK128_H_手机屏幕篝火_250226.jpg' },
      { label: '横图 010', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK129_H_可爱霸王龙抱着蛋_250226-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK129_H_可爱霸王龙抱着蛋_250226.jpg' },
      { label: '横图 011', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK131_H_人宠搭配_250226-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK131_H_人宠搭配_250226.jpg' },
      { label: '横图 012', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK134_H_人宠大作战_250303-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK134_H_人宠大作战_250303.jpg' },
      { label: '横图 013', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK13_孵蛋AIGC_240906-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK13_孵蛋AIGC_240906.jpg' },
      { label: '横图 014', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK141_H_红色人宠蛋_250306-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK141_H_红色人宠蛋_250306.jpg' },
      { label: '横图 015', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK143_H_复古RPG横版_250307-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK143_H_复古RPG横版_250307.jpg' },
      { label: '横图 016', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK144_H_在海滩睡觉_250307-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK144_H_在海滩睡觉_250307.jpg' },
      { label: '横图 017', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK148_H_苹果商店模版_250311-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK148_H_苹果商店模版_250311.jpg' },
      { label: '横图 018', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK14_夜间场景AIGC_240906-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK14_夜间场景AIGC_240906.jpg' },
      { label: '横图 019', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK14B_夜间场景AIGC_241015-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK14B_夜间场景AIGC_241015.jpg' },
      { label: '横图 020', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK153_H_雪地狩猎_250313-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK153_H_雪地狩猎_250313.jpg' },
      { label: '横图 021', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK157_H_雷兽进化_250317-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK157_H_雷兽进化_250317.jpg' },
      { label: '横图 022', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK21A_AIGC篝火_241015-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK21A_AIGC篝火_241015.jpg' },
      { label: '横图 023', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK23_AIGC桌面照片_241010-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK23_AIGC桌面照片_241010.jpg' },
      { label: '横图 024', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK26_AIGC人物宠物场景_241014-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK26_AIGC人物宠物场景_241014.jpg' },
      { label: '横图 025', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK26C_H_AIGC人物宠物场景_241127.jpg-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK26C_H_AIGC人物宠物场景_241127.jpg.jpg' },
      { label: '横图 026', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK278_H_霸王龙自拍_250506-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK278_H_霸王龙自拍_250506.jpg' },
      { label: '横图 027', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK296_H_发现蛋_0512-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK296_H_发现蛋_0512.jpg' },
      { label: '横图 028', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK299_H_快回来_0513-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK299_H_快回来_0513.jpg' },
      { label: '横图 029', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK300_H_帕鲁风格_0513-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK300_H_帕鲁风格_0513.jpg' },
      { label: '横图 030', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK34_H_人宠iPhone商店_241122-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK34_H_人宠iPhone商店_241122.jpg' },
      { label: '横图 031', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK36_H_快回来福利展示_241126-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK36_H_快回来福利展示_241126.jpg' },
      { label: '横图 032', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK371_H_霸王龙开箱子_250604-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK371_H_霸王龙开箱子_250604.jpg' },
      { label: '横图 033', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK375_H_雷兽_250604-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK375_H_雷兽_250604.jpg' },
      { label: '横图 034', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK376_H_手机白云边_250604-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK376_H_手机白云边_250604.jpg' },
      { label: '横图 035', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK377_H_鲁鲁比斯_250605-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK377_H_鲁鲁比斯_250605.jpg' },
      { label: '横图 036', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK384_H_救救阿宝_250605-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK384_H_救救阿宝_250605.jpg' },
      { label: '横图 037', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK388_H_黑影战斗紫色_250606-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK388_H_黑影战斗紫色_250606.jpg' },
      { label: '横图 038', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK40_H_一起泡温泉_241129-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK40_H_一起泡温泉_241129.jpg' },
      { label: '横图 039', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK42_H_骑着飞龙_241203-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK42_H_骑着飞龙_241203.jpg' },
      { label: '横图 040', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK507_H_暴君龙展示_AI_宠物展示_250702-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK507_H_暴君龙展示_AI_宠物展示_250702.jpg' },
      { label: '横图 041', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK509_H_漫画界面_AI_宠物展示_250702-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK509_H_漫画界面_AI_宠物展示_250702.jpg' },
      { label: '横图 042', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK510_H_2d铃兰展示_AI_宠物展示_250703-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK510_H_2d铃兰展示_AI_宠物展示_250703.jpg' },
      { label: '横图 043', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK511_H_上线就送铃兰_AI_宠物展示_250703-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK511_H_上线就送铃兰_AI_宠物展示_250703.jpg' },
      { label: '横图 044', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK512_H_白云边二次元_AI_宠物展示_250702-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK512_H_白云边二次元_AI_宠物展示_250702.jpg' },
      { label: '横图 045', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK514_H_草原蛋_AI_福利展示_250704-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK514_H_草原蛋_AI_福利展示_250704.jpg' },
      { label: '横图 046', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK51_H_骨架雷电龙_241211-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK51_H_骨架雷电龙_241211.jpg' },
      { label: '横图 047', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK520_H_雏风展示_AI_宠物展示_250708-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK520_H_雏风展示_AI_宠物展示_250708.jpg' },
      { label: '横图 048', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK521_H_铃兰对战_AI_人宠展示_250708-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK521_H_铃兰对战_AI_人宠展示_250708.jpg' },
      { label: '横图 049', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK524_H_大橙蛋_AI_福利展示_250709-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK524_H_大橙蛋_AI_福利展示_250709.jpg' },
      { label: '横图 050', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK525_H_女王展示_AI_人宠展示_250710 -thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK525_H_女王展示_AI_人宠展示_250710 .jpg' },
      { label: '横图 051', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK52_H_偷海盗蛋_241211-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK52_H_偷海盗蛋_241211.jpg' },
      { label: '横图 052', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK532_H_女王飞龙_AI_人宠合作_250714-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK532_H_女王飞龙_AI_人宠合作_250714.jpg' },
      { label: '横图 053', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK534_H_卡通白云边_AI_宠物展示_250715-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK534_H_卡通白云边_AI_宠物展示_250715.jpg' },
      { label: '横图 054', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK535_H_阿宝和蛋_AI_福利_250715-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK535_H_阿宝和蛋_AI_福利_250715.jpg' },
      { label: '横图 055', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK536_H_暴君龙对抗_AI_人宠对抗_250715-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK536_H_暴君龙对抗_AI_人宠对抗_250715.jpg' },
      { label: '横图 056', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK537_H_机甲霸王龙_AI_人宠合作_250716-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK537_H_机甲霸王龙_AI_人宠合作_250716.jpg' },
      { label: '横图 057', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK538_H_人宠对战_AI_福利_250716-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK538_H_人宠对战_AI_福利_250716.jpg' },
      { label: '横图 058', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK539_H_摩托车_AI_宠物展示_250716-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK539_H_摩托车_AI_宠物展示_250716.jpg' },
      { label: '横图 059', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK53_H_手握蛋福利_241217-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK53_H_手握蛋福利_241217.jpg' },
      { label: '横图 060', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK540_H_珍珠和蛋_AI_福利_250717-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK540_H_珍珠和蛋_AI_福利_250717.jpg' },
      { label: '横图 061', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK541_H_北极熊_AI_人宠合作_250717-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK541_H_北极熊_AI_人宠合作_250717.jpg' },
      { label: '横图 062', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK560_H_瑰夏国风_AI_宠物展示_250729-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK560_H_瑰夏国风_AI_宠物展示_250729.jpg' },
      { label: '横图 063', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK561_H_灵体暴君龙_AI_人宠合作_250729-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK561_H_灵体暴君龙_AI_人宠合作_250729.jpg' },
      { label: '横图 064', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK571_H_暴君龙_AI_福利_250804-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK571_H_暴君龙_AI_福利_250804.jpg' },
      { label: '横图 065', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK575_H_2D人宠蛋_AI_福利_250806-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK575_H_2D人宠蛋_AI_福利_250806.jpg' },
      { label: '横图 066', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK576_H_2D人宠蛋_AIPS_福利_250806-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK576_H_2D人宠蛋_AIPS_福利_250806.jpg' },
      { label: '横图 067', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK577_H_阿宝人宠_AI_人宠合作_250806-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK577_H_阿宝人宠_AI_人宠合作_250806.jpg' },
      { label: '横图 068', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK578_H_白云边人宠_AI_人宠合作_250807-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK578_H_白云边人宠_AI_人宠合作_250807.jpg' },
      { label: '横图 069', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK579_H_失败人宠_AI_人宠合作_250807-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK579_H_失败人宠_AI_人宠合作_250807.jpg' },
      { label: '横图 070', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK580_H_人宠蛋_AI_福利_250807-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK580_H_人宠蛋_AI_福利_250807.jpg' },
      { label: '横图 071', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK58_H_天降神蛋福利_241219-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK58_H_天降神蛋福利_241219.jpg' },
      { label: '横图 072', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK611_H_答题的霸王龙_AI_热梗_251010-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK611_H_答题的霸王龙_AI_热梗_251010.jpg' },
      { label: '横图 073', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK614_H_躺平白云边_AI_热梗_251013-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK614_H_躺平白云边_AI_热梗_251013.jpg' },
      { label: '横图 074', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK66_H_暗黑人宠对战_241226-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK66_H_暗黑人宠对战_241226.jpg' },
      { label: '横图 075', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK80_H_霸王龙大佬_250110-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK80_H_霸王龙大佬_250110.jpg' },
      { label: '横图 076', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK45_H_人宠雨中撑伞_241206-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK45_H_人宠雨中撑伞_241206.jpg' },
      { label: '横图 077', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK56_H_机甲霸王龙展示_241219-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK56_H_机甲霸王龙展示_241219.jpg' },
      { label: '横图 078', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK57_H_水中人宠大作战_241219-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK57_H_水中人宠大作战_241219.jpg' },
      { label: '横图 079', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK73_H_勇者斗恶龙_241231-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK73_H_勇者斗恶龙_241231.jpg' },
      { label: '横图 080', src: 'assets/ua-creatives/sliced/horizontal/thumbnails/ZCXZK74_H_iPhone商店人宠_241231-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/horizontal/ZCXZK74_H_iPhone商店人宠_241231.jpg' },
    ],
  },
  vertical: {
    label: "竖图",
    shotClass: "mobile-shot",
    files: [
      { label: '竖图 001', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK152_S_暗黑人宠对战_250313-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK152_S_暗黑人宠对战_250313.jpg' },
      { label: '竖图 002', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK196_S_点击即玩_250403-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK196_S_点击即玩_250403.jpg' },
      { label: '竖图 003', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK198_S_二次元形象_250403-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK198_S_二次元形象_250403.jpg' },
      { label: '竖图 004', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK212_S_复古雷兽进化_250409-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK212_S_复古雷兽进化_250409.jpg' },
      { label: '竖图 005', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK222_S_霸王龙小手办_250414-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK222_S_霸王龙小手办_250414.jpg' },
      { label: '竖图 006', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK224_S_暴君龙玩偶_250414-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK224_S_暴君龙玩偶_250414.jpg' },
      { label: '竖图 007', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK231_S_阿宝进化成啥_250416-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK231_S_阿宝进化成啥_250416.jpg' },
      { label: '竖图 008', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK238_S_人宠争夺蛋_250417-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK238_S_人宠争夺蛋_250417.jpg' },
      { label: '竖图 009', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK240_S_暗黑哥特龙进化_250417-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK240_S_暗黑哥特龙进化_250417.jpg' },
      { label: '竖图 010', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK241_S_摄像头滤镜_250418-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK241_S_摄像头滤镜_250418.jpg' },
      { label: '竖图 011', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK247_S_3D毛绒人宠_250422-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK247_S_3D毛绒人宠_250422.jpg' },
      { label: '竖图 012', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK252_S_警告_250423-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK252_S_警告_250423.jpg' },
      { label: '竖图 013', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK254_S_暴君龙人宠对战_250423-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK254_S_暴君龙人宠对战_250423.jpg' },
      { label: '竖图 014', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK260_S_宝箱福利_250424-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK260_S_宝箱福利_250424.jpg' },
      { label: '竖图 015', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK270_S_冰窖战斗_250429-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK270_S_冰窖战斗_250429.jpg' },
      { label: '竖图 016', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK275_S_黑暗之魂战斗风格_250430-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK275_S_黑暗之魂战斗风格_250430.jpg' },
      { label: '竖图 017', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK317_S_人宠对战_0516-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK317_S_人宠对战_0516.jpg' },
      { label: '竖图 018', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK321_S_黑魂对战模版_0521-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK321_S_黑魂对战模版_0521.jpg' },
      { label: '竖图 019', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK325_S_挑战失败剑齿虎_0519-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK325_S_挑战失败剑齿虎_0519.jpg' },
      { label: '竖图 020', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK327_S_紫色对战场景_0519-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK327_S_紫色对战场景_0519.jpg' },
      { label: '竖图 021', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK328_S_紫色对战苹果框架_0520-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK328_S_紫色对战苹果框架_0520.jpg' },
      { label: '竖图 022', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK335_S_紫色对战_0521-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK335_S_紫色对战_0521.jpg' },
      { label: '竖图 023', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK337_S_紫色对战_0521-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK337_S_紫色对战_0521.jpg' },
      { label: '竖图 024', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK346_S_神宠贴脸开大_0526-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK346_S_神宠贴脸开大_0526.jpg' },
      { label: '竖图 025', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK355_S_巨型史诗蛋_0527-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK355_S_巨型史诗蛋_0527.jpg' },
      { label: '竖图 026', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK357_S_你醒啦_0528-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK357_S_你醒啦_0528.jpg' },
      { label: '竖图 027', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK360_S_好多蛋苹果框架_0528-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK360_S_好多蛋苹果框架_0528.jpg' },
      { label: '竖图 028', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK363_S_温馨场景_0529-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK363_S_温馨场景_0529.jpg' },
      { label: '竖图 029', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK398_S_紫色对战_AI_玩法展示_250610-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK398_S_紫色对战_AI_玩法展示_250610.jpg' },
      { label: '竖图 030', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK401_S_闪电骨架龙_AI_宠物展示_250610-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK401_S_闪电骨架龙_AI_宠物展示_250610.jpg' },
      { label: '竖图 031', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK425_S_黑夜霸王龙_AI_宠物展示_250612-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK425_S_黑夜霸王龙_AI_宠物展示_250612.jpg' },
      { label: '竖图 032', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK427_S_神圣的鹿_AI_人宠展示_250613-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK427_S_神圣的鹿_AI_人宠展示_250613.jpg' },
      { label: '竖图 033', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK428_S_霸王龙通缉令_AI_人宠展示_250614-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK428_S_霸王龙通缉令_AI_人宠展示_250614.jpg' },
      { label: '竖图 034', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK429_S_人宠蛋展示_AI_人宠展示_250614-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK429_S_人宠蛋展示_AI_人宠展示_250614.jpg' },
      { label: '竖图 035', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK432_S_狮子战士_AI_人宠展示_250614-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK432_S_狮子战士_AI_人宠展示_250614.jpg' },
      { label: '竖图 036', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK433_S_石像阿宝_AI_人宠展示_250616-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK433_S_石像阿宝_AI_人宠展示_250616.jpg' },
      { label: '竖图 037', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK436_S_暴君龙冒险_AI_人宠展示_250616-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK436_S_暴君龙冒险_AI_人宠展示_250616.jpg' },
      { label: '竖图 038', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK451_S_毛绒胡胡鹰_AI_人宠展示_250617-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK451_S_毛绒胡胡鹰_AI_人宠展示_250617.jpg' },
      { label: '竖图 039', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK453_S_多页展示_AI_玩法展示_250618-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK453_S_多页展示_AI_玩法展示_250618.jpg' },
      { label: '竖图 040', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK455_S_努努比斯人化展示_AI_人宠展示_250618-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK455_S_努努比斯人化展示_AI_人宠展示_250618.jpg' },
      { label: '竖图 041', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK456_S_转职展示_AI_玩法展示_250618-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK456_S_转职展示_AI_玩法展示_250618.jpg' },
      { label: '竖图 042', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK458_S_人宠跑_AI_人宠展示_250619-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK458_S_人宠跑_AI_人宠展示_250619.jpg' },
      { label: '竖图 043', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK461_S_人宠出发_AI_人宠展示_250619-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK461_S_人宠出发_AI_人宠展示_250619.jpg' },
      { label: '竖图 044', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK465_S_功夫阿宝_AI_宠物展示_250620-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK465_S_功夫阿宝_AI_宠物展示_250620.jpg' },
      { label: '竖图 045', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK466_S_霸王龙送蛋_AI_福利展示_250620-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK466_S_霸王龙送蛋_AI_福利展示_250620.jpg' },
      { label: '竖图 046', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK469_S_魔法书霸王龙_AI_宠物展示_250621-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK469_S_魔法书霸王龙_AI_宠物展示_250621.jpg' },
      { label: '竖图 047', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK470_S_抽到努努比斯_AI_宠物展示_250621-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK470_S_抽到努努比斯_AI_宠物展示_250621.jpg' },
      { label: '竖图 048', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK504_S_兽灵_AI_人宠展示_250628-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK504_S_兽灵_AI_人宠展示_250628.jpg' },
      { label: '竖图 049', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK505_S_夕阳光线战斗_AI_人宠展示_250701-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK505_S_夕阳光线战斗_AI_人宠展示_250701.jpg' },
      { label: '竖图 050', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK545_S_霸王龙蛋_AIPS_福利_250722-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK545_S_霸王龙蛋_AIPS_福利_250722.jpg' },
      { label: '竖图 051', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK549_S_龙和福利_AIPS_福利_250723-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK549_S_龙和福利_AIPS_福利_250723.jpg' },
      { label: '竖图 052', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK553_S_阿宝休息_AIPS_宠物展示_250724-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK553_S_阿宝休息_AIPS_宠物展示_250724.jpg' },
      { label: '竖图 053', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK267_S_老电影胶片_250428-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK267_S_老电影胶片_250428.jpg' },
      { label: '竖图 054', src: 'assets/ua-creatives/sliced/vertical/thumbnails/ZCXZK271_S_苹果商店页面_250429-thumb.jpg', fullSrc: 'assets/ua-creatives/sliced/vertical/ZCXZK271_S_苹果商店页面_250429.jpg' },
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
  if (config.files) {
    return config.files;
  }
  return config.groups.flatMap((group) =>
    Array.from({ length: group.count }, (_, index) => {
      const idx = paddedIndex(index + 1);
      const ext = group.ext || 'png';
      return {
        label: `${config.label} ${idx}`,
        src: `assets/ua-creatives/sliced/${configKey}/thumbnails/${group.prefix}-${idx}-thumb.jpg`,
        fullSrc: `assets/ua-creatives/sliced/${configKey}/${group.prefix}-${idx}.${ext}`,
      };
    }),
  );
}

function createShot(configKey, item, index) {
  const config = sourceGroups[configKey];
  const button = document.createElement("button");
  button.className = `detail-shot ${config.shotClass}`;
  button.type = "button";
  button.dataset.detailPreview = "";
  button.dataset.full = item.fullSrc;
  button.setAttribute('aria-label', `预览${item.label}`);

  button.innerHTML = `
    <span class="detail-shot-label">${item.label}</span>
    <img src="${item.src}" alt="买量${item.label}" loading="lazy" decoding="async" />
  `;

  return button;
}

const RENDER_BATCH_SIZE = 18;
const scheduleIdle = window.requestIdleCallback
  ? (task) => window.requestIdleCallback(task, { timeout: 180 })
  : (task) => window.setTimeout(task, 24);

function renderGallery(configKey, gallery) {
  if (!gallery || gallery.dataset.rendered === "true") {
    return;
  }

  const items = buildFiles(configKey);
  let cursor = 0;
  gallery.dataset.rendered = "true";
  gallery.classList.add("is-gallery-loading");

  function renderBatch() {
    const fragment = document.createDocumentFragment();
    const limit = Math.min(cursor + RENDER_BATCH_SIZE, items.length);

    for (; cursor < limit; cursor += 1) {
      fragment.append(createShot(configKey, items[cursor], cursor));
    }

    gallery.append(fragment);

    if (cursor < items.length) {
      scheduleIdle(renderBatch);
      return;
    }

    gallery.classList.remove("is-gallery-loading");
    gallery.classList.add("is-gallery-ready");
  }

  renderBatch();
}

function renderGalleries() {
  const galleries = Object.keys(sourceGroups)
    .map((configKey) => ({
      configKey,
      gallery: document.querySelector(`[data-ua-gallery="${configKey}"]`),
    }))
    .filter((entry) => entry.gallery);

  if (!("IntersectionObserver" in window)) {
    galleries.forEach(({ configKey, gallery }) => renderGallery(configKey, gallery));
    return;
  }

  const lazyGalleryObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const configKey = entry.target.dataset.uaGallery;
        renderGallery(configKey, entry.target);
        lazyGalleryObserver.unobserve(entry.target);
      });
    },
    {
      rootMargin: "520px 0px",
      threshold: 0.01,
    },
  );

  galleries.forEach(({ configKey, gallery }) => {
    const section = gallery.closest("section");
    if (section && `#${section.id}` === window.location.hash) {
      renderGallery(configKey, gallery);
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

lightboxImage?.addEventListener('wheel', (event) => {
  event.preventDefault();
  const delta = event.deltaY > 0 ? -0.25 : 0.25;
  zoomState.scale = Math.min(5, Math.max(0.5, zoomState.scale + delta));
  if (zoomState.scale <= 1) {
    zoomState.x = 0;
    zoomState.y = 0;
  }
  applyZoom();
});

lightboxImage?.addEventListener('mousedown', (event) => {
  if (zoomState.scale <= 1) return;
  zoomState.dragging = true;
  zoomState.lastX = event.clientX;
  zoomState.lastY = event.clientY;
  applyZoom();
  event.preventDefault();
});

window.addEventListener('mousemove', (event) => {
  if (!zoomState.dragging) return;
  zoomState.x += event.clientX - zoomState.lastX;
  zoomState.y += event.clientY - zoomState.lastY;
  zoomState.lastX = event.clientX;
  zoomState.lastY = event.clientY;
  applyZoom();
});

window.addEventListener('mouseup', () => {
  zoomState.dragging = false;
  applyZoom();
});

lightboxImage?.addEventListener('dblclick', (event) => {
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

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-detail-preview]");
  if (button) {
    openPreview(button);
  }
});

closeButton?.addEventListener('click', closePreview);

lightbox?.addEventListener('click', (event) => {
  if (!event.target.closest("img, .lightbox-arrow, .lightbox-close")) {
    closePreview();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === "Escape") {
    closePreview();
  }
});
