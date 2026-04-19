import { Batch, Sample } from "@/types/models";

export interface BoxCounts {
  exportBox: number;
  domesticBox: number;
  processing: number;
  isolate: number;
}

export const getBoxCounts = (samples: Sample[], batch: Batch, exportBrix: number, domesticBrix: number): BoxCounts => {
  return samples.reduce<BoxCounts>(
    (acc, sample) => {
      const isIsolate = sample.blackheart_risk === "high" || sample.anomaly_flag === "isolate";
      if (isIsolate) {
        acc.isolate += 1;
        return acc;
      }
      if (sample.tss_brix >= exportBrix && sample.blackheart_risk === "low" && sample.anomaly_flag === "normal") {
        acc.exportBox += 1;
        return acc;
      }
      if (sample.tss_brix >= domesticBrix && sample.tss_brix < exportBrix && sample.anomaly_flag === "normal") {
        acc.domesticBox += 1;
        return acc;
      }
      if (sample.tss_brix < domesticBrix || sample.ripeness === "overripe") {
        acc.processing += 1;
      }
      return acc;
    },
    { exportBox: 0, domesticBox: 0, processing: 0, isolate: 0 }
  );
};
