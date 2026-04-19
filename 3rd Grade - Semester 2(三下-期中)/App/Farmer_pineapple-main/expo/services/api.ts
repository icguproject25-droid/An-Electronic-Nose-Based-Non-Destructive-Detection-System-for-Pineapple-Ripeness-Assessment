import { ScanResult } from "@/types/models";

const randomPick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;

export async function ping(backendUrl: string): Promise<{ ok: boolean; message: string }> {
  if (!backendUrl.trim()) {
    return { ok: false, message: "NO_URL" };
  }
  try {
    const response = await fetch(`${backendUrl.replace(/\/$/, "")}/ping`, { method: "GET" });
    return { ok: response.ok, message: response.ok ? "OK" : "FAILED" };
  } catch (error) {
    console.log("[api.ping] error", error);
    return { ok: false, message: "FAILED" };
  }
}

export async function startScan(backendUrl: string): Promise<ScanResult> {
  if (backendUrl.trim()) {
    try {
      const response = await fetch(`${backendUrl.replace(/\/$/, "")}/scan/start`, { method: "POST" });
      if (response.ok) {
        const json = (await response.json()) as ScanResult;
        return {
          ripeness: json.ripeness,
          tss_brix: Math.min(18, Math.max(10, json.tss_brix)),
          blackheart_risk: json.blackheart_risk,
          anomaly_flag: json.anomaly_flag,
        };
      }
    } catch (error) {
      console.log("[api.startScan] fallback to mock", error);
    }
  }

  const brix = Number((10 + Math.random() * 8).toFixed(1));
  return {
    ripeness: brix < 12.5 ? "unripe" : brix > 15.8 ? "overripe" : "ripe",
    tss_brix: brix,
    blackheart_risk: randomPick(["low", "low", "med", "high"]),
    anomaly_flag: randomPick(["normal", "normal", "normal", "isolate"]),
  };
}
