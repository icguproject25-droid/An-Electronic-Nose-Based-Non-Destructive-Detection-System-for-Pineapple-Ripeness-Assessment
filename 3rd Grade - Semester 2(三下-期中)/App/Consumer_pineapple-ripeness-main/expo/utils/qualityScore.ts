import { ScanRecord, RipenessPred } from '@/types/scanRecord';

export function estimateTSS(record: ScanRecord): number {
  const baseMap: Record<RipenessPred, number> = {
    'Unripe': 10.5,
    'Transition': 13.0,
    'Ripe': 15.0,
    'Overripe': 17.5,
  };
  const base = baseMap[record.ripeness_pred] ?? 13;
  const vocAvg = (record.MQ2_raw + record.MQ3_raw + record.MQ135_raw + record.TGS2602_raw) / 4;
  const offset = ((vocAvg - 200) / 400) * 2;
  return Math.round((base + offset) * 10) / 10;
}

export function calculateQualityScore(record: ScanRecord): number {
  let score = 70;
  const tss = estimateTSS(record);

  if (tss >= 13 && tss <= 16) {
    score += 15;
  }

  const hasAnomaly = record.anomaly_flag !== 'none';
  if (!hasAnomaly) {
    score += 15;
  }

  if (hasAnomaly) {
    score -= 30;
  }

  if (record.ripeness_pred === 'Overripe') {
    score -= 10;
  }

  if (record.ripeness_pred === 'Unripe') {
    score -= 5;
  }

  return Math.max(0, Math.min(100, score));
}

export function getVOCAverage(record: ScanRecord): number {
  return Math.round(((record.MQ2_raw + record.MQ3_raw + record.MQ135_raw + record.TGS2602_raw) / 4) * 100) / 100;
}

export function getRiskLevel(record: ScanRecord): 'normal' | 'overripe' | 'abnormal' {
  if (record.anomaly_flag !== 'none') return 'abnormal';
  if (record.ripeness_pred === 'Overripe') return 'overripe';
  return 'normal';
}

export function getRiskColor(risk: 'normal' | 'overripe' | 'abnormal'): string {
  switch (risk) {
    case 'normal': return '#4CAF50';
    case 'overripe': return '#FFC107';
    case 'abnormal': return '#F44336';
  }
}
