import argparse
import json
import pickle
import numpy as np
import serial
import glob
import time

WINDOW = 30
BAUD = 115200

SENSORS = ["MQ2", "MQ3", "MQ9", "MQ135", "TGS2602"]

STAGE_TEXT = {
    0: "未熟",
    1: "初熟",
    2: "成熟",
    3: "過熟",
}

# ============================================================
# CLI 參數
# ============================================================
parser = argparse.ArgumentParser()
parser.add_argument("--warmup-sec", type=int, default=0, help="前置累積秒數")
args = parser.parse_args()

WARMUP_SEC = max(0, int(args.warmup_sec))
TOTAL_SEC = WARMUP_SEC + WINDOW

print("🍍 Pineapple ripeness detection (30 sec mode)")
print(f"Warmup sec: {WARMUP_SEC}")
print(f"Collect mode: collect total {TOTAL_SEC} sec, use last {WINDOW} sec for inference")


def auto_detect_port():
    ports = sorted(glob.glob("/dev/ttyACM*")) + sorted(glob.glob("/dev/ttyUSB*"))
    if not ports:
        raise RuntimeError("❌ 找不到 Arduino (/dev/ttyACM* 或 /dev/ttyUSB*)")
    return ports[0]


def safe_ratio(a, b):
    return float(a) / (float(b) + 1e-9)


def safe_corr(x, y):
    if len(x) < 2 or len(y) < 2:
        return 0.0
    try:
        c = np.corrcoef(x, y)[0, 1]
        if not np.isfinite(c):
            return 0.0
        return float(c)
    except Exception:
        return 0.0


def safe_slope(x):
    if len(x) < 2:
        return 0.0
    try:
        return float(np.polyfit(range(len(x)), x, 1)[0])
    except Exception:
        return 0.0


def safe_mean_diff(x):
    if len(x) < 2:
        return 0.0
    try:
        d = np.diff(x)
        if len(d) == 0:
            return 0.0
        return float(np.mean(d))
    except Exception:
        return 0.0


def safe_auc(x):
    try:
        if hasattr(np, "trapezoid"):
            return float(np.trapezoid(x))
        return float(np.trapz(x))
    except Exception:
        return 0.0


def print_sensor_summary(data):
    print("\n" + "=" * 60)
    print("📊 Raw sensor summary (inference window)")
    print("=" * 60)
    for s in SENSORS:
        arr = data[s]
        print(
            f"{s:8s} | "
            f"mean={np.mean(arr):8.3f} | "
            f"min={np.min(arr):8.3f} | "
            f"max={np.max(arr):8.3f} | "
            f"std={np.std(arr):8.3f}"
        )


def print_feature_summary(features_order, feat):
    print("\n" + "=" * 60)
    print("🧪 Feature values used by model")
    print("=" * 60)
    for f in features_order:
        print(f"{f:28s} = {feat.get(f, 0.0):.6f}")


def build_raw_maturity_percent(proba):
    score = (
        proba[0] * 0 +
        proba[1] * 1 +
        proba[2] * 2 +
        proba[3] * 3
    ) / 3.0
    return int(round(score * 100))


def build_bar(percent):
    blocks = int(round(percent / 5))
    blocks = max(0, min(20, blocks))
    return "█" * blocks + "░" * (20 - blocks)


def maturity_zone_text(percent):
    if percent <= 16:
        return "未熟區"
    elif percent <= 49:
        return "初熟區"
    elif percent <= 82:
        return "成熟區"
    else:
        return "過熟區"


def overripe_tendency_text(p3):
    p = float(p3) * 100.0
    if p < 10:
        return f"{p:.2f}%（低）"
    elif p < 20:
        return f"{p:.2f}%（微弱）"
    elif p < 35:
        return f"{p:.2f}%（明顯）"
    else:
        return f"{p:.2f}%（高）"


def get_closest_stage_text(proba, pred):
    sorted_idx = np.argsort(proba)[::-1]
    top1 = int(sorted_idx[0])
    top2 = int(sorted_idx[1])

    if top1 == top2:
        return STAGE_TEXT[pred]

    if abs(top1 - top2) == 1 and proba[top2] >= 0.15:
        return f"{STAGE_TEXT[top1]}（接近{STAGE_TEXT[top2]}）"

    return STAGE_TEXT[top1]


def get_display_text_from_meta(proba, pred, meta):
    """
    顯示文字比最終分類更敏感：
    - p3 >= 0.18：成熟，明顯接近過熟
    - p3 >= 0.08：成熟，但已有過熟傾向
    """
    if len(proba) >= 4:
        sorted_idx = np.argsort(proba)[::-1]
        top1 = int(sorted_idx[0])
        p3 = float(proba[3])

        if top1 == 2 and p3 >= 0.18:
            return "成熟，明顯接近過熟"
        elif top1 == 2 and p3 >= 0.08:
            return "成熟，但已有過熟傾向"

    policy = meta.get("display_policy", {})
    mode = policy.get("mode", "base")

    if mode == "base":
        return get_closest_stage_text(proba, pred)

    if mode == "s3_sensitive":
        rule = policy.get("rule", {})
        trigger_pred_stage = int(rule.get("trigger_pred_stage", 2))
        s3_min_proba = float(rule.get("s3_min_proba", 0.08))
        s2s3_min_sum = float(rule.get("s2s3_min_sum", 0.66))
        custom_text = rule.get("display_text", "成熟，但已有過熟傾向")

        if (
            pred == trigger_pred_stage and
            len(proba) >= 4 and
            float(proba[3]) >= s3_min_proba and
            float(proba[2] + proba[3]) >= s2s3_min_sum
        ):
            return custom_text

        return get_closest_stage_text(proba, pred)

    return get_closest_stage_text(proba, pred)


def print_probabilities(proba):
    print("\n" + "=" * 60)
    print("📈 詳細機率")
    print("=" * 60)

    for i, p in enumerate(proba):
        print(f"Stage {i}（{STAGE_TEXT[i]}）: {p:.4f} ({p*100:.2f}%)")

    print("-" * 60)

    sorted_idx = np.argsort(proba)[::-1]
    top1 = int(sorted_idx[0])
    top2 = int(sorted_idx[1])
    gap = float(proba[top1] - proba[top2])

    print(f"Top-1: Stage {top1}（{STAGE_TEXT[top1]}）")
    print(f"Top-2: Stage {top2}（{STAGE_TEXT[top2]}）")
    print(f"Probability gap = {gap:.4f}")

    if gap < 0.10:
        print("⚠️ 這是一個邊界案例，前兩類非常接近")
    elif gap < 0.20:
        print("ℹ️ 這顆鳳梨有一點接近次高類別")
    else:
        print("✅ 這次預測相對明確")


def air_or_no_sample_guard(feat, proba=None):
    reasons = []

    mq2_mean_norm = float(feat.get("MQ2_mean_norm", 999.0))
    mq9_min_norm = float(feat.get("MQ9_min_norm", 999.0))
    tgs2602_min_norm = float(feat.get("TGS2602_min_norm", 999.0))
    mq3_std_norm = float(feat.get("MQ3_std_norm", 999.0))
    tgs2602_std_norm = float(feat.get("TGS2602_std_norm", 999.0))
    mq9_slope = float(feat.get("MQ9_slope", 999.0))
    mq3_mq135_ratio = float(feat.get("MQ3_MQ135_ratio", 0.0))

    p3 = 0.0
    if proba is not None and len(proba) >= 4:
        p3 = float(proba[3])

    # 有明顯鳳梨訊號時，不要誤判成空氣
    if tgs2602_min_norm > 1.02:
        return False, ["TGS2602_min_norm 高於 1.02，視為有效樣本"]

    if mq3_mq135_ratio > 2.00:
        return False, ["MQ3_MQ135_ratio 高於 2.00，視為有效樣本"]

    if p3 >= 0.08 and mq3_mq135_ratio > 1.98:
        return False, [f"Stage3={p3:.4f} 且 MQ3_MQ135_ratio 偏高，視為有效樣本"]

    baseline_hits = 0
    weak_signal_hits = 0

    if 0.99 <= mq2_mean_norm <= 1.01:
        baseline_hits += 1
        reasons.append(f"MQ2_mean_norm={mq2_mean_norm:.6f} 非常接近 baseline")

    if 0.99 <= mq9_min_norm <= 1.01:
        baseline_hits += 1
        reasons.append(f"MQ9_min_norm={mq9_min_norm:.6f} 非常接近 baseline")

    if 0.99 <= tgs2602_min_norm <= 1.01:
        baseline_hits += 1
        reasons.append(f"TGS2602_min_norm={tgs2602_min_norm:.6f} 非常接近 baseline")

    if mq3_std_norm < 0.0028:
        weak_signal_hits += 1
        reasons.append(f"MQ3_std_norm={mq3_std_norm:.6f} 波動很小")

    if tgs2602_std_norm < 0.0030:
        weak_signal_hits += 1
        reasons.append(f"TGS2602_std_norm={tgs2602_std_norm:.6f} 波動很小")

    if abs(mq9_slope) < 0.006:
        weak_signal_hits += 1
        reasons.append(f"MQ9_slope={mq9_slope:.6f} 幾乎無趨勢")

    trigger = (baseline_hits == 3 and weak_signal_hits >= 2)
    return trigger, reasons


def overripe_override(pred, proba, feat):
    """
    最終實用版：
    - strong_rule：非常明確的過熟
    - normal_rule：保留 TGS2602，但門檻放寬到 0.97
    - soft_rule：完全不看 TGS2602，避免 baseline 偏高一直卡住
    """
    reasons = []

    if int(pred) != 2:
        return pred, False, reasons

    p3 = float(proba[3])
    p2 = float(proba[2])
    mq3_mq135_ratio = float(feat.get("MQ3_MQ135_ratio", 0.0))
    tgs2602_min_norm = float(feat.get("TGS2602_min_norm", 0.0))
    mq2_mean_norm = float(feat.get("MQ2_mean_norm", 999.0))

    print("\n" + "=" * 60)
    print("[DEBUG] stage3 features")
    print("=" * 60)
    print(f"Stage3 prob        = {p3:.6f}")
    print(f"Stage2 prob        = {p2:.6f}")
    print(f"Stage2+3           = {p2 + p3:.6f}")
    print(f"MQ3_MQ135_ratio    = {mq3_mq135_ratio:.6f}")
    print(f"TGS2602_min_norm   = {tgs2602_min_norm:.6f}")
    print(f"MQ2_mean_norm      = {mq2_mean_norm:.6f}")

    strong_rule = (
        p3 >= 0.10 and
        tgs2602_min_norm >= 1.05 and
        mq3_mq135_ratio >= 2.08
    )

    normal_rule = (
        p3 >= 0.11 and
        tgs2602_min_norm >= 0.97 and
        mq3_mq135_ratio >= 2.00 and
        mq2_mean_norm <= 1.01
    )

    # 關鍵修正：soft_rule 完全不再看 TGS2602
    soft_rule = (
        p3 >= 0.12 and
        p2 <= 0.75 and
        mq3_mq135_ratio >= 2.00
    )

    print(f"strong_rule        = {strong_rule}")
    print(f"normal_rule        = {normal_rule}")
    print(f"soft_rule          = {soft_rule}")

    if strong_rule:
        reasons.append(
            f"強條件成立：Stage3={p3:.4f}, "
            f"TGS2602_min_norm={tgs2602_min_norm:.6f}, "
            f"MQ3_MQ135_ratio={mq3_mq135_ratio:.6f}"
        )

    if normal_rule and not strong_rule:
        reasons.append(
            f"一般條件成立：Stage3={p3:.4f}, "
            f"TGS2602_min_norm={tgs2602_min_norm:.6f}, "
            f"MQ3_MQ135_ratio={mq3_mq135_ratio:.6f}, "
            f"MQ2_mean_norm={mq2_mean_norm:.6f}"
        )

    if soft_rule and not strong_rule and not normal_rule:
        reasons.append(
            f"軟條件成立：Stage3={p3:.4f}, "
            f"Stage2={p2:.4f}, "
            f"MQ3_MQ135_ratio={mq3_mq135_ratio:.6f}"
        )

    if strong_rule or normal_rule or soft_rule:
        return 3, True, reasons

    return pred, False, reasons


def build_final_display_percent(raw_percent, final_pred, override_used, proba, feat):
    if not override_used or final_pred != 3:
        return raw_percent

    p3 = float(proba[3])
    tgs = float(feat.get("TGS2602_min_norm", 1.0))
    ratio = float(feat.get("MQ3_MQ135_ratio", 1.0))

    p3_score = np.clip((p3 - 0.08) / 0.22, 0.0, 1.0)
    tgs_score = np.clip((tgs - 0.970) / 0.165, 0.0, 1.0)
    ratio_score = np.clip((ratio - 2.00) / 0.18, 0.0, 1.0)

    override_strength = (p3_score + tgs_score + ratio_score) / 3.0
    override_percent = int(round(83 + 17 * override_strength))
    override_percent = max(83, min(100, override_percent))

    return max(raw_percent, override_percent)


def parse_sensor_row(row_dict):
    try:
        return {
            "MQ2": float(row_dict["MQ2_raw"]),
            "MQ3": float(row_dict["MQ3_raw"]),
            "MQ9": float(row_dict["MQ9_raw"]),
            "MQ135": float(row_dict["MQ135_raw"]),
            "TGS2602": float(row_dict["TGS2602_raw"]),
        }
    except Exception:
        return None


# ============================================================
# 自動找 Arduino port
# ============================================================
port = auto_detect_port()
print("Arduino port:", port)

ser = serial.Serial(port, BAUD, timeout=1)
time.sleep(2)
ser.reset_input_buffer()

# ============================================================
# 載入模型 / 特徵 / baseline / meta
# ============================================================
with open("deploy_student.pkl", "rb") as f:
    model = pickle.load(f)

with open("feature_columns.json", "r", encoding="utf-8") as f:
    feature_columns = json.load(f)

with open("deploy_meta.json", "r", encoding="utf-8") as f:
    meta = json.load(f)

with open("air_base.json", "r", encoding="utf-8") as f:
    air = json.load(f)

print("Model loaded")
print(f"Feature count: {len(feature_columns)}")
print(f"Target window: {meta.get('target_window_sec', WINDOW)} sec")

# ============================================================
# 讀取 CSV header
# ============================================================
header = None
print("等待 CSV header ...")

while True:
    line = ser.readline().decode("utf-8", errors="ignore").strip()
    if not line:
        continue

    if line.startswith("timestamp_ms,"):
        header = [x.strip() for x in line.split(",")]
        print("CSV header detected")
        break

# ============================================================
# 收集資料：前置累積 + 最後 30 秒推論
# ============================================================
all_rows = []
t0 = time.time()
last_print_sec = -1

if WARMUP_SEC > 0:
    print(f"開始前置累積 {WARMUP_SEC} 秒，之後取最後 {WINDOW} 秒做推論...")
else:
    print(f"直接收集 {WINDOW} 秒做推論...")

while time.time() - t0 < TOTAL_SEC:
    line = ser.readline().decode("utf-8", errors="ignore").strip()
    if not line:
        continue

    if (
        line.startswith("#") or
        line.startswith("✅") or
        line.startswith("❌") or
        line.startswith("📋") or
        line.startswith("⏱") or
        line.startswith("🍍") or
        line.startswith("===")
    ):
        continue

    vals = [x.strip() for x in line.split(",")]
    if len(vals) != len(header):
        continue

    row = dict(zip(header, vals))
    parsed = parse_sensor_row(row)
    if parsed is None:
        continue

    all_rows.append(parsed)

    elapsed = int(time.time() - t0)
    if elapsed != last_print_sec:
        last_print_sec = elapsed
        if elapsed < WARMUP_SEC:
            print(f"Warmup {elapsed}/{WARMUP_SEC} sec | total_rows={len(all_rows)}", end="\r")
        else:
            infer_elapsed = elapsed - WARMUP_SEC
            infer_elapsed = max(0, min(WINDOW, infer_elapsed))
            print(f"Collecting inference window {infer_elapsed}/{WINDOW} sec | total_rows={len(all_rows)}", end="\r")

print()

if len(all_rows) == 0:
    raise RuntimeError("❌ 沒有收集到任何有效感測資料")

rows = all_rows[-WINDOW:] if len(all_rows) > WINDOW else all_rows

print(f"Total collected rows = {len(all_rows)}")
print(f"Rows used for inference = {len(rows)} (last window)")

if len(rows) == 0:
    raise RuntimeError("❌ 推論窗口沒有有效資料")

# ============================================================
# 整理資料
# ============================================================
data = {s: np.array([r[s] for r in rows], dtype=float) for s in SENSORS}


def base(sensor_name):
    v = air.get(sensor_name, 1.0)
    if v is None or not np.isfinite(v) or v == 0:
        return 1.0
    return float(v)


# ============================================================
# 特徵工程
# ============================================================
feat = {}

feat["MQ2_MQ3_ratio"] = safe_ratio(np.mean(data["MQ2"]), np.mean(data["MQ3"]))
feat["MQ3_MQ135_ratio"] = safe_ratio(np.mean(data["MQ3"]), np.mean(data["MQ135"]))
feat["MQ3_TGS2602_ratio"] = safe_ratio(np.mean(data["MQ3"]), np.mean(data["TGS2602"]))
feat["MQ3_MQ135_correlation"] = safe_corr(data["MQ3"], data["MQ135"])

feat["MQ2_auc_norm"] = safe_auc(data["MQ2"]) / (len(data["MQ2"]) * base("MQ2"))
feat["MQ2_mean_norm"] = np.mean(data["MQ2"]) / base("MQ2")

feat["MQ3_range_norm"] = (np.max(data["MQ3"]) - np.min(data["MQ3"])) / base("MQ3")
feat["MQ3_max_norm"] = np.max(data["MQ3"]) / base("MQ3")
feat["MQ3_std_norm"] = np.std(data["MQ3"]) / base("MQ3")

feat["MQ9_slope"] = safe_slope(data["MQ9"])
feat["MQ9_min_norm"] = np.min(data["MQ9"]) / base("MQ9")
feat["MQ9_delta_mean"] = safe_mean_diff(data["MQ9"])

feat["TGS2602_min_norm"] = np.min(data["TGS2602"]) / base("TGS2602")
feat["TGS2602_delta_std"] = np.std(np.diff(data["TGS2602"])) if len(data["TGS2602"]) >= 2 else 0.0
feat["TGS2602_std_norm"] = np.std(data["TGS2602"]) / base("TGS2602")

# ============================================================
# 顯示 raw summary 與特徵
# ============================================================
print_sensor_summary(data)
print_feature_summary(feature_columns, feat)

# ============================================================
# 建立 feature vector
# ============================================================
X = [feat.get(f, 0.0) for f in feature_columns]
X = np.array(X, dtype=float).reshape(1, -1)

# ============================================================
# 預測
# ============================================================
raw_pred = int(model.predict(X)[0])

if hasattr(model, "predict_proba"):
    proba = model.predict_proba(X)[0]
else:
    proba = np.zeros(4, dtype=float)
    proba[raw_pred] = 1.0

print_probabilities(proba)

# ============================================================
# 空氣 / 無樣本防呆
# ============================================================
guard_triggered, guard_reasons = air_or_no_sample_guard(feat, proba=proba)

# ============================================================
# 第一層：展示文字
# ============================================================
display_text = get_display_text_from_meta(proba, raw_pred, meta)

# ============================================================
# 第二層：過熟校正
# ============================================================
final_pred, override_used, override_reasons = overripe_override(raw_pred, proba, feat)

if override_used:
    display_text = "過熟"

# ============================================================
# 成熟度條
# ============================================================
raw_maturity_percent = build_raw_maturity_percent(proba)
final_maturity_percent = build_final_display_percent(
    raw_percent=raw_maturity_percent,
    final_pred=final_pred,
    override_used=override_used,
    proba=proba,
    feat=feat,
)

final_maturity_bar = build_bar(final_maturity_percent)
zone_text = maturity_zone_text(final_maturity_percent)
overripe_text = overripe_tendency_text(proba[3])

# ============================================================
# 最終輸出
# ============================================================
print("\n" + "=" * 60)
print("🍍 結果")
print("=" * 60)

if guard_triggered:
    print("成熟度判定：⚠️ 無有效鳳梨訊號")
    print(f"原始模型分類：Stage {raw_pred}（{STAGE_TEXT[raw_pred]}）")
    print("校正後分類：—")
    print(f"成熟度條：[ {build_bar(raw_maturity_percent)} ] {raw_maturity_percent}%")
    print(f"成熟區段：{maturity_zone_text(raw_maturity_percent)}")
    print(f"過熟傾向：{overripe_text}")
    print("空氣/無樣本防呆：✅ 已觸發")
    print("判定依據：")
    for r in guard_reasons:
        print(f" - {r}")
else:
    print(f"成熟度判定：{display_text}")
    print(f"原始模型分類：Stage {raw_pred}（{STAGE_TEXT[raw_pred]}）")
    print(f"校正後分類：Stage {final_pred}（{STAGE_TEXT[final_pred]}）")

    if override_used and final_pred == 3:
        print(f"原始成熟度條：[ {build_bar(raw_maturity_percent)} ] {raw_maturity_percent}%")
        print(f"校正後成熟度條：[ {final_maturity_bar} ] {final_maturity_percent}%")
    else:
        print(f"成熟度條：[ {final_maturity_bar} ] {final_maturity_percent}%")

    print(f"成熟區段：{zone_text}")
    print(f"過熟傾向：{overripe_text}")
    print("空氣/無樣本防呆：— 未觸發")

    if override_used:
        print("過熟校正：✅ 已啟用")
        print("校正依據：")
        for r in override_reasons:
            print(f" - {r}")
    else:
        print("過熟校正：— 未啟用")

print("=" * 60)
print("Program finished")