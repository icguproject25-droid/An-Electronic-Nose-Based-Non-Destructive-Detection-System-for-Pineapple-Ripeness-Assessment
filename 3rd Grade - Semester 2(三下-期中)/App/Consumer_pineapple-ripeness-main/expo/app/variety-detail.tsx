import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Eye, Droplets, MapPin, BookOpen } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { varieties } from '@/mocks/varieties';
import { PineappleIcon } from '@/components/PineappleIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function VarietyDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language } = useLanguage();
  const lang = language || 'en';

  const variety = useMemo(() => varieties.find((v) => v.id === id), [id]);

  if (!variety) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.notFound}>{lang === 'zh' ? '找不到品種資料' : 'Variety not found'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.goBackBtn}>
          <Text style={styles.goBackText}>{t('goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          testID="btn-detail-back"
        >
          <ChevronLeft size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: variety.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.65)']}
            style={styles.heroOverlay}
          />
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>{variety.name[lang]}</Text>
          </View>
          <View style={styles.heroDecor}>
            <PineappleIcon size={36} style={{ opacity: 0.3 }} />
          </View>
        </View>

        <View style={styles.body}>
          <SectionCard
            icon={<BookOpen size={20} color={Colors.leafGreen} />}
            title={t('varietyIntro')}
            accentColor={Colors.leafGreen}
          >
            {variety.intro[lang].map((paragraph, i) => (
              <Text key={i} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </SectionCard>

          <SectionCard
            icon={<Eye size={20} color={Colors.pineappleGold} />}
            title={t('varietyAppearance')}
            accentColor={Colors.pineappleGold}
          >
            {variety.appearance[lang].map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bullet, { backgroundColor: Colors.pineappleGold }]} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </SectionCard>

          <SectionCard
            icon={<Droplets size={20} color={Colors.ripeOrange} />}
            title={t('varietyTaste')}
            accentColor={Colors.ripeOrange}
          >
            {variety.taste[lang].map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bullet, { backgroundColor: Colors.ripeOrange }]} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </SectionCard>

          <SectionCard
            icon={<MapPin size={20} color={Colors.freshGreen} />}
            title={t('varietyOrigin')}
            accentColor={Colors.freshGreen}
          >
            {variety.origin[lang].map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bullet, { backgroundColor: Colors.freshGreen }]} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </SectionCard>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionCard({
  icon,
  title,
  accentColor,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={[styles.sectionAccent, { backgroundColor: accentColor }]} />
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
  },
  notFound: {
    fontSize: 18,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 60,
  },
  goBackBtn: {
    alignSelf: 'center',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 28,
    backgroundColor: Colors.leafGreen,
    borderRadius: 20,
  },
  goBackText: {
    color: Colors.white,
    fontWeight: '600' as const,
    fontSize: 15,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 280,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroDecor: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionAccent: {
    height: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textDark,
  },
  sectionContent: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textDark,
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textDark,
  },
});
