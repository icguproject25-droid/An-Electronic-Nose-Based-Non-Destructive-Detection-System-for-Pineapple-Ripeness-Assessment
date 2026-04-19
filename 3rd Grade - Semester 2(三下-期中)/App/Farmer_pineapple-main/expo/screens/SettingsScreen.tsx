import React, { useState } from "react";
import { Alert, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { theme } from "@/constants/theme";
import { ping } from "@/services/api";
import { useAppStore } from "@/store/app-store";

export default function SettingsScreen() {
  const { settings, setLanguage, updateSettings, tx, unsyncedBatchCount, clearLocal, markAllSynced } = useAppStore();
  const [backendUrl, setBackendUrl] = useState<string>(settings.backendUrl);

  const onTest = async (): Promise<void> => {
    updateSettings({ backendUrl });
    const res = await ping(backendUrl);
    Alert.alert(tx("testConnection"), res.ok ? tx("connected") : tx("failed"));
    if (res.ok) {
      markAllSynced();
    }
  };

  const onClear = (): void => {
    Alert.alert(tx("clearLocal"), tx("confirmClear"), [
      { text: tx("cancel"), style: "cancel" },
      {
        text: tx("confirm"),
        style: "destructive",
        onPress: () => {
          clearLocal().catch((error) => {
            console.log("[settings.clearLocal]", error);
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container} testID="settings-screen">
      <View style={styles.card}>
        <Text style={styles.label}>{tx("language")}</Text>
        <View style={styles.rowBetween}>
          <Text>中文</Text>
          <Switch value={settings.language === "en"} onValueChange={(v) => setLanguage(v ? "en" : "zh")} testID="language-switch" />
          <Text>English</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{tx("thresholds")}</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(settings.thresholds.exportBrix)}
          onChangeText={(v) =>
            updateSettings({
              thresholds: {
                ...settings.thresholds,
                exportBrix: Number(v) || 15,
              },
            })
          }
          placeholder="Export Brix"
          testID="export-brix-input"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(settings.thresholds.domesticBrix)}
          onChangeText={(v) =>
            updateSettings({
              thresholds: {
                ...settings.thresholds,
                domesticBrix: Number(v) || 13,
              },
            })
          }
          placeholder="Domestic Brix"
          testID="domestic-brix-input"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(settings.thresholds.samplingRatio)}
          onChangeText={(v) =>
            updateSettings({
              thresholds: {
                ...settings.thresholds,
                samplingRatio: Number(v) || 0.12,
              },
            })
          }
          placeholder="Sampling Ratio"
          testID="sampling-ratio-input"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{tx("apiConfig")}</Text>
        <TextInput style={styles.input} value={backendUrl} onChangeText={setBackendUrl} placeholder="https://api.example.com" testID="backend-url-input" />
        <AppButton label={tx("testConnection")} onPress={onTest} testID="test-connection-btn" />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{tx("offlineData")}</Text>
        <Text style={styles.info}>{tx("unsyncedCount")}: {unsyncedBatchCount}</Text>
        <AppButton label={tx("clearLocal")} onPress={onClear} variant="danger" testID="clear-local-btn" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 12, gap: 10 },
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: 12,
    gap: 8,
  },
  label: { fontSize: 16, fontWeight: "800", color: theme.colors.dark },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 10,
    backgroundColor: "#FBFDFF",
  },
  info: { color: theme.colors.text },
});
