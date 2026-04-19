import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Audio, type AVPlaybackSource } from 'expo-av';
import * as Speech from 'expo-speech';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, ChevronLeft, ChevronDown, Wifi, Smartphone, RotateCcw } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSensor } from '@/contexts/SensorContext';
import { DetectionAnimation } from '@/components/DetectionAnimation';
import { getApiBaseUrl, setApiBaseUrl, DEFAULT_API_URL } from '@/services/storage';
import { useTrivia } from '@/contexts/TriviaContext';

const TOTAL_GUIDE_SECONDS = 10;
const GUIDE_STEP_SECONDS = 2.5;
const BEEP_SOURCE = require('../assets/sounds/beep.mp3') as AVPlaybackSource;

export default function InstructionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();
  const { scanMetadata, updateMetadata } = useSensor();
  const { resetSession: resetTrivia, stopSession: stopTrivia } = useTrivia();

  const [showMetadata, setShowMetadata] = useState<boolean>(false);
  const [fruitId, setFruitId] = useState<string>(scanMetadata.fruit_id || '');
  const [distCm, setDistCm] = useState<number | undefined>(scanMetadata.dist_cm);
  const [note, setNote] = useState<string>(scanMetadata.note || '');
  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_API_URL);
  const [apiUrlInput, setApiUrlInput] = useState<string>(DEFAULT_API_URL);
  const [startCountdown, setStartCountdown] = useState<number | null>(null);
  const [isCountdownRunning, setIsCountdownRunning] = useState<boolean>(false);
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [soundsReady, setSoundsReady] = useState<boolean>(false);

  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasStartedCountdownRef = useRef<boolean>(false);
  const isUnmountingRef = useRef<boolean>(false);
  const activeSoundRef = useRef<Audio.Sound | null>(null);
  const beepSoundRef = useRef<Audio.Sound | null>(null);
  const lastPlayedCountRef = useRef<number | null>(null);
  const hasSpokeInitialRef = useRef<boolean>(false);
  const hasSpokeCountdownRef = useRef<boolean>(false);
  const hasSpokeBeginRef = useRef<boolean>(false);

  const guideTips = useMemo(
    () => [t('factCard1'), t('factCard2'), t('factCard3'), t('factCard4')],
    [t]
  );

  const clearCountdownTimers = useCallback(() => {
    console.log('[Instruction] Clearing countdown timers');
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (navigationTimerRef.current) {
      clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }
    lastPlayedCountRef.current = null;
    setIsCountdownRunning(false);
  }, []);

  const stopActiveSound = useCallback(async () => {
    try {
      if (activeSoundRef.current) {
        await activeSoundRef.current.stopAsync();
        await activeSoundRef.current.setPositionAsync(0);
      }
    } catch (error) {
      console.log('[Instruction] stopActiveSound error:', error);
    } finally {
      activeSoundRef.current = null;
    }
  }, []);

  const unloadSounds = useCallback(async () => {
    try {
      await stopActiveSound();
      if (beepSoundRef.current) {
        await beepSoundRef.current.unloadAsync();
        beepSoundRef.current = null;
      }
    } catch (error) {
      console.log('[Instruction] unloadSounds error:', error);
    }
  }, [stopActiveSound]);

  const playLoadedSound = useCallback(async (sound: Audio.Sound | null, label: string) => {
    if (!sound) {
      console.log(`[Instruction] ${label} sound missing`);
      return;
    }

    try {
      await stopActiveSound();
      activeSoundRef.current = sound;
      await sound.setPositionAsync(0);
      await sound.playAsync();
      console.log(`[Instruction] Played ${label} sound`);
    } catch (error) {
      console.log(`[Instruction] playLoadedSound ${label} error:`, error);
      activeSoundRef.current = null;
    }
  }, [stopActiveSound]);

  const loadSounds = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });
      const beepResult = await Audio.Sound.createAsync(BEEP_SOURCE, { shouldPlay: false });
      beepSoundRef.current = beepResult.sound;
      setSoundsReady(true);
      console.log('[Instruction] Sounds loaded');
    } catch (error) {
      console.log('[Instruction] loadSounds error:', error);
      setSoundsReady(false);
    }
  }, []);

  const speakText = useCallback(async (text: string) => {
    try {
      await Speech.stop();
      Speech.speak(text, {
        language: language === 'zh' ? 'zh-TW' : 'en-US',
        pitch: 1,
        rate: 0.95,
      });
      console.log('[Instruction] TTS spoke:', text.substring(0, 30));
    } catch (error) {
      console.log('[Instruction] speakText error:', error);
    }
  }, [language]);

  useEffect(() => {
    isUnmountingRef.current = false;
    hasSpokeInitialRef.current = false;
    hasSpokeCountdownRef.current = false;
    hasSpokeBeginRef.current = false;
    resetTrivia();
    void loadApiUrl();
    void loadSounds();

    const initialSpeechTimer = setTimeout(() => {
      if (!hasSpokeInitialRef.current && !isUnmountingRef.current) {
        hasSpokeInitialRef.current = true;
        void speakText(t('voicePlacePrompt'));
      }
    }, 600);

    return () => {
      isUnmountingRef.current = true;
      clearTimeout(initialSpeechTimer);
      clearCountdownTimers();
      hasStartedCountdownRef.current = false;
      stopTrivia();
      void Speech.stop();
      void unloadSounds();
    };
  }, [clearCountdownTimers, loadSounds, speakText, t, unloadSounds, resetTrivia, stopTrivia]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        clearCountdownTimers();
        void stopActiveSound();
        void Speech.stop();
      };
    }, [clearCountdownTimers, stopActiveSound])
  );

  const loadApiUrl = async () => {
    const url = await getApiBaseUrl();
    setApiUrl(url);
    setApiUrlInput(url);
    console.log('[Instruction] Loaded API URL:', url);
  };

  const validateUrl = (url: string): boolean => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const handleApplyUrl = async () => {
    const trimmedUrl = apiUrlInput.trim();
    if (!trimmedUrl || !validateUrl(trimmedUrl)) {
      Alert.alert('', t('invalidUrl'));
      return;
    }
    await setApiBaseUrl(trimmedUrl);
    setApiUrl(trimmedUrl);
    Alert.alert('', t('backendUpdated'));
    console.log('[Instruction] Applied API URL:', trimmedUrl);
  };

  const handleQuickSelect = async (url: string, label: string) => {
    await setApiBaseUrl(url);
    setApiUrl(url);
    setApiUrlInput(url);
    Alert.alert('', `${t('switchedTo')}: ${label}`);
    console.log('[Instruction] Quick selected API URL:', url);
  };

  const handleReady = useCallback(() => {
    if (hasStartedCountdownRef.current || isCountdownRunning) {
      console.log('[Instruction] Countdown already running. Ignoring duplicate trigger.');
      return;
    }

    if (!hasSpokeCountdownRef.current) {
      hasSpokeCountdownRef.current = true;
      void speakText(t('voiceCountdownStart'));
    }

    console.log('[Instruction] Starting single countdown flow');
    hasStartedCountdownRef.current = true;
    setIsCountdownRunning(true);
    setStartCountdown(TOTAL_GUIDE_SECONDS);
    setTipIndex(0);
    lastPlayedCountRef.current = null;

    updateMetadata({
      fruit_id: fruitId.trim() || undefined,
      dist_cm: distCm,
      note: note.trim() || undefined,
    });

    countdownIntervalRef.current = setInterval(() => {
      setStartCountdown((prev) => {
        if (prev === null) {
          return prev;
        }

        const next = prev - 1;
        console.log('[Instruction] Countdown tick:', { previous: prev, next });

        if (next <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return 0;
        }

        return next;
      });
    }, 1000);

    navigationTimerRef.current = setTimeout(() => {
      console.log('[Instruction] Countdown finished, navigating to processing');
      if (!hasSpokeBeginRef.current) {
        hasSpokeBeginRef.current = true;
        void speakText(t('voiceScanBegin'));
      }
      clearCountdownTimers();
      if (!isUnmountingRef.current) {
        router.push('/processing' as any);
      }
    }, TOTAL_GUIDE_SECONDS * 1000 + 250);
  }, [clearCountdownTimers, distCm, fruitId, isCountdownRunning, note, router, speakText, t, updateMetadata]);

  const handleBack = () => {
    clearCountdownTimers();
    hasStartedCountdownRef.current = false;
    void stopActiveSound();
    void Speech.stop();
    router.back();
  };

  const handleDistanceSelect = (value: number | undefined) => {
    setDistCm(distCm === value ? undefined : value);
  };

  useEffect(() => {
    if (!isCountdownRunning || startCountdown === null) {
      return;
    }

    const elapsedSeconds = TOTAL_GUIDE_SECONDS - startCountdown;
    const computedIndex = Math.min(
      guideTips.length - 1,
      Math.floor(elapsedSeconds / GUIDE_STEP_SECONDS)
    );
    setTipIndex(computedIndex);
  }, [guideTips.length, isCountdownRunning, startCountdown]);

  useEffect(() => {
    if (!isCountdownRunning || startCountdown === null) {
      return;
    }

    if (lastPlayedCountRef.current === startCountdown) {
      return;
    }

    if (startCountdown === 3 || startCountdown === 2 || startCountdown === 1) {
      lastPlayedCountRef.current = startCountdown;
      void playLoadedSound(beepSoundRef.current, 'beep');
    }
  }, [isCountdownRunning, playLoadedSound, startCountdown]);

  const countdownValue = startCountdown ?? TOTAL_GUIDE_SECONDS;
  const progressText = t('scanProgress').replace('{seconds}', String(countdownValue));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#FFFDF4', '#F7F4E9', '#EFF6FF']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack} testID="btn-back">
          <ChevronLeft size={28} color={Colors.textDark} />
        </TouchableOpacity>

        <View style={styles.illustrationContainer}>
          <View style={styles.deviceShell}>
            <LinearGradient
              colors={['rgba(255,255,255,0.96)', 'rgba(244,248,255,0.92)']}
              style={styles.deviceShellGradient}
            >
              <Text style={styles.deviceTitle}>{t('deviceTitle')}</Text>
              <Text style={styles.deviceSubtitle}>{t('deviceSubtitle')}</Text>

              <DetectionAnimation
                countdown={countdownValue}
                factText={guideTips[tipIndex] ?? guideTips[0]}
                progressText={progressText}
                isCountdownRunning={isCountdownRunning}
              />
            </LinearGradient>
          </View>
        </View>

        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>{t('scanInstruction')}</Text>
          {!isCountdownRunning && (
            <Text style={styles.instructionHint}>
              {t('precheckHint')}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.metadataToggle}
          onPress={() => setShowMetadata(!showMetadata)}
          activeOpacity={0.7}
          testID="btn-toggle-metadata"
        >
          <Text style={styles.metadataToggleText}>{t('optionalMetadata')}</Text>
          <ChevronDown
            size={20}
            color={Colors.textLight}
            style={{ transform: [{ rotate: showMetadata ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>

        {showMetadata && (
          <View style={styles.metadataContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('fruitId')}</Text>
              <TextInput
                style={styles.textInput}
                value={fruitId}
                onChangeText={setFruitId}
                placeholder={t('fruitIdPlaceholder')}
                placeholderTextColor={Colors.textLight}
                testID="input-fruit-id"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('distCm')}</Text>
              <View style={styles.distanceButtons}>
                <TouchableOpacity
                  style={[styles.distanceButton, distCm === 5 && styles.distanceButtonActive]}
                  onPress={() => handleDistanceSelect(5)}
                  testID="btn-dist-5"
                >
                  <Text style={[styles.distanceButtonText, distCm === 5 && styles.distanceButtonTextActive]}>
                    {t('distCm5')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.distanceButton, distCm === 10 && styles.distanceButtonActive]}
                  onPress={() => handleDistanceSelect(10)}
                  testID="btn-dist-10"
                >
                  <Text style={[styles.distanceButtonText, distCm === 10 && styles.distanceButtonTextActive]}>
                    {t('distCm10')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('note')}</Text>
              <TextInput
                style={[styles.textInput, styles.textInputMultiline]}
                value={note}
                onChangeText={setNote}
                placeholder={t('notePlaceholder')}
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={2}
                testID="input-note"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('backendUrl')}</Text>
              <View style={styles.urlInputRow}>
                <TextInput
                  style={[styles.textInput, styles.urlInput]}
                  value={apiUrlInput}
                  onChangeText={setApiUrlInput}
                  placeholder={t('backendUrlPlaceholder')}
                  placeholderTextColor={Colors.textLight}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  testID="input-api-url"
                />
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApplyUrl}
                  testID="btn-apply-url"
                >
                  <Text style={styles.applyButtonText}>{t('apply')}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.currentUrlText}>
                {t('currentBackend')}: {apiUrl}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('quickIpSelect')}</Text>
              <View style={styles.quickSelectContainer}>
                <TouchableOpacity
                  style={styles.quickSelectButton}
                  onPress={() => handleQuickSelect('http://192.168.18.11:8000', '192.168.18.11')}
                  testID="btn-quick-wifi"
                >
                  <Wifi size={16} color={Colors.leafGreen} />
                  <Text style={styles.quickSelectText}>192.168.18.11</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickSelectButton}
                  onPress={() => handleQuickSelect('http://10.0.2.2:8000', '10.0.2.2')}
                  testID="btn-quick-emulator"
                >
                  <Smartphone size={16} color={Colors.leafGreen} />
                  <Text style={styles.quickSelectText}>10.0.2.2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickSelectButton}
                  onPress={() => handleQuickSelect(DEFAULT_API_URL, 'Default')}
                  testID="btn-quick-reset"
                >
                  <RotateCcw size={16} color={Colors.textLight} />
                  <Text style={styles.quickSelectTextMuted}>{t('resetDefault')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.readyButton, isCountdownRunning && styles.readyButtonDisabled]}
            onPress={handleReady}
            activeOpacity={0.85}
            testID="btn-ready"
            disabled={isCountdownRunning}
          >
            <LinearGradient
              colors={isCountdownRunning ? ['#7A8666', '#647052'] : [Colors.leafGreen, '#293312']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.readyButtonText}>
                {isCountdownRunning
                  ? t('preparingScan')
                  : t('readyToScan')}
              </Text>
              <ArrowRight size={22} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
          {!soundsReady && (
            <Text style={styles.soundHint} testID="text-sound-loading">
              {language === 'zh' ? '提示音載入中…' : 'Loading audio cues…'}
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
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
    flexGrow: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  illustrationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 26,
  },
  deviceShell: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  deviceShellGradient: {
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
  },
  deviceTitle: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#152033',
    marginBottom: 4,
  },
  deviceSubtitle: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#667085',
    marginBottom: 18,
  },
  instructionBox: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionHint: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textLight,
    lineHeight: 20,
  },
  metadataToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  metadataToggleText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textLight,
  },
  metadataContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textDark,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textDark,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  textInputMultiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 16,
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urlInput: {
    flex: 1,
  },
  applyButton: {
    backgroundColor: Colors.leafGreen,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  currentUrlText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 6,
  },
  quickSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8F8F8',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  quickSelectText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textDark,
  },
  quickSelectTextMuted: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textLight,
  },
  distanceButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  distanceButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  distanceButtonActive: {
    backgroundColor: Colors.pineappleYellow,
    borderColor: Colors.pineappleGold,
  },
  distanceButtonText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.textDark,
  },
  distanceButtonTextActive: {
    color: Colors.white,
    fontWeight: '600' as const,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingTop: 20,
    paddingBottom: 10,
  },
  readyButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.leafGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 7,
  },
  readyButtonDisabled: {
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 10,
  },
  readyButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  soundHint: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textLight,
  },
});
