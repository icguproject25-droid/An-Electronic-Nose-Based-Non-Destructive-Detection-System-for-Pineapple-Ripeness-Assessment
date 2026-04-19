import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { translations, Language, TranslationKey } from '@/constants/translations';

const LANGUAGE_KEY = 'app_language';

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [language, setLanguageState] = useState<Language | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (saved === 'zh' || saved === 'en') {
          setLanguageState(saved);
        }
      } catch (error) {
        console.log('Error loading language:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    const lang = language || 'en';
    return translations[lang][key] || key;
  }, [language]);

  const resetLanguage = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(LANGUAGE_KEY);
      setLanguageState(null);
    } catch (error) {
      console.log('Error resetting language:', error);
    }
  }, []);

  return {
    language,
    setLanguage,
    t,
    isLoading,
    resetLanguage,
  };
});
