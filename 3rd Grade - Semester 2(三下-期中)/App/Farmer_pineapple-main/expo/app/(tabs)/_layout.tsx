import { Tabs } from "expo-router";
import { BarChart3, FolderKanban, House, Radar, Settings } from "lucide-react-native";
import React from "react";

import { theme } from "@/constants/theme";
import { useAppStore } from "@/store/app-store";

export default function TabLayout() {
  const { tx } = useAppStore();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.card },
        headerTitleStyle: { fontWeight: "700" },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: tx("home"),
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="batches"
        options={{
          title: tx("batches"),
          tabBarIcon: ({ color, size }) => <FolderKanban color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: tx("scan"),
          tabBarIcon: ({ color, size }) => <Radar color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: tx("reports"),
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: tx("settings"),
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
