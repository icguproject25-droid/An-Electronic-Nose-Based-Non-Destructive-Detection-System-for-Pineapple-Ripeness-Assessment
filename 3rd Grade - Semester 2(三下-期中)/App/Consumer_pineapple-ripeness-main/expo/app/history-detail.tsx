import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Thermometer, Droplets, Gauge, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHistory } from '@/contexts/HistoryContext';
import { ScanRecord, UploadStatus } from '@/types/scanRecord';
import { getRecord } from '@/services/storage';

export default function HistoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { retryUpload } = useHistory();
  const [record, setRecord] = useState<ScanRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const loadRecord = async () => {
      if (id) {
        const data = await getRecord(id);
        setRecord(data);
      }
      setIsLoading(false);
    };
    loadRecord();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleRetry = async () => {
    if (!record) return;
    setIsRetrying(true);
    const success = await retryUpload(record.local_id);
    if (success) {
      const updated = await getRecord(record.local_id);
      setRecord(updated);
    } else {
      const updated = await getRecord(record.local_id);
      setRecord(updated);
    }
    setIsRetrying(false);
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getRipenessColor = (pred: string): string => {
    switch (pred) {
      case 'Unripe': return Colors.unripeGreen;
      case 'Transition': return Colors.transitionYellow;
      case 'Ripe': return Colors.freshGreen;
      case 'Overripe': return Colors.overripeBrown;
      default: return Colors.textLight;
    }
  };

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'uploaded':
        return <CheckCircle size={20} color={Colors.freshGreen} />;
      case 'failed':
        return <XCircle size={20} color="#E53935" />;
      case 'pending':
        return <Clock size={20} color={Colors.ripeOrange} />;
    }
  };

  const getStatusText = (status: UploadStatus): string => {
    switch (status) {
      case 'uploaded': return t('statusUploaded');
      case 'failed': return t('statusFailed');
      case 'pending': return t('statusPending');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.pineappleYellow} />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{t('recordNotFound')}</Text>
        <TouchableOpacity style={styles.backLink} onPress={handleBack}>
          <Text style={styles.backLinkText}>{t('goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canRetry = record.upload_status !== 'uploaded';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.warmWhite, Colors.cream]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={28} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('recordDetail')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.ripenessCard, { backgroundColor: getRipenessColor(record.ripeness_pred) }]}>
          <Text style={styles.ripenessLabel}>{record.ripeness_pred}</Text>
          <Text style={styles.confidenceText}>
            {t('confidence')}: {(record.confidence * 100).toFixed(0)}%
          </Text>
        </View>

        <View style={styles.statusRow}>
          {getStatusIcon(record.upload_status)}
          <Text style={styles.statusText}>{getStatusText(record.upload_status)}</Text>
          {record.server_id && (
            <Text style={styles.serverIdText}>ID: {record.server_id}</Text>
          )}
        </View>

        {canRetry && (
          <TouchableOpacity
            style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
            onPress={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <RefreshCw size={18} color={Colors.white} />
                <Text style={styles.retryButtonText}>{t('retryUpload')}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {record.last_error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorLabel}>{t('lastError')}:</Text>
            <Text style={styles.errorMessage}>{record.last_error}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('basicInfo')}</Text>
          <View style={styles.infoGrid}>
            <InfoRow label={t('dateTime')} value={formatDate(record.created_at_iso)} />
            {record.fruit_id && <InfoRow label={t('fruitId')} value={record.fruit_id} />}
            {record.dist_cm !== undefined && <InfoRow label={t('distCm')} value={`${record.dist_cm} cm`} />}
            {record.note && <InfoRow label={t('note')} value={record.note} />}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('sensorData')}</Text>
          <View style={styles.sensorGrid}>
            <SensorItem label="MQ2" value={record.MQ2_raw.toFixed(2)} />
            <SensorItem label="MQ3" value={record.MQ3_raw.toFixed(2)} />
            <SensorItem label="MQ9" value={record.MQ9_raw.toFixed(2)} />
            <SensorItem label="MQ135" value={record.MQ135_raw.toFixed(2)} />
            <SensorItem label="TGS2602" value={record.TGS2602_raw.toFixed(2)} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('environment')}</Text>
          <View style={styles.envRow}>
            <View style={styles.envItem}>
              <Thermometer size={24} color={Colors.ripeOrange} />
              <Text style={styles.envValue}>{record.Temp_C.toFixed(1)}°C</Text>
              <Text style={styles.envLabel}>{t('temperature')}</Text>
            </View>
            <View style={styles.envItem}>
              <Droplets size={24} color="#4FC3F7" />
              <Text style={styles.envValue}>{record.Humidity_pct.toFixed(1)}%</Text>
              <Text style={styles.envLabel}>{t('humidity')}</Text>
            </View>
            <View style={styles.envItem}>
              <Gauge size={24} color={Colors.leafGreen} />
              <Text style={styles.envValue}>{record.Pressure_hPa.toFixed(1)}</Text>
              <Text style={styles.envLabel}>hPa</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('deviceInfo')}</Text>
          <View style={styles.infoGrid}>
            <InfoRow label={t('locale')} value={record.locale.toUpperCase()} />
            <InfoRow label={t('deviceId')} value={record.device_id} small />
            <InfoRow label={t('modelVersion')} value={record.model_version} />
            <InfoRow label={t('appVersion')} value={record.app_version} />
            <InfoRow label={t('retryCount')} value={String(record.retry_count)} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, small && styles.infoValueSmall]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function SensorItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.sensorItem}>
      <Text style={styles.sensorLabel}>{label}</Text>
      <Text style={styles.sensorValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colors.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textDark,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  ripenessCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  ripenessLabel: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  confidenceText: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textDark,
  },
  serverIdText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.ripeOrange,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonDisabled: {
    opacity: 0.6,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  errorBox: {
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#E53935',
  },
  errorLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#E53935',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 13,
    color: '#C62828',
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textLight,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textLight,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textDark,
    flex: 1,
    textAlign: 'right',
  },
  infoValueSmall: {
    fontSize: 11,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sensorItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: '30%',
    flex: 1,
    alignItems: 'center',
  },
  sensorLabel: {
    fontSize: 11,
    color: Colors.textLight,
    marginBottom: 4,
  },
  sensorValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textDark,
  },
  envRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  envItem: {
    alignItems: 'center',
    gap: 6,
  },
  envValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textDark,
  },
  envLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 16,
  },
  backLink: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backLinkText: {
    fontSize: 16,
    color: Colors.leafGreen,
    fontWeight: '600' as const,
  },
});
