import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { ScanRecordPayload, uploadScanRecord } from '@/services/api';

const QUEUE_STORAGE_KEY = '@pineapple_upload_queue';

export interface QueuedRecord {
  id: string;
  payload: ScanRecordPayload;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

async function loadQueueFromStorage(): Promise<QueuedRecord[]> {
  try {
    const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
    if (stored) {
      const queue = JSON.parse(stored) as QueuedRecord[];
      console.log('[UploadQueue] Loaded queue from storage:', queue.length, 'items');
      return queue;
    }
  } catch (error) {
    console.error('[UploadQueue] Failed to load queue:', error);
  }
  return [];
}

async function saveQueueToStorage(queue: QueuedRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    console.log('[UploadQueue] Saved queue to storage:', queue.length, 'items');
  } catch (error) {
    console.error('[UploadQueue] Failed to save queue:', error);
  }
}

export const [UploadQueueProvider, useUploadQueue] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [isRetrying, setIsRetrying] = useState(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queueQuery = useQuery({
    queryKey: ['uploadQueue'],
    queryFn: loadQueueFromStorage,
    staleTime: Infinity,
  });

  const queue = queueQuery.data || [];

  const updateQueue = useCallback(async (newQueue: QueuedRecord[]) => {
    await saveQueueToStorage(newQueue);
    queryClient.setQueryData(['uploadQueue'], newQueue);
  }, [queryClient]);

  const addToQueue = useCallback(async (payload: ScanRecordPayload): Promise<string> => {
    const record: QueuedRecord = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };
    
    const currentQueue = queryClient.getQueryData<QueuedRecord[]>(['uploadQueue']) || [];
    const newQueue = [...currentQueue, record];
    await updateQueue(newQueue);
    
    console.log('[UploadQueue] Added to queue:', record.id);
    return record.id;
  }, [queryClient, updateQueue]);

  const removeFromQueue = useCallback(async (id: string) => {
    const currentQueue = queryClient.getQueryData<QueuedRecord[]>(['uploadQueue']) || [];
    const newQueue = currentQueue.filter(item => item.id !== id);
    await updateQueue(newQueue);
    console.log('[UploadQueue] Removed from queue:', id);
  }, [queryClient, updateQueue]);

  const clearQueue = useCallback(async () => {
    await updateQueue([]);
    console.log('[UploadQueue] Queue cleared');
  }, [updateQueue]);

  const uploadWithQueue = useCallback(async (payload: ScanRecordPayload): Promise<{ success: boolean; queued: boolean }> => {
    try {
      await uploadScanRecord(payload);
      console.log('[UploadQueue] Direct upload successful');
      return { success: true, queued: false };
    } catch {
      console.log('[UploadQueue] Direct upload failed, adding to queue');
      await addToQueue(payload);
      return { success: false, queued: true };
    }
  }, [addToQueue]);

  const retryItem = useCallback(async (id: string): Promise<boolean> => {
    const currentQueue = queryClient.getQueryData<QueuedRecord[]>(['uploadQueue']) || [];
    const item = currentQueue.find(q => q.id === id);
    
    if (!item) {
      console.log('[UploadQueue] Item not found:', id);
      return false;
    }

    try {
      await uploadScanRecord(item.payload);
      await removeFromQueue(id);
      console.log('[UploadQueue] Retry successful:', id);
      return true;
    } catch (error) {
      const newQueue = currentQueue.map(q => 
        q.id === id 
          ? { ...q, retryCount: q.retryCount + 1, lastError: String(error) }
          : q
      );
      await updateQueue(newQueue);
      console.log('[UploadQueue] Retry failed:', id, error);
      return false;
    }
  }, [queryClient, removeFromQueue, updateQueue]);

  const retryAll = useCallback(async (): Promise<{ success: number; failed: number }> => {
    setIsRetrying(true);
    const currentQueue = queryClient.getQueryData<QueuedRecord[]>(['uploadQueue']) || [];
    let success = 0;
    let failed = 0;

    for (const item of currentQueue) {
      try {
        await uploadScanRecord(item.payload);
        await removeFromQueue(item.id);
        success++;
      } catch {
        const updatedQueue = queryClient.getQueryData<QueuedRecord[]>(['uploadQueue']) || [];
        const newQueue = updatedQueue.map(q => 
          q.id === item.id 
            ? { ...q, retryCount: q.retryCount + 1 }
            : q
        );
        await updateQueue(newQueue);
        failed++;
      }
    }

    setIsRetrying(false);
    console.log('[UploadQueue] Retry all completed:', { success, failed });
    return { success, failed };
  }, [queryClient, removeFromQueue, updateQueue]);

  useEffect(() => {
    if (queue.length > 0 && !isRetrying) {
      retryTimeoutRef.current = setTimeout(() => {
        console.log('[UploadQueue] Auto-retry triggered');
        retryAll();
      }, 5000);
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [queue.length, isRetrying, retryAll]);

  return {
    queue,
    queueCount: queue.length,
    isLoading: queueQuery.isLoading,
    isRetrying,
    addToQueue,
    removeFromQueue,
    clearQueue,
    uploadWithQueue,
    retryItem,
    retryAll,
  };
});
