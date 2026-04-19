import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { ScanRecord, toUploadPayload } from '@/types/scanRecord';
import { getApiBaseUrl, getOrCreateDeviceId } from '@/services/storage';
import { RipenessLevel, SensorData } from '@/utils/ripeness';

export type AnomalyFlag = 'none' | 'spike' | 'drift' | 'saturation';

export interface ScanMetadata {
  fruit_id?: string;
  dist_cm?: number;
  note?: string;
}

export interface ScanRecordPayload {
  timestamp_iso: string;
  fruit_id: string;
  dist_cm: number | null;
  MQ2_raw: number;
  MQ3_raw: number;
  MQ9_raw: number;
  MQ135_raw: number;
  TGS2602_raw: number;
  Temp_C: number;
  Humidity_pct: number;
  Pressure_hPa: number;
  ripeness_pred: RipenessLevel;
  confidence: number;
  anomaly_flag: AnomalyFlag;
  locale: string;
  device_id: string;
  model_version: string;
  app_version: string;
  note: string;
}

export interface FeedbackPayload {
  correct_label: RipenessLevel;
  comment?: string;
}

export interface ScanRecordResponse {
  id: string;
  success: boolean;
  message?: string;
}

export interface UploadResponse {
  ok: boolean;
  id: string;
}

export function getAppVersion(): string {
  try {
    return Constants.expoConfig?.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

export function buildScanRecordPayload(
  rawData: SensorData,
  ripeness: RipenessLevel,
  locale: string,
  metadata: ScanMetadata = {}
): ScanRecordPayload {
  return {
    timestamp_iso: new Date().toISOString(),
    fruit_id: metadata.fruit_id || '',
    dist_cm: metadata.dist_cm ?? null,
    MQ2_raw: rawData.MQ2_raw,
    MQ3_raw: rawData.MQ3_raw,
    MQ9_raw: rawData.MQ9_raw,
    MQ135_raw: rawData.MQ135_raw,
    TGS2602_raw: rawData.TGS2602_raw,
    Temp_C: rawData.Temp_C,
    Humidity_pct: rawData.Humidity_pct,
    Pressure_hPa: rawData.Pressure_hPa,
    ripeness_pred: ripeness,
    confidence: 0.7,
    anomaly_flag: 'none',
    locale,
    device_id: '',
    model_version: 'mock-v1',
    app_version: getAppVersion(),
    note: metadata.note || '',
  };
}

export async function uploadScanRecord(payload: ScanRecordPayload): Promise<ScanRecordResponse> {
  const apiBaseUrl = await getApiBaseUrl();
  console.log('[API] Uploading scan record to:', apiBaseUrl);
  console.log('[API] Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(`${apiBaseUrl}/scan_records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API] Upload successful:', data);
    return { id: data.id || payload.timestamp_iso, success: true };
  } catch (error) {
    console.log('[API] Upload failed:', error);
    throw error;
  }
}

export async function uploadHistoryRecord(record: ScanRecord): Promise<UploadResponse> {
  const apiBaseUrl = await getApiBaseUrl();
  const payload = toUploadPayload(record);
  
  console.log('[API] Uploading history record to:', `${apiBaseUrl}/scan_records`);
  console.log('[API] Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(`${apiBaseUrl}/scan_records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API] Upload successful:', data);
    return { ok: true, id: data.id || record.local_id };
  } catch (error) {
    console.log('[API] Upload failed:', error);
    throw error;
  }
}

export async function submitFeedbackToServer(
  recordId: string,
  feedback: FeedbackPayload
): Promise<boolean> {
  const apiBaseUrl = await getApiBaseUrl();
  console.log('[API] Submitting feedback for record:', recordId, feedback);
  
  try {
    const response = await fetch(`${apiBaseUrl}/scan_records/${recordId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(feedback),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('[API] Feedback submitted successfully');
    return true;
  } catch (error) {
    console.log('[API] Feedback submission failed:', error);
    throw error;
  }
}

export async function openExportExcel(): Promise<void> {
  const apiBaseUrl = await getApiBaseUrl();
  const exportUrl = `${apiBaseUrl}/scan_records/export.xlsx`;
  console.log('[API] Opening export URL:', exportUrl);
  try {
    const response = await fetch(exportUrl, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    Linking.openURL(exportUrl);
  } catch (error) {
    console.log('[API] Export Excel failed, falling back to direct open:', error);
    Linking.openURL(exportUrl);
  }
}

export { getOrCreateDeviceId };
