import json
import time
import glob
import numpy as np
import serial

BAUD = 115200
CALIB_SECONDS = 30

def auto_detect_port():
    ports = sorted(glob.glob("/dev/ttyACM*")) + sorted(glob.glob("/dev/ttyUSB*"))
    if not ports:
        raise RuntimeError("找不到 Arduino 序列埠")
    return ports[0]

def parse_header_line(line: str):
    return [x.strip() for x in line.split(",")]

def parse_data_line(line: str, header_cols: list):
    vals = [x.strip() for x in line.split(",")]
    if len(vals) != len(header_cols):
        return None
    row = dict(zip(header_cols, vals))
    try:
        return {
            "MQ2_raw": float(row["MQ2_raw"]),
            "MQ3_raw": float(row["MQ3_raw"]),
            "MQ9_raw": float(row["MQ9_raw"]),
            "MQ135_raw": float(row["MQ135_raw"]),
            "TGS2602_raw": float(row["TGS2602_raw"]),
            "TGS2620_raw": float(row.get("TGS2620_raw", np.nan)),
            "Temp_C": float(row.get("Temp_C", np.nan)),
            "Humidity_pct": float(row.get("Humidity_pct", np.nan)),
            "Pressure_hPa": float(row.get("Pressure_hPa", np.nan)),
        }
    except Exception:
        return None

def main():
    print("=" * 60)
    print("🌫️ Air baseline calibration (30 sec)")
    print("=" * 60)
    print("請確認容器內沒有鳳梨，只量空氣。")
    print(f"將收集 {CALIB_SECONDS} 秒資料後輸出 air_base.json")
    print("-" * 60)

    port = auto_detect_port()
    print("Arduino port:", port)

    ser = serial.Serial(port, BAUD, timeout=1)
    time.sleep(2)

    header_cols = None
    print("等待 CSV header ...")

    while True:
        raw = ser.readline().decode("utf-8", errors="ignore").strip()
        if not raw:
            continue
        if raw.startswith("timestamp_ms,"):
            header_cols = parse_header_line(raw)
            print("✅ CSV header detected")
            break

    rows = []
    t0 = time.time()

    while time.time() - t0 < CALIB_SECONDS:
        raw = ser.readline().decode("utf-8", errors="ignore").strip()
        if not raw:
            continue
        if raw.startswith("#") or raw.startswith("✅") or raw.startswith("📋") or raw.startswith("⏱") or raw.startswith("🍍") or raw.startswith("==="):
            continue

        row = parse_data_line(raw, header_cols)
        if row is None:
            continue

        rows.append(row)
        elapsed = int(time.time() - t0)
        print(f"Collecting air baseline... {elapsed}/{CALIB_SECONDS} sec", end="\r")

    print()
    if len(rows) == 0:
        raise RuntimeError("沒有收集到有效資料，無法建立 air_base.json")

    sensors = ["MQ2", "MQ3", "MQ9", "MQ135", "TGS2602", "TGS2620"]
    out = {}

    for s in sensors:
        col = f"{s}_raw"
        arr = np.array([r[col] for r in rows if np.isfinite(r[col])], dtype=float)
        out[s] = float(np.mean(arr)) if len(arr) > 0 else 1.0

    for k in ["Temp_C", "Humidity_pct", "Pressure_hPa"]:
        arr = np.array([r[k] for r in rows if np.isfinite(r[k])], dtype=float)
        if len(arr) > 0:
            out[k] = float(np.mean(arr))

    with open("air_base.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print("✅ air_base.json 已建立")
    print(json.dumps(out, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
