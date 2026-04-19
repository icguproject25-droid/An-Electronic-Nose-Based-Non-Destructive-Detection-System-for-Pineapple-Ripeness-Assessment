import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown, Bug, Sprout, FlaskConical, Globe, Search, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { knowledgeCategories, KnowledgeCategory, KnowledgeItem } from '@/mocks/knowledgeBase';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CategoryIcon = ({ iconName, color }: { iconName: string; color: string }) => {
  switch (iconName) {
    case 'bug':
      return <Bug size={22} color={color} />;
    case 'sprout':
      return <Sprout size={22} color={color} />;
    case 'flask':
      return <FlaskConical size={22} color={color} />;
    case 'globe':
      return <Globe size={22} color={color} />;
    default:
      return <Bug size={22} color={color} />;
  }
};

const categoryColors: Record<string, { bg: string; accent: string }> = {
  disease: { bg: 'rgba(220,53,69,0.08)', accent: '#DC3545' },
  growing: { bg: 'rgba(40,167,69,0.08)', accent: '#28A745' },
  chemistry: { bg: 'rgba(0,123,255,0.08)', accent: '#007BFF' },
  history: { bg: 'rgba(255,165,0,0.08)', accent: '#FFA500' },
};

function AccordionItem({ item, lang, isExpanded, onToggle }: {
  item: KnowledgeItem;
  lang: 'zh' | 'en';
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  const handleToggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    onToggle();
  }, [isExpanded, onToggle, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={handleToggle}
        activeOpacity={0.7}
        testID={`faq-${item.id}`}
      >
        <Text style={styles.questionText}>{item.question[lang]}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDown size={20} color={Colors.textLight} />
        </Animated.View>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.accordionBody}>
          <View style={styles.answerDivider} />
          <Text style={styles.answerText}>{item.answer[lang]}</Text>
        </View>
      )}
    </View>
  );
}

export default function KnowledgeBaseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const lang = (language || 'en') as 'zh' | 'en';
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>(knowledgeCategories[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<TextInput>(null);

  const toggleItem = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const handleCategoryChange = useCallback((catId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveCategory(catId);
    setExpandedItems(new Set());
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setExpandedItems(new Set());
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const query = searchQuery.trim().toLowerCase();
    const results: { category: KnowledgeCategory; item: KnowledgeItem }[] = [];
    for (const cat of knowledgeCategories) {
      for (const item of cat.items) {
        const matchQ = item.question.zh.toLowerCase().includes(query) || item.question.en.toLowerCase().includes(query);
        const matchA = item.answer.zh.toLowerCase().includes(query) || item.answer.en.toLowerCase().includes(query);
        if (matchQ || matchA) {
          results.push({ category: cat, item });
        }
      }
    }
    return results;
  }, [searchQuery, isSearching]);

  const currentCategory = knowledgeCategories.find((c) => c.id === activeCategory) ?? knowledgeCategories[0];

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
          testID="btn-kb-back"
        >
          <ChevronLeft size={24} color={Colors.leafGreen} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {lang === 'zh' ? '知識問答庫' : 'Knowledge Base'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollView}
        contentContainerStyle={styles.tabContainer}
      >
        {knowledgeCategories.map((cat) => {
          const isActive = cat.id === activeCategory;
          const colors = categoryColors[cat.id] ?? categoryColors.disease;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.tabButton,
                isActive && { backgroundColor: colors.accent },
                !isActive && { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.accent + '30' },
              ]}
              onPress={() => handleCategoryChange(cat.id)}
              activeOpacity={0.7}
              testID={`tab-${cat.id}`}
            >
              <CategoryIcon iconName={cat.icon} color={isActive ? Colors.white : colors.accent} />
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? Colors.white : colors.accent },
                ]}
              >
                {cat.title[lang]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isSearching ? (
          <>
            <View style={styles.searchResultHeader}>
              <Text style={styles.searchResultTitle}>
                {lang === 'zh'
                  ? `搜尋結果：${searchResults.length} 筆`
                  : `Results: ${searchResults.length} found`}
              </Text>
            </View>
            {searchResults.length === 0 ? (
              <View style={styles.emptySearch}>
                <Search size={40} color={Colors.textLight + '60'} />
                <Text style={styles.emptySearchText}>
                  {lang === 'zh' ? '找不到相關內容' : 'No matching results'}
                </Text>
              </View>
            ) : (
              searchResults.map(({ category, item }) => {
                const colors = categoryColors[category.id] ?? categoryColors.disease;
                return (
                  <View key={item.id} style={styles.searchResultCard}>
                    <View style={[styles.searchCategoryBadge, { backgroundColor: colors.bg }]}>
                      <CategoryIcon iconName={category.icon} color={colors.accent} />
                      <Text style={[styles.searchCategoryText, { color: colors.accent }]}>
                        {category.title[lang]}
                      </Text>
                    </View>
                    <AccordionItem
                      item={item}
                      lang={lang}
                      isExpanded={expandedItems.has(item.id)}
                      onToggle={() => toggleItem(item.id)}
                    />
                  </View>
                );
              })
            )}
          </>
        ) : (
          <>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIconBg, { backgroundColor: categoryColors[currentCategory.id]?.bg }]}>
                <CategoryIcon iconName={currentCategory.icon} color={categoryColors[currentCategory.id]?.accent ?? '#000'} />
              </View>
              <View style={styles.categoryTitleContainer}>
                <Text style={styles.categoryTitle}>{currentCategory.title[lang]}</Text>
                <Text style={styles.categoryCount}>
                  {currentCategory.items.length} {lang === 'zh' ? '個問題' : 'questions'}
                </Text>
              </View>
            </View>

            {currentCategory.items.map((item) => (
              <AccordionItem
                key={item.id}
                item={item}
                lang={lang}
                isExpanded={expandedItems.has(item.id)}
                onToggle={() => toggleItem(item.id)}
              />
            ))}
          </>
        )}
      </ScrollView>

      <View style={[styles.searchBarContainer, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textLight} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder={lang === 'zh' ? '搜尋關鍵字...' : 'Search keywords...'}
            placeholderTextColor={Colors.textLight + '80'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            testID="kb-search-input"
          />
          {isSearching && (
            <TouchableOpacity onPress={clearSearch} activeOpacity={0.7} testID="kb-search-clear">
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
  tabScrollView: {
    maxHeight: 56,
    marginTop: 8,
  },
  tabContainer: {
    paddingHorizontal: 16,
    gap: 10,
    alignItems: 'center',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 14,
  },
  categoryIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textDark,
  },
  categoryCount: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
  accordionItem: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textDark,
    lineHeight: 22,
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answerDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginBottom: 12,
  },
  answerText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 22,
  },
  searchBarContainer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,252,245,0.95)',
    paddingTop: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  searchBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
    paddingVertical: 0,
  },
  searchResultHeader: {
    marginBottom: 16,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  emptySearch: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
    gap: 12,
  },
  emptySearchText: {
    fontSize: 15,
    color: Colors.textLight,
  },
  searchResultCard: {
    marginBottom: 4,
  },
  searchCategoryBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
    marginBottom: 6,
  },
  searchCategoryText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
});
