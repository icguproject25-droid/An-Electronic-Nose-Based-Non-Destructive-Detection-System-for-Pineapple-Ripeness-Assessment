import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { PineapplePattern } from '@/components/PineapplePattern';
import { PineappleIcon } from '@/components/PineappleIcon';

const { width } = Dimensions.get('window');

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setLanguage, isLoading } = useLanguage();

  useEffect(() => {
    if (!isLoading && language) {
      router.replace('/menu' as any);
    }
  }, [language, isLoading, router]);

  const handleLanguageSelect = async (lang: 'zh' | 'en') => {
    await setLanguage(lang);
    router.replace('/menu' as any);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.pineappleYellow} />
      </View>
    );
  }

  if (language) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.pineappleYellow, Colors.pineappleGold, Colors.ripeOrange]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <PineapplePattern opacity={0.12} />
      
      <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.iconContainer}>
          <PineappleIcon size={140} />
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.titleZh}>🍍 鳳梨熟度感測助手</Text>
          <Text style={styles.titleEn}>Pineapple Ripeness Detector</Text>
        </View>
        
        <View style={styles.divider} />
        
        <Text style={styles.selectText}>Select Language / 請選擇語言</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => handleLanguageSelect('zh')}
            activeOpacity={0.8}
            testID="btn-chinese"
          >
            <LinearGradient
              colors={[Colors.white, Colors.cream]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <Text style={styles.buttonText}>繁體中文</Text>
              <Text style={styles.buttonSubtext}>Traditional Chinese</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => handleLanguageSelect('en')}
            activeOpacity={0.8}
            testID="btn-english"
          >
            <LinearGradient
              colors={[Colors.white, Colors.cream]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <Text style={styles.buttonText}>English</Text>
              <Text style={styles.buttonSubtext}>英文</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pineappleYellow,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.pineappleYellow,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleZh: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  titleEn: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    opacity: 0.95,
  },
  divider: {
    width: width * 0.5,
    height: 3,
    backgroundColor: Colors.white,
    borderRadius: 2,
    marginVertical: 30,
    opacity: 0.5,
  },
  selectText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '500' as const,
    marginBottom: 25,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  languageButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textDark,
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
});
