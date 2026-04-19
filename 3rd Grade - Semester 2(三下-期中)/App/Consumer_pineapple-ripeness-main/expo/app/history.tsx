import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Trash2, RefreshCw, Clock, CheckCircle, XCircle, Download, TrendingUp, BarChart3, FileText } from 'lucide-react-native';
import Svg, { Path, Circle as SvgCircle, Line, Text as SvgText, G } from 'react-native-svg';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHistory } from '@/contexts/HistoryContext';
import { ScanRecord, UploadStatus } from '@/types/scanRecord';
import { estimateTSS, calculateQualityScore, getVOCAverage, getRiskLevel, getRiskColor } from '@/utils/qualityScore';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { records, isLoading, isRetrying, clearHistory, retryUpload, refreshRecords } = useHistory();
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) =>
      new Date(b.created_at_iso).getTime() - new Date(a.created_at_iso).getTime()
    );
  }, [records]);

  const todayRecords = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return sortedRecords.filter(r => r.created_at_iso.startsWith(todayStr));
  }, [sortedRecords]);

  const todayStats = useMemo(() => {
    if (todayRecords.length === 0) return null;
    const tssValues = todayRecords.map(r => estimateTSS(r));
    const avgTss = tssValues.reduce((a, b) => a + b, 0) / tssValues.length;

    const ripenessCount = { Unripe: 0, Transition: 0, Ripe: 0, Overripe: 0 };
    todayRecords.forEach(r => { ripenessCount[r.ripeness_pred]++; });

    const abnormalCount = todayRecords.filter(r => r.anomaly_flag !== 'none').length;
    const abnormalPct = (abnormalCount / todayRecords.length) * 100;

    return {
      count: todayRecords.length,
      avgTss: Math.round(avgTss * 10) / 10,
      ripenessCount,
      abnormalPct: Math.round(abnormalPct * 10) / 10,
    };
  }, [todayRecords]);

  const trendData = useMemo(() => {
    const sorted = [...records].sort((a, b) =>
      new Date(a.created_at_iso).getTime() - new Date(b.created_at_iso).getTime()
    );
    return sorted.map(r => ({
      time: new Date(r.created_at_iso),
      tss: estimateTSS(r),
    }));
  }, [records]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      t('clearHistory'),
      t('clearHistoryConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clearAll'),
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
          }
        },
      ]
    );
  }, [t, clearHistory]);

  const handleRetry = useCallback(async (localId: string) => {
    setRetryingId(localId);
    await retryUpload(localId);
    setRetryingId(null);
  }, [retryUpload]);

  const handleItemPress = useCallback((record: ScanRecord) => {
    router.push({
      pathname: '/history-detail' as any,
      params: { id: record.local_id },
    });
  }, [router]);

  const handleExportCsv = useCallback(async () => {
    if (records.length === 0) return;
    setIsExporting(true);
    try {
      const header = 'Date,Time,Ripeness,TSS,Anomaly,Quality Score\n';
      const rows = sortedRecords.map(r => {
        const d = new Date(r.created_at_iso);
        const date = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
        const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        const tss = estimateTSS(r);
        const qs = calculateQualityScore(r);
        const anomaly = r.anomaly_flag !== 'none' ? r.anomaly_flag : 'none';
        return `${date},${time},${r.ripeness_pred},${tss},${anomaly},${qs}`;
      }).join('\n');
      const csvContent = header + rows;

      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pineapple_quality_${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        Alert.alert(t('exportCsv'), t('csvExported'));
      } else {
        const file = new File(Paths.cache, `pineapple_quality_${Date.now()}.csv`);
        file.create();
        file.write(csvContent);
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(file.uri, {
            mimeType: 'text/csv',
            dialogTitle: t('exportCsv'),
          });
        } else {
          Alert.alert(t('exportCsv'), t('csvExported'));
        }
      }
    } catch (error) {
      console.log('[History] CSV export failed:', error);
      Alert.alert(t('exportCsv'), t('csvExportFailed'));
    } finally {
      setIsExporting(false);
    }
  }, [records, sortedRecords, t]);

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'uploaded':
        return <CheckCircle size={16} color={Colors.freshGreen} />;
      case 'failed':
        return <XCircle size={16} color="#E53935" />;
      case 'pending':
        return <Clock size={16} color={Colors.ripeOrange} />;
    }
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

  const renderStatsBlock = () => {
    if (!todayStats || todayStats.count === 0) return null;

    const { ripenessCount, count } = todayStats;
    const pieData = [
      { label: 'Unripe', value: ripenessCount.Unripe, color: Colors.unripeGreen },
      { label: 'Transition', value: ripenessCount.Transition, color: Colors.transitionYellow },
      { label: 'Ripe', value: ripenessCount.Ripe, color: Colors.freshGreen },
      { label: 'Overripe', value: ripenessCount.Overripe, color: Colors.overripeBrown },
    ].filter(d => d.value > 0);

    const pieSize = 100;
    const pieRadius = 40;
    const pieCenter = pieSize / 2;

    let cumAngle = -Math.PI / 2;
    const arcs = pieData.map(d => {
      const angle = (d.value / count) * Math.PI * 2;
      const startAngle = cumAngle;
      const endAngle = cumAngle + angle;
      cumAngle = endAngle;

      const largeArc = angle > Math.PI ? 1 : 0;
      const x1 = pieCenter + pieRadius * Math.cos(startAngle);
      const y1 = pieCenter + pieRadius * Math.sin(startAngle);
      const x2 = pieCenter + pieRadius * Math.cos(endAngle);
      const y2 = pieCenter + pieRadius * Math.sin(endAngle);

      if (pieData.length === 1) {
        return {
          path: `M ${pieCenter} ${pieCenter - pieRadius} A ${pieRadius} ${pieRadius} 0 1 1 ${pieCenter - 0.01} ${pieCenter - pieRadius} Z`,
          color: d.color,
          label: d.label,
          value: d.value,
          pct: Math.round((d.value / count) * 100),
        };
      }

      return {
        path: `M ${pieCenter} ${pieCenter} L ${x1} ${y1} A ${pieRadius} ${pieRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: d.color,
        label: d.label,
        value: d.value,
        pct: Math.round((d.value / count) * 100),
      };
    });

    return (
      <View style={styles.statsBlock}>
        <View style={styles.statsTitleRow}>
          <BarChart3 size={18} color={Colors.pineappleGold} />
          <Text style={styles.statsTitle}>{t('todayAnalysis')}</Text>
        </View>

        <View style={styles.statsTopRow}>
          <View style={styles.statBubble}>
            <Text style={styles.statBubbleValue}>{todayStats.count}</Text>
            <Text style={styles.statBubbleLabel}>{t('todayScans')}</Text>
          </View>
          <View style={styles.statBubble}>
            <Text style={styles.statBubbleValue}>{todayStats.avgTss}°</Text>
            <Text style={styles.statBubbleLabel}>{t('avgTSS')}</Text>
          </View>
          <View style={[styles.statBubble, todayStats.abnormalPct > 0 && styles.statBubbleDanger]}>
            <Text style={[styles.statBubbleValue, todayStats.abnormalPct > 0 && styles.statBubbleValueDanger]}>{todayStats.abnormalPct}%</Text>
            <Text style={[styles.statBubbleLabel, todayStats.abnormalPct > 0 && styles.statBubbleLabelDanger]}>{t('abnormalRate')}</Text>
          </View>
        </View>

        <View style={styles.pieSection}>
          <Svg width={pieSize} height={pieSize}>
            {arcs.map((arc, i) => (
              <Path key={i} d={arc.path} fill={arc.color} />
            ))}
            <SvgCircle cx={pieCenter} cy={pieCenter} r={20} fill={Colors.white} />
            <SvgText x={pieCenter} y={pieCenter + 4} textAnchor="middle" fontSize={12} fontWeight="bold" fill={Colors.textDark}>
              {count}
            </SvgText>
          </Svg>
          <View style={styles.pieLegend}>
            {arcs.map((arc, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: arc.color }]} />
                <Text style={styles.legendLabel}>{arc.label}</Text>
                <Text style={styles.legendValue}>{arc.pct}%</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderTrendChart = () => {
    if (trendData.length < 2) return null;

    const chartWidth = SCREEN_WIDTH - 72;
    const chartHeight = 140;
    const paddingLeft = 36;
    const paddingRight = 12;
    const paddingTop = 16;
    const paddingBottom = 28;
    const graphWidth = chartWidth - paddingLeft - paddingRight;
    const graphHeight = chartHeight - paddingTop - paddingBottom;

    const tssValues = trendData.map(d => d.tss);
    const minTss = Math.floor(Math.min(...tssValues) - 1);
    const maxTss = Math.ceil(Math.max(...tssValues) + 1);
    const tssRange = maxTss - minTss || 1;

    const timeMin = trendData[0].time.getTime();
    const timeMax = trendData[trendData.length - 1].time.getTime();
    const timeRange = timeMax - timeMin || 1;

    const points = trendData.map(d => ({
      x: paddingLeft + ((d.time.getTime() - timeMin) / timeRange) * graphWidth,
      y: paddingTop + (1 - (d.tss - minTss) / tssRange) * graphHeight,
    }));

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    const gridLines = 4;
    const gridYValues = Array.from({ length: gridLines }, (_, i) => {
      const val = minTss + (tssRange / (gridLines - 1)) * i;
      return { val: Math.round(val * 10) / 10, y: paddingTop + (1 - (val - minTss) / tssRange) * graphHeight };
    });

    return (
      <View style={styles.trendBlock}>
        <View style={styles.statsTitleRow}>
          <TrendingUp size={18} color={Colors.ripeOrange} />
          <Text style={styles.statsTitle}>{t('trendChart')}</Text>
        </View>
        <Text style={styles.trendSubtitle}>{t('tssOverTime')}</Text>
        <Svg width={chartWidth} height={chartHeight}>
          {gridYValues.map((g, i) => (
            <G key={i}>
              <Line x1={paddingLeft} y1={g.y} x2={chartWidth - paddingRight} y2={g.y} stroke="#E8E8E8" strokeWidth={1} />
              <SvgText x={paddingLeft - 6} y={g.y + 4} textAnchor="end" fontSize={10} fill={Colors.textLight}>
                {g.val}
              </SvgText>
            </G>
          ))}
          <Path d={linePath} fill="none" stroke={Colors.ripeOrange} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => (
            <SvgCircle key={i} cx={p.x} cy={p.y} r={3.5} fill={Colors.ripeOrange} stroke={Colors.white} strokeWidth={1.5} />
          ))}
          <SvgText x={points[0].x} y={chartHeight - 4} textAnchor="start" fontSize={9} fill={Colors.textLight}>
            {formatTime(trendData[0].time.toISOString())}
          </SvgText>
          <SvgText x={points[points.length - 1].x} y={chartHeight - 4} textAnchor="end" fontSize={9} fill={Colors.textLight}>
            {formatTime(trendData[trendData.length - 1].time.toISOString())}
          </SvgText>
        </Svg>
      </View>
    );
  };

  const renderItem = ({ item }: { item: ScanRecord }) => {
    const isRetryingThis = retryingId === item.local_id;
    const canRetry = item.upload_status !== 'uploaded';
    const risk = getRiskLevel(item);
    const riskColor = getRiskColor(risk);
    const tss = estimateTSS(item);
    const qualityScore = calculateQualityScore(item);
    const vocAvg = getVOCAverage(item);

    return (
      <TouchableOpacity
        style={styles.recordItem}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.riskBar, { backgroundColor: riskColor }]} />

        <View style={styles.recordContent}>
          <View style={styles.recordHeader}>
            <View style={styles.recordDateBlock}>
              <Text style={styles.recordDate}>{formatDate(item.created_at_iso)}</Text>
              <Text style={styles.recordTime}>{formatTime(item.created_at_iso)}</Text>
            </View>
            <View style={styles.recordHeaderRight}>
              <View style={styles.qualityBadge}>
                <Text style={styles.qualityBadgeText}>{qualityScore}</Text>
                <Text style={styles.qualityBadgeUnit}>{t('scoreUnit')}</Text>
              </View>
              {getStatusIcon(item.upload_status)}
            </View>
          </View>

          <View style={styles.recordBody}>
            <View style={[styles.ripenessBadge, { backgroundColor: getRipenessColor(item.ripeness_pred) }]}>
              <Text style={styles.ripenessText}>{item.ripeness_pred}</Text>
            </View>
            <Text style={styles.tssText}>TSS: {tss}°</Text>
            {item.fruit_id && (
              <Text style={styles.fruitIdText}>ID: {item.fruit_id}</Text>
            )}
          </View>

          <View style={styles.sensorSummary}>
            <View style={styles.sensorMiniItem}>
              <Text style={styles.sensorMiniLabel}>{t('vocAvg')}</Text>
              <Text style={styles.sensorMiniValue}>{vocAvg.toFixed(0)}</Text>
            </View>
            <View style={styles.sensorMiniDivider} />
            <View style={styles.sensorMiniItem}>
              <Text style={styles.sensorMiniLabel}>MQ-9</Text>
              <Text style={styles.sensorMiniValue}>{item.MQ9_raw.toFixed(0)}</Text>
            </View>
            <View style={styles.sensorMiniDivider} />
            <View style={styles.sensorMiniItem}>
              <Text style={styles.sensorMiniLabel}>{t('envTemp')}</Text>
              <Text style={styles.sensorMiniValue}>{item.Temp_C.toFixed(1)}°</Text>
            </View>
            <View style={styles.sensorMiniDivider} />
            <View style={styles.sensorMiniItem}>
              <Text style={styles.sensorMiniLabel}>{t('envHumidity')}</Text>
              <Text style={styles.sensorMiniValue}>{item.Humidity_pct.toFixed(0)}%</Text>
            </View>
          </View>

          {canRetry && (
            <TouchableOpacity
              style={[styles.retryButton, isRetryingThis && styles.retryButtonDisabled]}
              onPress={() => handleRetry(item.local_id)}
              disabled={isRetryingThis}
            >
              {isRetryingThis ? (
                <ActivityIndicator size="small" color={Colors.ripeOrange} />
              ) : (
                <>
                  <RefreshCw size={13} color={Colors.ripeOrange} />
                  <Text style={styles.retryText}>{t('retryUpload')}</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {item.last_error && (
            <Text style={styles.errorText} numberOfLines={1}>{item.last_error}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderListHeader = useCallback(() => {
    return (
      <View>
        {renderStatsBlock()}
        {renderTrendChart()}
      </View>
    );
  }, [todayStats, trendData, t]);

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
        <Text style={styles.title}>{t('qualityDashboard')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={handleExportCsv}
            disabled={isExporting || records.length === 0}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={Colors.freshGreen} />
            ) : (
              <FileText size={22} color={records.length > 0 ? Colors.freshGreen : Colors.textLight} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={handleClearAll}
            disabled={records.length === 0}
          >
            <Trash2 size={22} color={records.length > 0 ? '#E53935' : Colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.pineappleYellow} />
        </View>
      ) : records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Clock size={60} color={Colors.textLight} />
          <Text style={styles.emptyText}>{t('noHistory')}</Text>
        </View>
      ) : (
        <FlatList
          data={sortedRecords}
          keyExtractor={(item) => item.local_id}
          renderItem={renderItem}
          ListHeaderComponent={renderListHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          onRefresh={refreshRecords}
          refreshing={isRetrying}
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: Colors.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEECC',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textDark,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerActionButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  statsBlock: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textDark,
  },
  statsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  statBubble: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9F7EC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  statBubbleDanger: {
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
  },
  statBubbleValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textDark,
  },
  statBubbleValueDanger: {
    color: '#E53935',
  },
  statBubbleLabel: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
    textAlign: 'center',
  },
  statBubbleLabelDanger: {
    color: '#E53935',
  },
  pieSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pieLegend: {
    flex: 1,
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: Colors.textLight,
    flex: 1,
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textDark,
  },
  trendBlock: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  trendSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 10,
  },
  recordItem: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  riskBar: {
    width: 5,
  },
  recordContent: {
    flex: 1,
    padding: 14,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  recordDateBlock: {
    flex: 1,
  },
  recordDate: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textDark,
  },
  recordTime: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 1,
  },
  recordHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#F0F8E8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  qualityBadgeText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.leafGreen,
  },
  qualityBadgeUnit: {
    fontSize: 9,
    color: Colors.leafGreen,
    marginLeft: 2,
  },
  recordBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  ripenessBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ripenessText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  tssText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.pineappleGold,
  },
  fruitIdText: {
    fontSize: 11,
    color: Colors.textLight,
  },
  sensorSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAF4',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  sensorMiniItem: {
    flex: 1,
    alignItems: 'center',
  },
  sensorMiniLabel: {
    fontSize: 9,
    color: Colors.textLight,
    marginBottom: 2,
  },
  sensorMiniValue: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textDark,
  },
  sensorMiniDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E8E8E0',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
  },
  retryButtonDisabled: {
    opacity: 0.6,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.ripeOrange,
  },
  errorText: {
    fontSize: 10,
    color: '#E53935',
    marginTop: 6,
  },
});
