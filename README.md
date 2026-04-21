<div align="center">

# 🍍 鳳梨成熟度辨識系統
### Pineapple Ripeness Detection System

[![Watch Demo Video](https://img.shields.io/badge/▶️-Watch%20Demo%20Video-orange?style=for-the-badge)](https://drive.google.com/file/d/1zQTGWSUGKHxx7ukhSpP41EWQJNEOJPet/view?usp=drivesdk)


[▶️ Demo Video](https://github.com/icguproject25-droid/electronic-nose-pineapple-ripeness-assessment/blob/main/3rd%20Grade%20-%20Semester%202(%E4%B8%89%E4%B8%8B-%E6%9C%9F%E4%B8%AD)/114_2_midterm_demo_video.mov)

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


## 🏗️ 系統架構

```
┌─────────────────────────────────────────────────────────────┐
│            👤 使用者端  User Interface Layer                 │
│  消費端 App (React Native) │ 農民端 App │ Flask 模擬介面      │
├─────────────────────────────────────────────────────────────┤
│            🌐 應用服務層  Application Service Layer          │
│          SSH 遠端控制 │ API 服務 │ 結果紀錄 / 報表            │
├─────────────────────────────────────────────────────────────┤
│            🖥️  運算處理層  Processing Layer                  │
│   Raspberry Pi 3 │ 特徵工程 │ ExtraTrees 推論 │ 後處理邏輯   │
├─────────────────────────────────────────────────────────────┤
│            🔌 資料傳輸層  Data Transfer Layer                │
│          USB Serial (115200 baud) │ I²C (BME280)             │
├─────────────────────────────────────────────────────────────┤
│            🔬 感測層  Sensing Layer                          │
│   Arduino Mega 2560 │ MQ 系列感測器 │ TGS 系列 │ BME280      │
└─────────────────────────────────────────────────────────────┘
```
---

### 專案檔案結構

```
📦 AN-ELECTRONIC-NOSE-BASED-NO...
│
├── 📁 arduino_mega_data_collection/          # Arduino 資料擷取韌體
│   ├── 🔌 air_baseline_collection.ino        # 空氣基線蒐集程式
│   ├── 🔌 pineapple_sample_collection.ino    # 鳳梨樣本蒐集程式
│   └── 📄 README.md
│
├── 📁 enose_model_training/                  # 模型訓練工作區
│   └── 📁 orkspace/
│       ├── 📁 catboost_info/                 # CatBoost 訓練紀錄
│       ├── 📁 data/                          # 原始量測資料
│       ├── 📁 deploy_rpi_catboost/           # CatBoost 部署版本
│       ├── 📁 deploy_rpi_et_10s/             # ExtraTrees 10s 版本
│       ├── 📁 deploy_rpi_et_10s_nodeay/
│       ├── 📁 deploy_rpi_et_30s_noday/
│       ├── 📁 deploy_rpi_et_30s_noday_s3_sensitive/
│       ├── 📁 deploy_rpi_et_30s_nodeay/
│       ├── 📁 deploy_rpi_student/            # Student 模型部署版本
│       ├── 📁 deploy_rpi_student_short/
│       ├── 📁 models/                        # 儲存的模型檔案
│       ├── 📁 reports/                       # 訓練報表與評估結果
│       ├── {} cutpoints.json                 # 閾值設定
│       ├── 📊 data_label_audit_report.xlsx   # 資料標注稽核報表
│       ├── {} feature_columns.json           # 特徵欄位定義
│       ├── 📓 labeling_perfect_final.ipynb   # 標注最終版 Notebook
│       ├── 📊 labeling.xlsx                  # 標注資料表
│       ├── 📄 model_final.pkl                # 最終訓練模型
│       ├── 🖼️ stage_timeline.png             # 成熟度時間軸圖
│       └── 📄 README.md
│
├── 📁 files(設計文件&簡報)/                  # 設計規格書與簡報
│
├── 📁 pineapple_deployment_system/           # Raspberry Pi 部署系統
│   ├── 🐍 app_local.py                       # Flask 模擬測試介面
│   ├── 🐍 calibrate_air_30s.py              # 空氣基線校正主程式
│   ├── 🐍 inference_30s.py                  # 30 秒窗口推論主程式
│   ├── 🔌 use_this.ino                       # Arduino 搭配推論用韌體
│   └── 📄 README.md
│
├── 🎬 114_2_midterm_demo_video.mov           # 期中成果展示影片
└── 📄 README.md
```
---

## 👥 開發團隊

> 本專題由長庚大學(Chang Gung University)B1144143陳玟妤、B1229062林冠妤、B1229066陳怡禎、B1229068廖文歆共同開發

