import { Batch, Sample } from "@/types/models";

export interface BatchStats {
  unripe: number;
  ripe: number;
  overripe: number;
  avgBrix: number;
  blackheartRisk: number;
  isolate: number;
}

export const getBatchSamples = (samples: Sample[], batchId: string): Sample[] => {
  return samples.filter((sample) => sample.batch_id === batchId).sort((a, b) => a.seq_no - b.seq_no);
};

export const getBatchStats = (samples: Sample[]): BatchStats => {
  if (samples.length === 0) {
    return { unripe: 0, ripe: 0, overripe: 0, avgBrix: 0, blackheartRisk: 0, isolate: 0 };
  }

  const totalBrix = samples.reduce((sum, sample) => sum + sample.tss_brix, 0);
  return {
    unripe: samples.filter((sample) => sample.ripeness === "unripe").length,
    ripe: samples.filter((sample) => sample.ripeness === "ripe").length,
    overripe: samples.filter((sample) => sample.ripeness === "overripe").length,
    avgBrix: Number((totalBrix / samples.length).toFixed(2)),
    blackheartRisk: samples.filter((sample) => sample.blackheart_risk === "high" || sample.blackheart_risk === "med").length,
    isolate: samples.filter((sample) => sample.anomaly_flag === "isolate").length,
  };
};

export const getTodayMetrics = (batches: Batch[], samples: Sample[]): { doneBatches: number; scanCount: number; riskCount: number } => {
  const today = new Date().toISOString().slice(0, 10);
  const todayBatches = batches.filter((batch) => batch.date.slice(0, 10) === today);
  const todayBatchIds = new Set(todayBatches.map((batch) => batch.batch_id));
  const todaySamples = samples.filter((sample) => todayBatchIds.has(sample.batch_id));

  return {
    doneBatches: todayBatches.filter((batch) => batch.status === "done").length,
    scanCount: todaySamples.length,
    riskCount: todaySamples.filter((sample) => sample.blackheart_risk === "high" || sample.anomaly_flag === "isolate").length,
  };
};
