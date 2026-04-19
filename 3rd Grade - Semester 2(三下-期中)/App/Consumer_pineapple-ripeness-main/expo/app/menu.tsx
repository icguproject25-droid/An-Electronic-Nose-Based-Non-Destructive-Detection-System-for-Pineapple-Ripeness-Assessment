import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Clock, Settings, Globe, Upload, Leaf, BookOpen } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUploadQueue } from '@/contexts/UploadQueueContext';
import { useHistory } from '@/contexts/HistoryContext';
import { PineappleIcon } from '@/components/PineappleIcon';

export default function MenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, resetLanguage } = useLanguage();
  const { queueCount } = useUploadQueue();
  const { records } = useHistory();

  const handleStartScan = () => {
    router.push('/instruction' as any);
  };

  const handleLanguageChange = async () => {
    await resetLanguage();
    router.replace('/');
  };

  const handlePendingUploads = () => {
    router.push('/pending-uploads' as any);
  };

  const handleHistory = () => {
    router.push('/history' as any);
  };

  const handleVarieties = () => {
    router.push('/varieties' as any);
  };

  const handleTrivia = () => {
    router.push('/trivia' as any);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.warmWhite, Colors.cream, '#FFF5E1']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      <View style={styles.patternTop}>
        <LinearGradient
          colors={[Colors.pineappleYellow, Colors.pineappleGold]}
          style={styles.patternGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.patternScales}>
            {Array.from({ length: 15 }).map((_, i) => (
              <View key={i} style={[styles.scale, { opacity: 0.3 + Math.random() * 0.3 }]} />
            ))}
          </View>
        </LinearGradient>
      </View>
      
      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.header}>
          <PineappleIcon size={80} />
          <Text style={styles.appTitle}>{t('appName')}</Text>
        </View>
        
        <View style={styles.mainButtonContainer}>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={handleStartScan}
            activeOpacity={0.85}
            testID="btn-start-scan"
          >
            <LinearGradient
              colors={[Colors.pineappleYellow, Colors.pineappleGold]}
              style={styles.mainButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.mainButtonContent}>
                <View style={styles.scanIconContainer}>
                  <Search size={32} color={Colors.white} strokeWidth={2.5} />
                </View>
                <Text style={styles.mainButtonText}>{t('startScan')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.varietyButton}
            onPress={handleVarieties}
            activeOpacity={0.7}
            testID="btn-varieties"
          >
            <View style={styles.varietyContent}>
              <Leaf size={24} color={Colors.leafGreen} />
              <Text style={styles.varietyText}>{t('varietiesTitle')}</Text>
              <View style={styles.varietyArrow}>
                <Text style={styles.varietyArrowText}>›</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.triviaButton}
            onPress={handleTrivia}
            activeOpacity={0.7}
            testID="btn-trivia"
          >
            <View style={styles.triviaContent}>
              <BookOpen size={24} color={Colors.ripeOrange} />
              <Text style={styles.triviaText}>{t('triviaTitle')}</Text>
              <View style={styles.triviaArrow}>
                <Text style={styles.triviaArrowText}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.placeholderContainer}>
          {queueCount > 0 && (
            <TouchableOpacity 
              style={styles.pendingButton} 
              onPress={handlePendingUploads}
              activeOpacity={0.7}
              testID="btn-pending-uploads"
            >
              <View style={styles.pendingContent}>
                <Upload size={24} color={Colors.ripeOrange} />
                <Text style={styles.pendingText}>{t('pendingUploads')}</Text>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{queueCount}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.historyButton} 
            onPress={handleHistory}
            activeOpacity={0.7}
            testID="btn-history"
          >
            <View style={styles.historyContent}>
              <Clock size={24} color={Colors.leafGreen} />
              <Text style={styles.historyText}>{t('history')}</Text>
              {records.length > 0 && (
                <View style={styles.historyBadge}>
                  <Text style={styles.historyBadgeText}>{records.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.placeholderButton} disabled activeOpacity={1}>
            <View style={styles.placeholderContent}>
              <Settings size={24} color={Colors.textLight} />
              <Text style={styles.placeholderText}>{t('settings')}</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>{t('comingSoon')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={handleLanguageChange}
            activeOpacity={0.7}
            testID="btn-change-language"
          >
            <Globe size={20} color={Colors.leafGreen} />
            <Text style={styles.languageButtonText}>{t('language')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.decorPineapple}>
        <PineappleIcon size={60} style={{ opacity: 0.15 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
  },
  patternTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    overflow: 'hidden',
  },
  patternGradient: {
    flex: 1,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  patternScales: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingTop: 60,
  },
  scale: {
    width: 50,
    height: 35,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.ripeOrange,
    margin: -8,
    transform: [{ rotate: '45deg' }],
    backgroundColor: Colors.pineappleYellow,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textDark,
    marginTop: 12,
    textAlign: 'center',
  },
  mainButtonContainer: {
    marginBottom: 30,
    gap: 14,
  },
  varietyButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.leafGreen,
    overflow: 'hidden',
  },
  varietyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  varietyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textDark,
    flex: 1,
  },
  varietyArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(75,83,32,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  varietyArrowText: {
    fontSize: 20,
    color: Colors.leafGreen,
    fontWeight: '700' as const,
    marginTop: -2,
  },
  triviaButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.ripeOrange,
    overflow: 'hidden',
  },
  triviaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  triviaText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textDark,
    flex: 1,
  },
  triviaArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,165,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  triviaArrowText: {
    fontSize: 20,
    color: Colors.ripeOrange,
    fontWeight: '700' as const,
    marginTop: -2,
  },
  mainButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.pineappleGold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  mainButtonGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  mainButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  scanIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  placeholderContainer: {
    gap: 14,
  },
  pendingButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.ripeOrange,
    overflow: 'hidden',
  },
  pendingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 12,
  },
  pendingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textDark,
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: Colors.ripeOrange,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  pendingBadgeText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '700' as const,
  },
  placeholderButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  placeholderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 12,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.textLight,
    flex: 1,
  },
  comingSoonBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
  historyButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.leafGreen,
    overflow: 'hidden',
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 12,
  },
  historyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textDark,
    flex: 1,
  },
  historyBadge: {
    backgroundColor: Colors.leafGreen,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  historyBadgeText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '700' as const,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(75, 83, 32, 0.08)',
    borderRadius: 25,
  },
  languageButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.leafGreen,
  },
  decorPineapple: {
    position: 'absolute',
    bottom: 120,
    right: -10,
  },
});
