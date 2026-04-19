import { useState, useCallback, useRef, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';

interface TriviaQuestion {
  id: number;
  question_en: string;
  question_zh: string;
  choices_en: string[];
  choices_zh: string[];
  correctIndex: number;
  explanation_en: string;
  explanation_zh: string;
}

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    question_en: 'Which smell usually suggests a ripe pineapple?',
    question_zh: '哪種氣味通常代表鳳梨成熟？',
    choices_en: ['Sweet aroma', 'No smell', 'Burnt smell'],
    choices_zh: ['甜甜的果香', '沒有氣味', '燒焦的味道'],
    correctIndex: 0,
    explanation_en: 'A sweet, fruity aroma at the base indicates ripeness.',
    explanation_zh: '底部散發甜甜的果香代表鳳梨已成熟。',
  },
  {
    id: 2,
    question_en: 'Where should you smell a pineapple?',
    question_zh: '通常應該聞鳳梨哪裡？',
    choices_en: ['Bottom', 'Leaves', 'Outer skin'],
    choices_zh: ['底部', '葉子', '外皮表面'],
    correctIndex: 0,
    explanation_en: 'The base of the pineapple releases the most aroma.',
    explanation_zh: '鳳梨底部會散發最多香氣。',
  },
  {
    id: 3,
    question_en: 'What color often suggests ripeness?',
    question_zh: '哪種顏色通常代表比較成熟？',
    choices_en: ['Golden yellow', 'Blue', 'Dark gray'],
    choices_zh: ['金黃色', '藍色', '深灰色'],
    correctIndex: 0,
    explanation_en: 'Golden yellow color from the base up signals ripeness.',
    explanation_zh: '從底部開始轉為金黃色代表鳳梨正在成熟。',
  },
  {
    id: 4,
    question_en: 'What can this scan help analyze?',
    question_zh: '這個掃描可以幫助分析什麼？',
    choices_en: ['Aroma signals', 'Fruit price', 'Package weight'],
    choices_zh: ['氣味訊號', '水果價格', '包裝重量'],
    correctIndex: 0,
    explanation_en: 'The sensor detects volatile organic compounds (VOC) from the fruit.',
    explanation_zh: '感測器偵測水果散發的揮發性有機化合物（VOC）。',
  },
  {
    id: 5,
    question_en: 'How long does the scan usually take?',
    question_zh: '這個掃描通常需要多久？',
    choices_en: ['About 30 seconds', 'About 5 minutes', 'About 1 second'],
    choices_zh: ['大約 30 秒', '大約 5 分鐘', '大約 1 秒'],
    correctIndex: 0,
    explanation_en: 'The scan typically completes in about 30 seconds.',
    explanation_zh: '掃描通常在約 30 秒內完成。',
  },
  {
    id: 6,
    question_en: 'What can aroma help indicate?',
    question_zh: '氣味可以幫助判斷什麼？',
    choices_en: ['Ripeness', 'Screen brightness', 'Fruit label color'],
    choices_zh: ['成熟度', '螢幕亮度', '水果標籤顏色'],
    correctIndex: 0,
    explanation_en: 'Aroma is one of the best indicators of fruit ripeness.',
    explanation_zh: '氣味是判斷水果成熟度最好的指標之一。',
  },
  {
    id: 7,
    question_en: 'Before cutting, where is pineapple usually stored?',
    question_zh: '鳳梨在切開前通常怎麼保存？',
    choices_en: ['Room temperature first', 'Freezer only', 'In water'],
    choices_zh: ['先放室溫', '只能冷凍', '泡在水裡'],
    correctIndex: 0,
    explanation_en: 'Whole pineapples can stay at room temperature before cutting.',
    explanation_zh: '整顆鳳梨切開前可以在室溫下保存。',
  },
  {
    id: 8,
    question_en: 'A sweet smell near the base usually means...',
    question_zh: '底部聞起來有甜味通常代表...',
    choices_en: ['It may be ripe', 'It is frozen', 'It is empty inside'],
    choices_zh: ['可能已成熟', '已經冷凍過', '裡面是空的'],
    correctIndex: 0,
    explanation_en: 'Ripe pineapples usually smell sweet at the base.',
    explanation_zh: '成熟的鳳梨通常在底部會散發甜香。',
  },
  {
    id: 9,
    question_en: 'What does a sour or fermented smell indicate?',
    question_zh: '如果聞起來有酸味或酒味代表什麼？',
    choices_en: ['Perfect ripeness', 'Overripe', 'Unripe'],
    choices_zh: ['完美成熟', '過熟', '未熟'],
    correctIndex: 1,
    explanation_en: 'A fermented smell usually means the pineapple is overripe.',
    explanation_zh: '發酵或酸味通常代表鳳梨已經過熟。',
  },
  {
    id: 10,
    question_en: 'Which part of a pineapple is usually the sweetest?',
    question_zh: '鳳梨哪個部位通常最甜？',
    choices_en: ['Top (near leaves)', 'Middle', 'Bottom (base)'],
    choices_zh: ['頂部（靠近葉子）', '中間', '底部'],
    correctIndex: 2,
    explanation_en: 'Sugar concentrates at the base, making the bottom sweetest.',
    explanation_zh: '糖分集中在底部，所以底部最甜。',
  },
  {
    id: 11,
    question_en: 'What should you avoid when picking a pineapple?',
    question_zh: '挑選鳳梨時應該避免什麼？',
    choices_en: ['Smelling it', 'Squeezing it hard', 'Looking at the color'],
    choices_zh: ['聞它', '用力擠壓', '看顏色'],
    correctIndex: 1,
    explanation_en: 'Squeezing can damage the fruit and cause bruising.',
    explanation_zh: '用力擠壓會傷害果肉並造成瘀傷。',
  },
  {
    id: 12,
    question_en: 'Pineapple is especially rich in which vitamin?',
    question_zh: '鳳梨特別富含哪種維生素？',
    choices_en: ['Vitamin D', 'Vitamin C', 'Vitamin K'],
    choices_zh: ['維生素 D', '維生素 C', '維生素 K'],
    correctIndex: 1,
    explanation_en: 'Pineapple is an excellent source of Vitamin C.',
    explanation_zh: '鳳梨是維生素 C 的極佳來源。',
  },
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const [TriviaProvider, useTrivia] = createContextHook(() => {
  const [shuffledQuestions, setShuffledQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const initializedRef = useRef(false);

  const startSession = useCallback(() => {
    if (!initializedRef.current) {
      const q = shuffleArray(TRIVIA_QUESTIONS);
      setShuffledQuestions(q);
      setCurrentIndex(0);
      setScore(0);
      setTotalAnswered(0);
      initializedRef.current = true;
      console.log('[Trivia] Session started with', q.length, 'questions');
    }
    setIsActive(true);
  }, []);

  const continueSession = useCallback(() => {
    setIsActive(true);
    console.log('[Trivia] Session continued at question index', currentIndex);
  }, [currentIndex]);

  const stopSession = useCallback(() => {
    setIsActive(false);
    console.log('[Trivia] Session stopped');
  }, []);

  const resetSession = useCallback(() => {
    initializedRef.current = false;
    setShuffledQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setTotalAnswered(0);
    setIsActive(false);
    console.log('[Trivia] Session reset');
  }, []);

  const recordAnswer = useCallback((correct: boolean) => {
    if (correct) {
      setScore((prev) => prev + 1);
    }
    setTotalAnswered((prev) => prev + 1);
  }, []);

  const advanceQuestion = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = (prev + 1) % (shuffledQuestions.length || 1);
      return next;
    });
  }, [shuffledQuestions.length]);

  const currentQuestion = shuffledQuestions[currentIndex] ?? null;

  return useMemo(() => ({
    shuffledQuestions,
    currentQuestion,
    currentIndex,
    score,
    totalAnswered,
    isActive,
    startSession,
    continueSession,
    stopSession,
    resetSession,
    recordAnswer,
    advanceQuestion,
  }), [shuffledQuestions, currentQuestion, currentIndex, score, totalAnswered, isActive, startSession, continueSession, stopSession, resetSession, recordAnswer, advanceQuestion]);
});
