import { Stack, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { theme } from "@/constants/theme";
import { useAppStore } from "@/store/app-store";

export default function NotFoundScreen() {
  const { tx } = useAppStore();

  return (
    <View style={styles.container} testID="not-found-screen">
      <Stack.Screen options={{ title: "404" }} />
      <Text style={styles.title}>404</Text>
      <Text style={styles.text}>{tx("noData")}</Text>
      <AppButton label={tx("home")} onPress={() => router.replace("/")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: theme.colors.bg,
    gap: 10,
  },
  title: {
    fontSize: 44,
    fontWeight: "900",
    color: theme.colors.dark,
  },
  text: {
    fontSize: 16,
    color: theme.colors.muted,
    marginBottom: 8,
  },
});
