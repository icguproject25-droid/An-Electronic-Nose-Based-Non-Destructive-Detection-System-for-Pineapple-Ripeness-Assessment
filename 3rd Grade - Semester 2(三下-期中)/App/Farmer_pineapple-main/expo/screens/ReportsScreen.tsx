import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from "react-native";

import { PieChartSegment, RipenessPieChart } from "@/components/RipenessPieChart";
import { theme } from "@/constants/theme";
import { useAppStore } from "@/store/app-store";
import { Batch, Sample } from "@/types/models";

type RangeFilter = 7 | 30;

interface TrendPoint {
  label: string;
  batches: number;
  scans: number;
  anomalyRate: number;
}

const QUALITY_COLORS = {
  unripe: "#FFD93D",
  initialRipe: "#A8E06E",
  ripe: "#2ECC71",
  overripe: "#F28C28",
} as const;

function getRangeStart(range: RangeFilter): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (range - 1));
  return date;
}

function formatShortDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${month}/${day}`;
}

function isBatchInRange(batch: Batch, startDate: Date): boolean {
  const batchDate = new Date(batch.date);
  return !Number.isNaN(batchDate.getTime()) && batchDate >= startDate;
}

export default function ReportsScreen() {
  const { batches, samples, tx } = useAppStore();
  const [range, setRange] = useState<RangeFilter>(7);

  const filteredData = useMemo(() => {
    const startDate = getRangeStart(range);
    const relevantBatches = batches.filter((batch) => isBatchInRange(batch, startDate));
    const batchIds = new Set(relevantBatches.map((batch) => batch.batch_id));
    const relevantSamples = samples.filter((sample) => batchIds.has(sample.batch_id));

    return { relevantBatches, relevantSamples };
  }, [batches, range, samples]);

  const chartSegments = useMemo((): PieChartSegment[] => {
    const getCount = (predicate: (sample: Sample) => boolean): number => filteredData.relevantSamples.filter(predicate).length;
    const isNormalSample = (sample: Sample): boolean => sample.anomaly_flag !== "isolate";
    const isInitialRipe = (sample: Sample): boolean => sample.ripeness === "ripe" && sample.tss_brix < 15;
    const isRipe = (sample: Sample): boolean => sample.ripeness === "ripe" && sample.tss_brix >= 15;

    return [
      {
        key: "unripe",
        label: tx("unripe"),
        color: QUALITY_COLORS.unripe,
        value: getCount((sample) => sample.ripeness === "unripe" && isNormalSample(sample)),
      },
      {
        key: "initialRipe",
        label: tx("initialRipe"),
        color: QUALITY_COLORS.initialRipe,
        value: getCount((sample) => isInitialRipe(sample) && isNormalSample(sample)),
      },
      {
        key: "ripe",
        label: tx("ripe"),
        color: QUALITY_COLORS.ripe,
        value: getCount((sample) => isRipe(sample) && isNormalSample(sample)),
      },
      {
        key: "overripe",
        label: tx("overripe"),
        color: QUALITY_COLORS.overripe,
        value: getCount((sample) => sample.ripeness === "overripe" && isNormalSample(sample)),
      },
    ];
  }, [filteredData.relevantSamples, tx]);

  const chartTotal = useMemo(() => {
    return chartSegments.reduce((sum, segment) => sum + segment.value, 0);
  }, [chartSegments]);

  const summary = useMemo(() => {
    const completedBatches = filteredData.relevantBatches.filter((batch) => batch.status === "done").length;
    const totalScans = filteredData.relevantSamples.length;
    const abnormalCount = filteredData.relevantSamples.filter((sample) => sample.anomaly_flag === "isolate").length;
    const averageAnomalyRate = totalScans > 0 ? Math.round((abnormalCount / totalScans) * 100) : 0;

    return {
      completedBatches,
      totalScans,
      averageAnomalyRate,
    };
  }, [filteredData.relevantBatches, filteredData.relevantSamples]);

  const trendData = useMemo((): TrendPoint[] => {
    const startDate = getRangeStart(range);
    const points: TrendPoint[] = [];

    for (let index = 0; index < range; index += 1) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + index);
      const key = day.toISOString().slice(0, 10);
      const dayBatches = filteredData.relevantBatches.filter((batch) => batch.date.slice(0, 10) === key);
      const dayBatchIds = new Set(dayBatches.map((batch) => batch.batch_id));
      const daySamples = filteredData.relevantSamples.filter((sample) => dayBatchIds.has(sample.batch_id));
      const anomalyCount = daySamples.filter((sample) => sample.anomaly_flag === "isolate").length;

      points.push({
        label: formatShortDate(day),
        batches: dayBatches.length,
        scans: daySamples.length,
        anomalyRate: daySamples.length > 0 ? Math.round((anomalyCount / daySamples.length) * 100) : 0,
      });
    }

    return points.filter((point) => point.batches > 0 || point.scans > 0);
  }, [filteredData.relevantBatches, filteredData.relevantSamples, range]);

  const trendMax = useMemo(() => {
    const values = trendData.flatMap((point) => [point.scans, point.batches]);
    return Math.max(...values, 1);
  }, [trendData]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="reports-screen">
      <View style={styles.headerCard}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{tx("historicalReports")}</Text>
          <Text style={styles.headerSubtitle}>{tx("reportsHistoricalSubtitle")}</Text>
        </View>

        <View style={styles.filterRow} testID="reports-range-filter">
          <Pressable
            onPress={() => setRange(7)}
            style={[styles.filterChip, range === 7 ? styles.filterChipActive : null]}
            testID="reports-filter-7"
          >
            <Text style={[styles.filterChipText, range === 7 ? styles.filterChipTextActive : null]}>{tx("last7Days")}</Text>
          </Pressable>

          <Pressable
            onPress={() => setRange(30)}
            style={[styles.filterChip, range === 30 ? styles.filterChipActive : null]}
            testID="reports-filter-30"
          >
            <Text style={[styles.filterChipText, range === 30 ? styles.filterChipTextActive : null]}>{tx("last30Days")}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.chartCard}>
        <RipenessPieChart
          title={tx("qualityDistribution")}
          totalLabel={tx("totalScanned")}
          totalValue={chartTotal}
          segments={chartSegments}
          size={264}
          strokeWidth={50}
          testID="reports-quality-chart"
        />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>{tx("summaryTitle")}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem} testID="reports-completed-batches">
            <Text style={styles.summaryValue}>{summary.completedBatches}</Text>
            <Text style={styles.summaryLabel}>{tx("completedBatchCount")}</Text>
          </View>
          <View style={styles.summaryItem} testID="reports-total-scans">
            <Text style={styles.summaryValue}>{summary.totalScans}</Text>
            <Text style={styles.summaryLabel}>{tx("totalScanCount")}</Text>
          </View>
          <View style={styles.summaryItem} testID="reports-average-anomaly-rate">
            <Text style={styles.summaryValue}>{summary.averageAnomalyRate}%</Text>
            <Text style={styles.summaryLabel}>{tx("averageAnomalyRate")}</Text>
          </View>
        </View>
      </View>

      <View style={styles.trendCard}>
        <View style={styles.trendHeader}>
          <Text style={styles.sectionTitle}>{tx("trendAnalysis")}</Text>
          <Text style={styles.sectionHint}>{tx("trendHint")}</Text>
        </View>

        {trendData.length === 0 ? (
          <Text style={styles.emptyText}>{tx("noData")}</Text>
        ) : (
          trendData.map((point) => {
            const scanWidth: ViewStyle = {
              width: `${Math.max((point.scans / trendMax) * 100, point.scans > 0 ? 12 : 0)}%`,
            };
            const batchWidth: ViewStyle = {
              width: `${Math.max((point.batches / trendMax) * 100, point.batches > 0 ? 12 : 0)}%`,
            };

            return (
              <View key={point.label} style={styles.trendRow} testID={`trend-${point.label}`}>
                <View style={styles.trendTopRow}>
                  <Text style={styles.trendLabel}>{point.label}</Text>
                  <Text style={styles.trendMeta}>{point.scans} · {point.anomalyRate}%</Text>
                </View>

                <View style={styles.trendBarTrack}>
                  <View style={[styles.trendBarScan, scanWidth]} />
                  <View style={[styles.trendBarBatch, batchWidth]} />
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF3EA",
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 90,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#D9E2D1",
    padding: 18,
    gap: 16,
  },
  headerTextWrap: {
    gap: 6,
  },
  headerTitle: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    color: theme.colors.dark,
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
    color: theme.colors.muted,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
  },
  filterChip: {
    flex: 1,
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: "#EDF1E7",
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: "#2F7D32",
  },
  filterChipText: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#D9E2D1",
    paddingVertical: 22,
    paddingHorizontal: 16,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#D9E2D1",
    padding: 18,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: theme.colors.dark,
  },
  sectionHint: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.muted,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryItem: {
    flex: 1,
    minHeight: 118,
    borderRadius: 20,
    backgroundColor: "#F7FAF4",
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: "space-between",
  },
  summaryValue: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    color: theme.colors.dark,
  },
  summaryLabel: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    color: theme.colors.muted,
  },
  trendCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#D9E2D1",
    padding: 18,
    gap: 14,
  },
  trendHeader: {
    gap: 4,
  },
  trendRow: {
    gap: 8,
  },
  trendTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trendLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text,
  },
  trendMeta: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.muted,
  },
  trendBarTrack: {
    gap: 6,
  },
  trendBarScan: {
    height: 12,
    borderRadius: 999,
    backgroundColor: "#2F7D32",
  },
  trendBarBatch: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#A8C98E",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.muted,
    paddingVertical: 8,
  },
});
