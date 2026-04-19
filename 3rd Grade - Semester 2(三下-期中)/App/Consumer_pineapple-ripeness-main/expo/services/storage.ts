import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanRecord } from '@/types/scanRecord';

const HISTORY_STORAGE_KEY = '@pineapple_scan_history';
const API_URL_STORAGE_KEY = '@pineapple_api_url';
const DEVICE_ID_STORAGE_KEY = '@pineapple_device_id';
const MAX_RECORDS = 200;

export async function saveRecord(record: ScanRecord): Promise<void> {
  try {
    const records = await listRecords();
    const newRecords = [record, ...records].slice(0, MAX_RECORDS);
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newRecords));
    console.log('[Storage] Saved record:', record.local_id);
  } catch (error) {
    console.error('[Storage] Failed to save record:', error);
    throw error;
  }
}

export async function listRecords(): Promise<ScanRecord[]> {
  try {
    const stored = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      const records = JSON.parse(stored) as ScanRecord[];
      console.log('[Storage] Loaded', records.length, 'records');
      return records;
    }
  } catch (error) {
    console.error('[Storage] Failed to load records:', error);
  }
  return [];
}

export async function updateRecord(local_id: string, patch: Partial<ScanRecord>): Promise<void> {
  try {
    const records = await listRecords();
    const index = records.findIndex(r => r.local_id === local_id);
    if (index !== -1) {
      records[index] = { ...records[index], ...patch };
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records));
      console.log('[Storage] Updated record:', local_id, patch);
    } else {
      console.warn('[Storage] Record not found:', local_id);
    }
  } catch (error) {
    console.error('[Storage] Failed to update record:', error);
    throw error;
  }
}

export async function getRecord(local_id: string): Promise<ScanRecord | null> {
  try {
    const records = await listRecords();
    return records.find(r => r.local_id === local_id) || null;
  } catch (error) {
    console.error('[Storage] Failed to get record:', error);
    return null;
  }
}

export async function clearAllRecords(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
    console.log('[Storage] Cleared all records');
  } catch (error) {
    console.error('[Storage] Failed to clear records:', error);
    throw error;
  }
}

export const DEFAULT_API_URL = 'http://192.168.18.11:8000';

export async function getApiBaseUrl(): Promise<string> {
  try {
    const url = await AsyncStorage.getItem(API_URL_STORAGE_KEY);
    return url || DEFAULT_API_URL;
  } catch {
    return DEFAULT_API_URL;
  }
}

export async function setApiBaseUrl(url: string): Promise<void> {
  try {
    await AsyncStorage.setItem(API_URL_STORAGE_KEY, url);
    console.log('[Storage] Saved API URL:', url);
  } catch (error) {
    console.error('[Storage] Failed to save API URL:', error);
    throw error;
  }
}

export async function getOrCreateDeviceId(): Promise<string> {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
      console.log('[Storage] Created new device ID:', deviceId);
    }
    return deviceId;
  } catch {
    return `device_${Date.now()}`;
  }
}
