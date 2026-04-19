export interface PineappleVariety {
  id: string;
  imageUrl: string;
  name: { zh: string; en: string };
  intro: { zh: string[]; en: string[] };
  appearance: { zh: string[]; en: string[] };
  taste: { zh: string[]; en: string[] };
  origin: { zh: string[]; en: string[] };
}

export const varieties: PineappleVariety[] = [
  {
    id: 'kaiying',
    imageUrl: 'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=600&h=400&fit=crop',
    name: {
      zh: '土鳳梨 / 開英種（1號、2號、3號仔）',
      en: 'Native Pineapple / Cayenne (No.1, No.2, No.3)',
    },
    intro: {
      zh: [
        '產季：5月～8月',
        '開英種又稱為「外來種」，是台灣早期引進並長期栽培的傳統品種。',
        '早期主要用於外銷罐頭加工，現在則是「純鳳梨酥」內餡的主角。',
        '依果實特性分為：1號仔（突目系）、2號仔（正常系）、3號仔（三菱系）。',
        '2號仔與3號仔因風味濃郁，最常被用來製作鳳梨酥。',
      ],
      en: [
        'Season: May–August',
        'Cayenne, also known as the "imported variety," is a traditional cultivar introduced to Taiwan early on and cultivated for a long time.',
        'Originally used mainly for canned exports, it is now the star ingredient in authentic pineapple cake filling.',
        'Classified by fruit characteristics: No.1 (protruding-eye type), No.2 (normal type), No.3 (triangular type).',
        'No.2 and No.3 are most commonly used for pineapple cakes due to their rich flavor.',
      ],
    },
    appearance: {
      zh: [
        '1號仔：果目明顯突起。',
        '2號仔：果形較長，果目較平坦。',
        '3號仔：果形粗大，多呈三角錐狀，葉緣帶刺。',
      ],
      en: [
        'No.1: Noticeably protruding eyes.',
        'No.2: Elongated fruit shape, flatter eyes.',
        'No.3: Thick and large, often triangular cone-shaped, with thorny leaf edges.',
      ],
    },
    taste: {
      zh: [
        '酸味明顯，香氣強烈。',
        '果肉纖維較粗，口感紮實。',
        '甜中帶酸，適合不喜歡太甜、追求原始鳳梨味的人。',
      ],
      en: [
        'Distinctly sour with a strong aroma.',
        'Coarser flesh fibers, firm texture.',
        'Sweet with a tart edge, perfect for those who prefer authentic pineapple flavor over sweetness.',
      ],
    },
    origin: {
      zh: ['南投名間（最多）、台中霧峰、屏東、台南關廟、宜蘭員山、花蓮瑞穗、台東鹿野。'],
      en: ['Nantou Mingjian (most), Taichung Wufeng, Pingtung, Tainan Guanmiao, Yilan Yuanshan, Hualien Ruisui, Taitung Luye.'],
    },
  },
  {
    id: 'tainung4',
    imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&h=400&fit=crop',
    name: {
      zh: '釋迦鳳梨（台農4號）',
      en: 'Tainung No.4 (Sugar Apple Pineapple)',
    },
    intro: {
      zh: [
        '產季：3月～5月',
        '又稱為「剝皮鳳梨」，因為果目突起且果皮厚，可以直接用手剝開食用。',
        '早期多外銷日本，但因葉片邊緣有刺，近年種植面積逐漸減少。',
      ],
      en: [
        'Season: March–May',
        'Also called "peel pineapple" because its protruding eyes and thick skin allow it to be peeled by hand.',
        'Previously exported mostly to Japan, but its thorny leaf edges have led to a gradual decline in cultivation.',
      ],
    },
    appearance: {
      zh: [
        '果目突、果皮厚。',
        '葉片為綠色且邊緣有刺。',
        '帶有特殊的清新香氣。',
      ],
      en: [
        'Protruding eyes, thick skin.',
        'Green leaves with thorny edges.',
        'Carries a distinctive fresh fragrance.',
      ],
    },
    taste: {
      zh: [
        '食用方式像釋迦一樣可以用手剝，非常方便。',
        '肉質較硬脆，風味獨特。',
      ],
      en: [
        'Can be eaten by peeling with hands like a sugar apple, very convenient.',
        'Firm and crispy flesh with a unique flavor.',
      ],
    },
    origin: {
      zh: ['屏東潮州、嘉義大林、民雄。'],
      en: ['Pingtung Chaozhou, Chiayi Dalin, Minxiong.'],
    },
  },
  {
    id: 'tainung6',
    imageUrl: 'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=600&h=400&fit=crop',
    name: {
      zh: '蘋果鳳梨（台農6號）',
      en: 'Tainung No.6 (Apple Pineapple)',
    },
    intro: {
      zh: [
        '產季：4月～5月',
        '因口感帶有脆度，吃起來像蘋果而得名。',
        '屬於早春品種，產期較短。',
      ],
      en: [
        'Season: April–May',
        'Named for its apple-like crispness.',
        'An early spring variety with a short harvest season.',
      ],
    },
    appearance: {
      zh: [
        '葉片為暗紫紅色，葉緣有刺。',
        '果目淺平，果皮薄。',
      ],
      en: [
        'Dark purple-red leaves with thorny edges.',
        'Shallow, flat eyes with thin skin.',
      ],
    },
    taste: {
      zh: [
        '肉質軟而細緻，但帶有如蘋果般的脆感。',
        '甜度適中，風味清爽。',
      ],
      en: [
        'Soft and delicate flesh with an apple-like crispness.',
        'Moderate sweetness with a refreshing flavor.',
      ],
    },
    origin: {
      zh: ['高雄大樹、屏東。'],
      en: ['Kaohsiung Dashu, Pingtung.'],
    },
  },
  {
    id: 'tainung11',
    imageUrl: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=600&h=400&fit=crop',
    name: {
      zh: '香水鳳梨（台農11號）',
      en: 'Tainung No.11 (Perfume Pineapple)',
    },
    intro: {
      zh: [
        '產季：5月～6月',
        '以強烈的特殊香氣著稱，平均重量僅約1公斤，體型精巧。',
        '主要是外銷日本的寵兒，在台灣本地零售市場較少見。',
      ],
      en: [
        'Season: May–June',
        'Known for its intensely unique fragrance, averaging only about 1 kg — compact in size.',
        'A favorite for export to Japan, rarely seen in Taiwan\'s domestic retail market.',
      ],
    },
    appearance: {
      zh: [
        '果實較小。',
        '聞起來有非常濃郁且特殊的香氣。',
      ],
      en: [
        'Smaller fruit.',
        'Extremely rich and distinctive fragrance.',
      ],
    },
    taste: {
      zh: [
        '纖維細緻且水分充足（多汁）。',
        '甜度高，香氣十足。',
      ],
      en: [
        'Fine fiber and very juicy.',
        'High sweetness with abundant aroma.',
      ],
    },
    origin: {
      zh: ['屏東高樹。'],
      en: ['Pingtung Gaoshu.'],
    },
  },
  {
    id: 'tainung13',
    imageUrl: 'https://images.unsplash.com/photo-1587883012610-e3df17d14018?w=600&h=400&fit=crop',
    name: {
      zh: '冬蜜鳳梨 / 甘蔗鳳梨（台農13號）',
      en: 'Tainung No.13 (Winter Honey / Sugarcane Pineapple)',
    },
    intro: {
      zh: [
        '產季：10月～隔年2月',
        '專門為冬季生產而生的品種，在寒冷季節的風味表現最棒。',
        '因纖維較粗，吃起來有種嚼甘蔗的錯覺，故又名「甘蔗鳳梨」。',
      ],
      en: [
        'Season: October–February (next year)',
        'A variety bred specifically for winter production, with the best flavor in cold seasons.',
        'Its coarser fiber gives a sugarcane-chewing sensation, hence the name "Sugarcane Pineapple."',
      ],
    },
    appearance: {
      zh: [
        '葉子長而直立，葉片中軸帶紫紅色。',
        '果實呈長圓錐形。',
      ],
      en: [
        'Long, upright leaves with purple-red midribs.',
        'Elongated conical fruit shape.',
      ],
    },
    taste: {
      zh: [
        '糖度高、酸度低，風味濃郁。',
        '纖維感較明顯。',
      ],
      en: [
        'High sugar, low acidity, rich flavor.',
        'More noticeable fiber texture.',
      ],
    },
    origin: {
      zh: ['高雄大樹、屏東。'],
      en: ['Kaohsiung Dashu, Pingtung.'],
    },
  },
  {
    id: 'tainung16',
    imageUrl: 'https://images.unsplash.com/photo-1595702419689-35e041012960?w=600&h=400&fit=crop',
    name: {
      zh: '甜蜜蜜鳳梨（台農16號）',
      en: 'Tainung No.16 (Sweet Honey Pineapple)',
    },
    intro: {
      zh: [
        '產季：4月～7月',
        '號稱鳳梨界的「絲絨」，纖維細緻度是所有品種之冠。',
        '建議「趁綠吃」，不需要等到變黃，綠皮時甜度最高。',
      ],
      en: [
        'Season: April–July',
        'Dubbed the "velvet" of the pineapple world — the finest fiber texture of all varieties.',
        'Best eaten while still green; sweetness peaks before the skin turns yellow.',
      ],
    },
    appearance: {
      zh: [
        '果實呈圓錐狀。',
        '香氣非常濃烈，即使果皮尚綠也能聞到香味。',
      ],
      en: [
        'Conical fruit shape.',
        'Extremely intense aroma, detectable even when the skin is still green.',
      ],
    },
    taste: {
      zh: [
        '幾乎「入口即化」，完全沒有纖維卡牙縫感。',
        '甜度極佳，果肉綿密。',
      ],
      en: [
        'Practically melts in your mouth with zero fibrous feeling.',
        'Exceptional sweetness with dense, velvety flesh.',
      ],
    },
    origin: {
      zh: ['嘉義新港、台南山上、屏東。'],
      en: ['Chiayi Xingang, Tainan Shanshang, Pingtung.'],
    },
  },
  {
    id: 'tainung17',
    imageUrl: 'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=600&h=400&fit=crop',
    name: {
      zh: '金鑽鳳梨（台農17號）',
      en: 'Tainung No.17 (Golden Diamond Pineapple)',
    },
    intro: {
      zh: [
        '產季：3月～6月',
        '台灣鳳梨的「王者」，產量占全台近8成。',
        '因為在水果較少的3月就能上市，經濟價值極高。',
      ],
      en: [
        'Season: March–June',
        'The "king" of Taiwan pineapples, accounting for nearly 80% of total production.',
        'Its ability to hit the market in March when other fruits are scarce gives it immense economic value.',
      ],
    },
    appearance: {
      zh: [
        '外形接近圓筒形。',
        '果皮金黃，果芯較大。',
      ],
      en: [
        'Nearly cylindrical shape.',
        'Golden yellow skin with a larger core.',
      ],
    },
    taste: {
      zh: [
        '口感清脆，甜度與酸度的比例平衡。',
        '果芯也可以直接食用，不影響口感。',
      ],
      en: [
        'Crisp texture with a well-balanced sweetness-to-acidity ratio.',
        'The core is also edible without affecting the taste.',
      ],
    },
    origin: {
      zh: ['全台主要鳳梨產地皆有種植。'],
      en: ['Grown in all major pineapple-producing regions across Taiwan.'],
    },
  },
  {
    id: 'tainung18',
    imageUrl: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&h=400&fit=crop',
    name: {
      zh: '金桂花鳳梨（台農18號）',
      en: 'Tainung No.18 (Osmanthus Pineapple)',
    },
    intro: {
      zh: [
        '產季：4月～7月',
        '最大的特色是果肉散發淡淡的「桂花香氣」。',
        '平均重量約1.5公斤。',
      ],
      en: [
        'Season: April–July',
        'Its signature feature is flesh that emits a subtle osmanthus flower fragrance.',
        'Average weight is about 1.5 kg.',
      ],
    },
    appearance: {
      zh: [
        '果形美觀。',
        '帶有清雅的桂花香。',
      ],
      en: [
        'Attractive fruit shape.',
        'Carries an elegant osmanthus fragrance.',
      ],
    },
    taste: {
      zh: [
        '纖維量中等，口感適中。',
        '吃完後口中會留有淡雅的花香味。',
      ],
      en: [
        'Medium fiber content with a balanced mouthfeel.',
        'Leaves a lingering, elegant floral aftertaste.',
      ],
    },
    origin: {
      zh: ['高雄大樹。'],
      en: ['Kaohsiung Dashu.'],
    },
  },
  {
    id: 'tainung19',
    imageUrl: 'https://images.unsplash.com/photo-1559581895-a37d959bf19c?w=600&h=400&fit=crop',
    name: {
      zh: '蜜寶鳳梨（台農19號）',
      en: 'Tainung No.19 (Honey Treasure Pineapple)',
    },
    intro: {
      zh: [
        '產季：5月～10月',
        '雖然長相平凡，但是「自然抗病」的強健品種。',
        '適合有機栽培或自然農法，是追求健康的消費者的好選擇。',
      ],
      en: [
        'Season: May–October',
        'Modest in appearance but a naturally disease-resistant, robust variety.',
        'Ideal for organic or natural farming — a great choice for health-conscious consumers.',
      ],
    },
    appearance: {
      zh: [
        '果實呈圓筒狀。',
        '黃皮帶黃褐色，視覺上較不吸引人。',
      ],
      en: [
        'Cylindrical fruit shape.',
        'Yellow skin with brownish tones, visually less appealing.',
      ],
    },
    taste: {
      zh: [
        '風味自然、甜度穩定。',
        '肉質耐儲放。',
      ],
      en: [
        'Natural flavor with stable sweetness.',
        'Flesh stores well over time.',
      ],
    },
    origin: {
      zh: ['台南以南。'],
      en: ['South of Tainan.'],
    },
  },
  {
    id: 'tainung20',
    imageUrl: 'https://images.unsplash.com/photo-1587883012610-e3df17d14018?w=600&h=400&fit=crop',
    name: {
      zh: '牛奶鳳梨（台農20號）',
      en: 'Tainung No.20 (Milk Pineapple)',
    },
    intro: {
      zh: [
        '產季：5月～10月',
        '頂級品種之一，以純白如牛奶的果肉聞名。',
        '種植技術要求較高，高品質的果實會帶有淡淡乳香味。',
      ],
      en: [
        'Season: May–October',
        'One of the premium varieties, renowned for its milky-white flesh.',
        'Requires advanced cultivation techniques; top-quality fruits carry a subtle milky aroma.',
      ],
    },
    appearance: {
      zh: [
        '葉片無刺，果實呈圓筒狀。',
        '果皮薄，果肉呈獨特的乳白色。',
      ],
      en: [
        'Thornless leaves, cylindrical fruit.',
        'Thin skin with uniquely milky-white flesh.',
      ],
    },
    taste: {
      zh: [
        '肉質極度細嫩，多汁。',
        '甜度高且帶有奶香（產季佳時）。',
      ],
      en: [
        'Extremely tender and juicy flesh.',
        'High sweetness with a milky fragrance (during peak season).',
      ],
    },
    origin: {
      zh: ['嘉義民雄。'],
      en: ['Chiayi Minxiong.'],
    },
  },
  {
    id: 'tainung21',
    imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&h=400&fit=crop',
    name: {
      zh: '黃金鳳梨（台農21號）',
      en: 'Tainung No.21 (Golden Pineapple)',
    },
    intro: {
      zh: [
        '產季：4月～10月',
        '適合在陽光充足的環境生長，5月是其風味巔峰。',
        '高品質的果實會散發驚人的「哈密瓜」香氣。',
      ],
      en: [
        'Season: April–October',
        'Thrives in sunny environments, with peak flavor in May.',
        'Top-quality fruits emit an astonishing cantaloupe-like fragrance.',
      ],
    },
    appearance: {
      zh: [
        '果肉呈漂亮的深金黃色。',
        '果香中帶有濃郁的熱帶果香。',
      ],
      en: [
        'Beautiful deep golden yellow flesh.',
        'Fruity aroma with rich tropical notes.',
      ],
    },
    taste: {
      zh: [
        '果肉厚實，甜味厚重。',
        '吃起來有哈密瓜的神韻。',
      ],
      en: [
        'Thick, dense flesh with deep sweetness.',
        'Tastes reminiscent of cantaloupe.',
      ],
    },
    origin: {
      zh: ['台南關廟、高雄大樹。'],
      en: ['Tainan Guanmiao, Kaohsiung Dashu.'],
    },
  },
  {
    id: 'tainung22',
    imageUrl: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=600&h=400&fit=crop',
    name: {
      zh: '蜜香鳳梨（台農22號）',
      en: 'Tainung No.22 (Honey Fragrance Pineapple)',
    },
    intro: {
      zh: [
        '產季：5月～6月、8月～10月',
        '為了改善主要品種（金鑽鳳梨）在8月雨季後品質不佳的問題，由農試所嘉義分所選育而成。',
        '具有耐多雨、不易裂果、耐貯運的優點，適合在夏秋兩季生產。',
        '特性是品質穩定，能填補夏季傳統品種品質下滑的空窗期。',
      ],
      en: [
        'Season: May–June, August–October',
        'Bred by the Chiayi Branch of the Agricultural Research Institute to address the quality decline of Golden Diamond pineapples after the August rainy season.',
        'Rain-tolerant, crack-resistant, and transport-durable — ideal for summer and autumn production.',
        'Delivers consistent quality, filling the gap when traditional varieties suffer during summer.',
      ],
    },
    appearance: {
      zh: [
        '果實呈圓筒形，平均重量約 1.76 公斤。',
        '成熟時果皮為黃色稍帶橙紅，果皮薄。',
        '葉片先端有微刺，葉緣無刺，葉色濃綠帶暗紫紅色。',
      ],
      en: [
        'Cylindrical fruit averaging about 1.76 kg.',
        'Skin turns yellow with a slight orange-red hue when ripe, thin-skinned.',
        'Leaf tips have tiny thorns but smooth edges; dark green leaves with dark purple-red tones.',
      ],
    },
    taste: {
      zh: [
        '肉質緻密且細嫩，纖維中等。',
        '果肉呈黃色或金黃色，糖度高。',
        '酸度低，風味清甜如蜜。',
      ],
      en: [
        'Dense, tender flesh with medium fiber.',
        'Yellow to golden flesh with high sugar content.',
        'Low acidity, clean and honey-sweet flavor.',
      ],
    },
    origin: {
      zh: ['屏東新埤/內埔、高雄大樹、台南關廟。'],
      en: ['Pingtung Xinpi/Neipu, Kaohsiung Dashu, Tainan Guanmiao.'],
    },
  },
  {
    id: 'tainung23',
    imageUrl: 'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=600&h=400&fit=crop',
    name: {
      zh: '芒果鳳梨（台農23號）',
      en: 'Tainung No.23 (Mango Pineapple)',
    },
    intro: {
      zh: [
        '產季：夏季（約 5月～8月）',
        '由台農 19 號（蜜寶）與台農 21 號（黃金）雜交育成。',
        '最大的賣點是成熟時散發出濃郁的「土芒果」香氣。',
        '克服了鳳梨常見的「肉聲果」或裂果問題，且皮厚耐運輸，外銷潛力極大。',
      ],
      en: [
        'Season: Summer (approx. May–August)',
        'A cross between Tainung No.19 (Honey Treasure) and Tainung No.21 (Golden).',
        'Its biggest selling point is the rich "native mango" aroma released when ripe.',
        'Overcomes common pineapple issues like hollow fruit and cracking; thick skin makes it highly export-friendly.',
      ],
    },
    appearance: {
      zh: [
        '外觀呈短圓形，果皮較厚。',
        '成熟時會釋放獨特的熱帶芒果香。',
      ],
      en: [
        'Short, round shape with thicker skin.',
        'Releases a distinctive tropical mango fragrance when ripe.',
      ],
    },
    taste: {
      zh: [
        '肉質細緻柔軟，纖維極少。',
        '甜度極高，遠高於一般的金鑽鳳梨。',
        '帶有像土芒果般的混合風味，酸甜比均衡。',
      ],
      en: [
        'Delicate, soft flesh with minimal fiber.',
        'Extremely high sweetness, far exceeding typical Golden Diamond pineapples.',
        'A blended flavor reminiscent of native mangoes with a balanced sweet-sour ratio.',
      ],
    },
    origin: {
      zh: ['屏東高樹/枋山、台南關廟、嘉義民雄。'],
      en: ['Pingtung Gaoshu/Fangshan, Tainan Guanmiao, Chiayi Minxiong.'],
    },
  },
];
