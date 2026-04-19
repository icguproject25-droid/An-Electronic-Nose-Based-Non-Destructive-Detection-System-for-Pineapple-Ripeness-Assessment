import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";

interface StatCardProps {
  label: string;
  value: string;
  testID?: string;
}

export function StatCard({ label, value, testID }: StatCardProps) {
  return (
    <View testID={testID} style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.dark,
  },
  label: {
    fontSize: 13,
    color: theme.colors.muted,
  },
});
