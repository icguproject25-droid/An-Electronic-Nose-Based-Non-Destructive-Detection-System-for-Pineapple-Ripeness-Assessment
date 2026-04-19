import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { theme } from "@/constants/theme";
import { useAppStore } from "@/store/app-store";

export default function ScanEntryScreen() {
  const { batches, tx } = useAppStore();
  const latestTesting = batches.find((item) => item.status === "testing") ?? batches[0];

  return (
    <View style={styles.container} testID="scan-entry-screen">
      <View style={styles.card}>
        <Text style={styles.title}>{latestTesting ? latestTesting.name : tx("currentBatch")}</Text>
        <Text style={styles.subtitle}>{latestTesting ? `${tx("progress")} ${latestTesting.target_samples}` : tx("recentActiveBatch")}</Text>
        <AppButton
          label={tx("startScan")}
          onPress={() => {
            if (latestTesting) {
              router.push(`/batches/${latestTesting.batch_id}/scan`);
              return;
            }
            router.push("/batches/create");
          }}
          style={styles.primaryButton}
          testID="scan-entry-start"
        />
        <AppButton
          label={tx("newBatch")}
          onPress={() => router.push("/batches/create")}
          variant="secondary"
          style={styles.secondaryButton}
          testID="scan-entry-create"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: 18,
    justifyContent: "center",
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 22,
    gap: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: theme.colors.dark,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.muted,
    textAlign: "center",
  },
  primaryButton: {
    minHeight: 74,
    borderRadius: 22,
    backgroundColor: "#2F7D32",
  },
  secondaryButton: {
    minHeight: 64,
    borderRadius: 20,
    backgroundColor: "#E9EFE5",
  },
});
