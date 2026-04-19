import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { getRecommendations, CalculatorResult } from '@/mocks/calculatorData';
import { PineappleIcon } from '@/components/PineappleIcon';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 80;
const KNOB_SIZE = 32;

const CONFETTI_COUNT = 40;
const CONFETTI_COLORS = ['#FFD700', '#F4C430', '#FFA500', '#4B5320', '#7CB518', '#FF6B6B', '#FF8C00', '#FFDAB9'];

interface ConfettiPiece {
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
  shape: 'rect' | 'circle';
}

function useConfetti() {
  const pieces = useRef<ConfettiPiece[]>(
    Array.from({ length: CONFETTI_COUNT }).map(() => ({
      x: new Animated.Value(Math.random() * SCREEN_WIDTH),
      y: new Animated.Value(-50),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 10,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }))
  ).current;

  const [visible, setVisible] = useState(false);

  const fire = useCallback(() => {
    setVisible(true);
    const animations = pieces.map((piece) => {
      const startX = Math.random() * SCREEN_WIDTH;
      piece.x.setValue(startX);
      piece.y.setValue(-30 - Math.random() * 60);
      piece.rotate.setValue(0);
      piece.opacity.setValue(1);

      const duration = 2000 + Math.random() * 1500;
      return Animated.parallel([
        Animated.timing(piece.y, {
          toValue: SCREEN_HEIGHT + 50,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(piece.x, {
          toValue: startX + (Math.random() - 0.5) * 200,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(piece.rotate, {
          toValue: Math.random() * 10,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(piece.opacity, {
          toValue: 0,
          duration,
          delay: duration * 0.6,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(30, animations).start(() => {
      setVisible(false);
    });
  }, [pieces]);

  return { pieces, visible, fire };
}

function CustomSlider({
  value,
  onValueChange,
  label,
  min,
  max,
  labels,
  color,
  testID,
}: {
  value: number;
  onValueChange: (v: number) => void;
  label: string;
  min: number;
  max: number;
  labels: string[];
  color: string;
  testID: string;
}) {
  const steps = max - min;

  return (
    <View style={styles.sliderContainer} testID={testID}>
      <Text style={styles.sliderLabel}>{label}</Text>
      <View style={styles.sliderTrackContainer}>
        <View style={styles.sliderTrack}>
          <View
            style={[
              styles.sliderFill,
              {
                width: `${((value - min) / steps) * 100}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
        <View style={styles.stepsRow}>
          {Array.from({ length: steps + 1 }).map((_, i) => {
            const stepVal = min + i;
            const isActive = stepVal <= value;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.stepDot,
                  isActive && { backgroundColor: color },
                  stepVal === value && styles.stepDotActive,
                  stepVal === value && { borderColor: color },
                ]}
                onPress={() => onValueChange(stepVal)}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
              />
            );
          })}
        </View>
      </View>
      <View style={styles.labelsRow}>
        {labels.map((l, i) => (
          <Text
            key={i}
            style={[
              styles.stepLabel,
              i + min === value && { color, fontWeight: '700' as const },
            ]}
          >
            {l}
          </Text>
        ))}
      </View>
      <View style={styles.valueDisplay}>
        <Text style={[styles.valueText, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

function ResultCard({ item, lang, index }: { item: CalculatorResult; lang: 'zh' | 'en'; index: number }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 150,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [scaleAnim, index]);

  const isTop = index === 0;

  return (
    <Animated.View
      style={[
        styles.resultCard,
        isTop && styles.resultCardTop,
        { transform: [{ scale: scaleAnim }], opacity: scaleAnim },
      ]}
    >
      {isTop && (
        <View style={styles.topBadge}>
          <Sparkles size={12} color={Colors.white} />
          <Text style={styles.topBadgeText}>
            {lang === 'zh' ? '最佳推薦' : 'Best Match'}
          </Text>
        </View>
      )}
      <View style={styles.resultHeader}>
        <Text style={styles.resultEmoji}>{item.emoji}</Text>
        <View style={styles.resultTitleContainer}>
          <Text style={[styles.resultName, isTop && styles.resultNameTop]}>
            {item.name[lang]}
          </Text>
          <View style={styles.resultMeter}>
            <Text style={styles.meterLabel}>🍬 {item.sweetness}</Text>
            <Text style={styles.meterLabel}>🍋 {item.acidity}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.resultDesc}>{item.description[lang]}</Text>
    </Animated.View>
  );
}

export default function CalculatorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const lang = (language || 'en') as 'zh' | 'en';

  const [sweetness, setSweetness] = useState(3);
  const [acidity, setAcidity] = useState(3);
  const [results, setResults] = useState<CalculatorResult[] | null>(null);
  const { pieces, visible, fire } = useConfetti();
  const buttonScale = useRef(new Animated.Value(1)).current;

  const sweetnessLabels = lang === 'zh'
    ? ['淡', '微甜', '適中', '甜', '極甜']
    : ['Light', 'Mild', 'Medium', 'Sweet', 'Very Sweet'];

  const acidityLabels = lang === 'zh'
    ? ['不酸', '微酸', '適中', '酸', '極酸']
    : ['None', 'Mild', 'Medium', 'Sour', 'Very Sour'];

  const handleCalculate = useCallback(() => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    const recs = getRecommendations(sweetness, acidity);
    setResults(recs);
    fire();
  }, [sweetness, acidity, fire, buttonScale]);

  const ratioText = acidity === 0
    ? '∞'
    : (sweetness / acidity).toFixed(1);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.warmWhite, Colors.cream, '#FFF5E1']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          testID="btn-calc-back"
        >
          <ChevronLeft size={24} color={Colors.leafGreen} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {lang === 'zh' ? '糖酸比計算器' : 'Sugar-Acid Calculator'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <PineappleIcon size={48} />
          <Text style={styles.heroTitle}>
            {lang === 'zh' ? '找到最適合你的鳳梨' : 'Find Your Perfect Pineapple'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {lang === 'zh'
              ? '調整你對甜度和酸度的偏好，我們幫你配對最適合的品種！'
              : 'Adjust your sweetness and acidity preferences, and we\'ll match the best variety for you!'}
          </Text>
        </View>

        <View style={styles.slidersSection}>
          <CustomSlider
            value={sweetness}
            onValueChange={setSweetness}
            label={lang === 'zh' ? '🍬 甜度偏好' : '🍬 Sweetness Preference'}
            min={1}
            max={5}
            labels={sweetnessLabels}
            color='#F4C430'
            testID="slider-sweetness"
          />

          <CustomSlider
            value={acidity}
            onValueChange={setAcidity}
            label={lang === 'zh' ? '🍋 酸度偏好' : '🍋 Acidity Preference'}
            min={1}
            max={5}
            labels={acidityLabels}
            color='#7CB518'
            testID="slider-acidity"
          />
        </View>

        <View style={styles.ratioDisplay}>
          <Text style={styles.ratioLabel}>
            {lang === 'zh' ? '你的糖酸比' : 'Your Sugar-Acid Ratio'}
          </Text>
          <Text style={styles.ratioValue}>{ratioText}</Text>
          <Text style={styles.ratioFormula}>
            {sweetness} ÷ {acidity} = {ratioText}
          </Text>
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.calcButton}
            onPress={handleCalculate}
            activeOpacity={0.85}
            testID="btn-calculate"
          >
            <LinearGradient
              colors={[Colors.pineappleYellow, Colors.pineappleGold]}
              style={styles.calcButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Sparkles size={22} color={Colors.white} />
              <Text style={styles.calcButtonText}>
                {lang === 'zh' ? '幫我配對！' : 'Match Me!'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {results && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              🎯 {lang === 'zh' ? '推薦結果' : 'Recommendations'}
            </Text>
            {results.map((item, index) => (
              <ResultCard key={item.id} item={item} lang={lang} index={index} />
            ))}

            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>
                💡 {lang === 'zh' ? '糖酸比小知識' : 'About Sugar-Acid Ratio'}
              </Text>
              <Text style={styles.explanationText}>
                {lang === 'zh'
                  ? '糖酸比 = 甜度 ÷ 酸度。比值越高代表越甜，比值越低代表越酸。大多數人偏好比值在 1.5～3 之間的鳳梨。'
                  : 'Sugar-Acid Ratio = Sweetness ÷ Acidity. Higher ratio = sweeter, lower ratio = more sour. Most people prefer pineapples with a ratio between 1.5 and 3.'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {visible && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {pieces.map((piece, i) => {
            const rotate = piece.rotate.interpolate({
              inputRange: [0, 10],
              outputRange: ['0deg', '3600deg'],
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.confettiPiece,
                  {
                    backgroundColor: piece.color,
                    width: piece.size,
                    height: piece.shape === 'rect' ? piece.size * 0.5 : piece.size,
                    borderRadius: piece.shape === 'circle' ? piece.size / 2 : 2,
                    transform: [
                      { translateX: piece.x },
                      { translateY: piece.y },
                      { rotate },
                    ],
                    opacity: piece.opacity,
                  },
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(75,83,32,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textDark,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(244,196,48,0.15)',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textDark,
    marginTop: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  slidersSection: {
    gap: 24,
    marginBottom: 20,
  },
  sliderContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sliderLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textDark,
    marginBottom: 16,
  },
  sliderTrackContainer: {
    paddingHorizontal: 8,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -9,
    paddingHorizontal: 0,
  },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stepDotActive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    marginTop: -2,
    backgroundColor: Colors.white,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 0,
  },
  stepLabel: {
    fontSize: 10,
    color: Colors.textLight,
    fontWeight: '500' as const,
    textAlign: 'center',
    width: 44,
  },
  valueDisplay: {
    position: 'absolute',
    top: 14,
    right: 18,
  },
  valueText: {
    fontSize: 28,
    fontWeight: '800' as const,
  },
  ratioDisplay: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(75,83,32,0.06)',
    borderRadius: 16,
    padding: 18,
  },
  ratioLabel: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
  ratioValue: {
    fontSize: 42,
    fontWeight: '800' as const,
    color: Colors.leafGreen,
    marginVertical: 4,
  },
  ratioFormula: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
  calcButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.pineappleGold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 24,
  },
  calcButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  calcButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  resultsSection: {
    marginTop: 4,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textDark,
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  resultCardTop: {
    borderColor: Colors.pineappleGold,
    borderWidth: 2,
    backgroundColor: '#FFFDF5',
  },
  topBadge: {
    position: 'absolute',
    top: -1,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.pineappleGold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  topBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  resultEmoji: {
    fontSize: 36,
  },
  resultTitleContainer: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textDark,
    marginBottom: 4,
  },
  resultNameTop: {
    fontWeight: '700' as const,
    color: Colors.leafGreen,
  },
  resultMeter: {
    flexDirection: 'row',
    gap: 12,
  },
  meterLabel: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
  resultDesc: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 20,
  },
  explanationBox: {
    backgroundColor: 'rgba(75,83,32,0.06)',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.leafGreen,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.leafGreen,
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 20,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  confettiPiece: {
    position: 'absolute',
  },
});
