export type Language = "zh" | "en";

export interface Farm {
  farm_id: string;
  farm_name: string;
  location: string;
}

export type BatchPurpose = "export" | "domestic" | "processing" | "unknown";
export type BatchStatus = "draft" | "testing" | "done";

export interface Batch {
  batch_id: string;
  name: string;
  date: string;
  block: string;
  cultivar: string;
  harvest_count: number;
  purpose: BatchPurpose;
  sampling_plan: string;
  target_samples: number;
  status: BatchStatus;
  created_at: string;
  synced?: boolean;
}

export type Ripeness = "unripe" | "ripe" | "overripe";
export type BlackheartRisk = "low" | "med" | "high";
export type AnomalyFlag = "normal" | "isolate";

export interface Sample {
  sample_id: string;
  batch_id: string;
  seq_no: number;
  qr_id?: string;
  scan_time: string;
  ripeness: Ripeness;
  tss_brix: number;
  blackheart_risk: BlackheartRisk;
  anomaly_flag: AnomalyFlag;
  note?: string;
}

export interface ScanResult {
  ripeness: Ripeness;
  tss_brix: number;
  blackheart_risk: BlackheartRisk;
  anomaly_flag: AnomalyFlag;
}

export interface ThresholdSettings {
  exportBrix: number;
  domesticBrix: number;
  samplingRatio: number;
}

export interface AppSettings {
  language: Language;
  backendUrl: string;
  thresholds: ThresholdSettings;
}
