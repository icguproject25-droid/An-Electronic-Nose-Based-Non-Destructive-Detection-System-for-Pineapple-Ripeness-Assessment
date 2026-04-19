export interface CalculatorResult {
  id: string;
  name: { zh: string; en: string };
  description: { zh: string; en: string };
  sweetness: number;
  acidity: number;
  emoji: string;
}

export const calculatorVarieties: CalculatorResult[] = [
  {
    id: 'milk',
    name: { zh: '牛奶鳳梨（台農20號）', en: 'Milk Pineapple (TN20)' },
    description: {
      zh: '極度細嫩多汁，甜度高且帶有奶香，幾乎不酸。',
      en: 'Extremely tender and juicy, very sweet with milky aroma, barely any acidity.',
    },
    sweetness: 5,
    acidity: 1,
    emoji: '🥛',
  },
  {
    id: 'golden_diamond',
    name: { zh: '金鑽鳳梨（台農17號）', en: 'Golden Diamond (TN17)' },
    description: {
      zh: '台灣鳳梨王者，口感清脆，甜酸比例完美平衡。',
      en: 'Taiwan\'s pineapple king, crisp texture, perfectly balanced sweet and sour.',
    },
    sweetness: 4,
    acidity: 2,
    emoji: '💎',
  },
  {
    id: 'sweet_honey',
    name: { zh: '甜蜜蜜鳳梨（台農16號）', en: 'Sweet Honey (TN16)' },
    description: {
      zh: '入口即化，纖維最細，甜度極佳，趁綠吃最甜。',
      en: 'Melts in your mouth, finest fiber, extremely sweet, best eaten green.',
    },
    sweetness: 5,
    acidity: 1,
    emoji: '🍯',
  },
  {
    id: 'golden',
    name: { zh: '黃金鳳梨（台農21號）', en: 'Golden Pineapple (TN21)' },
    description: {
      zh: '果肉厚實甜味厚重，帶有哈密瓜香氣。',
      en: 'Thick sweet flesh with cantaloupe aroma.',
    },
    sweetness: 5,
    acidity: 2,
    emoji: '✨',
  },
  {
    id: 'honey_aroma',
    name: { zh: '蜜香鳳梨（台農22號）', en: 'Honey Aroma (TN22)' },
    description: {
      zh: '品質穩定，糖度高酸度低，清甜如蜜。',
      en: 'Stable quality, high sugar low acid, sweet as honey.',
    },
    sweetness: 4,
    acidity: 1,
    emoji: '🌸',
  },
  {
    id: 'mango',
    name: { zh: '芒果鳳梨（台農23號）', en: 'Mango Pineapple (TN23)' },
    description: {
      zh: '甜度極高，帶有土芒果風味，酸甜比均衡。',
      en: 'Extremely sweet with wild mango flavor, balanced sweet-sour ratio.',
    },
    sweetness: 5,
    acidity: 2,
    emoji: '🥭',
  },
  {
    id: 'perfume',
    name: { zh: '香水鳳梨（台農11號）', en: 'Perfume Pineapple (TN11)' },
    description: {
      zh: '纖維細緻多汁，甜度高香氣十足。',
      en: 'Fine fiber, juicy, very sweet and aromatic.',
    },
    sweetness: 4,
    acidity: 2,
    emoji: '🌺',
  },
  {
    id: 'osmanthus',
    name: { zh: '金桂花鳳梨（台農18號）', en: 'Osmanthus Pineapple (TN18)' },
    description: {
      zh: '帶有淡淡桂花香，纖維中等，回味有花香。',
      en: 'Subtle osmanthus aroma, moderate fiber, floral aftertaste.',
    },
    sweetness: 3,
    acidity: 2,
    emoji: '🌼',
  },
  {
    id: 'apple',
    name: { zh: '蘋果鳳梨（台農6號）', en: 'Apple Pineapple (TN6)' },
    description: {
      zh: '肉質軟細緻卻帶蘋果般脆感，甜度適中清爽。',
      en: 'Soft yet apple-like crisp, moderately sweet and refreshing.',
    },
    sweetness: 3,
    acidity: 2,
    emoji: '🍎',
  },
  {
    id: 'sugar_apple',
    name: { zh: '釋迦鳳梨（台農4號）', en: 'Sugar Apple Pineapple (TN4)' },
    description: {
      zh: '可用手剝開食用，肉質硬脆風味獨特。',
      en: 'Hand-peelable, firm crisp flesh with unique flavor.',
    },
    sweetness: 3,
    acidity: 3,
    emoji: '🫐',
  },
  {
    id: 'winter_honey',
    name: { zh: '冬蜜鳳梨（台農13號）', en: 'Winter Honey (TN13)' },
    description: {
      zh: '冬季限定，糖度高酸度低，纖維感明顯像嚼甘蔗。',
      en: 'Winter exclusive, high sugar low acid, sugarcane-like fiber texture.',
    },
    sweetness: 4,
    acidity: 1,
    emoji: '❄️',
  },
  {
    id: 'honey_treasure',
    name: { zh: '蜜寶鳳梨（台農19號）', en: 'Honey Treasure (TN19)' },
    description: {
      zh: '自然抗病品種，風味自然甜度穩定，耐儲放。',
      en: 'Naturally disease-resistant, stable natural sweetness, long shelf life.',
    },
    sweetness: 3,
    acidity: 2,
    emoji: '🍀',
  },
  {
    id: 'native',
    name: { zh: '土鳳梨（開英種）', en: 'Native Pineapple (Cayenne)' },
    description: {
      zh: '酸味明顯香氣強烈，纖維較粗口感紮實，適合鳳梨酥。',
      en: 'Pronounced acidity with strong aroma, coarse fiber, ideal for pineapple cakes.',
    },
    sweetness: 2,
    acidity: 5,
    emoji: '🏔️',
  },
];

export function getRecommendations(sweetness: number, acidity: number): CalculatorResult[] {
  const targetRatio = acidity === 0 ? sweetness * 5 : sweetness / acidity;

  const scored = calculatorVarieties.map((v) => {
    const vRatio = v.acidity === 0 ? v.sweetness * 5 : v.sweetness / v.acidity;
    const ratioDiff = Math.abs(targetRatio - vRatio);
    const sweetDiff = Math.abs(sweetness - v.sweetness);
    const acidDiff = Math.abs(acidity - v.acidity);
    const score = ratioDiff * 2 + sweetDiff + acidDiff;
    return { ...v, score };
  });

  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, 3);
}
