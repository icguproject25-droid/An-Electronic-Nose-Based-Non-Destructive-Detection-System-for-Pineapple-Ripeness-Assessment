import { useState, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { SensorData, RipenessLevel, calculateRipeness, generateMockSensorData, processSensorData, ProcessedSensorData } from '@/utils/ripeness';
import { ScanMetadata } from '@/services/api';

export interface ScanResult {
  id: string;
  timestamp: Date;
  rawData: SensorData;
  processedData: ProcessedSensorData;
  ripeness: RipenessLevel;
  metadata?: ScanMetadata;
}

export const [SensorProvider, useSensor] = createContextHook(() => {
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMetadata, setScanMetadata] = useState<ScanMetadata>({});

  const updateMetadata = useCallback((metadata: Partial<ScanMetadata>) => {
    setScanMetadata(prev => ({ ...prev, ...metadata }));
  }, []);

  const clearMetadata = useCallback(() => {
    setScanMetadata({});
  }, []);

  const startScan = useCallback((): Promise<ScanResult> => {
    return new Promise((resolve) => {
      setIsScanning(true);
      
      setTimeout(() => {
        const rawData = generateMockSensorData();
        const processedData = processSensorData(rawData);
        const ripeness = calculateRipeness(rawData);
        
        const result: ScanResult = {
          id: Date.now().toString(),
          timestamp: new Date(),
          rawData,
          processedData,
          ripeness,
          metadata: { ...scanMetadata },
        };
        
        setCurrentResult(result);
        setIsScanning(false);
        resolve(result);
      }, 10000);
    });
  }, [scanMetadata]);

  const submitFeedback = useCallback(async (resultId: string, correctRipeness: RipenessLevel) => {
    console.log('Feedback submitted:', { resultId, correctRipeness });
    console.log('Raw data for ML training:', currentResult?.rawData);
  }, [currentResult]);

  const clearResult = useCallback(() => {
    setCurrentResult(null);
    clearMetadata();
  }, [clearMetadata]);

  return {
    currentResult,
    isScanning,
    scanMetadata,
    startScan,
    submitFeedback,
    clearResult,
    updateMetadata,
    clearMetadata,
  };
});
