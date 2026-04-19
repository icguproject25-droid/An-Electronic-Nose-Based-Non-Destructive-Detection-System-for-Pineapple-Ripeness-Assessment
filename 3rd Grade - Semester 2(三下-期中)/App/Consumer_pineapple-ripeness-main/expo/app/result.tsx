import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Modal, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp, Thermometer, Droplets, Gauge, AlertCircle, X, Check, Upload, ChefHat, ArrowRight, CookingPot } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSensor } from '@/contexts/SensorContext';
import { useUploadQueue } from '@/contexts/UploadQueueContext';
import { useHistory } from '@/contexts/HistoryContext';
import { getRipenessColor, RipenessLevel } from '@/utils/ripeness';
import { submitFeedbackToServer } from '@/services/api';
import { PineappleIcon } from '@/components/PineappleIcon';
import { TranslationKey } from '@/constants/translations';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type RecipeCategory = 'unripe' | 'ripe' | 'overripe' | 'abnormal';

interface RecipeItem {
  nameKey: TranslationKey;
  reasonKey: TranslationKey;
  stepKeys: TranslationKey[];
  emoji: string;
}

const recipeMap: Record<RecipeCategory, RecipeItem[]> = {
  unripe: [
    {
      nameKey: 'recipeUnripe1Name',
      reasonKey: 'recipeUnripe1Reason',
      stepKeys: ['recipeUnripe1Step1', 'recipeUnripe1Step2', 'recipeUnripe1Step3', 'recipeUnripe1Step4', 'recipeUnripe1Step5'],
      emoji: '🍤',
    },
    {
      nameKey: 'recipeUnripe2Name',
      reasonKey: 'recipeUnripe2Reason',
      stepKeys: ['recipeUnripe2Step1', 'recipeUnripe2Step2', 'recipeUnripe2Step3', 'recipeUnripe2Step4', 'recipeUnripe2Step5'],
      emoji: '🍳',
    },
    {
      nameKey: 'recipeUnripe3Name',
      reasonKey: 'recipeUnripe3Reason',
      stepKeys: ['recipeUnripe3Step1', 'recipeUnripe3Step2', 'recipeUnripe3Step3', 'recipeUnripe3Step4', 'recipeUnripe3Step5'],
      emoji: '🫙',
    },
  ],
  ripe: [
    {
      nameKey: 'recipeRipe1Name',
      reasonKey: 'recipeRipe1Reason',
      stepKeys: ['recipeRipe1Step1', 'recipeRipe1Step2', 'recipeRipe1Step3', 'recipeRipe1Step4', 'recipeRipe1Step5'],
      emoji: '🍍',
    },
    {
      nameKey: 'recipeRipe2Name',
      reasonKey: 'recipeRipe2Reason',
      stepKeys: ['recipeRipe2Step1', 'recipeRipe2Step2', 'recipeRipe2Step3', 'recipeRipe2Step4', 'recipeRipe2Step5'],
      emoji: '🥤',
    },
    {
      nameKey: 'recipeRipe3Name',
      reasonKey: 'recipeRipe3Reason',
      stepKeys: ['recipeRipe3Step1', 'recipeRipe3Step2', 'recipeRipe3Step3', 'recipeRipe3Step4', 'recipeRipe3Step5'],
      emoji: '🥣',
    },
  ],
  overripe: [
    {
      nameKey: 'recipeOverripe1Name',
      reasonKey: 'recipeOverripe1Reason',
      stepKeys: ['recipeOverripe1Step1', 'recipeOverripe1Step2', 'recipeOverripe1Step3', 'recipeOverripe1Step4', 'recipeOverripe1Step5'],
      emoji: '🫙',
    },
    {
      nameKey: 'recipeOverripe2Name',
      reasonKey: 'recipeOverripe2Reason',
      stepKeys: ['recipeOverripe2Step1', 'recipeOverripe2Step2', 'recipeOverripe2Step3', 'recipeOverripe2Step4', 'recipeOverripe2Step5'],
      emoji: '🥮',
    },
    {
      nameKey: 'recipeOverripe3Name',
      reasonKey: 'recipeOverripe3Reason',
      stepKeys: ['recipeOverripe3Step1', 'recipeOverripe3Step2', 'recipeOverripe3Step3', 'recipeOverripe3Step4', 'recipeOverripe3Step5'],
      emoji: '🍮',
    },
  ],
  abnormal: [
    {
      nameKey: 'recipeAbnormal1Name',
      reasonKey: 'recipeAbnormal1Reason',
      stepKeys: ['recipeAbnormal1Step1', 'recipeAbnormal1Step2', 'recipeAbnormal1Step3', 'recipeAbnormal1Step4', 'recipeAbnormal1Step5'],
      emoji: '🔥',
    },
    {
      nameKey: 'recipeAbnormal2Name',
      reasonKey: 'recipeAbnormal2Reason',
      stepKeys: ['recipeAbnormal2Step1', 'recipeAbnormal2Step2', 'recipeAbnormal2Step3', 'recipeAbnormal2Step4', 'recipeAbnormal2Step5'],
      emoji: '🫕',
    },
  ],
};

function getRecipeCategory(ripeness: RipenessLevel): RecipeCategory {
  switch (ripeness) {
    case 'unripe':
    case 'transition':
      return 'unripe';
    case 'ripe':
      return 'ripe';
    case 'overripe':
      return 'overripe';
  }
}

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();
  const { currentResult, submitFeedback, clearResult } = useSensor();
  useUploadQueue();
  const { createAndSaveRecord, uploadRecord } = useHistory();
  const [showDetails, setShowDetails] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState<RipenessLevel | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'queued'>('idle');
  const [hasUploaded, setHasUploaded] = useState(false);
  const [expandedRecipeIndex, setExpandedRecipeIndex] = useState<number | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const ripeness = currentResult?.ripeness ?? 'unripe';
  const processedData = currentResult?.processedData;
  const ripenessColor = getRipenessColor(ripeness);

  const recipeCategory = useMemo(() => getRecipeCategory(ripeness), [ripeness]);
  const recipes = useMemo(() => recipeMap[recipeCategory].slice(0, 3), [recipeCategory]);

  const handleToggleRecipe = useCallback((index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedRecipeIndex(prev => prev === index ? null : index);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    const doSaveAndUpload = async () => {
      if (!currentResult) return;
      
      console.log('[Result] Saving scan record to local history');
      
      const locale = (language || 'en') as 'zh' | 'en';
      const record = await createAndSaveRecord(
        currentResult.rawData,
        currentResult.ripeness,
        locale,
        currentResult.metadata
      );
      
      console.log('[Result] Record saved locally:', record.local_id);
      setHasUploaded(true);
      
      setUploadStatus('uploading');
      console.log('[Result] Attempting to upload record');
      
      const success = await uploadRecord(record.local_id);
      
      if (success) {
        setUploadStatus('success');
        console.log('[Result] Upload successful');
      } else {
        setUploadStatus('queued');
        console.log('[Result] Upload failed, queued for retry');
      }
    };

    if (currentResult && !hasUploaded) {
      doSaveAndUpload();
    }
  }, [currentResult, hasUploaded, language, createAndSaveRecord, uploadRecord]);

  if (!currentResult || !processedData) {
    return null;
  }

  const getRipenessLabel = (level: RipenessLevel): string => {
    switch (level) {
      case 'unripe': return t('unripe');
      case 'transition': return t('transition');
      case 'ripe': return t('ripe');
      case 'overripe': return t('overripe');
    }
  };

  const handleExit = () => {
    router.replace('/menu' as any);
    setTimeout(() => clearResult(), 100);
  };

  const handleSubmitFeedback = async () => {
    if (selectedCorrection && currentResult) {
      submitFeedback(currentResult.id, selectedCorrection);
      
      try {
        await submitFeedbackToServer(currentResult.id, {
          correct_label: selectedCorrection,
        });
        Alert.alert(t('feedbackSent'));
      } catch (error) {
        console.log('[Result] Feedback submission failed:', error);
      }
      
      setShowFeedback(false);
      setSelectedCorrection(null);
    }
  };

  const sensorDataItems = [
    { label: t('smokeFlammable'), value: processedData.smokeFlammable, icon: '💨' },
    { label: t('alcoholLevel'), value: processedData.alcoholLevel, icon: '🍷', important: true },
    { label: t('carbonMonoxide'), value: processedData.carbonMonoxide, icon: '🔥' },
    { label: t('airQuality'), value: processedData.airQuality, icon: '🌬️' },
    { label: t('odorIntensity'), value: processedData.odorIntensity, icon: '👃', important: true },
  ];

  const ripenessOptions: RipenessLevel[] = ['unripe', 'transition', 'ripe', 'overripe'];

  const getUploadStatusText = () => {
    switch (uploadStatus) {
      case 'uploading': return t('uploading');
      case 'success': return t('uploadSuccess');
      case 'queued': return t('uploadFailed');
      default: return '';
    }
  };

  const getUploadStatusColor = () => {
    switch (uploadStatus) {
      case 'success': return Colors.freshGreen;
      case 'queued': return Colors.ripeOrange;
      default: return Colors.textLight;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.warmWhite, Colors.cream]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('result')}</Text>

        {uploadStatus !== 'idle' && (
          <View style={[styles.uploadStatusBar, { borderColor: getUploadStatusColor() }]}>
            <Upload size={16} color={getUploadStatusColor()} />
            <Text style={[styles.uploadStatusText, { color: getUploadStatusColor() }]}>
              {getUploadStatusText()}
            </Text>
          </View>
        )}
        
        <Animated.View 
          style={[
            styles.resultCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[ripenessColor, adjustColor(ripenessColor, -20)]}
            style={styles.resultCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.pineappleResult}>
              <PineappleIcon size={100} />
            </View>
            <Text style={styles.ripenessLabel}>{getRipenessLabel(ripeness)}</Text>
            <Text style={styles.ripenessSubtext}>
              {language === 'zh' ? getRipenessDescriptionZh(ripeness) : getRipenessDescriptionEn(ripeness)}
            </Text>
          </LinearGradient>
        </Animated.View>
        
        <TouchableOpacity
          style={styles.detailsToggle}
          onPress={() => setShowDetails(!showDetails)}
          activeOpacity={0.7}
        >
          <Text style={styles.detailsToggleText}>{t('detailedData')}</Text>
          {showDetails ? (
            <ChevronUp size={22} color={Colors.textDark} />
          ) : (
            <ChevronDown size={22} color={Colors.textDark} />
          )}
        </TouchableOpacity>
        
        {showDetails && (
          <View style={styles.detailsContainer}>
            <View style={styles.sensorSection}>
              {sensorDataItems.map((item, index) => (
                <View key={index} style={[styles.sensorItem, item.important && styles.sensorItemImportant]}>
                  <View style={styles.sensorItemLeft}>
                    <Text style={styles.sensorIcon}>{item.icon}</Text>
                    <Text style={styles.sensorLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.sensorValueContainer}>
                    <View style={styles.sensorBar}>
                      <View style={[styles.sensorBarFill, { width: `${item.value}%`, backgroundColor: getBarColor(item.value) }]} />
                    </View>
                    <Text style={styles.sensorValue}>{item.value.toFixed(1)}%</Text>
                  </View>
                </View>
              ))}
            </View>
            
            <View style={styles.envSection}>
              <Text style={styles.envTitle}>{t('environment')}</Text>
              <View style={styles.envRow}>
                <View style={styles.envItem}>
                  <Thermometer size={20} color={Colors.ripeOrange} />
                  <Text style={styles.envValue}>{processedData.temperature}°C</Text>
                  <Text style={styles.envLabel}>{t('temperature')}</Text>
                </View>
                <View style={styles.envItem}>
                  <Droplets size={20} color="#4FC3F7" />
                  <Text style={styles.envValue}>{processedData.humidity}%</Text>
                  <Text style={styles.envLabel}>{t('humidity')}</Text>
                </View>
                <View style={styles.envItem}>
                  <Gauge size={20} color={Colors.leafGreen} />
                  <Text style={styles.envValue}>{processedData.pressure}</Text>
                  <Text style={styles.envLabel}>hPa</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.feedbackButton}
          onPress={() => setShowFeedback(true)}
          activeOpacity={0.7}
        >
          <AlertCircle size={18} color={Colors.textLight} />
          <Text style={styles.feedbackButtonText}>{t('correctThis')}</Text>
        </TouchableOpacity>

        <View style={styles.recipeSection}>
          <View style={styles.recipeSectionHeader}>
            <CookingPot size={20} color={Colors.leafGreen} />
            <Text style={styles.recipeSectionTitle}>{t('recipeRecommendation')}</Text>
          </View>

          {recipes.map((recipe, index) => {
            const isExpanded = expandedRecipeIndex === index;
            return (
              <View key={`${recipeCategory}-${index}`} style={styles.recipeCard}>
                <View style={styles.recipeCardTop}>
                  <View style={styles.recipeCardLeft}>
                    <Text style={styles.recipeEmoji}>{recipe.emoji}</Text>
                    <View style={styles.recipeTextGroup}>
                      <Text style={styles.recipeName}>{t(recipe.nameKey)}</Text>
                      <Text style={styles.recipeDesc}>{t(recipe.reasonKey)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.recipeButton, isExpanded && styles.recipeButtonExpanded]}
                    activeOpacity={0.7}
                    onPress={() => handleToggleRecipe(index)}
                  >
                    <Text style={[styles.recipeButtonText, isExpanded && styles.recipeButtonTextExpanded]}>
                      {isExpanded ? t('hideSteps') : t('viewRecipe')}
                    </Text>
                    {isExpanded ? (
                      <ChevronUp size={14} color={Colors.leafGreen} />
                    ) : (
                      <ArrowRight size={14} color={Colors.white} />
                    )}
                  </TouchableOpacity>
                </View>
                {isExpanded && (
                  <View style={styles.recipeStepsContainer}>
                    <View style={styles.recipeStepsDivider} />
                    <Text style={styles.recipeStepsTitle}>{t('recipeSteps')}</Text>
                    {recipe.stepKeys.map((stepKey, stepIdx) => (
                      <View key={stepIdx} style={styles.recipeStepRow}>
                        <View style={styles.recipeStepNumberBadge}>
                          <Text style={styles.recipeStepNumber}>{stepIdx + 1}</Text>
                        </View>
                        <Text style={styles.recipeStepText}>{t(stepKey)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
      
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.exitButton}
          onPress={handleExit}
          activeOpacity={0.85}
          testID="btn-exit"
        >
          <LinearGradient
            colors={[Colors.leafGreen, '#3D4419']}
            style={styles.exitButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.exitButtonText}>{t('exit')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      <Modal
        visible={showFeedback}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFeedback(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowFeedback(false)}
            >
              <X size={24} color={Colors.textDark} />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>{t('selectCorrectResult')}</Text>
            
            <View style={styles.correctionOptions}>
              {ripenessOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.correctionOption,
                    selectedCorrection === option && styles.correctionOptionSelected,
                    { borderColor: getRipenessColor(option) },
                  ]}
                  onPress={() => setSelectedCorrection(option)}
                >
                  <View style={[styles.correctionDot, { backgroundColor: getRipenessColor(option) }]} />
                  <Text style={styles.correctionText}>{getRipenessLabel(option)}</Text>
                  {selectedCorrection === option && (
                    <Check size={20} color={getRipenessColor(option)} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowFeedback(false)}
              >
                <Text style={styles.modalCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, !selectedCorrection && styles.modalSubmitDisabled]}
                onPress={handleSubmitFeedback}
                disabled={!selectedCorrection}
              >
                <Text style={styles.modalSubmitText}>{t('submit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getBarColor(value: number): string {
  if (value < 30) return Colors.freshGreen;
  if (value < 60) return Colors.pineappleYellow;
  if (value < 80) return Colors.ripeOrange;
  return Colors.overripeBrown;
}

function getRipenessDescriptionZh(level: RipenessLevel): string {
  switch (level) {
    case 'unripe': return '鳳梨尚未成熟，建議再等待數日';
    case 'transition': return '鳳梨正在轉熟中，即將達到最佳狀態';
    case 'ripe': return '鳳梨已成熟，現在是最佳食用時機！';
    case 'overripe': return '鳳梨已過熟，建議盡快食用';
  }
}

function getRipenessDescriptionEn(level: RipenessLevel): string {
  switch (level) {
    case 'unripe': return 'Pineapple is not yet ripe. Wait a few more days.';
    case 'transition': return 'Pineapple is transitioning. Almost ready!';
    case 'ripe': return 'Pineapple is ripe. Perfect time to enjoy!';
    case 'overripe': return 'Pineapple is overripe. Consume soon.';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 16,
  },
  uploadStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  uploadStatusText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  resultCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 24,
  },
  resultCardGradient: {
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  pineappleResult: {
    marginBottom: 16,
  },
  ripenessLabel: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  ripenessSubtext: {
    fontSize: 15,
    color: Colors.white,
    opacity: 0.95,
    textAlign: 'center',
    lineHeight: 22,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderRadius: 12,
    gap: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsToggleText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textDark,
  },
  detailsContainer: {
    marginTop: 16,
  },
  sensorSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sensorItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sensorItemImportant: {
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  sensorItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sensorIcon: {
    fontSize: 18,
  },
  sensorLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textDark,
  },
  sensorValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sensorBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sensorBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sensorValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textDark,
    width: 55,
    textAlign: 'right',
  },
  envSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  envTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textLight,
    marginBottom: 12,
    textAlign: 'center',
  },
  envRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  envItem: {
    alignItems: 'center',
    gap: 4,
  },
  envValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textDark,
    marginTop: 4,
  },
  envLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingVertical: 12,
  },
  feedbackButtonText: {
    fontSize: 14,
    color: Colors.textLight,
    textDecorationLine: 'underline',
  },
  recipeSection: {
    marginTop: 28,
  },
  recipeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  recipeSectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textDark,
  },
  recipeCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recipeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  recipeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  recipeTextGroup: {
    flex: 1,
  },
  recipeName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textDark,
    marginBottom: 3,
  },
  recipeDesc: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 17,
  },
  recipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.leafGreen,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  recipeButtonExpanded: {
    backgroundColor: 'rgba(75, 83, 32, 0.1)',
  },
  recipeButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  recipeButtonTextExpanded: {
    color: Colors.leafGreen,
  },
  recipeStepsContainer: {
    marginTop: 12,
  },
  recipeStepsDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  recipeStepsTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textLight,
    marginBottom: 10,
  },
  recipeStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  recipeStepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.leafGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  recipeStepNumber: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  recipeStepText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: Colors.warmWhite,
  },
  exitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.leafGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exitButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  exitButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 20,
  },
  correctionOptions: {
    gap: 12,
    marginBottom: 24,
  },
  correctionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  correctionOptionSelected: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  correctionDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  correctionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.textDark,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textDark,
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.leafGreen,
    alignItems: 'center',
  },
  modalSubmitDisabled: {
    opacity: 0.5,
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
