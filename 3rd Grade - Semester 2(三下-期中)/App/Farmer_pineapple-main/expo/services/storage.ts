import AsyncStorage from "@react-native-async-storage/async-storage";

const APP_KEY = "farmer_console_v1";

export async function saveAppData(data: string): Promise<void> {
  await AsyncStorage.setItem(APP_KEY, data);
}

export async function loadAppData(): Promise<string | null> {
  return AsyncStorage.getItem(APP_KEY);
}

export async function clearAppData(): Promise<void> {
  await AsyncStorage.removeItem(APP_KEY);
}
