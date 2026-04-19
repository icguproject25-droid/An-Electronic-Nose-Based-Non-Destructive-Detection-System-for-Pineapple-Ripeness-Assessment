import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { PieChartSegment, RipenessPieChart } from "@/components/RipenessPieChart";
import { theme } from "@/constants/theme";
import { useAppStore } from "@/store/app-store";
import { Sample } from "@/types/models";
import { getBatchSamples } from "@/utils/metrics";

const RIPENESS_COLORS = {
  unripe: "#FFD93D",
  ripe: "#2ECC71",
  overripe: "#F28C28",
  abnormal: "#E74C3C",
} as const;

export default function BatchSummaryScreen() {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const { batches, samples, updateBatchStatus } = useAppStore();

  const batch = useMemo(() => batches.find((item) => item.batch_id === batchId), [batches, batchId]);
  const batchSamples = useMemo(() => getBatchSamples(samples, batchId ?? ""), [samples, batchId]);

  const chartSegments = useMemo((): PieChartSegment[] => {
    const getCount = (predicate: (sample: Sample) => boolean): number => batchSamples.filter(predicate).length;

    return [
      {
        key: "unripe",
        label: "未熟",
        color: RIPENESS_COLORS.unripe,
        value: getCount((sample) => sample.ripeness === "unripe" && sample.anomaly_flag !== "isolate"),
      },
      {
        key: "ripe",
        label: "完熟",
        color: RIPENESS_COLORS.ripe,
        value: getCount((sample) => sample.ripeness === "ripe" && sample.anomaly_flag !== "isolate"),
      },
      {
        key: "overripe",
        label: "過熟",
        color: RIPENESS_COLORS.overripe,
        value: getCount((sample) => sample.ripeness === "overripe" && sample.anomaly_flag !== "isolate"),
      },
      {
        key: "abnormal",
        label: "異常",
        color: RIPENESS_COLORS.abnormal,
        value: getCount((sample) => sample.anomaly_flag === "isolate"),
      },
    ];
  }, [batchSamples]);

  const shipment = useMemo(() => {
    return batchSamples.reduce(
      (acc, sample) => {
        if (sample.anomaly_flag === "isolate" || sample.ripeness === "overripe") {
          acc.processing += 1;
          return acc;
        }

        if (sample.ripeness === "ripe") {
          acc.canShip += 1;
          return acc;
        }

        acc.needRipen += 1;
        return acc;
      },
      { canShip: 0, needRipen: 0, processing: 0 },
    );
  }, [batchSamples]);

  if (!batch) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>暫無資料</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="batch-summary-screen">
      <Stack.Screen options={{ title: "批次總結" }} />

      <View style={styles.chartCard}>
        <RipenessPieChart
          totalLabel="總掃描數量"
          totalValue={batchSamples.length}
          segments={chartSegments}
          size={250}
          strokeWidth={48}
          testID="summary-ripeness-chart"
        />
      </View>

      <View style={styles.shipmentCard}>
        <Text style={styles.sectionTitle}>出貨建議</Text>

        <View style={styles.shipmentRow}>
          <Text style={styles.shipmentLabel}>可出貨</Text>
          <Text style={styles.shipmentValue}>{shipment.canShip}</Text>
        </View>

        <View style={styles.shipmentRow}>
          <Text style={styles.shipmentLabel}>需放熟</Text>
          <Text style={styles.shipmentValue}>{shipment.needRipen}</Text>
        </View>

        <View style={styles.shipmentRow}>
          <Text style={styles.shipmentLabel}>加工</Text>
          <Text style={styles.shipmentValue}>{shipment.processing}</Text>
        </View>
      </View>

      <AppButton
        label="完成批次"
        onPress={() => {
          updateBatchStatus(batch.batch_id, "done");
          router.replace("/");
        }}
        style={styles.primaryButton}
        testID="summary-complete"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF3EA",
  },
  content: {
    padding: 18,
    gap: 18,
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#D9E2D1",
    padding: 20,
  },
  shipmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#D9E2D1",
    padding: 18,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: theme.colors.dark,
  },
  shipmentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F8F0",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  shipmentLabel: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text,
  },
  shipmentValue: {
    fontSize: 30,
    fontWeight: "900",
    color: "#2F7D32",
  },
  primaryButton: {
    minHeight: 78,
    borderRadius: 24,
    backgroundColor: "#2F7D32",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.muted,
  },
});
