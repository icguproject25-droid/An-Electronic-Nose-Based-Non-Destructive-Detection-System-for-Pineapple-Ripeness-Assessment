export interface TriviaQuestion {
  id: number;
  question_en: string;
  question_zh: string;
  choices_en: string[];
  choices_zh: string[];
  correctAnswer: number;
  explanation_en: string;
  explanation_zh: string;
}

export const triviaQuestions: TriviaQuestion[] = [
  {
    id: 1,
    question_en: 'Which smell usually suggests a ripe pineapple?',
    question_zh: '哪種氣味通常代表鳳梨已經成熟？',
    choices_en: ['No smell', 'Sweet fruity aroma', 'Sour vinegar smell'],
    choices_zh: ['沒有氣味', '甜甜的果香', '酸酸的醋味'],
    correctAnswer: 1,
    explanation_en: 'A sweet, fruity aroma at the base indicates ripeness.',
    explanation_zh: '底部散發甜甜的果香代表鳳梨已成熟。',
  },
  {
    id: 2,
    question_en: 'Where should you smell a pineapple to check ripeness?',
    question_zh: '應該聞鳳梨哪個部位來判斷熟度？',
    choices_en: ['The leaves', 'The bottom (base)'],
    choices_zh: ['葉子', '底部'],
    correctAnswer: 1,
    explanation_en: 'The base of the pineapple releases the most aroma.',
    explanation_zh: '鳳梨底部會散發最多香氣。',
  },
  {
    id: 3,
    question_en: 'What color change usually means a pineapple is ripening?',
    question_zh: '鳳梨變成什麼顏色通常代表正在成熟？',
    choices_en: ['Stays dark green', 'Turns golden yellow', 'Turns red'],
    choices_zh: ['維持深綠色', '轉為金黃色', '變成紅色'],
    correctAnswer: 1,
    explanation_en: 'Golden yellow color from the base up signals ripeness.',
    explanation_zh: '從底部開始轉為金黃色代表鳳梨正在成熟。',
  },
  {
    id: 4,
    question_en: 'Should you refrigerate a whole uncut pineapple?',
    question_zh: '未切開的整顆鳳梨應該放冰箱嗎？',
    choices_en: ['Yes, immediately', 'No, keep at room temperature'],
    choices_zh: ['是的，立刻冷藏', '不用，放在室溫即可'],
    correctAnswer: 1,
    explanation_en: 'Uncut pineapples ripen better at room temperature.',
    explanation_zh: '未切開的鳳梨在室溫下熟成效果更好。',
  },
  {
    id: 5,
    question_en: 'What does this electronic nose scan detect?',
    question_zh: '電子鼻掃描偵測的是什麼？',
    choices_en: ['Weight', 'VOC gases', 'Sugar crystals'],
    choices_zh: ['重量', 'VOC 揮發性氣體', '糖結晶'],
    correctAnswer: 1,
    explanation_en: 'The sensor detects volatile organic compounds (VOC) from the fruit.',
    explanation_zh: '感測器偵測水果散發的揮發性有機化合物（VOC）。',
  },
  {
    id: 6,
    question_en: 'How long does a typical pineapple scan take?',
    question_zh: '一次鳳梨掃描大約需要多久？',
    choices_en: ['About 10 seconds', 'About 5 minutes', 'About 1 hour'],
    choices_zh: ['大約 10 秒', '大約 5 分鐘', '大約 1 小時'],
    correctAnswer: 0,
    explanation_en: 'The VOC pre-check takes about 10 seconds before analysis.',
    explanation_zh: 'VOC 預檢大約需要 10 秒，之後進行分析。',
  },
  {
    id: 7,
    question_en: 'Pineapple is especially rich in which vitamin?',
    question_zh: '鳳梨特別富含哪種維生素？',
    choices_en: ['Vitamin D', 'Vitamin C', 'Vitamin K'],
    choices_zh: ['維生素 D', '維生素 C', '維生素 K'],
    correctAnswer: 1,
    explanation_en: 'Pineapple is an excellent source of Vitamin C.',
    explanation_zh: '鳳梨是維生素 C 的極佳來源。',
  },
  {
    id: 8,
    question_en: 'What should you avoid when picking a pineapple?',
    question_zh: '挑選鳳梨時應該避免什麼？',
    choices_en: ['Smelling it', 'Squeezing it hard', 'Looking at the color'],
    choices_zh: ['聞它', '用力擠壓', '看顏色'],
    correctAnswer: 1,
    explanation_en: 'Squeezing can damage the fruit and cause bruising.',
    explanation_zh: '用力擠壓會傷害果肉並造成瘀傷。',
  },
  {
    id: 9,
    question_en: 'What enzyme in pineapple helps with digestion?',
    question_zh: '鳳梨中哪種酵素有助於消化？',
    choices_en: ['Bromelain', 'Pepsin', 'Lipase'],
    choices_zh: ['鳳梨酵素（鳳梨蛋白酶）', '胃蛋白酶', '脂肪酶'],
    correctAnswer: 0,
    explanation_en: 'Bromelain is a natural enzyme found in pineapple that aids digestion.',
    explanation_zh: '鳳梨蛋白酶是鳳梨中的天然酵素，有助於消化。',
  },
  {
    id: 10,
    question_en: 'A heavier pineapple of similar size usually means:',
    question_zh: '同樣大小但較重的鳳梨通常代表：',
    choices_en: ['Less juice', 'More juice and ripeness', 'It is overripe'],
    choices_zh: ['汁少', '汁多且更成熟', '已經過熟'],
    correctAnswer: 1,
    explanation_en: 'Heavier pineapples tend to have more juice content.',
    explanation_zh: '較重的鳳梨通常汁液含量更多。',
  },
];
