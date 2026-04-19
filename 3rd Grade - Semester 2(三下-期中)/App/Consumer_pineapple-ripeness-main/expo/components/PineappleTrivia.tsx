import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { Lightbulb, Check, X } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface TriviaQuestion {
  id: number;
  question_en: string;
  question_zh: string;
  options_en: string[];
  options_zh: string[];
  correctIndex: number;
  explanation_en: string;
  explanation_zh: string;
}

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    question_en: 'Which smell usually means a pineapple is ripe?',
    question_zh: '哪種氣味代表鳳梨成熟？',
    options_en: ['Sweet aroma', 'No smell', 'Burnt smell'],
    options_zh: ['甜甜的果香', '沒有氣味', '燒焦的味道'],
    correctIndex: 0,
    explanation_en: 'A sweet, fruity aroma at the base indicates ripeness.',
    explanation_zh: '底部散發甜甜的果香代表鳳梨已成熟。',
  },
  {
    id: 2,
    question_en: 'Where should you smell a pineapple?',
    question_zh: '應該聞鳳梨哪個部位？',
    options_en: ['Bottom', 'Leaves', 'Skin surface'],
    options_zh: ['底部', '葉子', '外皮表面'],
    correctIndex: 0,
    explanation_en: 'The base of the pineapple releases the most aroma.',
    explanation_zh: '鳳梨底部會散發最多香氣。',
  },
  {
    id: 3,
    question_en: 'What color suggests ripeness?',
    question_zh: '什麼顏色代表比較成熟？',
    options_en: ['Golden yellow', 'Dark green', 'Blue'],
    options_zh: ['金黃色', '深綠色', '藍色'],
    correctIndex: 0,
    explanation_en: 'Golden yellow color from the base up signals ripeness.',
    explanation_zh: '從底部開始轉為金黃色代表鳳梨正在成熟。',
  },
  {
    id: 4,
    question_en: 'How long does this scan take?',
    question_zh: '這個掃描大約需要多久？',
    options_en: ['About 30 seconds', '5 minutes', '1 second'],
    options_zh: ['大約 30 秒', '5 分鐘', '1 秒'],
    correctIndex: 0,
    explanation_en: 'The scan typically completes in about 30 seconds.',
    explanation_zh: '掃描通常在約 30 秒內完成。',
  },
  {
    id: 5,
    question_en: 'What can aroma tell us?',
    question_zh: '氣味可以判斷什麼？',
    options_en: ['Ripeness', 'Weight', 'Size'],
    options_zh: ['成熟度', '重量', '大小'],
    correctIndex: 0,
    explanation_en: 'Aroma is one of the best indicators of fruit ripeness.',
    explanation_zh: '氣味是判斷水果成熟度最好的指標之一。',
  },
  {
    id: 6,
    question_en: 'What does a sour or fermented smell indicate?',
    question_zh: '如果聞起來有酸味或酒味代表什麼？',
    options_en: ['Perfect ripeness', 'Overripe', 'Unripe'],
    options_zh: ['完美成熟', '過熟', '未熟'],
    correctIndex: 1,
    explanation_en: 'A fermented smell usually means the pineapple is overripe.',
    explanation_zh: '發酵或酸味通常代表鳳梨已經過熟。',
  },
  {
    id: 7,
    question_en: 'What does this scan mainly analyze?',
    question_zh: '這個掃描主要在分析什麼？',
    options_en: ['Color', 'Smell compounds (VOC)', 'Weight'],
    options_zh: ['顏色', '氣味分子（VOC）', '重量'],
    correctIndex: 1,
    explanation_en: 'The sensor detects volatile organic compounds (VOC).',
    explanation_zh: '感測器偵測揮發性有機化合物（VOC）。',
  },
  {
    id: 8,
    question_en: 'Which part of a pineapple is the sweetest?',
    question_zh: '鳳梨哪個部位最甜？',
    options_en: ['Top (near leaves)', 'Middle', 'Bottom (base)'],
    options_zh: ['頂部（靠近葉子）', '中間', '底部'],
    correctIndex: 2,
    explanation_en: 'Sugar concentrates at the base, making the bottom sweetest.',
    explanation_zh: '糖分集中在底部，所以底部最甜。',
  },
  {
    id: 9,
    question_en: 'What enzyme in pineapple helps digestion?',
    question_zh: '鳳梨中哪種酵素有助於消化？',
    options_en: ['Bromelain', 'Pepsin', 'Lipase'],
    options_zh: ['鳳梨酵素', '胃蛋白酶', '脂肪酶'],
    correctIndex: 0,
    explanation_en: 'Bromelain is a natural enzyme in pineapple that aids digestion.',
    explanation_zh: '鳳梨蛋白酶是鳳梨中的天然酵素，有助於消化。',
  },
  {
    id: 10,
    question_en: 'Should you refrigerate a whole uncut pineapple?',
    question_zh: '整顆未切的鳳梨需要冷藏嗎？',
    options_en: ['Yes, always', 'No, room temp is fine', 'Only if overripe'],
    options_zh: ['是，一定要', '不用，室溫即可', '只有過熟時才需要'],
    correctIndex: 1,
    explanation_en: 'Whole pineapples can stay at room temperature before cutting.',
    explanation_zh: '整顆鳳梨切開前可以在室溫下保存。',
  },
];

interface PineappleTriviaProps {
  visible: boolean;
  onClose: () => void;
}

type TriviaPhase = 'question' | 'feedback';

export const PineappleTrivia = React.memo(function PineappleTrivia({ visible, onClose }: PineappleTriviaProps) {
  const { language } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<TriviaPhase>('question');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const questionOpacity = useRef(new Animated.Value(1)).current;
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shuffledRef = useRef<TriviaQuestion[]>([]);

  const isZh = language === 'zh';

  const clearTimers = useCallback(() => {
    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }
  }, []);

  const shuffleQuestions = useCallback(() => {
    const arr = [...TRIVIA_QUESTIONS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    shuffledRef.current = arr;
  }, []);

  useEffect(() => {
    if (visible) {
      shuffleQuestions();
      setCurrentIndex(0);
      setPhase('question');
      setSelectedOption(null);
      setIsCorrect(false);
      setScore(0);
      setQuestionNumber(1);
      feedbackOpacity.setValue(0);
      questionOpacity.setValue(1);

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      clearTimers();
      overlayOpacity.setValue(0);
      cardOpacity.setValue(0);
      cardScale.setValue(0.9);
    }

    return clearTimers;
  }, [visible, shuffleQuestions, clearTimers, overlayOpacity, cardOpacity, cardScale, feedbackOpacity, questionOpacity]);

  const goToNextQuestion = useCallback(() => {
    Animated.timing(questionOpacity, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      const nextIdx = (currentIndex + 1) % shuffledRef.current.length;
      setCurrentIndex(nextIdx);
      setPhase('question');
      setSelectedOption(null);
      setIsCorrect(false);
      setQuestionNumber((prev) => prev + 1);
      feedbackOpacity.setValue(0);

      Animated.timing(questionOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [currentIndex, questionOpacity, feedbackOpacity]);

  const handleAnswer = useCallback((optionIdx: number) => {
    if (phase !== 'question') return;

    const question = shuffledRef.current[currentIndex];
    if (!question) return;

    const correct = optionIdx === question.correctIndex;
    setSelectedOption(optionIdx);
    setIsCorrect(correct);
    setPhase('feedback');
    if (correct) {
      setScore((prev) => prev + 1);
    }

    Animated.timing(feedbackOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    nextTimerRef.current = setTimeout(() => {
      goToNextQuestion();
    }, 1300);
  }, [phase, currentIndex, feedbackOpacity, goToNextQuestion]);

  const handleClose = useCallback(() => {
    clearTimers();
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [clearTimers, overlayOpacity, cardOpacity, onClose]);

  if (!visible || shuffledRef.current.length === 0) return null;

  const question = shuffledRef.current[currentIndex];
  if (!question) return null;

  const questionText = isZh ? question.question_zh : question.question_en;
  const options = isZh ? question.options_zh : question.options_en;
  const explanation = isZh ? question.explanation_zh : question.explanation_en;
  const correctOptionText = (isZh ? question.options_zh : question.options_en)[question.correctIndex];

  const titleText = isZh ? '鳳梨小知識' : 'Pineapple Trivia';
  const roundLabel = `ROUND ${questionNumber}`;
  const correctLabel = isZh ? '答對了！' : 'Correct!';
  const wrongLabel = isZh ? '答錯了' : 'Not quite';
  const correctAnswerLabel = isZh
    ? `正確答案：${correctOptionText}`
    : `Correct answer: ${correctOptionText}`;
  const scoreLabel = questionNumber > 1
    ? (isZh ? `得分：${score}/${questionNumber - 1}` : `Score: ${score}/${questionNumber - 1}`)
    : '';
  const closeLabel = isZh ? '關閉' : 'Close';

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={handleClose} />
        <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Lightbulb size={16} color="#E5A100" />
              <Text style={styles.titleText}>{titleText}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} testID="trivia-close-btn">
              <X size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.roundLabel}>{roundLabel}</Text>
            {scoreLabel.length > 0 && (
              <Text style={styles.scoreLabel}>{scoreLabel}</Text>
            )}
          </View>

          <Animated.View style={{ opacity: questionOpacity }}>
            <Text style={styles.questionText}>{questionText}</Text>

            <View style={styles.optionsContainer}>
              {options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const showCorrect = phase === 'feedback' && idx === question.correctIndex;
                const showWrong = phase === 'feedback' && isSelected && !isCorrect;

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.optionBtn,
                      showCorrect && styles.optionCorrect,
                      showWrong && styles.optionWrong,
                    ]}
                    onPress={() => handleAnswer(idx)}
                    activeOpacity={0.7}
                    disabled={phase === 'feedback'}
                    testID={`trivia-option-${idx}`}
                  >
                    <View style={styles.optionContent}>
                      {showCorrect && <Check size={14} color="#2E9B63" />}
                      {showWrong && <X size={14} color="#D64545" />}
                      <Text
                        style={[
                          styles.optionText,
                          showCorrect && styles.optionTextCorrect,
                          showWrong && styles.optionTextWrong,
                        ]}
                      >
                        {opt}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {phase === 'feedback' && (
              <Animated.View style={[styles.feedbackArea, { opacity: feedbackOpacity }]}>
                <Text style={[styles.feedbackResult, { color: isCorrect ? '#2E9B63' : '#D64545' }]}>
                  {isCorrect ? correctLabel : wrongLabel}
                </Text>
                {!isCorrect && (
                  <Text style={styles.correctAnswerText}>{correctAnswerLabel}</Text>
                )}
                <Text style={styles.explanationText}>{explanation}</Text>
              </Animated.View>
            )}
          </Animated.View>

          <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.7} testID="trivia-close-bottom">
            <Text style={styles.closeBtnText}>{closeLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
});

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: Math.min(screenWidth - 48, 380),
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 22,
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E7EEF7',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#1F2937',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  roundLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#E5A100',
    letterSpacing: 1.0,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#9CA3AF',
  },
  questionText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  optionWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    flex: 1,
  },
  optionTextCorrect: {
    color: '#2E9B63',
  },
  optionTextWrong: {
    color: '#D64545',
  },
  feedbackArea: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  feedbackResult: {
    fontSize: 13,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  correctAnswerText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 2,
  },
  explanationText: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: '#6B7280',
    lineHeight: 16,
  },
  closeBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#6B7280',
  },
});
