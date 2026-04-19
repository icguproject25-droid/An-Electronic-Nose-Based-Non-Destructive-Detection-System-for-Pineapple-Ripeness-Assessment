import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppProvider, useAppStore } from "@/store/app-store";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated } = useAppStore();

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      {!isAuthenticated ? <Stack.Screen name="login" options={{ headerShown: false }} /> : null}
      <Stack.Screen name="(tabs)" options={{ headerShown: isAuthenticated }} />
      <Stack.Screen name="batches/create" options={{ presentation: "card" }} />
      <Stack.Screen name="batches/[batchId]/index" options={{ presentation: "card" }} />
      <Stack.Screen name="batches/[batchId]/scan" options={{ presentation: "card" }} />
      <Stack.Screen name="batches/[batchId]/summary" options={{ presentation: "card" }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <GestureHandlerRootView>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </AppProvider>
    </QueryClientProvider>
  );
}
