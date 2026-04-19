import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Star, Leaf, Hand, Wind, Eye, ChevronRight, ChevronDown } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { seasonalData, pickingTips, PickingTip } from '@/mocks/seasonalGuide';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TipIcon = ({ iconName, color }: { iconName: string; color: string }) => {
  switch (iconName) {
    case 'leaf':
      return <Leaf size={20} color={color} />;
    case 'hand':
      return <Hand size={20} color={color} />;
    case 'wind':
      return <Wind size={20} color={color} />;
    case 'eye':
      return <Eye size={20} color={color} />;
    default:
      return <Leaf size={20} color={color} />;
  }
};

const monthEmojis = ['❄️', '🌸', '🌱', '🌷', '☀️', '🌞', '🌴', '🌻', '🍂', '🎃', '🍁', '⛄'];

function TipCard({ tip, lang, index }: { tip: PickingTip; lang: 'zh' | 'en'; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggle = useCallback(() => {
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setExpanded(!expanded);
  }, [expanded, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const tipColors = ['#4B5320', '#D4A017', '#E67E22', '#2E86C1'];
  const color = tipColors[index % tipColors.length];

  return (
    <View style={styles.tipCard}>
      <TouchableOpacity
        style={styles.tipHeader}
        onPress={toggle}
        activeOpacity={0.7}
        testID={`tip-${tip.id}`}
      >
        <View style={[styles.tipIconBg, { backgroundColor: color + '15' }]}>
          <TipIcon iconName={tip.icon} color={color} />
        </View>
        <Text style={styles.tipTitle}>{tip.title[lang]}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDown size={18} color={Colors.textLight} />
        </Animated.View>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.tipBody}>
          <View style={styles.tipDivider} />
          <Text style={styles.tipDesc}>{tip.description[lang]}</Text>
        </View>
      )}
    </View>
  );
}

export default function SeasonalGuideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const lang = (language || 'en') as 'zh' | 'en';

  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const monthScrollRef = useRef<ScrollView>(null);

  const monthData = seasonalData.find((m) => m.month === selectedMonth) ?? seasonalData[0];

  const handleMonthSelect = useCallback((month: number) => {
    setSelectedMonth(month);
  }, []);

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
          testID="btn-sg-back"
        >
          <ChevronLeft size={24} color={Colors.leafGreen} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {lang === 'zh' ? '挑選與時令導覽' : 'Buying Guide'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.monthSelector}>
        <ScrollView
          ref={monthScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthList}
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const month = i + 1;
            const isActive = month === selectedMonth;
            const isCurrent = month === currentMonth;
            return (
              <TouchableOpacity
                key={month}
                style={[
                  styles.monthChip,
                  isActive && styles.monthChipActive,
                  isCurrent && !isActive && styles.monthChipCurrent,
                ]}
                onPress={() => handleMonthSelect(month)}
                activeOpacity={0.7}
                testID={`month-${month}`}
              >
                <Text style={styles.monthEmoji}>{monthEmojis[i]}</Text>
                <Text
                  style={[
                    styles.monthText,
                    isActive && styles.monthTextActive,
                  ]}
                >
                  {month}{lang === 'zh' ? '月' : ''}
                </Text>
                {isCurrent && (
                  <View style={[styles.currentDot, isActive && styles.currentDotActive]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>{monthEmojis[selectedMonth - 1]}</Text>
          <Text style={styles.sectionTitle}>
            {monthData.label[lang]} {lang === 'zh' ? '推薦品種' : 'Recommendations'}
          </Text>
        </View>

        {monthData.recommended.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {lang === 'zh' ? '本月無主要推薦品種' : 'No major recommendations this month'}
            </Text>
          </View>
        ) : (
          monthData.recommended.map((rec, idx) => (
            <View
              key={idx}
              style={[styles.recCard, rec.highlight && styles.recCardHighlight]}
            >
              <View style={styles.recHeader}>
                {rec.highlight && (
                  <Star size={16} color={Colors.pineappleGold} fill={Colors.pineappleGold} />
                )}
                <Text style={[styles.recName, rec.highlight && styles.recNameHighlight]}>
                  {rec.name[lang]}
                </Text>
              </View>
              <Text style={styles.recReason}>{rec.reason[lang]}</Text>
              {rec.highlight && (
                <View style={styles.bestPickBadge}>
                  <Text style={styles.bestPickText}>
                    {lang === 'zh' ? '本月首選' : 'Best Pick'}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}

        {monthData.pickingTips.length > 0 && (
          <View style={styles.monthTipBox}>
            <Text style={styles.monthTipLabel}>💡 {lang === 'zh' ? '本月小提示' : 'Monthly Tip'}</Text>
            {monthData.pickingTips.map((tip, idx) => (
              <Text key={idx} style={styles.monthTipText}>{tip[lang]}</Text>
            ))}
          </View>
        )}

        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <Text style={styles.sectionEmoji}>🛒</Text>
          <Text style={styles.sectionTitle}>
            {lang === 'zh' ? '挑選技巧' : 'Picking Tips'}
          </Text>
        </View>

        {pickingTips.map((tip, index) => (
          <TipCard key={tip.id} tip={tip} lang={lang} index={index} />
        ))}
      </ScrollView>
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
  monthSelector: {
    marginTop: 8,
    marginBottom: 4,
  },
  monthList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  monthChip: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    minWidth: 56,
  },
  monthChipActive: {
    backgroundColor: Colors.leafGreen,
    borderColor: Colors.leafGreen,
  },
  monthChipCurrent: {
    borderColor: Colors.pineappleGold,
    borderWidth: 2,
  },
  monthEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  monthText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textDark,
  },
  monthTextActive: {
    color: Colors.white,
  },
  currentDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.pineappleGold,
    marginTop: 3,
  },
  currentDotActive: {
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionEmoji: {
    fontSize: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textDark,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  recCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  recCardHighlight: {
    borderColor: Colors.pineappleGold,
    borderWidth: 2,
    backgroundColor: '#FFFDF5',
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  recName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textDark,
    flex: 1,
  },
  recNameHighlight: {
    fontWeight: '700' as const,
    color: Colors.leafGreen,
  },
  recReason: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 20,
  },
  bestPickBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: 'rgba(244,196,48,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  bestPickText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.pineappleGold,
  },
  monthTipBox: {
    backgroundColor: 'rgba(75,83,32,0.06)',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.leafGreen,
  },
  monthTipLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.leafGreen,
    marginBottom: 6,
  },
  monthTipText: {
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  tipIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textDark,
  },
  tipBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  tipDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginBottom: 10,
  },
  tipDesc: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 21,
  },
});
