import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, BookOpen, Calendar, SlidersHorizontal, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { PineappleIcon } from '@/components/PineappleIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MenuItem {
  id: string;
  titleZh: string;
  titleEn: string;
  subtitleZh: string;
  subtitleEn: string;
  icon: 'book' | 'calendar' | 'sliders';
  route: string;
  gradient: [string, string];
  iconBg: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'knowledge',
    titleZh: '知識問答庫',
    titleEn: 'Knowledge Base',
    subtitleZh: '病蟲害、種植、化學、歷史',
    subtitleEn: 'Disease, Growing, Chemistry, History',
    icon: 'book',
    route: '/knowledge-base',
    gradient: ['#4B5320', '#6B7B30'],
    iconBg: 'rgba(75,83,32,0.15)',
  },
  {
    id: 'seasonal',
    titleZh: '挑選與時令導覽',
    titleEn: 'Buying Guide',
    subtitleZh: '依月份推薦最佳品種',
    subtitleEn: 'Monthly variety recommendations',
    icon: 'calendar',
    route: '/seasonal-guide',
    gradient: ['#F4C430', '#FFD700'],
    iconBg: 'rgba(244,196,48,0.15)',
  },
  {
    id: 'calculator',
    titleZh: '糖酸比計算器',
    titleEn: 'Sugar-Acid Calculator',
    subtitleZh: '找到最適合你的鳳梨',
    subtitleEn: 'Find your perfect pineapple',
    icon: 'sliders',
    route: '/calculator',
    gradient: ['#FF8C00', '#FFA500'],
    iconBg: 'rgba(255,165,0,0.15)',
  },
];

const IconComponent = ({ type, color }: { type: string; color: string }) => {
  switch (type) {
    case 'book':
      return <BookOpen size={28} color={color} />;
    case 'calendar':
      return <Calendar size={28} color={color} />;
    case 'sliders':
      return <SlidersHorizontal size={28} color={color} />;
    default:
      return null;
  }
};

export default function TriviaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const lang = language || 'en';

  const scaleAnims = useRef(menuItems.map(() => new Animated.Value(1))).current;

  const handlePressIn = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.warmWhite, Colors.cream, '#FFF5E1']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <View style={styles.bgDecor} pointerEvents="none">
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.bgDot,
              {
                top: 100 + Math.floor(i / 3) * 180 + (i % 2) * 60,
                left: (i % 3) * (SCREEN_WIDTH / 2.5) + 10,
                opacity: 0.05 + (i % 3) * 0.02,
                width: 50 + (i % 3) * 20,
                height: 50 + (i % 3) * 20,
                borderRadius: 25 + (i % 3) * 10,
              },
            ]}
          />
        ))}
      </View>

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          testID="btn-trivia-back"
        >
          <ChevronLeft size={24} color={Colors.leafGreen} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {lang === 'zh' ? '鳳梨百科與評測' : 'Pineapple Trivia & Guide'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.heroSection}>
        <View style={styles.heroIconContainer}>
          <PineappleIcon size={64} />
        </View>
        <Text style={styles.heroSubtitle}>
          {lang === 'zh'
            ? '探索鳳梨的奧秘，成為鳳梨達人！'
            : 'Explore pineapple secrets and become an expert!'}
        </Text>
      </View>

      <View style={styles.menuList}>
        {menuItems.map((item, index) => (
          <Animated.View
            key={item.id}
            style={[
              styles.cardWrapper,
              { transform: [{ scale: scaleAnims[index] }] },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPressIn={() => handlePressIn(index)}
              onPressOut={() => handlePressOut(index)}
              onPress={() => handlePress(item.route)}
              testID={`btn-trivia-${item.id}`}
            >
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                    <IconComponent type={item.icon} color={item.gradient[0]} />
                  </View>
                </View>
                <View style={styles.cardCenter}>
                  <Text style={styles.cardTitle}>
                    {lang === 'zh' ? item.titleZh : item.titleEn}
                  </Text>
                  <Text style={styles.cardSubtitle} numberOfLines={2}>
                    {lang === 'zh' ? item.subtitleZh : item.subtitleEn}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <View style={styles.arrowCircle}>
                    <ChevronRight size={18} color={Colors.textLight} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <View style={[styles.bottomDecor, { paddingBottom: insets.bottom + 20 }]}>
        <PineappleIcon size={40} style={{ opacity: 0.1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
  },
  bgDecor: {
    ...StyleSheet.absoluteFillObject,
  },
  bgDot: {
    position: 'absolute' as const,
    backgroundColor: Colors.pineappleGold,
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  heroIconContainer: {
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 15,
    color: Colors.textLight,
    fontWeight: '500' as const,
    textAlign: 'center',
    lineHeight: 22,
  },
  menuList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  cardWrapper: {},
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(244,196,48,0.15)',
  },
  cardLeft: {
    marginRight: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCenter: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textDark,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  cardRight: {
    marginLeft: 12,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomDecor: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
