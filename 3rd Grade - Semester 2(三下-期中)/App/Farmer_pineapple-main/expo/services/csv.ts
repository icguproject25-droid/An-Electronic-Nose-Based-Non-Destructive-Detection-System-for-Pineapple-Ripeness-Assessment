import { Batch, Sample } from "@/types/models";
import { formatDate } from "@/utils/helpers";

const escapeCsv = (value: string): string => {
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export function buildBatchCsv(batch: Batch, samples: Sample[]): { fileName: string; content: string } {
  const header = [
    "batch_id",
    "batch_name",
    "date",
    "seq_no",
    "scan_time",
    "ripeness",
    "tss_brix",
    "blackheart_risk",
    "anomaly_flag",
    "note",
  ];

  const rows = samples.map((sample) => [
    batch.batch_id,
    batch.name,
    batch.date,
    String(sample.seq_no),
    sample.scan_time,
    sample.ripeness,
    String(sample.tss_brix),
    sample.blackheart_risk,
    sample.anomaly_flag,
    sample.note ?? "",
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
    .join("\n");

  return {
    fileName: `FarmerConsole_${batch.name.replace(/\s+/g, "-")}_${formatDate(batch.date)}.csv`,
    content: csv,
  };
}
