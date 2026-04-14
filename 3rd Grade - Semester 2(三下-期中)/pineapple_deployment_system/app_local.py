from flask import Flask, render_template_string, request
import json
import re
import paramiko
import shlex

app = Flask(__name__)

# ============================================================
# Raspberry Pi 設定
# ============================================================
RPI_USER = "linguanyu"
RPI_PASSWORD = "DdoKk///23"
RPI_IP = "192.168.0.152"
RPI_PROJECT_DIR = "/home/linguanyu/pineapple"

RPI_ACTIVATE = "source .venv/bin/activate"
AIR_SCRIPT = "calibrate_air_30s.py"
INFER_SCRIPT = "inference_30s.py"


# ============================================================
# 工具：透過 Paramiko 執行 Raspberry Pi 腳本（可帶參數）
# ============================================================
def run_remote_script(script_name, args=""):
    # 避免參數中有奇怪字元造成 shell 問題
    safe_script = shlex.quote(script_name)
    safe_args = args.strip()

    remote_cmd = (
        f"cd {shlex.quote(RPI_PROJECT_DIR)} && "
        f"{RPI_ACTIVATE} && "
        f"python {safe_script} {safe_args}"
    )

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        client.connect(
            hostname=RPI_IP,
            username=RPI_USER,
            password=RPI_PASSWORD,
            timeout=15,
            banner_timeout=15,
            auth_timeout=15
        )

        # timeout 拉高，因為現在可能會有 warmup
        stdin, stdout, stderr = client.exec_command(remote_cmd, timeout=420)

        out_text = stdout.read().decode("utf-8", errors="replace")
        err_text = stderr.read().decode("utf-8", errors="replace")

        output = ""
        if out_text:
            output += out_text
        if err_text:
            output += "\n[stderr]\n" + err_text

        if not output.strip():
            output = "(沒有輸出)"

        return output

    except Exception as e:
        return f"執行失敗：{e}"

    finally:
        try:
            client.close()
        except Exception:
            pass


# ============================================================
# 小工具
# ============================================================
def stage_name(stage):
    mapping = {
        0: "未熟",
        1: "初熟",
        2: "成熟",
        3: "過熟",
    }
    return mapping.get(stage, f"Stage {stage}")


def stage_color(stage):
    mapping = {
        0: "#3b82f6",
        1: "#22c55e",
        2: "#f59e0b",
        3: "#ef4444",
    }
    return mapping.get(stage, "#6b7280")


def badge_class_from_text(text: str):
    if not text:
        return "tag-gray"

    if "無有效鳳梨訊號" in text:
        return "tag-orange"

    if "過熟" in text:
        return "tag-red"

    if "成熟" in text:
        return "tag-amber"

    if "初熟" in text:
        return "tag-green"

    if "未熟" in text:
        return "tag-blue"

    return "tag-gray"


def mode_name_from_warmup(warmup_sec: int):
    if warmup_sec <= 0:
        return "快速檢測"
    if warmup_sec == 60:
        return "標準檢測"
    if warmup_sec == 180:
        return "完整檢測"
    return f"自訂檢測（前置 {warmup_sec} 秒）"


# ============================================================
# 工具：解析 air calibration 結果
# ============================================================
def parse_air_output(output: str):
    data = {
        "type": "air",
        "success": False,
        "port": None,
        "baseline": None,
        "raw_output": output
    }

    m_port = re.search(r"Arduino port:\s*(.+)", output)
    if m_port:
        data["port"] = m_port.group(1).strip()

    m_json = re.search(r"(\{[\s\S]*\})\s*$", output.strip())
    if m_json:
        try:
            baseline = json.loads(m_json.group(1))
            data["baseline"] = baseline
            data["success"] = True
        except Exception:
            pass

    return data


# ============================================================
# 工具：解析 inference 結果
# ============================================================
def parse_infer_output(output: str):
    data = {
        "type": "infer",
        "success": False,
        "port": None,
        "feature_count": None,
        "target_window": None,
        "warmup_sec": None,
        "measure_mode": None,

        "display_text": None,

        "raw_stage": None,
        "raw_stage_text": None,

        "final_stage": None,
        "final_stage_text": None,

        "raw_maturity_percent": None,
        "final_maturity_percent": None,

        "maturity_zone": None,
        "overripe_tendency": None,

        "guard_triggered": False,
        "override_used": False,

        "guard_reasons": [],
        "override_reasons": [],

        "probabilities": [],
        "sensor_summary": [],
        "feature_values": [],
        "raw_output": output,
    }

    m_port = re.search(r"Arduino port:\s*(.+)", output)
    if m_port:
        data["port"] = m_port.group(1).strip()

    m_feat_count = re.search(r"Feature count:\s*(\d+)", output)
    if m_feat_count:
        data["feature_count"] = int(m_feat_count.group(1))

    m_target_window = re.search(r"Target window:\s*(\d+)\s*sec", output)
    if m_target_window:
        data["target_window"] = int(m_target_window.group(1))

    m_warmup = re.search(r"Warmup sec:\s*(\d+)", output)
    if m_warmup:
        data["warmup_sec"] = int(m_warmup.group(1))
        data["measure_mode"] = mode_name_from_warmup(data["warmup_sec"])

    m_display = re.search(r"成熟度判定：(.+)", output)
    if m_display:
        data["display_text"] = m_display.group(1).strip()

    m_raw = re.search(r"原始模型分類：Stage\s*(\d+)\s*（(.+?)）", output)
    if m_raw:
        data["raw_stage"] = int(m_raw.group(1))
        data["raw_stage_text"] = m_raw.group(2).strip()

    m_final = re.search(r"校正後分類：Stage\s*(\d+)\s*（(.+?)）", output)
    if m_final:
        data["final_stage"] = int(m_final.group(1))
        data["final_stage_text"] = m_final.group(2).strip()

    if "校正後分類：—" in output:
        data["final_stage"] = None
        data["final_stage_text"] = None

    m_raw_bar = re.search(r"原始成熟度條：\[.*?\]\s*(\d+)%", output)
    if m_raw_bar:
        data["raw_maturity_percent"] = int(m_raw_bar.group(1))

    m_final_bar = re.search(r"校正後成熟度條：\[.*?\]\s*(\d+)%", output)
    if m_final_bar:
        data["final_maturity_percent"] = int(m_final_bar.group(1))

    if data["raw_maturity_percent"] is None and data["final_maturity_percent"] is None:
        m_single_bar = re.search(r"成熟度條：\[.*?\]\s*(\d+)%", output)
        if m_single_bar:
            pct = int(m_single_bar.group(1))
            data["final_maturity_percent"] = pct

    m_zone = re.search(r"成熟區段：(.+)", output)
    if m_zone:
        data["maturity_zone"] = m_zone.group(1).strip()

    m_over = re.search(r"過熟傾向：(.+)", output)
    if m_over:
        data["overripe_tendency"] = m_over.group(1).strip()

    if "空氣/無樣本防呆：✅ 已觸發" in output:
        data["guard_triggered"] = True

    if "過熟校正：✅ 已啟用" in output:
        data["override_used"] = True

    prob_matches = re.findall(
        r"Stage\s*(\d+)\s*（.*?）:\s*([0-9.]+)\s*\(([0-9.]+)%\)",
        output
    )
    probs = []
    for stage_idx, prob_val, prob_pct in prob_matches:
        stage_idx = int(stage_idx)
        probs.append({
            "stage": stage_idx,
            "stage_text": stage_name(stage_idx),
            "prob": float(prob_val),
            "percent": float(prob_pct),
            "color": stage_color(stage_idx)
        })
    if probs:
        data["probabilities"] = probs

    m_sensor_block = re.search(
        r"Raw sensor summary.*?\n=+\n([\s\S]*?)\n=+\n.*?Feature values used by model",
        output
    )
    if m_sensor_block:
        sensor_block = m_sensor_block.group(1)
        sensor_lines = sensor_block.strip().splitlines()
        parsed_sensors = []

        for line in sensor_lines:
            line = line.strip()
            if not line:
                continue

            m = re.match(
                r"([A-Za-z0-9_]+)\s*\|\s*mean=\s*([0-9.\-]+)\s*\|\s*min=\s*([0-9.\-]+)\s*\|\s*max=\s*([0-9.\-]+)\s*\|\s*std=\s*([0-9.\-]+)",
                line
            )
            if m:
                parsed_sensors.append({
                    "name": m.group(1),
                    "mean": float(m.group(2)),
                    "min": float(m.group(3)),
                    "max": float(m.group(4)),
                    "std": float(m.group(5)),
                })

        data["sensor_summary"] = parsed_sensors

    m_feat_block = re.search(
        r"Feature values used by model.*?\n=+\n([\s\S]*?)\n=+\n.*?(?:詳細機率|Class probabilities)",
        output
    )
    if m_feat_block:
        feat_block = m_feat_block.group(1)
        feat_lines = feat_block.strip().splitlines()
        parsed_feats = []

        for line in feat_lines:
            line = line.strip()
            if not line or "=" not in line:
                continue

            parts = line.split("=")
            if len(parts) >= 2:
                name = parts[0].strip()
                value_text = parts[1].strip()
                try:
                    value = float(value_text)
                except Exception:
                    value = value_text

                parsed_feats.append({
                    "name": name,
                    "value": value
                })

        data["feature_values"] = parsed_feats

    lines = output.splitlines()
    guard_reasons = []
    override_reasons = []

    current_mode = None
    for raw_line in lines:
        line = raw_line.strip()

        if line.startswith("判定依據："):
            current_mode = "guard"
            continue

        if line.startswith("校正依據："):
            current_mode = "override"
            continue

        if line.startswith("=") or line.startswith("Program finished") or line.startswith("🍍 結果"):
            current_mode = None
            continue

        if line.startswith("- "):
            if current_mode == "guard":
                guard_reasons.append(line[2:].strip())
            elif current_mode == "override":
                override_reasons.append(line[2:].strip())

    data["guard_reasons"] = guard_reasons
    data["override_reasons"] = override_reasons

    if data["display_text"] or data["raw_stage"] is not None:
        data["success"] = True

    return data


# ============================================================
# HTML
# ============================================================
HTML_PAGE = """
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Pineapple Ripeness Detector</title>
<meta name="viewport" content="width=device-width, initial-scale=1">

<style>
:root{
    --bg:#f4f7fb;
    --card:#ffffff;
    --line:#e5e7eb;
    --text:#1f2937;
    --muted:#6b7280;
    --shadow:0 10px 30px rgba(0,0,0,0.08);
}
*{ box-sizing:border-box; }
body{
    font-family: Arial, sans-serif;
    background:var(--bg);
    margin:0;
    padding:28px;
    color:var(--text);
}
.container{
    max-width:1200px;
    margin:auto;
}
.card{
    background:var(--card);
    border-radius:20px;
    padding:24px;
    margin-bottom:20px;
    box-shadow:var(--shadow);
}
h1,h2,h3{
    margin-top:0;
    margin-bottom:12px;
}
.header{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    flex-wrap:wrap;
    gap:12px;
}
.small{
    color:var(--muted);
    font-size:14px;
    line-height:1.6;
}
.btn-row{
    display:flex;
    gap:12px;
    flex-wrap:wrap;
    align-items:stretch;
}
form{ margin:0; }
.mode-card{
    background:#f9fafb;
    border:1px solid var(--line);
    border-radius:16px;
    padding:14px;
    min-width:250px;
}
.mode-title{
    font-size:15px;
    font-weight:800;
    margin-bottom:8px;
}
.mode-desc{
    font-size:13px;
    color:var(--muted);
    margin-bottom:12px;
    line-height:1.6;
}
button{
    width:100%;
    font-size:15px;
    padding:14px 18px;
    border:none;
    border-radius:14px;
    cursor:pointer;
    background:#2563eb;
    color:white;
    font-weight:700;
    box-shadow:0 8px 18px rgba(37,99,235,0.22);
}
button:hover{
    filter:brightness(0.96);
}
button.air{
    background:#0891b2;
    box-shadow:0 8px 18px rgba(8,145,178,0.22);
}
button.quick{
    background:#2563eb;
}
button.std{
    background:#7c3aed;
}
button.full{
    background:#ea580c;
}
.result-big{
    font-size:30px;
    font-weight:800;
    margin-bottom:8px;
}
.tag{
    display:inline-block;
    padding:8px 12px;
    border-radius:999px;
    font-size:13px;
    font-weight:700;
    margin-right:8px;
    margin-bottom:8px;
}
.tag-green{ background:#dcfce7; color:#166534; }
.tag-blue{ background:#dbeafe; color:#1d4ed8; }
.tag-orange{ background:#ffedd5; color:#c2410c; }
.tag-red{ background:#fee2e2; color:#b91c1c; }
.tag-amber{ background:#fef3c7; color:#92400e; }
.tag-purple{ background:#ede9fe; color:#6d28d9; }
.tag-gray{ background:#f3f4f6; color:#374151; }

.grid{
    display:grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap:16px;
}
.mini-card{
    background:#f9fafb;
    border-radius:14px;
    padding:16px;
    border:1px solid var(--line);
}
.mini-title{
    font-size:13px;
    color:var(--muted);
    margin-bottom:8px;
}
.mini-value{
    font-size:24px;
    font-weight:800;
}
.mono{
    font-family: Consolas, monospace;
}
.table{
    width:100%;
    border-collapse:collapse;
}
.table th, .table td{
    border-bottom:1px solid var(--line);
    padding:10px 8px;
    text-align:left;
    font-size:14px;
}
.bar-wrap{
    background:#e5e7eb;
    border-radius:999px;
    overflow:hidden;
    height:18px;
    margin-top:8px;
}
.bar{
    height:18px;
    background:linear-gradient(90deg,#3b82f6,#22c55e,#f59e0b,#ef4444);
}
.bar-gray{
    height:18px;
    background:linear-gradient(90deg,#94a3b8,#64748b);
}
.section-line{
    height:1px;
    background:var(--line);
    margin:20px 0;
}
.prob-row{
    margin-bottom:14px;
}
.prob-label{
    display:flex;
    justify-content:space-between;
    gap:12px;
    margin-bottom:6px;
    font-size:14px;
}
.prob-bg{
    background:#e5e7eb;
    height:14px;
    border-radius:999px;
    overflow:hidden;
}
.prob-fill{
    height:14px;
    border-radius:999px;
}
.reason-list{
    margin:0;
    padding-left:20px;
    color:#374151;
}
.reason-list li{
    margin-bottom:8px;
    line-height:1.5;
}
details{
    margin-top:18px;
}
summary{
    cursor:pointer;
    font-weight:700;
}
pre{
    background:#111827;
    color:#d1fae5;
    padding:16px;
    border-radius:14px;
    overflow-x:auto;
    white-space:pre-wrap;
    word-wrap:break-word;
    line-height:1.5;
}
.loading{
    display:none;
    position:fixed;
    inset:0;
    background:rgba(255,255,255,0.72);
    z-index:9999;
    align-items:center;
    justify-content:center;
    backdrop-filter: blur(3px);
}
.loading-box{
    background:white;
    padding:24px 28px;
    border-radius:18px;
    box-shadow:var(--shadow);
    text-align:center;
    min-width:320px;
}
.spinner{
    width:46px;
    height:46px;
    border:5px solid #dbeafe;
    border-top:5px solid #2563eb;
    border-radius:50%;
    margin:0 auto 14px auto;
    animation:spin 1s linear infinite;
}
@keyframes spin{
    0%{ transform:rotate(0deg); }
    100%{ transform:rotate(360deg); }
}
</style>

<script>
function showLoading(msg, submsg){
    const overlay = document.getElementById("loading-overlay");
    const text = document.getElementById("loading-text");
    const sub = document.getElementById("loading-subtext");
    text.innerText = msg;
    sub.innerText = submsg || "請稍候...";
    overlay.style.display = "flex";
}
</script>
</head>

<body>

<div id="loading-overlay" class="loading">
    <div class="loading-box">
        <div class="spinner"></div>
        <div id="loading-text" style="font-weight:800; font-size:18px;">執行中，請稍候...</div>
        <div id="loading-subtext" class="small" style="margin-top:8px;">空氣校正約 30 秒，鳳梨量測依模式而定</div>
    </div>
</div>

<div class="container">

    <div class="card">
        <div class="header">
            <div>
                <h1>🍍 Pineapple Ripeness Detector</h1>
                <div class="small">本機端網頁版（透過 SSH 控制 Raspberry Pi）</div>
            </div>
            <div class="small">
                Raspberry Pi：{{ user }}@{{ ip }}<br>
                路徑：{{ rpi_dir }}
            </div>
        </div>
    </div>

    <div class="card">
        <h2>操作</h2>

        <div class="btn-row" style="margin-bottom:14px;">
            <form method="post" action="/air"
                  onsubmit="showLoading('🌫️ 正在進行空氣校正...', '將收集 30 秒空氣 baseline')"
                  style="width:100%;">
                <button class="air" type="submit">🌫️ 空氣校正（30 秒）</button>
            </form>
        </div>

        <div class="btn-row">
            <div class="mode-card">
                <div class="mode-title">快速檢測</div>
                <div class="mode-desc">不做前置累積，直接量 30 秒。適合快速查看。</div>
                <form method="post" action="/infer"
                      onsubmit="showLoading('🍍 快速檢測中...', '前置累積 0 秒，量測窗口 30 秒')">
                    <input type="hidden" name="warmup_sec" value="0">
                    <button class="quick" type="submit">🍍 直接 30 秒</button>
                </form>
            </div>

            <div class="mode-card">
                <div class="mode-title">標準檢測</div>
                <div class="mode-desc">先讓氣味累積 60 秒，再取最後 30 秒做模型推論。</div>
                <form method="post" action="/infer"
                      onsubmit="showLoading('⏳ 標準檢測中...', '前置累積 60 秒，之後取最後 30 秒')">
                    <input type="hidden" name="warmup_sec" value="60">
                    <button class="std" type="submit">⏳ 先等 60 秒再測</button>
                </form>
            </div>

            <div class="mode-card">
                <div class="mode-title">完整檢測</div>
                <div class="mode-desc">先讓氣味累積 180 秒，再取最後 30 秒做模型推論。</div>
                <form method="post" action="/infer"
                      onsubmit="showLoading('🧪 完整檢測中...', '前置累積 180 秒，之後取最後 30 秒')">
                    <input type="hidden" name="warmup_sec" value="180">
                    <button class="full" type="submit">🧪 先等 180 秒再測</button>
                </form>
            </div>
        </div>
    </div>

    {% if mode == "air" and parsed %}
    <div class="card">
        <h2>空氣校正結果</h2>
        {% if parsed.success %}
            <div class="tag tag-green">✅ air_base.json 建立成功</div>
            <div class="tag tag-blue">Port：{{ parsed.port }}</div>

            <div class="grid" style="margin-top:18px;">
                {% for k, v in parsed.baseline.items() %}
                <div class="mini-card">
                    <div class="mini-title">{{ k }}</div>
                    <div class="mini-value mono">{{ "%.3f"|format(v) if v is number else v }}</div>
                </div>
                {% endfor %}
            </div>
        {% else %}
            <div class="tag tag-orange">⚠️ 無法解析 air baseline 結果</div>
        {% endif %}

        <details>
            <summary>查看原始終端輸出</summary>
            <pre>{{ output }}</pre>
        </details>
    </div>
    {% endif %}

    {% if mode == "infer" and parsed %}
    <div class="card">
        <h2>量測結果</h2>

        {% if parsed.success %}
            <div class="result-big">🍍 {{ parsed.display_text }}</div>

            <div style="margin-bottom:12px;">
                <span class="tag {{ badge_class }}">判定：{{ parsed.display_text }}</span>

                {% if parsed.measure_mode %}
                    <span class="tag tag-purple">模式：{{ parsed.measure_mode }}</span>
                {% endif %}

                {% if parsed.guard_triggered %}
                    <span class="tag tag-orange">空氣 / 無樣本防呆已觸發</span>
                {% endif %}

                {% if parsed.override_used %}
                    <span class="tag tag-red">過熟校正已啟用</span>
                {% endif %}
            </div>

            <div class="small">
                {% if parsed.port %}Port：{{ parsed.port }}{% endif %}
                {% if parsed.target_window %}｜窗口：{{ parsed.target_window }} 秒{% endif %}
                {% if parsed.warmup_sec is not none %}｜前置累積：{{ parsed.warmup_sec }} 秒{% endif %}
                {% if parsed.feature_count %}｜Feature count：{{ parsed.feature_count }}{% endif %}
            </div>

            <div class="section-line"></div>

            <div class="grid">
                <div class="mini-card">
                    <div class="mini-title">原始模型分類</div>
                    <div class="mini-value">
                        {% if parsed.raw_stage is not none %}
                            Stage {{ parsed.raw_stage }}（{{ parsed.raw_stage_text }}）
                        {% else %}
                            —
                        {% endif %}
                    </div>
                </div>

                <div class="mini-card">
                    <div class="mini-title">校正後分類</div>
                    <div class="mini-value">
                        {% if parsed.final_stage is not none %}
                            Stage {{ parsed.final_stage }}（{{ parsed.final_stage_text }}）
                        {% else %}
                            —
                        {% endif %}
                    </div>
                </div>

                <div class="mini-card">
                    <div class="mini-title">成熟區段</div>
                    <div class="mini-value">{{ parsed.maturity_zone or "—" }}</div>
                </div>

                <div class="mini-card">
                    <div class="mini-title">過熟傾向</div>
                    <div class="mini-value">{{ parsed.overripe_tendency or "—" }}</div>
                </div>
            </div>

            <div class="section-line"></div>

            {% if parsed.raw_maturity_percent is not none and parsed.final_maturity_percent is not none and parsed.raw_maturity_percent != parsed.final_maturity_percent %}
                <h3>成熟度條</h3>

                <div class="small">原始成熟度條：{{ parsed.raw_maturity_percent }}%</div>
                <div class="bar-wrap">
                    <div class="bar-gray" style="width: {{ parsed.raw_maturity_percent }}%;"></div>
                </div>

                <div style="height:14px;"></div>

                <div class="small">校正後成熟度條：{{ parsed.final_maturity_percent }}%</div>
                <div class="bar-wrap">
                    <div class="bar" style="width: {{ parsed.final_maturity_percent }}%;"></div>
                </div>

            {% elif parsed.final_maturity_percent is not none %}
                <h3>成熟度條</h3>
                <div class="small">{{ parsed.final_maturity_percent }}%</div>
                <div class="bar-wrap">
                    <div class="bar" style="width: {{ parsed.final_maturity_percent }}%;"></div>
                </div>
            {% endif %}

            {% if parsed.probabilities %}
            <div class="section-line"></div>
            <div>
                <h3>四類機率</h3>
                {% for p in parsed.probabilities %}
                <div class="prob-row">
                    <div class="prob-label">
                        <span>Stage {{ p.stage }}（{{ p.stage_text }}）</span>
                        <span>{{ "%.2f"|format(p.percent) }}%</span>
                    </div>
                    <div class="prob-bg">
                        <div class="prob-fill" style="width: {{ p.percent }}%; background: {{ p.color }};"></div>
                    </div>
                </div>
                {% endfor %}
            </div>
            {% endif %}

            {% if parsed.guard_reasons %}
            <div class="section-line"></div>
            <div>
                <h3>空氣 / 無樣本防呆依據</h3>
                <ul class="reason-list">
                    {% for r in parsed.guard_reasons %}
                    <li>{{ r }}</li>
                    {% endfor %}
                </ul>
            </div>
            {% endif %}

            {% if parsed.override_reasons %}
            <div class="section-line"></div>
            <div>
                <h3>過熟校正依據</h3>
                <ul class="reason-list">
                    {% for r in parsed.override_reasons %}
                    <li>{{ r }}</li>
                    {% endfor %}
                </ul>
            </div>
            {% endif %}

            {% if parsed.sensor_summary %}
            <div class="section-line"></div>
            <div>
                <h3>原始感測器摘要</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Sensor</th>
                            <th>Mean</th>
                            <th>Min</th>
                            <th>Max</th>
                            <th>Std</th>
                        </tr>
                    </thead>
                    <tbody>
                        {% for s in parsed.sensor_summary %}
                        <tr>
                            <td>{{ s.name }}</td>
                            <td>{{ "%.3f"|format(s.mean) }}</td>
                            <td>{{ "%.3f"|format(s.min) }}</td>
                            <td>{{ "%.3f"|format(s.max) }}</td>
                            <td>{{ "%.3f"|format(s.std) }}</td>
                        </tr>
                        {% endfor %}
                    </tbody>
                </table>
            </div>
            {% endif %}

            {% if parsed.feature_values %}
            <div class="section-line"></div>
            <div>
                <h3>模型特徵值</h3>
                <div class="grid">
                    {% for f in parsed.feature_values %}
                    <div class="mini-card">
                        <div class="mini-title">{{ f.name }}</div>
                        <div class="mono" style="font-size:18px; font-weight:700;">
                            {% if f.value is number %}
                                {{ "%.6f"|format(f.value) }}
                            {% else %}
                                {{ f.value }}
                            {% endif %}
                        </div>
                    </div>
                    {% endfor %}
                </div>
            </div>
            {% endif %}

        {% else %}
            <div class="tag tag-orange">⚠️ 無法解析推論結果，請查看原始輸出</div>
        {% endif %}

        <details>
            <summary>查看原始終端輸出</summary>
            <pre>{{ output }}</pre>
        </details>
    </div>
    {% endif %}

    {% if mode == "none" %}
    <div class="card">
        <h2>目前狀態</h2>
        <div class="small">尚未執行操作，請先點上方按鈕。</div>
    </div>
    {% endif %}

</div>
</body>
</html>
"""


# ============================================================
# Routes
# ============================================================
@app.route("/")
def index():
    return render_template_string(
        HTML_PAGE,
        output="",
        parsed=None,
        mode="none",
        user=RPI_USER,
        ip=RPI_IP,
        rpi_dir=RPI_PROJECT_DIR,
        badge_class="tag-gray"
    )


@app.route("/air", methods=["POST"])
def run_air():
    output = run_remote_script(AIR_SCRIPT)
    parsed = parse_air_output(output)

    return render_template_string(
        HTML_PAGE,
        output=output,
        parsed=parsed,
        mode="air",
        user=RPI_USER,
        ip=RPI_IP,
        rpi_dir=RPI_PROJECT_DIR,
        badge_class="tag-gray"
    )


@app.route("/infer", methods=["POST"])
def run_infer():
    warmup_sec = request.form.get("warmup_sec", "0").strip()
    if not warmup_sec.isdigit():
        warmup_sec = "0"

    warmup_sec_int = int(warmup_sec)
    args = f"--warmup-sec {warmup_sec_int}"

    output = run_remote_script(INFER_SCRIPT, args=args)
    parsed = parse_infer_output(output)

    # 保底：如果 Pi 端沒印出 Warmup sec，前端也補上
    if parsed.get("warmup_sec") is None:
        parsed["warmup_sec"] = warmup_sec_int
        parsed["measure_mode"] = mode_name_from_warmup(warmup_sec_int)

    badge_class = badge_class_from_text(parsed.get("display_text", ""))

    return render_template_string(
        HTML_PAGE,
        output=output,
        parsed=parsed,
        mode="infer",
        user=RPI_USER,
        ip=RPI_IP,
        rpi_dir=RPI_PROJECT_DIR,
        badge_class=badge_class
    )


# ============================================================
# main
# ============================================================
if __name__ == "__main__":
    print("Local Web App Running")
    print("Open Browser: http://127.0.0.1:5000")
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )