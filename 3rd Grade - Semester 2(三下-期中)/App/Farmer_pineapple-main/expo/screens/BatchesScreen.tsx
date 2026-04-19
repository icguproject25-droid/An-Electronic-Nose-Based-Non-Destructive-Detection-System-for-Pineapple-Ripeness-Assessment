import { router, Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { theme } from "@/constants/theme";
import { useAppStore } from "@/store/app-store";

export default function BatchesScreen() {
  const { batches, samples, tx } = useAppStore();
  const [query, setQuery] = useState<string>("");

  const filtered = useMemo(() => {
    return batches.filter((batch) => batch.name.toLowerCase().includes(query.toLowerCase()));
  }, [batches, query]);

  return (
    <View style={styles.container} testID="batches-screen">
      <Stack.Screen options={{ title: tx("batches") }} />

      <TextInput
        style={styles.searchInput}
        placeholder={tx("searchBatch")}
        value={query}
        onChangeText={setQuery}
        testID="search-input"
      />

      <AppButton label={tx("newBatch")}
        onPress={() => router.push("/batches/create")}
        style={styles.createButton}
        testID="create-batch-btn"
      />

      <FlatList
        testID="batch-list"
        data={filtered}
        keyExtractor={(item) => item.batch_id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const scanned = samples.filter((sample) => sample.batch_id === item.batch_id).length;
          const destination = item.status === "done"
            ? (`/batches/${item.batch_id}/summary` as const)
            : (`/batches/${item.batch_id}/scan` as const);

          return (
            <Pressable style={styles.itemCard} onPress={() => router.push(destination)} testID={`batch-item-${item.batch_id}`}>
              <View style={styles.itemTextWrap}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemMeta}>{scanned}/{item.target_samples}</Text>
              </View>
              <Text style={styles.itemAction}>{item.status === "done" ? tx("summary") : tx("startScan")}</Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>{tx("noData")}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: 18,
    gap: 14,
  },
  searchInput: {
    height: 58,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  createButton: {
    minHeight: 66,
    borderRadius: 20,
    backgroundColor: "#2F7D32",
  },
  list: {
    gap: 12,
    paddingBottom: 90,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  itemTextWrap: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: theme.colors.text,
  },
  itemMeta: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.muted,
  },
  itemAction: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2F7D32",
  },
  empty: {
    paddingTop: 30,
    textAlign: "center",
    color: theme.colors.muted,
    fontSize: 16,
    fontWeight: "600",
  },
});
