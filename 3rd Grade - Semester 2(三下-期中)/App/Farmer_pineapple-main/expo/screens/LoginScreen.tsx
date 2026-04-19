import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { theme } from "@/constants/theme";
import { useAppStore } from "@/store/app-store";

export default function LoginScreen() {
  const [pin, setPin] = useState<string>("");
  const { login, enterDemo, tx } = useAppStore();

  const onLogin = (): void => {
    const ok = login(pin);
    if (!ok) {
      Alert.alert(tx("pinLogin"), tx("invalidPin"));
      return;
    }
    router.replace("/");
  };

  const onDemo = (): void => {
    enterDemo();
    router.replace("/");
  };

  return (
    <View style={styles.container} testID="login-screen">
      <Text style={styles.title}>{tx("appName")}</Text>
      <Text style={styles.subtitle}>{tx("loginTitle")}</Text>
      <TextInput
        testID="pin-input"
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        placeholder={tx("pinPlaceholder")}
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
      />
      <View style={styles.actions}>
        <AppButton label={tx("enter")} onPress={onLogin} testID="login-btn" />
        <AppButton label={tx("demoMode")} onPress={onDemo} variant="secondary" testID="demo-btn" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: 20,
    justifyContent: "center",
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.dark,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.muted,
  },
  input: {
    height: 54,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    fontSize: 18,
    letterSpacing: 8,
  },
  actions: {
    gap: 10,
  },
});
