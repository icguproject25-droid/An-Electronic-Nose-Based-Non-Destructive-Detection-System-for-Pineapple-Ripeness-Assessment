import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";

import { dictionary, I18nKey, t } from "@/constants/i18n";
import { clearAppData, loadAppData, saveAppData } from "@/services/storage";
import { AppSettings, Batch, BatchPurpose, Language, Sample } from "@/types/models";
import { clamp, createId } from "@/utils/helpers";

interface PersistedData {
  batches: Batch[];
  samples: Sample[];
  settings: AppSettings;
}

interface CreateBatchInput {
  name: string;
  date: string;
  block: string;
  cultivar: string;
  harvest_count: number;
  purpose: BatchPurpose;
  target_samples: number;
}

const defaultSettings: AppSettings = {
  language: "zh",
  backendUrl: "",
  thresholds: {
    exportBrix: 15,
    domesticBrix: 13,
    samplingRatio: 0.12,
  },
};

export const [AppProvider, useAppStore] = createContextHook(() => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    const bootstrap = async (): Promise<void> => {
      try {
        const saved = await loadAppData();
        if (saved) {
          const parsed = JSON.parse(saved) as PersistedData;
          setBatches(parsed.batches ?? []);
          setSamples(parsed.samples ?? []);
          setSettings(parsed.settings ?? defaultSettings);
        }
      } catch (error) {
        console.log("[store.bootstrap] failed", error);
      } finally {
        setIsReady(true);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const payload: PersistedData = { batches, samples, settings };
    saveAppData(JSON.stringify(payload)).catch((error) => {
      console.log("[store.persist] failed", error);
    });
  }, [isReady, batches, samples, settings]);

  const login = useCallback((pin: string): boolean => {
    const ok = pin === "1234";
    setIsAuthenticated(ok);
    setIsDemoMode(false);
    return ok;
  }, []);

  const enterDemo = useCallback((): void => {
    setIsAuthenticated(true);
    setIsDemoMode(true);
  }, []);

  const logout = useCallback((): void => {
    setIsAuthenticated(false);
    setIsDemoMode(false);
  }, []);

  const createBatch = useCallback((input: CreateBatchInput): Batch => {
    const batch: Batch = {
      batch_id: createId("batch"),
      name: input.name,
      date: input.date,
      block: input.block,
      cultivar: input.cultivar,
      harvest_count: input.harvest_count,
      purpose: input.purpose,
      sampling_plan: `ratio:${settings.thresholds.samplingRatio}`,
      target_samples: clamp(input.target_samples, 10, 20),
      status: "testing",
      created_at: new Date().toISOString(),
      synced: false,
    };
    setBatches((prev) => [batch, ...prev]);
    return batch;
  }, [settings.thresholds.samplingRatio]);

  const addSample = useCallback((sample: Sample): void => {
    setSamples((prev) => [sample, ...prev]);
  }, []);

  const updateBatchStatus = useCallback((batchId: string, status: Batch["status"]): void => {
    setBatches((prev) => prev.map((batch) => (batch.batch_id === batchId ? { ...batch, status, synced: false } : batch)));
  }, []);

  const setLanguage = useCallback((language: Language): void => {
    setSettings((prev) => ({ ...prev, language }));
  }, []);

  const updateSettings = useCallback((next: Partial<AppSettings>): void => {
    setSettings((prev) => ({
      ...prev,
      ...next,
      thresholds: {
        ...prev.thresholds,
        ...(next.thresholds ?? {}),
      },
    }));
  }, []);

  const clearLocal = useCallback(async (): Promise<void> => {
    setBatches([]);
    setSamples([]);
    await clearAppData();
  }, []);

  const markAllSynced = useCallback((): void => {
    setBatches((prev) => prev.map((batch) => ({ ...batch, synced: true })));
  }, []);

  const unsyncedBatchCount = useMemo(() => batches.filter((item) => item.synced !== true).length, [batches]);
  const language = settings.language;
  const tx = useCallback((key: I18nKey): string => t(language, key), [language]);

  return {
    dictionary,
    isReady,
    isAuthenticated,
    isDemoMode,
    batches,
    samples,
    settings,
    unsyncedBatchCount,
    login,
    enterDemo,
    logout,
    createBatch,
    addSample,
    updateBatchStatus,
    setLanguage,
    updateSettings,
    clearLocal,
    markAllSynced,
    tx,
  };
});
