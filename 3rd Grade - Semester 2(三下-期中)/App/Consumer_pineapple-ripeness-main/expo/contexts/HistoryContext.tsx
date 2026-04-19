import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { ScanRecord, RipenessPred, Locale } from '@/types/scanRecord';
import { 
  saveRecord, 
  listRecords, 
  updateRecord, 
  clearAllRecords, 
  getOrCreateDeviceId,
  getApiBaseUrl,
  setApiBaseUrl as saveApiBaseUrl,
} from '@/services/storage';
import { uploadHistoryRecord, getAppVersion, ScanMetadata } from '@/services/api';
import { SensorData } from '@/utils/ripeness';

const RETRY_INTERVAL = 5000;

function ripenessToStoredFormat(level: string): RipenessPred {
  switch (level) {
    case 'unripe': return 'Unripe';
    case 'transition': return 'Transition';
    case 'ripe': return 'Ripe';
    case 'overripe': return 'Overripe';
    default: return 'Unripe';
  }
}

export const [HistoryProvider, useHistory] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [deviceId, setDeviceId] = useState<string>('');
  const [apiUrl, setApiUrl] = useState<string>('http://localhost:8000');
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    getOrCreateDeviceId().then(setDeviceId);
    getApiBaseUrl().then(setApiUrl);
  }, []);

  const recordsQuery = useQuery({
    queryKey: ['scanHistory'],
    queryFn: listRecords,
    staleTime: 1000,
  });

  const records = recordsQuery.data || [];
  const pendingRecords = records.filter(r => r.upload_status !== 'uploaded');

  const refreshRecords = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['scanHistory'] });
  }, [queryClient]);

  const createAndSaveRecord = useCallback(async (
    rawData: SensorData,
    ripeness: string,
    locale: Locale,
    metadata: ScanMetadata = {}
  ): Promise<ScanRecord> => {
    const currentDeviceId = deviceId || await getOrCreateDeviceId();
    
    const record: ScanRecord = {
      local_id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at_iso: new Date().toISOString(),
      fruit_id: metadata.fruit_id,
      dist_cm: metadata.dist_cm,
      note: metadata.note,
      MQ2_raw: rawData.MQ2_raw,
      MQ3_raw: rawData.MQ3_raw,
      MQ9_raw: rawData.MQ9_raw,
      MQ135_raw: rawData.MQ135_raw,
      TGS2602_raw: rawData.TGS2602_raw,
      Temp_C: rawData.Temp_C,
      Humidity_pct: rawData.Humidity_pct,
      Pressure_hPa: rawData.Pressure_hPa,
      ripeness_pred: ripenessToStoredFormat(ripeness),
      confidence: 0.7,
      anomaly_flag: 'none',
      locale,
      device_id: currentDeviceId,
      model_version: 'mock-v1',
      app_version: getAppVersion(),
      upload_status: 'pending',
      retry_count: 0,
    };

    await saveRecord(record);
    refreshRecords();
    console.log('[History] Created and saved record:', record.local_id);
    return record;
  }, [deviceId, refreshRecords]);

  const uploadRecordMutation = useMutation({
    mutationFn: async (localId: string) => {
      const currentRecords = await listRecords();
      const record = currentRecords.find(r => r.local_id === localId);
      if (!record) throw new Error('Record not found');

      const response = await uploadHistoryRecord(record);
      return { localId, serverId: response.id };
    },
    onSuccess: async ({ localId, serverId }) => {
      await updateRecord(localId, {
        upload_status: 'uploaded',
        server_id: serverId,
        last_error: undefined,
      });
      refreshRecords();
      console.log('[History] Upload successful:', localId);
    },
    onError: async (error, localId) => {
      const currentRecords = await listRecords();
      const record = currentRecords.find(r => r.local_id === localId);
      await updateRecord(localId, {
        upload_status: 'failed',
        last_error: String(error),
        retry_count: (record?.retry_count || 0) + 1,
      });
      refreshRecords();
      console.log('[History] Upload failed:', localId, error);
    },
  });

  const { mutateAsync: uploadMutateAsync, isPending: isUploadPending } = uploadRecordMutation;

  const uploadRecord = useCallback(async (localId: string): Promise<boolean> => {
    try {
      await uploadMutateAsync(localId);
      return true;
    } catch {
      return false;
    }
  }, [uploadMutateAsync]);

  const retryUpload = useCallback(async (localId: string): Promise<boolean> => {
    return uploadRecord(localId);
  }, [uploadRecord]);

  const retryAllPending = useCallback(async (): Promise<{ success: number; failed: number }> => {
    setIsRetrying(true);
    const currentRecords = await listRecords();
    const pending = currentRecords.filter(r => r.upload_status !== 'uploaded');
    const sorted = [...pending].sort((a, b) => 
      new Date(a.created_at_iso).getTime() - new Date(b.created_at_iso).getTime()
    );

    let success = 0;
    let failed = 0;

    for (const record of sorted) {
      const result = await uploadRecord(record.local_id);
      if (result) {
        success++;
      } else {
        failed++;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRetrying(false);
    console.log('[History] Retry all completed:', { success, failed });
    return { success, failed };
  }, [uploadRecord]);

  const clearHistory = useCallback(async () => {
    await clearAllRecords();
    refreshRecords();
    console.log('[History] Cleared all history');
  }, [refreshRecords]);

  const updateApiUrl = useCallback(async (url: string) => {
    await saveApiBaseUrl(url);
    setApiUrl(url);
    console.log('[History] Updated API URL:', url);
  }, []);

  useEffect(() => {
    if (pendingRecords.length > 0 && !isRetrying && !isUploadPending) {
      retryTimeoutRef.current = setTimeout(() => {
        console.log('[History] Auto-retry triggered for', pendingRecords.length, 'records');
        retryAllPending();
      }, RETRY_INTERVAL);
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [pendingRecords.length, isRetrying, isUploadPending, retryAllPending]);

  return {
    records,
    pendingCount: pendingRecords.length,
    isLoading: recordsQuery.isLoading,
    isRetrying,
    isUploading: isUploadPending,
    deviceId,
    apiUrl,
    createAndSaveRecord,
    uploadRecord,
    retryUpload,
    retryAllPending,
    clearHistory,
    refreshRecords,
    updateApiUrl,
  };
});
