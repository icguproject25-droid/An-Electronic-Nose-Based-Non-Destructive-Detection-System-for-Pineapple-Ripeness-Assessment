import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Check, X, Lightbulb } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTrivia } from '@/contexts/TriviaContext';

interface PineappleTriviaCardProps {
  active: boolean;
  variant?: 'light' | 'dark';
}

type Phase = 'question' | 'feedback';

export const PineappleTriviaCard = React.memo(function PineappleTriviaCard({
  active,
  variant = 'light',
}: PineappleTriviaCardProps) {
  const { language } = useLanguage();
  const {
    currentQuestion,
    score,
    totalAnswered,
    isActive,
    startSession,
    continueSession,
    recordAnswer,
    advanceQuestion,
  } = useTrivia();

  const [phase, setPhase] = useState<Phase>('question');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const questionOpacity = useRef(new Animated.Value(1)).current;
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isZh = language === 'zh';
  const isDark = variant === 'dark';

  const clearTimers = useCallback(() => {
    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (active) {
      if (!isActive) {
        startSession();
      } else {
        continueSession();
      }
      setPhase('question');
      setSelectedOption(null);
      setIsCorrect(false);
      feedbackOpacity.setValue(0);
      questionOpacity.setValue(1);
    }

    return clearTimers;
  }, [active, isActive, startSession, continueSession, clearTimers, feedbackOpacity, questionOpacity]);

  const goToNextQuestion = useCallback(() => {
    clearTimers();
    Animated.timing(questionOpacity, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      advanceQuestion();
      setPhase('question');
      setSelectedOption(null);
      setIsCorrect(false);
      feedbackOpacity.setValue(0);

      Animated.timing(questionOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  }, [advanceQuestion, clearTimers, questionOpacity, feedbackOpacity]);

  const handleAnswer = useCallback((optionIdx: number) => {
    if (phase !== 'question' || !currentQuestion) return;

    const correct = optionIdx === currentQuestion.correctIndex;
    setSelectedOption(optionIdx);
    setIsCorrect(correct);
    setPhase('feedback');
    recordAnswer(correct);

    Animated.timing(feedbackOpacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();

    nextTimerRef.current = setTimeout(() => {
      goToNextQuestion();
    }, 1300);
  }, [phase, currentQuestion, recordAnswer, feedbackOpacity, goToNextQuestion]);

  if (!active || !currentQuestion) return null;

  const questionText = isZh ? currentQuestion.question_zh : currentQuestion.question_en;
  const choices = isZh ? currentQuestion.choices_zh : currentQuestion.choices_en;
  const explanation = isZh ? currentQuestion.explanation_zh : currentQuestion.explanation_en;
  const correctOptionText = choices[currentQuestion.correctIndex];

  const titleLabel = isZh ? '鳳梨小知識與引導' : 'PINEAPPLE TRIVIA & GUIDE';
  const correctLabel = isZh ? '答對了！' : 'Correct!';
  const wrongLabel = isZh ? '答錯了' : 'Not quite';
  const correctAnswerLabel = isZh
    ? `正確答案：${correctOptionText}`
    : `Correct answer: ${correctOptionText}`;
  const questionNumLabel = isZh
    ? `第 ${totalAnswered + (phase === 'question' ? 1 : 0)} 題`
    : `Question ${totalAnswered + (phase === 'question' ? 1 : 0)}`;
  const scoreLabel = totalAnswered > 0
    ? (isZh ? `得分：${score}/${totalAnswered}` : `Score: ${score}/${totalAnswered}`)
    : '';

  const cardStyle = isDark ? styles.cardDark : styles.cardLight;
  const titleStyle = isDark ? styles.titleDark : styles.titleLight;
  const metaColor = isDark ? '#9CA3AF' : '#6F7A8A';
  const questionStyle = isDark ? styles.questionDark : styles.questionLight;
  const optionBtnStyle = isDark ? styles.optionBtnDark : styles.optionBtnLight;
  const optionTextStyle = isDark ? styles.optionTextDark : styles.optionTextLight;
  const explanationStyle = isDark ? styles.explanationDark : styles.explanationLight;
  const feedbackBorderStyle = isDark ? styles.feedbackBorderDark : styles.feedbackBorderLight;

  return (
    <View style={[styles.card, cardStyle]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Lightbulb size={14} color="#E5A100" />
          <Text style={[styles.titleText, titleStyle]}>{titleLabel}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.metaText, { color: metaColor }]}>{questionNumLabel}</Text>
        {scoreLabel.length > 0 && (
          <Text style={[styles.metaText, { color: metaColor }]}>{scoreLabel}</Text>
        )}
      </View>

      <Animated.View style={{ opacity: questionOpacity }}>
        <Text style={[styles.questionText, questionStyle]}>{questionText}</Text>

        <View style={styles.choicesContainer}>
          {choices.map((choice, idx) => {
            const isSelected = selectedOption === idx;
            const showCorrect = phase === 'feedback' && idx === currentQuestion.correctIndex;
            const showWrong = phase === 'feedback' && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.choiceBtn,
                  optionBtnStyle,
                  showCorrect && styles.choiceCorrect,
                  showWrong && styles.choiceWrong,
                ]}
                onPress={() => handleAnswer(idx)}
                activeOpacity={0.7}
                disabled={phase === 'feedback'}
                testID={`trivia-card-option-${idx}`}
              >
                <View style={styles.choiceContent}>
                  {showCorrect && <Check size={13} color="#2E9B63" />}
                  {showWrong && <X size={13} color="#D64545" />}
                  <Text
                    style={[
                      styles.choiceText,
                      optionTextStyle,
                      showCorrect && styles.choiceTextCorrect,
                      showWrong && styles.choiceTextWrong,
                    ]}
                  >
                    {choice}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {phase === 'feedback' && (
          <Animated.View style={[styles.feedbackArea, feedbackBorderStyle, { opacity: feedbackOpacity }]}>
            <Text style={[styles.feedbackResult, { color: isCorrect ? '#2E9B63' : '#D64545' }]}>
              {isCorrect ? correctLabel : wrongLabel}
            </Text>
            {!isCorrect && (
              <Text style={styles.correctAnswerText}>{correctAnswerLabel}</Text>
            )}
            <Text style={[styles.explanationText, explanationStyle]}>{explanation}</Text>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: '#E7EEF7',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardDark: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  titleText: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1.2,
  },
  titleLight: {
    color: '#6F7A8A',
  },
  titleDark: {
    color: 'rgba(255,255,255,0.6)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 20,
    marginBottom: 10,
  },
  questionLight: {
    color: '#1F2937',
  },
  questionDark: {
    color: '#FFFFFF',
  },
  choicesContainer: {
    gap: 6,
  },
  choiceBtn: {
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  optionBtnLight: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  optionBtnDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  choiceCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  choiceWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  choiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  choiceText: {
    fontSize: 13,
    fontWeight: '600' as const,
    flex: 1,
  },
  optionTextLight: {
    color: '#374151',
  },
  optionTextDark: {
    color: 'rgba(255,255,255,0.85)',
  },
  choiceTextCorrect: {
    color: '#2E9B63',
  },
  choiceTextWrong: {
    color: '#D64545',
  },
  feedbackArea: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  feedbackBorderLight: {
    borderTopColor: '#F3F4F6',
  },
  feedbackBorderDark: {
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  feedbackResult: {
    fontSize: 12,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  correctAnswerText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 2,
  },
  explanationText: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 15,
  },
  explanationLight: {
    color: '#6B7280',
  },
  explanationDark: {
    color: 'rgba(255,255,255,0.55)',
  },
});
