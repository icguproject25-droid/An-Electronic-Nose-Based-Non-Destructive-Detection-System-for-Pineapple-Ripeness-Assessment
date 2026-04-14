# Pineapple Deployment System

This folder contains the final deployment-side programs used after model training.

It includes:

- Raspberry Pi runtime scripts
- a local web interface for testing and demonstration
- the final Arduino Mega firmware used in the deployed system

These files are different from the earlier Arduino sketches used only for training-data collection.  
This folder is for the **runtime / deployment stage** of the project.

---

## Overview

This part of the project is used after the model has already been trained and exported.

The complete runtime flow is:

1. upload the final Arduino firmware to Arduino Mega
2. connect Arduino Mega to Raspberry Pi through USB serial
3. use Raspberry Pi to calibrate air baseline
4. run 30-second inference with optional warmup time
5. optionally control the Raspberry Pi scripts from a local Flask web page
6. display the ripeness result, probabilities, feature values, and sensor summary

---

## Recommended Outer Folder Name

Recommended English folder name:

`pineapple_deployment_system`

Meaning:

**Pineapple Deployment System（鳳梨成熟度辨識部署系統）**

This name is suitable because it can contain:

- Raspberry Pi inference scripts
- calibration scripts
- local web interface
- final Arduino Mega firmware
- deployment-related notes and configuration files

---

## Suggested Folder Structure

```text
pineapple_deployment_system/
├── app_local.py
├── calibrate_air_30s.py
├── inference_30s.py
├── use_this.ino
├── air_base.json              # generated after calibration
├── deploy_student.pkl         # exported model file
├── feature_columns.json
├── deploy_meta.json
└── README.md
```

---

## File Descriptions

### `app_local.py`
This is the local Flask web interface used on the computer side.

Main purpose:

- provides a browser-based control panel
- connects to Raspberry Pi through SSH
- can trigger air calibration remotely
- can trigger ripeness inference remotely
- supports three measurement modes:
  - quick mode
  - standard mode
  - full mode
- parses Raspberry Pi output and shows:
  - final ripeness result
  - raw and corrected class
  - maturity bar
  - stage probabilities
  - sensor summary
  - model feature values

This file is mainly used for **testing, demonstration, and presentation**.

> Before use, check the Raspberry Pi connection settings inside `app_local.py`, such as:
> - Raspberry Pi IP
> - username
> - password or SSH method
> - project directory on Raspberry Pi

---

### `calibrate_air_30s.py`
This script runs on Raspberry Pi and is used to collect the air baseline before measuring pineapple samples.

Main functions:

- automatically detects the Arduino serial port
- waits for the CSV header from Arduino
- collects air-only data for 30 seconds
- computes the average baseline for all sensors
- saves the result as `air_base.json`

This file should be run when:

- the system starts for a new measurement session
- the environment changes
- you want to refresh the background air reference

Generated output:

- `air_base.json`

---

### `inference_30s.py`
This script runs on Raspberry Pi and is the main ripeness inference program.

Main functions:

- loads the exported deployment model
- loads `feature_columns.json`
- loads `deploy_meta.json`
- loads `air_base.json`
- reads serial data from Arduino
- supports optional warmup time with `--warmup-sec`
- uses the **last 30 seconds** as the inference window
- computes deploy-time features
- predicts pineapple ripeness stage
- prints:
  - display text
  - raw class
  - corrected class
  - maturity percentage
  - maturity zone
  - overripe tendency
  - probabilities
  - sensor summary
  - feature values
- includes:
  - air / no-sample guard
  - overripe override logic

This is the main script used for **real measurement and final prediction**.

---

### `use_this.ino`
This is the final Arduino Mega firmware for the deployment stage.

Its role is different from the previous training-data Arduino sketches.

Main purpose:

- read gas sensors and environmental sensor values in real time
- send serial data to Raspberry Pi
- provide the live input required by:
  - `calibrate_air_30s.py`
  - `inference_30s.py`

This file is the one that should be **finally uploaded to Arduino Mega** for the deployed system.

> In other words:
> - the earlier `.ino` files were for collecting training data
> - `use_this.ino` is for the final runtime system

---

## Expected Arduino Serial Output

The Raspberry Pi scripts expect Arduino to continuously send CSV-style serial output.

The header is expected to begin with:

```text
timestamp_ms,...
```

The deployment scripts read fields such as:

- `MQ2_raw`
- `MQ3_raw`
- `MQ9_raw`
- `MQ135_raw`
- `TGS2602_raw`
- `TGS2620_raw` (optional in calibration)
- `Temp_C`
- `Humidity_pct`
- `Pressure_hPa`

So the final Arduino firmware should keep the output format consistent with the Raspberry Pi scripts.

---

## How to Use

### Step 1. Upload the Arduino firmware
Upload `use_this.ino` to Arduino Mega.

After uploading:

- connect Arduino Mega to Raspberry Pi by USB
- confirm that Arduino can continuously send sensor data through serial

---

### Step 2. Prepare Raspberry Pi deployment files
Make sure the following files already exist in the Raspberry Pi project folder:

- `deploy_student.pkl`
- `feature_columns.json`
- `deploy_meta.json`
- `calibrate_air_30s.py`
- `inference_30s.py`

If air calibration has not been done yet, `air_base.json` will be created in the next step.

---

### Step 3. Run air calibration on Raspberry Pi
Run:

```bash
python calibrate_air_30s.py
```

Use this when:

- there is no pineapple inside the container
- you want to collect background air baseline
- you need to generate or update `air_base.json`

Expected result:

- a new `air_base.json` file is created

---

### Step 4. Run inference on Raspberry Pi
Run quick mode:

```bash
python inference_30s.py --warmup-sec 0
```

Run standard mode:

```bash
python inference_30s.py --warmup-sec 60
```

Run full mode:

```bash
python inference_30s.py --warmup-sec 180
```

Meaning:

- `0` seconds: directly collect the 30-second window
- `60` seconds: first accumulate odor for 60 seconds, then use the last 30 seconds
- `180` seconds: first accumulate odor for 180 seconds, then use the last 30 seconds

---

### Step 5. Run the local web interface
On the local computer, run:

```bash
python app_local.py
```

Then open:

```text
http://127.0.0.1:5000
```

The page can:

- trigger air calibration remotely
- trigger pineapple inference remotely
- show results in a more visual format
- support quick / standard / full measurement modes

This is mainly used for:

- demo
- presentation
- local monitoring
- easier operation than terminal commands

---

## Measurement Modes

### Quick Mode
- warmup: 0 seconds
- inference window: 30 seconds
- use case: fast testing

### Standard Mode
- warmup: 60 seconds
- inference window: 30 seconds
- use case: more stable routine testing

### Full Mode
- warmup: 180 seconds
- inference window: 30 seconds
- use case: more complete odor accumulation before prediction

---

## Output Files

### `air_base.json`
Generated by `calibrate_air_30s.py`.

Purpose:

- stores the average air baseline for each sensor
- used later by `inference_30s.py`

---

## Notes

- `use_this.ino` is the **final deployment firmware**, not the training-data collection firmware
- `calibrate_air_30s.py` must be run before inference if no valid `air_base.json` exists
- `inference_30s.py` depends on the exported model and deployment metadata
- `app_local.py` is optional, but useful for demo and presentation
- if the serial port is not detected, check:
  - USB connection
  - Arduino power
  - Raspberry Pi serial device name
- if SSH remote control fails in the web interface, verify the Raspberry Pi connection settings in `app_local.py`

---

## Project Context

This folder is part of our graduation project:

**An Electronic Nose Based Non-Destructive Pineapple Ripeness Detection System**

This deployment-side module is responsible for turning the trained model into a working runtime system connected with Arduino Mega, Raspberry Pi, and a web-based demonstration interface.
