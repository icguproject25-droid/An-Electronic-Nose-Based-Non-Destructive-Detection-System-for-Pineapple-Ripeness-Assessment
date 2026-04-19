export type RipenessLevel = 'unripe' | 'transition' | 'ripe' | 'overripe';

export interface SensorData {
  MQ2_raw: number;
  MQ3_raw: number;
  MQ9_raw: number;
  MQ135_raw: number;
  TGS2602_raw: number;
  Temp_C: number;
  Humidity_pct: number;
  Pressure_hPa: number;
}

export interface ProcessedSensorData {
  smokeFlammable: number;
  alcoholLevel: number;
  carbonMonoxide: number;
  airQuality: number;
  odorIntensity: number;
  temperature: number;
  humidity: number;
  pressure: number;
}

const BASE_REFERENCE = {
  MQ2: { min: 100, max: 800 },
  MQ3: { min: 50, max: 600 },
  MQ9: { min: 80, max: 500 },
  MQ135: { min: 100, max: 700 },
  TGS2602: { min: 50, max: 400 },
};

export function normalizeValue(value: number, min: number, max: number): number {
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized));
}

export function processSensorData(raw: SensorData): ProcessedSensorData {
  return {
    smokeFlammable: normalizeValue(raw.MQ2_raw, BASE_REFERENCE.MQ2.min, BASE_REFERENCE.MQ2.max),
    alcoholLevel: normalizeValue(raw.MQ3_raw, BASE_REFERENCE.MQ3.min, BASE_REFERENCE.MQ3.max),
    carbonMonoxide: normalizeValue(raw.MQ9_raw, BASE_REFERENCE.MQ9.min, BASE_REFERENCE.MQ9.max),
    airQuality: normalizeValue(raw.MQ135_raw, BASE_REFERENCE.MQ135.min, BASE_REFERENCE.MQ135.max),
    odorIntensity: normalizeValue(raw.TGS2602_raw, BASE_REFERENCE.TGS2602.min, BASE_REFERENCE.TGS2602.max),
    temperature: raw.Temp_C,
    humidity: raw.Humidity_pct,
    pressure: raw.Pressure_hPa,
  };
}

export function calculateRipeness(data: SensorData): RipenessLevel {
  const processed = processSensorData(data);
  
  const alcoholWeight = 0.35;
  const odorWeight = 0.35;
  const airQualityWeight = 0.15;
  const smokeWeight = 0.10;
  const coWeight = 0.05;
  
  const score = 
    processed.alcoholLevel * alcoholWeight +
    processed.odorIntensity * odorWeight +
    processed.airQuality * airQualityWeight +
    processed.smokeFlammable * smokeWeight +
    processed.carbonMonoxide * coWeight;
  
  if (score < 25) return 'unripe';
  if (score < 50) return 'transition';
  if (score < 75) return 'ripe';
  return 'overripe';
}

export function generateMockSensorData(): SensorData {
  const randomInRange = (min: number, max: number) => 
    Math.floor(Math.random() * (max - min + 1)) + min;
  
  return {
    MQ2_raw: randomInRange(150, 650),
    MQ3_raw: randomInRange(80, 500),
    MQ9_raw: randomInRange(100, 400),
    MQ135_raw: randomInRange(150, 550),
    TGS2602_raw: randomInRange(80, 350),
    Temp_C: randomInRange(22, 32),
    Humidity_pct: randomInRange(45, 75),
    Pressure_hPa: randomInRange(1008, 1020),
  };
}

export function getRipenessColor(level: RipenessLevel): string {
  switch (level) {
    case 'unripe': return '#228B22';
    case 'transition': return '#C5B358';
    case 'ripe': return '#FFD700';
    case 'overripe': return '#8B4513';
  }
}
