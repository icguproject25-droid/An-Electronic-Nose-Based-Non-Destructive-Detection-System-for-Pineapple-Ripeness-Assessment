import { router, Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { theme } from "@/constants/theme";
import { useAppStore } from "@/store/app-store";
import { clamp, formatDate } from "@/utils/helpers";

const AREAS = ["A區", "B區", "C區"] as const;

export default function CreateBatchScreen() {
  const { createBatch } = useAppStore();
  const today = useMemo(() => formatDate(new Date().toISOString()), []);
  const [area, setArea] = useState<(typeof AREAS)[number]>("A區");
  const [harvestCount, setHarvestCount] = useState<string>("100");

  const harvestValue = useMemo(() => Number(harvestCount) || 0, [harvestCount]);
  const suggestedSamples = useMemo(() => {
    if (harvestValue <= 0) {
      return 10;
    }
    return clamp(Math.round(harvestValue * 0.1), 10, 20);
  }, [harvestValue]);

  const onCreate = (): void => {
    const created = createBatch({
      name: `${today} ${area}`,
      date: today,
      block: area,
      cultivar: "",
      harvest_count: harvestValue,
      purpose: "unknown",
      target_samples: suggestedSamples,
    });

    console.log("[create.batch.farmer]", created);
    router.replace(`/batches/${created.batch_id}/scan`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="create-batch-screen">
      <Stack.Screen options={{ title: "建立今日批次" }} />

      <View style={styles.headerCard}>
        <Text style={styles.title}>建立今日批次</Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>日期</Text>
          <View style={styles.staticField}>
            <Text style={styles.staticFieldText}>{today}</Text>
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>農地區域</Text>
          <View style={styles.areaRow}>
            {AREAS.map((item) => {
              const isActive = item === area;
              return (
                <Pressable
                  key={item}
                  onPress={() => setArea(item)}
                  style={[styles.areaButton, isActive ? styles.areaButtonActive : null]}
                  testID={`area-${item}`}
                >
                  <Text style={[styles.areaButtonText, isActive ? styles.areaButtonTextActive : null]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>收成數量</Text>
          <TextInput
            style={styles.input}
            value={harvestCount}
            onChangeText={setHarvestCount}
            keyboardType="numeric"
            placeholder="0"
            testID="harvest-input"
          />
        </View>

        <View style={styles.suggestionCard}>
          <Text style={styles.suggestionLabel}>建議檢測數量</Text>
          <Text style={styles.suggestionValue}>{suggestedSamples}</Text>
        </View>
      </View>

      <AppButton label="建立並開始掃描" onPress={onCreate} style={styles.submitButton} testID="create-scan-btn" />
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
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#D9E2D1",
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: theme.colors.dark,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#D9E2D1",
    padding: 18,
    gap: 20,
  },
  fieldWrap: {
    gap: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
  },
  staticField: {
    minHeight: 64,
    borderRadius: 20,
    backgroundColor: "#F4F8F0",
    borderWidth: 1,
    borderColor: "#DCE6D4",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  staticFieldText: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.dark,
  },
  areaRow: {
    flexDirection: "row",
    gap: 10,
  },
  areaButton: {
    flex: 1,
    minHeight: 60,
    borderRadius: 18,
    backgroundColor: "#F4F8F0",
    borderWidth: 1,
    borderColor: "#DCE6D4",
    alignItems: "center",
    justifyContent: "center",
  },
  areaButtonActive: {
    backgroundColor: "#2F7D32",
    borderColor: "#2F7D32",
  },
  areaButtonText: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text,
  },
  areaButtonTextActive: {
    color: "#FFFFFF",
  },
  input: {
    minHeight: 68,
    borderRadius: 20,
    backgroundColor: "#F4F8F0",
    borderWidth: 1,
    borderColor: "#DCE6D4",
    paddingHorizontal: 18,
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.dark,
  },
  suggestionCard: {
    borderRadius: 24,
    backgroundColor: "#EEF6E8",
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: "center",
    gap: 8,
  },
  suggestionLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.muted,
  },
  suggestionValue: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    color: "#2F7D32",
  },
  submitButton: {
    minHeight: 78,
    borderRadius: 24,
    backgroundColor: "#2F7D32",
  },
});
