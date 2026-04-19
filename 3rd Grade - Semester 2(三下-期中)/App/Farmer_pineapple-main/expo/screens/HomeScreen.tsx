import { router } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { theme } from "@/constants/theme";
import { useAppStore } from "@/store/app-store";
import { Batch } from "@/types/models";

function getTodayBatchIds(batches: Batch[]): Set<string> {
  const today = new Date().toISOString().slice(0, 10);
  return new Set(batches.filter((batch) => batch.date.slice(0, 10) === today).map((batch) => batch.batch_id));
}

export default function HomeScreen() {
  const { batches, samples, tx } = useAppStore();

  const todayBatchIds = useMemo(() => getTodayBatchIds(batches), [batches]);

  const todayScanCount = useMemo(() => {
    return samples.filter((sample) => todayBatchIds.has(sample.batch_id)).length;
  }, [samples, todayBatchIds]);

  const todayAbnormalCount = useMemo(() => {
    return samples.filter((sample) => todayBatchIds.has(sample.batch_id) && sample.anomaly_flag === "isolate").length;
  }, [samples, todayBatchIds]);

  const inProgressBatches = useMemo(() => {
    return batches.filter((batch) => batch.status === "testing").length;
  }, [batches]);

  const recentBatches = useMemo(() => batches.slice(0, 4), [batches]);
  const activeBatch = useMemo(() => batches.find((batch) => batch.status === "testing") ?? recentBatches[0], [batches, recentBatches]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="home-screen">
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.eyebrow}>{tx("currentBatch")}</Text>
          <Text style={styles.heroTitle}>{tx("todayStats")}</Text>
          <Text style={styles.heroSubtitle}>{tx("homeOperationalSubtitle")}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard} testID="home-today-scans">
            <Text style={styles.statValue}>{todayScanCount}</Text>
            <Text style={styles.statLabel}>{tx("todaySamples")}</Text>
          </View>

          <View style={styles.statCard} testID="home-today-abnormal">
            <Text style={styles.statValue}>{todayAbnormalCount}</Text>
            <Text style={styles.statLabel}>{tx("todayAnomalies")}</Text>
          </View>

          <View style={styles.statCard} testID="home-in-progress-batches">
            <Text style={styles.statValue}>{inProgressBatches}</Text>
            <Text style={styles.statLabel}>{tx("inProgressBatches")}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsWrap}>
        <AppButton
          label={tx("startScan")}
          onPress={() => {
            if (activeBatch) {
              router.push(`/batches/${activeBatch.batch_id}/scan`);
              return;
            }
            router.push("/batches/create");
          }}
          style={styles.primaryButton}
          testID="dashboard-start-scan-btn"
        />

        <AppButton
          label={tx("newBatch")}
          onPress={() => router.push("/batches/create")}
          variant="secondary"
          style={styles.secondaryButton}
          testID="dashboard-create-batch-btn"
        />
      </View>

      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{tx("recentBatches")}</Text>
          <Text style={styles.sectionHint}>{tx("homeRecentHint")}</Text>
        </View>

        <View style={styles.listCard} testID="recent-batches-list">
          {recentBatches.length === 0 ? <Text style={styles.emptyText}>{tx("noData")}</Text> : null}
          {recentBatches.map((batch) => {
            const scannedCount = samples.filter((sample) => sample.batch_id === batch.batch_id).length;
            const badgeTone = batch.status === "done" ? styles.badgeDone : styles.badgeTesting;
            const badgeTextTone = batch.status === "done" ? styles.badgeDoneText : styles.badgeTestingText;

            return (
              <View key={batch.batch_id} style={styles.batchRow}>
                <View style={styles.batchMain}>
                  <Text style={styles.batchName}>{batch.name}</Text>
                  <Text style={styles.batchMeta}>{batch.block || "-"} · {batch.date}</Text>
                </View>

                <View style={styles.batchRight}>
                  <View style={[styles.statusBadge, badgeTone]}>
                    <Text style={[styles.statusBadgeText, badgeTextTone]}>
                      {batch.status === "done" ? tx("doneBatches") : tx("testingBatches")}
                    </Text>
                  </View>
                  <Text style={styles.batchProgress}>{scannedCount}/{batch.target_samples}</Text>
                </View>
              </View>
            );
          })}
        </View>
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
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 18,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#D9E2D1",
    padding: 20,
    gap: 18,
  },
  heroHeader: {
    gap: 6,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "800",
    color: "#5F6F5B",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    color: theme.colors.dark,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
    color: theme.colors.muted,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    minHeight: 122,
    borderRadius: 22,
    backgroundColor: "#F7FAF4",
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: "space-between",
  },
  statValue: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    color: theme.colors.dark,
  },
  statLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    color: theme.colors.muted,
  },
  actionsWrap: {
    gap: 12,
  },
  primaryButton: {
    minHeight: 78,
    borderRadius: 24,
    backgroundColor: "#2F7D32",
  },
  secondaryButton: {
    minHeight: 68,
    borderRadius: 22,
    backgroundColor: "#E4ECD9",
  },
  sectionWrap: {
    gap: 12,
  },
  sectionHeader: {
    gap: 4,
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
  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D9E2D1",
    padding: 10,
    gap: 10,
  },
  batchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#F7FAF4",
  },
  batchMain: {
    flex: 1,
    gap: 4,
  },
  batchName: {
    fontSize: 19,
    fontWeight: "800",
    color: theme.colors.text,
  },
  batchMeta: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.muted,
  },
  batchRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeDone: {
    backgroundColor: "#D9F2E3",
  },
  badgeTesting: {
    backgroundColor: "#E8EDD9",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  badgeDoneText: {
    color: "#146C43",
  },
  badgeTestingText: {
    color: "#556B2F",
  },
  batchProgress: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.dark,
  },
  emptyText: {
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.muted,
    textAlign: "center",
  },
});
