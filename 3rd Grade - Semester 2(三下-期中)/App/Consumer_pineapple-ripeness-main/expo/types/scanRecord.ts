export type RipenessPred = 'Unripe' | 'Transition' | 'Ripe' | 'Overripe';
export type AnomalyFlag = 'none' | 'spike' | 'drift' | 'saturation';
export type UploadStatus = 'pending' | 'uploaded' | 'failed';
export type Locale = 'zh' | 'en';

export interface ScanRecord {
  local_id: string;
  created_at_iso: string;
  fruit_id?: string;
  dist_cm?: number;
  note?: string;
  MQ2_raw: number;
  MQ3_raw: number;
  MQ9_raw: number;
  MQ135_raw: number;
  TGS2602_raw: number;
  Temp_C: number;
  Humidity_pct: number;
  Pressure_hPa: number;
  ripeness_pred: RipenessPred;
  confidence: number;
  anomaly_flag: AnomalyFlag;
  locale: Locale;
  device_id: string;
  model_version: string;
  app_version: string;
  upload_status: UploadStatus;
  server_id?: string;
  last_error?: string;
  retry_count: number;
}

export interface ScanRecordUploadPayload {
  created_at_iso: string;
  fruit_id?: string;
  dist_cm?: number;
  note?: string;
  MQ2_raw: number;
  MQ3_raw: number;
  MQ9_raw: number;
  MQ135_raw: number;
  TGS2602_raw: number;
  Temp_C: number;
  Humidity_pct: number;
  Pressure_hPa: number;
  ripeness_pred: RipenessPred;
  confidence: number;
  anomaly_flag: AnomalyFlag;
  locale: Locale;
  device_id: string;
  model_version: string;
  app_version: string;
}

export function toUploadPayload(record: ScanRecord): ScanRecordUploadPayload {
  return {
    created_at_iso: record.created_at_iso,
    fruit_id: record.fruit_id,
    dist_cm: record.dist_cm,
    note: record.note,
    MQ2_raw: record.MQ2_raw,
    MQ3_raw: record.MQ3_raw,
    MQ9_raw: record.MQ9_raw,
    MQ135_raw: record.MQ135_raw,
    TGS2602_raw: record.TGS2602_raw,
    Temp_C: record.Temp_C,
    Humidity_pct: record.Humidity_pct,
    Pressure_hPa: record.Pressure_hPa,
    ripeness_pred: record.ripeness_pred,
    confidence: record.confidence,
    anomaly_flag: record.anomaly_flag,
    locale: record.locale,
    device_id: record.device_id,
    model_version: record.model_version,
    app_version: record.app_version,
  };
}
