export interface SeasonalMonth {
  month: number;
  label: { zh: string; en: string };
  recommended: SeasonalRecommendation[];
  pickingTips: { zh: string; en: string }[];
}

export interface SeasonalRecommendation {
  name: { zh: string; en: string };
  reason: { zh: string; en: string };
  highlight?: boolean;
}

export interface PickingTip {
  id: string;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  icon: string;
}

export const pickingTips: PickingTip[] = [
  {
    id: 'tip1',
    title: { zh: '觀察冠芽', en: 'Check the Crown' },
    description: {
      zh: '冠芽（頂部葉叢）應翠綠挺立、葉片飽滿有光澤。枯黃或萎縮的冠芽表示果實已過度成熟或不新鮮。輕拉冠芽中心葉片，能輕鬆拔起表示已過熟。',
      en: 'The crown should be vibrant green, upright, and glossy. Yellow or wilted crowns indicate overripe or old fruit. If the center leaf pulls out easily, the fruit is overripe.',
    },
    icon: 'leaf',
  },
  {
    id: 'tip2',
    title: { zh: '拍打聽聲', en: 'Tap & Listen' },
    description: {
      zh: '用手指輕彈果實側面：「鼓聲果」（聲音清脆如拍打鼓面）表示果肉紮實、水分充足，品質最佳；「肉聲果」（聲音沉悶如拍打肌肉）表示果肉偏軟、可能過熟或有內部問題。',
      en: '"Drum sound" (crisp, hollow tap) = firm flesh with good moisture, best quality. "Meat sound" (dull, flat thud) = soft flesh, possibly overripe or has internal issues.',
    },
    icon: 'hand',
  },
  {
    id: 'tip3',
    title: { zh: '聞果香濃郁度', en: 'Smell the Aroma' },
    description: {
      zh: '成熟的鳳梨底部會散發自然甜香。香氣太淡表示尚未完全成熟；若有發酵或酒精味則表示過熟。最佳狀態是香氣適中、帶有清新甜味。',
      en: 'Ripe pineapples emit a sweet fragrance from the base. Too faint = not fully ripe. Fermented or alcohol smell = overripe. Best when moderately fragrant with a fresh sweetness.',
    },
    icon: 'wind',
  },
  {
    id: 'tip4',
    title: { zh: '觀察果皮顏色', en: 'Check Skin Color' },
    description: {
      zh: '大部分品種由綠轉黃表示成熟。但注意：甜蜜蜜鳳梨（台農16號）建議「趁綠吃」，綠皮時甜度最高。購買時可請教攤販該品種的最佳食用時機。',
      en: 'Most varieties turn from green to yellow when ripe. Exception: Tainung No.16 is best eaten while still green — peak sweetness is at the green stage. Ask vendors about the best eating time for each variety.',
    },
    icon: 'eye',
  },
];

export const seasonalData: SeasonalMonth[] = [
  {
    month: 1,
    label: { zh: '1月', en: 'January' },
    recommended: [
      { name: { zh: '冬蜜鳳梨（台農13號）', en: 'Winter Honey (TN13)' }, reason: { zh: '冬季限定，風味最佳', en: 'Winter exclusive, peak flavor' }, highlight: true },
    ],
    pickingTips: [
      { zh: '冬季鳳梨產量少，建議直接到產地選購', en: 'Winter pineapple supply is limited; buy directly from farms' },
    ],
  },
  {
    month: 2,
    label: { zh: '2月', en: 'February' },
    recommended: [
      { name: { zh: '冬蜜鳳梨（台農13號）', en: 'Winter Honey (TN13)' }, reason: { zh: '尾聲產季，把握機會', en: 'End of season, seize the chance' }, highlight: true },
    ],
    pickingTips: [
      { zh: '產季尾聲品質仍佳，可多購囤放', en: 'Still good quality at end of season' },
    ],
  },
  {
    month: 3,
    label: { zh: '3月', en: 'March' },
    recommended: [
      { name: { zh: '金鑽鳳梨（台農17號）', en: 'Golden Diamond (TN17)' }, reason: { zh: '最甜美的產季開始', en: 'Sweetest season begins' }, highlight: true },
      { name: { zh: '釋迦鳳梨（台農4號）', en: 'Sugar Apple Pineapple (TN4)' }, reason: { zh: '早春限定，可手剝食用', en: 'Early spring, hand-peelable' } },
    ],
    pickingTips: [
      { zh: '金鑽鳳梨開始上市，3月水果少是搶先品嘗的好時機', en: 'Golden Diamond hits the market; great time to enjoy early' },
    ],
  },
  {
    month: 4,
    label: { zh: '4月', en: 'April' },
    recommended: [
      { name: { zh: '金鑽鳳梨（台農17號）', en: 'Golden Diamond (TN17)' }, reason: { zh: '品質巔峰期', en: 'Peak quality period' }, highlight: true },
      { name: { zh: '蘋果鳳梨（台農6號）', en: 'Apple Pineapple (TN6)' }, reason: { zh: '口感如蘋果般脆爽', en: 'Crisp like an apple' } },
      { name: { zh: '甜蜜蜜鳳梨（台農16號）', en: 'Sweet Honey (TN16)' }, reason: { zh: '入口即化，趁綠吃最甜', en: 'Melts in mouth, eat while green' } },
      { name: { zh: '黃金鳳梨（台農21號）', en: 'Golden (TN21)' }, reason: { zh: '哈密瓜香氣', en: 'Cantaloupe aroma' } },
    ],
    pickingTips: [
      { zh: '品種最多的時期，建議多嘗試不同品種', en: 'Most variety available; try different types' },
    ],
  },
  {
    month: 5,
    label: { zh: '5月', en: 'May' },
    recommended: [
      { name: { zh: '金鑽鳳梨（台農17號）', en: 'Golden Diamond (TN17)' }, reason: { zh: '仍是黃金產季', en: 'Still golden season' }, highlight: true },
      { name: { zh: '香水鳳梨（台農11號）', en: 'Perfume Pineapple (TN11)' }, reason: { zh: '香氣極濃郁', en: 'Extremely fragrant' } },
      { name: { zh: '牛奶鳳梨（台農20號）', en: 'Milk Pineapple (TN20)' }, reason: { zh: '頂級乳白果肉', en: 'Premium milky white flesh' } },
      { name: { zh: '蜜寶鳳梨（台農19號）', en: 'Honey Treasure (TN19)' }, reason: { zh: '自然抗病品種', en: 'Naturally disease-resistant' } },
      { name: { zh: '蜜香鳳梨（台農22號）', en: 'Honey Aroma (TN22)' }, reason: { zh: '清甜如蜜', en: 'Sweet as honey' } },
      { name: { zh: '芒果鳳梨（台農23號）', en: 'Mango Pineapple (TN23)' }, reason: { zh: '散發土芒果香氣', en: 'Mango-scented' } },
    ],
    pickingTips: [
      { zh: '5月是黃金鳳梨風味巔峰，不要錯過！', en: 'May is peak flavor for Golden pineapple — don\'t miss it!' },
    ],
  },
  {
    month: 6,
    label: { zh: '6月', en: 'June' },
    recommended: [
      { name: { zh: '牛奶鳳梨（台農20號）', en: 'Milk Pineapple (TN20)' }, reason: { zh: '乳香味最明顯', en: 'Most pronounced milky aroma' }, highlight: true },
      { name: { zh: '甜蜜蜜鳳梨（台農16號）', en: 'Sweet Honey (TN16)' }, reason: { zh: '纖維最細的品種', en: 'Finest fiber variety' } },
      { name: { zh: '金鑽鳳梨（台農17號）', en: 'Golden Diamond (TN17)' }, reason: { zh: '產季末仍可品嘗', en: 'End of season, still available' } },
      { name: { zh: '香水鳳梨（台農11號）', en: 'Perfume Pineapple (TN11)' }, reason: { zh: '外銷日本的寵兒', en: "Japan's export favorite" } },
      { name: { zh: '蜜香鳳梨（台農22號）', en: 'Honey Aroma (TN22)' }, reason: { zh: '品質穩定', en: 'Consistent quality' } },
    ],
    pickingTips: [
      { zh: '夏季鳳梨糖度高但也容易過熟，買回後盡快食用', en: 'Summer pineapples are very sweet but ripen fast; eat soon after buying' },
    ],
  },
  {
    month: 7,
    label: { zh: '7月', en: 'July' },
    recommended: [
      { name: { zh: '甜蜜蜜鳳梨（台農16號）', en: 'Sweet Honey (TN16)' }, reason: { zh: '產季末尾', en: 'End of season' } },
      { name: { zh: '牛奶鳳梨（台農20號）', en: 'Milk Pineapple (TN20)' }, reason: { zh: '夏季品質佳', en: 'Good summer quality' }, highlight: true },
      { name: { zh: '金桂花鳳梨（台農18號）', en: 'Osmanthus (TN18)' }, reason: { zh: '淡淡桂花香', en: 'Subtle osmanthus aroma' } },
      { name: { zh: '芒果鳳梨（台農23號）', en: 'Mango Pineapple (TN23)' }, reason: { zh: '芒果香氣濃郁', en: 'Rich mango aroma' } },
    ],
    pickingTips: [
      { zh: '7月雨季開始，選購時更要注意果實品質', en: 'Rainy season begins; pay extra attention to fruit quality' },
    ],
  },
  {
    month: 8,
    label: { zh: '8月', en: 'August' },
    recommended: [
      { name: { zh: '土鳳梨（開英種）', en: 'Native Pineapple (Cayenne)' }, reason: { zh: '酸香濃郁，適合加工', en: 'Rich sour aroma, great for processing' }, highlight: true },
      { name: { zh: '蜜香鳳梨（台農22號）', en: 'Honey Aroma (TN22)' }, reason: { zh: '耐多雨品種，品質穩定', en: 'Rain-resistant, stable quality' } },
      { name: { zh: '芒果鳳梨（台農23號）', en: 'Mango Pineapple (TN23)' }, reason: { zh: '產季尾聲', en: 'End of season' } },
      { name: { zh: '蜜寶鳳梨（台農19號）', en: 'Honey Treasure (TN19)' }, reason: { zh: '耐儲放', en: 'Long shelf life' } },
    ],
    pickingTips: [
      { zh: '雨季後金鑽品質下滑，改選蜜香鳳梨品質更穩定', en: 'Golden Diamond quality drops after rains; Honey Aroma is more stable' },
    ],
  },
  {
    month: 9,
    label: { zh: '9月', en: 'September' },
    recommended: [
      { name: { zh: '蜜香鳳梨（台農22號）', en: 'Honey Aroma (TN22)' }, reason: { zh: '秋季主力品種', en: 'Autumn star variety' }, highlight: true },
      { name: { zh: '蜜寶鳳梨（台農19號）', en: 'Honey Treasure (TN19)' }, reason: { zh: '適合有機栽培', en: 'Suitable for organic farming' } },
      { name: { zh: '牛奶鳳梨（台農20號）', en: 'Milk Pineapple (TN20)' }, reason: { zh: '尚有產出', en: 'Still in season' } },
    ],
    pickingTips: [
      { zh: '秋季品種較少，蜜香鳳梨是最佳選擇', en: 'Fewer varieties in autumn; Honey Aroma is the best choice' },
    ],
  },
  {
    month: 10,
    label: { zh: '10月', en: 'October' },
    recommended: [
      { name: { zh: '冬蜜鳳梨（台農13號）', en: 'Winter Honey (TN13)' }, reason: { zh: '冬季品種登場', en: 'Winter variety arrives' }, highlight: true },
      { name: { zh: '蜜香鳳梨（台農22號）', en: 'Honey Aroma (TN22)' }, reason: { zh: '產季尾聲', en: 'End of season' } },
      { name: { zh: '蜜寶鳳梨（台農19號）', en: 'Honey Treasure (TN19)' }, reason: { zh: '產季尾聲', en: 'Last chance' } },
    ],
    pickingTips: [
      { zh: '冬蜜鳳梨開始上市，嚼起來像甘蔗！', en: 'Winter Honey arrives — chew-like sugarcane texture!' },
    ],
  },
  {
    month: 11,
    label: { zh: '11月', en: 'November' },
    recommended: [
      { name: { zh: '冬蜜鳳梨（台農13號）', en: 'Winter Honey (TN13)' }, reason: { zh: '寒冷中風味最棒', en: 'Best flavor in cold weather' }, highlight: true },
    ],
    pickingTips: [
      { zh: '只有冬蜜鳳梨在產，值得品嘗冬季限定風味', en: 'Only Winter Honey available — enjoy this winter exclusive' },
    ],
  },
  {
    month: 12,
    label: { zh: '12月', en: 'December' },
    recommended: [
      { name: { zh: '冬蜜鳳梨（台農13號）', en: 'Winter Honey (TN13)' }, reason: { zh: '冬季甜蜜首選', en: 'Winter sweet pick' }, highlight: true },
    ],
    pickingTips: [
      { zh: '冬蜜鳳梨搭配火鍋是絕配', en: 'Winter Honey pairs perfectly with hot pot' },
    ],
  },
];
