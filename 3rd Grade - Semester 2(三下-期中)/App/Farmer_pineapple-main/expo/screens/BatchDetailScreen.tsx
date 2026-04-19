import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { StatCard } from "@/components/StatCard";
import { theme } from "@/constants/theme";
import { buildBatchCsv } from "@/services/csv";
import { useAppStore } from "@/store/app-store";
import { exportCsvFile } from "@/utils/export";
import { getBatchSamples, getBatchStats } from "@/utils/metrics";

export default function BatchDetailScreen() {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const { batches, samples, updateBatchStatus, tx } = useAppStore();
  const batch = useMemo(() => batches.find((item) => item.batch_id === batchId), [batches, batchId]);
  const batchSamples = useMemo(() => getBatchSamples(samples, batchId ?? ""), [samples, batchId]);
  const stats = useMemo(() => getBatchStats(batchSamples), [batchSamples]);

  if (!batch) {
    return <View style={styles.emptyWrap}><Text>{tx("noData")}</Text></View>;
  }

  const onExport = async (): Promise<void> => {
    const built = buildBatchCsv(batch, batchSamples);
    await exportCsvFile(built.fileName, built.content);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="batch-detail-screen">
      <Stack.Screen options={{ title: batch.name }} />
      <View style={styles.box}>
        <Text style={styles.title}>{batch.name}</Text>
        <Text style={styles.meta}>{batch.date.slice(0, 10)} · {batch.block} · {batch.cultivar}</Text>
        <Text style={styles.meta}>{tx("progress")}: {batchSamples.length}/{batch.target_samples}</Text>
      </View>

      <View style={styles.row}>
        <StatCard label="Unripe" value={String(stats.unripe)} />
        <StatCard label="Ripe" value={String(stats.ripe)} />
      </View>
      <View style={styles.row}>
        <StatCard label="Overripe" value={String(stats.overripe)} />
        <StatCard label={tx("avgBrix")} value={String(stats.avgBrix)} />
      </View>
      <View style={styles.row}>
        <StatCard label="Blackheart" value={String(stats.blackheartRisk)} />
        <StatCard label={tx("isolate")} value={String(stats.isolate)} />
      </View>

      <AppButton label={tx("startScan")} onPress={() => router.push(`/batches/${batch.batch_id}/scan`)} testID="detail-start-scan" />
      <AppButton label={tx("details")} onPress={() => router.push(`/batches/${batch.batch_id}/summary`)} variant="secondary" testID="detail-summary" />
      <AppButton label={tx("exportCsv")} onPress={onExport} variant="secondary" testID="detail-export" />
      <AppButton
        label={tx("completeBatch")}
        onPress={() => updateBatchStatus(batch.batch_id, "done")}
        variant="primary"
        testID="detail-complete"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 12, gap: 10 },
  box: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: 12,
    gap: 4,
  },
  title: { fontSize: 20, fontWeight: "800", color: theme.colors.dark },
  meta: { color: theme.colors.muted },
  row: { flexDirection: "row", gap: 8 },
  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
});
