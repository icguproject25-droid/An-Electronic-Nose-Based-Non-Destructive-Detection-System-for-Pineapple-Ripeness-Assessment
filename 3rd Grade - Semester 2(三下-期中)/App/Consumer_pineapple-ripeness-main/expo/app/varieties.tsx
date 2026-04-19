import React, { useRef, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  ViewToken,
  TextInput,
  Platform,
} from 'react-native';

import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Search, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { varieties, PineappleVariety } from '@/mocks/varieties';
import { PineappleIcon } from '@/components/PineappleIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.72;
const CARD_SPACING = 16;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

export default function VarietiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();
  const lang = language || 'en';
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchText, setSearchText] = useState<string>('');
  const flatListRef = useRef<FlatList<PineappleVariety>>(null);

  const filteredVarieties = useMemo(() => {
    if (!searchText.trim()) return varieties;
    const keyword = searchText.trim().toLowerCase();
    return varieties.filter((v) => {
      const nameMatch = v.name.zh.toLowerCase().includes(keyword) || v.name.en.toLowerCase().includes(keyword);
      const introMatch = v.intro.zh.some(s => s.toLowerCase().includes(keyword)) || v.intro.en.some(s => s.toLowerCase().includes(keyword));
      const originMatch = v.origin.zh.some(s => s.toLowerCase().includes(keyword)) || v.origin.en.some(s => s.toLowerCase().includes(keyword));
      const tasteMatch = v.taste.zh.some(s => s.toLowerCase().includes(keyword)) || v.taste.en.some(s => s.toLowerCase().includes(keyword));
      const appearanceMatch = v.appearance.zh.some(s => s.toLowerCase().includes(keyword)) || v.appearance.en.some(s => s.toLowerCase().includes(keyword));
      return nameMatch || introMatch || originMatch || tasteMatch || appearanceMatch;
    });
  }, [searchText]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleCardPress = useCallback((variety: PineappleVariety) => {
    router.push({ pathname: '/variety-detail' as any, params: { id: variety.id } });
  }, [router]);

  const renderCard = useCallback(({ item, index }: { item: PineappleVariety; index: number }) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_SPACING),
      index * (CARD_WIDTH + CARD_SPACING),
      (index + 1) * (CARD_WIDTH + CARD_SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.88, 1, 0.88],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.cardWrapper, { transform: [{ scale }], opacity }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleCardPress(item)}
          testID={`variety-card-${item.id}`}
        >
          <View style={styles.card}>
            <View style={styles.cardBorder}>
              <View style={styles.cardImageContainer}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.5)']}
                  style={styles.imageOverlay}
                />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.name[lang]}
                </Text>
                <Text style={styles.cardHint}>
                  {lang === 'zh' ? '點擊查看詳情 →' : 'Tap for details →'}
                </Text>
              </View>
              <View style={styles.cornerDecorTL}>
                <PineappleIcon size={22} style={{ opacity: 0.25 }} />
              </View>
              <View style={styles.cornerDecorBR}>
                <PineappleIcon size={22} style={{ opacity: 0.25 }} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [scrollX, lang, handleCardPress]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.warmWhite, Colors.cream, '#FFF5E1']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <View style={styles.bgPattern} pointerEvents="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.bgScale,
              {
                top: 80 + Math.floor(i / 4) * 120 + (i % 2) * 40,
                left: (i % 4) * (SCREEN_WIDTH / 3.5) - 20,
                opacity: 0.06 + (i % 3) * 0.02,
                transform: [{ rotate: `${30 + i * 15}deg` }],
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
          testID="btn-varieties-back"
        >
          <ChevronLeft size={24} color={Colors.leafGreen} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('varietiesTitle')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.carouselSection}>
        <Animated.FlatList
          ref={flatListRef as any}
          data={filteredVarieties}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingHorizontal: SIDE_PADDING,
          }}
          ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
          renderItem={renderCard}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {lang === 'zh' ? '找不到符合的品種' : 'No matching varieties'}
              </Text>
            </View>
          }
        />

        {filteredVarieties.length > 1 && <View style={styles.pagination}>
          {filteredVarieties.map((_, i) => {
            const dotScale = scrollX.interpolate({
              inputRange: [
                (i - 1) * (CARD_WIDTH + CARD_SPACING),
                i * (CARD_WIDTH + CARD_SPACING),
                (i + 1) * (CARD_WIDTH + CARD_SPACING),
              ],
              outputRange: [1, 1.4, 1],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [
                (i - 1) * (CARD_WIDTH + CARD_SPACING),
                i * (CARD_WIDTH + CARD_SPACING),
                (i + 1) * (CARD_WIDTH + CARD_SPACING),
              ],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    transform: [{ scale: dotScale }],
                    opacity: dotOpacity,
                  },
                ]}
              />
            );
          })}
        </View>}
      </View>

      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 12 }]}>
        {filteredVarieties.length > 0 && (
          <Text style={styles.countText}>
            {activeIndex + 1} / {filteredVarieties.length}
          </Text>
        )}
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={lang === 'zh' ? '搜尋品種名稱、產地、風味...' : 'Search variety, origin, flavor...'}
            placeholderTextColor={Colors.textLight}
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              setActiveIndex(0);
            }}
            returnKeyType="search"
            testID="variety-search-input"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                setActiveIndex(0);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              testID="variety-search-clear"
            >
              <X size={18} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
  },
  bgPattern: {
    ...StyleSheet.absoluteFillObject,
  },
  bgScale: {
    position: 'absolute',
    width: 80,
    height: 55,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: Colors.pineappleGold,
    backgroundColor: Colors.pineappleYellow,
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
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textDark,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  carouselSection: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 8,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardBorder: {
    borderRadius: 24,
    borderWidth: 3,
    borderColor: Colors.pineappleGold,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  cardImageContainer: {
    height: 260,
    backgroundColor: Colors.cream,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: Colors.white,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textDark,
    marginBottom: 6,
  },
  cardHint: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
  cornerDecorTL: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  cornerDecorBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.pineappleGold,
  },
  bottomSection: {
    alignItems: 'center',
    paddingTop: 6,
    paddingHorizontal: 20,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textLight,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.pineappleGold,
    paddingHorizontal: 14,
    height: 46,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
  },
  emptyContainer: {
    width: CARD_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
});
