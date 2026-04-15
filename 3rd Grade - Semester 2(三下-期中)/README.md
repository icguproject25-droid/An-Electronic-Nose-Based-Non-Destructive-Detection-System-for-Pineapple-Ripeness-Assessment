根據設計規格書的完整內容，以下是專為你的專題設計的 GitHub README，可直接複製使用：

***

```markdown
<div align="center">

# 🍍 鳳梨成熟度辨識系統
### Pineapple Ripeness Detection System

*電子鼻 × 邊緣運算 × 機器學習 | Electronic Nose × Edge Computing × Machine Learning*

![Python](https://img.shields.io/badge/Python-3.7+-3776AB?style=flat-square&logo=python&logoColor=white)
![Arduino](https://img.shields.io/badge/Arduino-Mega_2560-00979D?style=flat-square&logo=arduino&logoColor=white)
![Raspberry Pi](https://img.shields.io/badge/Raspberry_Pi-3_Model_B-A22846?style=flat-square&logo=raspberry-pi&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-ExtraTrees-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-App-61DAFB?style=flat-square&logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-2.0+-000000?style=flat-square&logo=flask&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Version](https://img.shields.io/badge/Version-v1.0-blue?style=flat-square)

</div>

---

## 📖 專案簡介

本系統為**非破壞性鳳梨成熟度辨識系統**，結合電子鼻氣體感測器陣列、Arduino Mega、Raspberry Pi 3 以及機器學習模型，透過量測鳳梨周圍揮發性有機化合物（VOC）訊號，輸出**四階段成熟度分類結果**，協助農民、驗收人員與消費者進行快速且客觀的成熟度判定。

### 🎯 目標使用者

| 使用者 | 使用情境 |
|--------|----------|
| 🌾 **農民** | 採收與分級前快速判斷，減少農損 |
| 🔍 **驗收人員** | 降低主觀經驗差異，提供量化依據 |
| 🛒 **消費者** | 判斷是否適合立即食用 |

### 🍍 成熟度分級說明

| Stage | 說明 | 建議 |
|-------|------|------|
| **Stage 0** | 未成熟 | 再等 3–5 天 |
| **Stage 1** | 初熟 | 再等 1–2 天 |
| **Stage 2** | 完熟 | 立即食用 ✅ |
| **Stage 3** | 過熟 | 盡快食用 ⚠️ |

---

## 🏗️ 系統架構

本系統採用**五層分層式架構**，從底層感測到上層使用者介面完整整合：

```
┌─────────────────────────────────────────────────────────┐
│          👤 使用者端 User Interface Layer                │
│   消費端 App (React Native) │ 農民端 App │ Flask 模擬介面  │
├─────────────────────────────────────────────────────────┤
│          🌐 應用服務層 Application Service Layer         │
│         SSH 遠端控制 │ API 服務 │ 結果紀錄 / 報表         │
├─────────────────────────────────────────────────────────┤
│          🖥️ 運算處理層 Processing Layer                  │
│   Raspberry Pi 3 │ 特徵工程 │ ExtraTrees 推論 │ 後處理    │
├─────────────────────────────────────────────────────────┤
│          🔌 資料傳輸層 Data Transfer Layer               │
│        USB Serial (115200 baud) │ I²C (BME280)           │
├─────────────────────────────────────────────────────────┤
│          🔬 感測層 Sensing Layer                         │
│  Arduino Mega 2560 │ MQ 系列感測器 │ TGS 系列 │ BME280    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 硬體需求

### 元件清單

| 元件 | 規格 | 數量 | 用途 |
|------|------|------|------|
| Arduino Mega 2560 | ATmega2560, 16MHz | 1 | 感測器資料擷取 |
| Raspberry Pi 3 Model B | 1.2GHz Quad-Core, 1GB RAM | 1 | 邊緣運算、模型推論 |
| MQ-2 氣體感測器 | 煙霧 / 可燃氣體 | 1 | VOC 特徵擷取 |
| MQ-3 氣體感測器 | 酒精 / 乙醇 ⭐ | 1 | 酒精類揮發物偵測 |
| MQ-9 氣體感測器 | CO / 可燃氣體 | 1 | 一氧化碳類特徵 |
| MQ-135 氣體感測器 | 空氣品質 / 氨氣 | 1 | 氨氣類揮發物 |
| TGS2602 感測器 | VOC / 氨氣 ⭐⭐ | 1 | 核心 VOC 特徵（模型權重最高） |
| TGS2620 感測器 | 酒精 / 有機溶劑 | 1 | 有機溶劑類特徵 |
| BME280 | 溫度 / 濕度 / 氣壓 | 1 | 環境監測 |
| 麵包板 + 杜邦線 | 標準尺寸 | 若干 | 電路連接 |
| USB Type A-B 連接線 | — | 1 | Arduino ↔ Raspberry Pi |
| 電源供應器 | 5V 2.5A | 1 | Raspberry Pi 供電 |

### 硬體接線說明

- **氣體感測器（MQ/TGS）**：類比訊號輸出，連接至 Arduino `A0–A5`（10-bit ADC）
- **BME280**：I²C 協定，連接至 Arduino `SDA / SCL`
- **Arduino → Raspberry Pi**：USB Serial，`/dev/ttyACM0`，115200 baud

---

## 💻 軟體需求

### 開發環境

| 類別 | 規格 |
|------|------|
| Raspberry Pi OS | Debian-based Linux (最新穩定版) |
| Python | 3.7+ |
| Arduino IDE | 1.8+ |
| 版本控制 | Git / GitHub |

### Python 套件安裝

```bash
pip install scikit-learn numpy pandas flask paramiko pyserial
```

或使用 requirements.txt：

```bash
pip install -r requirements.txt
```

### 核心部署檔案

```
📦 專案根目錄
├── 📄 deploystudent.pkl        # ExtraTrees 部署模型 (6.2 MB)
├── 📄 featurecolumns.json      # 11 項部署特徵名稱清單
├── 📄 deploymeta.json          # 模型元資料 (Stage 映射)
├── 📄 airbase.json             # 空氣基準線參數 (校正後產生)
├── 🐍 calibrate_air_30s.py     # 空氣基線校正主程式
├── 🐍 inference_30s.py         # 30 秒窗口推論主程式
├── 🐍 applocal.py              # Flask 模擬測試介面
└── 📁 app/
    ├── 📁 consumer/            # 消費端 React Native App
    │   ├── Home.tsx
    │   ├── ScanProcess.tsx
    │   ├── Result.tsx
    │   └── History.tsx
    └── 📁 farmer/              # 農民端 React Native App
        ├── FarmerHome.tsx
        ├── BatchCreate.tsx
        ├── BatchScan.tsx
        ├── BatchResult.tsx
        └── ReportAnalysis.tsx
```

---

## 🚀 使用方式

### Step 1｜硬體連接

1. 依接線圖將六種氣體感測器連接至 Arduino `A0–A5`
2. 將 BME280 以 I²C 接至 Arduino `SDA / SCL`
3. 以 USB 線連接 Arduino Mega 與 Raspberry Pi 3
4. 確認裝置路徑（通常為 `/dev/ttyACM0`）

### Step 2｜部署環境設定（Raspberry Pi）

```bash
# 建立 Python 虛擬環境
python3 -m venv venv
source venv/bin/activate

# 安裝相依套件
pip install -r requirements.txt

# 確認模型檔案與 JSON 設定檔皆在同一目錄
ls deploystudent.pkl featurecolumns.json deploymeta.json
```

### Step 3｜空氣基線校正

> ⚠️ 每次量測前或環境條件改變時須重新校正

```bash
# 預設暖機 60 秒，校正 30 秒
python3 calibrate_air_30s.py

# 指定暖機時間（建議首次使用 180 秒）
python3 calibrate_air_30s.py --warmup-sec 180
```

校正完成後將產生 `airbase.json`，格式如下：

```json
{
  "MQ2": {"mean": 450.2, "std": 12.3, "min": 420, "max": 480},
  "MQ3": {"mean": 380.5, "std": 15.1, "min": 350, "max": 410},
  ...
}
```

### Step 4｜成熟度推論

```bash
# 將鳳梨置於感測器前 ~5 cm，執行推論
python3 inference_30s.py
```

系統將累積 **30 秒**感測窗口資料後輸出：

```
[推論結果]
Stage 0 機率: 0.03
Stage 1 機率: 0.12
Stage 2 機率: 0.79  ← argmax
Stage 3 機率: 0.06

✅ 最終判定：Stage 2（完熟）— 建議立即食用
```

### Step 5｜Flask 模擬介面（開發 / 測試用）

```bash
# 在本機啟動 Flask 介面
python3 applocal.py
```

開啟瀏覽器，前往 `http://localhost:5000`，介面提供：
- **Air Baseline 校正按鈕**（透過 SSH 遠端觸發 Raspberry Pi）
- **開始推論按鈕**（顯示四階段機率長條圖與最終結果）

---

## 🤖 機器學習模型

### 訓練策略：Teacher-Student 知識蒸餾

```
VOC 量測資料 → 特徵工程 → CatBoost (Teacher) → ExtraTrees (Student) → 部署推論
```

| 項目 | 內容 |
|------|------|
| **訓練資料** | 14 顆金鑽鳳梨，333 筆 per-day features |
| **成熟階段** | Stage 0: 32筆 / Stage 1: 25筆 / Stage 2: 29筆 / Stage 3: 21→69筆 |
| **資料增強** | Pseudo Labeling 將 Stage 3 從 21 筆擴增至 69 筆 |
| **Teacher Model** | CatBoost（輔助標註與覆蓋率改善） |
| **Student Model** | ExtraTrees（輕量部署，6.2 MB） |
| **特徵選取** | Mutual Information 篩選 11 項核心特徵 |
| **推論窗口** | 固定 30 秒滾動窗口 |

### 11 項部署特徵

| # | 特徵名稱 | 計算方式 |
|---|----------|----------|
| 1 | `MQ3stdnorm` | MQ3 標準差歸一化 |
| 2 | `MQ3rangenorm` | MQ3 範圍歸一化 |
| 3 | `MQ2MQ3ratio` | MQ2 / MQ3 濃度比值 |
| 4 | `MQ3MQ135ratio` | MQ3 / MQ135 濃度比值 |
| 5 | `MQ9slope` | MQ9 濃度變化斜率 |
| 6 | `TGS2602minnorm` | TGS2602 最小值歸一化 ⭐ |
| 7 | `MQ2aucnorm` | MQ2 曲線下面積歸一化 |
| 8 | `MQ2meannorm` | MQ2 均值歸一化 |
| 9 | `MQ9minnorm` | MQ9 最小值歸一化 |
| 10 | `TGS2602stdnorm` | TGS2602 標準差歸一化 ⭐ |
| 11 | `MQ9deltamean` | MQ9 均值變化量 |

### 模型效能指標

| 指標 | 數值 |
|------|------|
| LOGO 交叉驗證平均準確率 | **86.15%** |
| Macro F1 Score | **83.09%** |
| 部署前樣本準確率 | 79.27% |
| 含後處理樣本準確率 | **80.49%** |
| 模型大小 | **6.2 MB** |

### 後處理邏輯

```
Guard Baseline：若所有感測值接近 airbase.json 基準線 → 強制輸出 Stage 0
Override 邏輯：若模型預測為 Stage 2，但 TGS2602 與 MQ3 特徵超過閾值 → Override 為 Stage 3
```

---

## 📱 App 介面

### 消費端 App

| 頁面 | 功能 |
|------|------|
| 首頁 | 開始掃描、中英語言切換 |
| 掃描流程頁 | 放入引導動畫、30 秒倒數進度條 |
| 結果頁 | 熟度標籤（🟢🟡🟠🔴）、信心值、食用建議 |
| 歷史紀錄 | 過往掃描清單（日期 / 熟度 / 信心值） |
| 知識內容 | 鳳梨選購、保存與食用教育內容 |

### 農民端 App

| 頁面 | 功能 |
|------|------|
| 農民首頁 | 批次概況統計摘要 |
| 批次建立 | 建立批次名稱 / 數量 / 日期 |
| 批次掃描 | 連續多顆掃描、計數器 |
| 批次結果 | 熟度分布餅圖、表格摘要 |
| 報表分析 | PDF / 圖表匯出 |
| 批次歷史 | 搜尋、管理歷史批次 |

> 🌐 **雙語支援**：消費端與農民端皆支援中英文即時切換，語系偏好儲存於裝置本地。

---

## ⚠️ 系統限制

| 限制類別 | 說明 |
|----------|------|
| **硬體** | 感測器需暖機 60–180 秒；Raspberry Pi 3 記憶體有限，僅適合輕量模型 |
| **演算法** | 部署端不含 `dayratio` 等日期相關特徵；Stage 3 仍有個體差異影響 |
| **應用場景** | 目前僅支援金鑽鳳梨品種；每次單顆量測，不支援批次同時量測 |
| **安全性** | Flask 介面僅限區域網路使用，尚未實作 HTTPS 與完整身分驗證 |
| **環境條件** | 建議操作環境：溫度 20–30°C，相對濕度 40–70% |

---

## 🗂️ 版本管理

### 分支策略

```
main        ← 正式穩定版本（可展示 / 可交付）
develop     ← 開發整合版本（功能整合測試）
feature/*   ← 功能開發分支（各模組獨立開發）
```

### API 版本規劃

| 版本 | 功能 |
|------|------|
| `v1` | 鳳梨成熟度四階段分類 |
| `v2` | 預留：多水果支援、批次分析擴充 |

---

## 🔮 未來擴充方向

- [ ] 支援更多鳳梨品種（需重新蒐集訓練資料）
- [ ] 多顆鳳梨批次同時量測
- [ ] 結合影像辨識模組（多模態整合：氣味 + 視覺）
- [ ] 自動備份與異常自動復原機制
- [ ] 多語系支援（日文、英文等）
- [ ] 模型自動更新與版本比對機制

---

## 👥 開發團隊

> 本專題由 [學校名稱] 資訊管理系 / 資訊工程系專題小組開發

| 角色 | 負責項目 |
|------|----------|
| 硬體工程 | 感測器電路設計、Arduino 韌體開發 |
| 模型工程 | 特徵工程、模型訓練與部署 |
| 後端工程 | Raspberry Pi 部署、Flask API |
| 前端工程 | React Native App（消費端 / 農民端） |

---

## 📄 文件

| 文件 | 說明 |
|------|------|
| `設計規格書 v1.0` | 系統完整設計規格，含架構圖、流程圖、介面設計 |
| `featurecolumns.json` | 11 項部署特徵欄位定義 |
| `deploymeta.json` | Stage 映射與模型元資料 |



***
