import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { theme } from "@/constants/theme";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  style?: ViewStyle;
  testID?: string;
  disabled?: boolean;
}

export function AppButton({ label, onPress, variant = "primary", style, testID, disabled = false }: AppButtonProps) {
  const bgColor =
    variant === "danger" ? theme.colors.danger : variant === "secondary" ? "#E5E7EB" : theme.colors.primary;
  const textColor = variant === "secondary" ? theme.colors.text : "#FFFFFF";

  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bgColor, opacity: pressed || disabled ? 0.8 : 1 },
        style,
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
});
