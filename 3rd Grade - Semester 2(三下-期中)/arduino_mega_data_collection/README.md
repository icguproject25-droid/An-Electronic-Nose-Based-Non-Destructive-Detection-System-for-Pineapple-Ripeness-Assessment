# Arduino Mega E-Nose Data Acquisition

This folder contains the Arduino Mega programs used for gas sensing data acquisition in our pineapple electronic nose project.

## Overview

The purpose of these Arduino sketches is to collect raw gas sensor data and environmental data for pineapple ripeness analysis. The system uses multiple gas sensors together with a BME280 environmental sensor and sends the measurements through serial output for later preprocessing, feature extraction, and machine learning model training.

## Hardware

This data acquisition system is based on the following components:

- Arduino Mega 2560
- MQ2 gas sensor
- MQ3 gas sensor
- MQ9 gas sensor
- MQ135 gas sensor
- TGS2602 gas sensor
- TGS2620 gas sensor
- BME280 environmental sensor

## Sensor Pin Mapping

The analog input pins are assigned as follows:

- MQ2 -> A0
- MQ3 -> A1
- MQ9 -> A2
- MQ135 -> A3
- TGS2602 -> A4
- TGS2620 -> A5

The BME280 sensor is connected through I2C communication.

## Files

### `air_baseline_collection.ino`

This program is used to collect air baseline data before measuring pineapple samples.

Main functions:

- preheats the gas sensors
- measures the background air condition
- records raw gas sensor values
- records temperature, humidity, and pressure
- sends the results through serial output

This file is mainly used to establish the baseline condition of the sensing environment.

### `pineapple_sample_collection.ino`

This program is used to collect gas sensing data from pineapple samples.

Main functions:

- preheats the gas sensors
- reads raw values from all gas sensors
- reads temperature, humidity, and pressure from BME280
- performs basic validation for invalid readings
- computes baseline values from early valid samples
- sends time-series sensor data through serial output

This file is mainly used to capture volatile gas patterns released by pineapple samples for later ripeness analysis.

## Data Output

The serial output is designed for data logging and later model development. The recorded information may include:

- timestamp
- raw sensor readings
- temperature
- humidity
- pressure
- transformed sensor values
- delta values
- moving-average values

The output can be saved and further processed in the data preprocessing and machine learning pipeline.

## Workflow

The general workflow is:

1. Upload the selected Arduino sketch to Arduino Mega.
2. Connect the sensors and prepare the measurement setup.
3. Open the serial monitor or serial logging tool.
4. Wait for the sensor preheating stage to finish.
5. Start recording the measurement data.
6. Save the serial output for later preprocessing and analysis.

## Notes

- `air_baseline_collection.ino` is used for air/background measurement.
- `pineapple_sample_collection.ino` is used for pineapple sample measurement.
- The collected data is later used for preprocessing, feature engineering, model training, and deployment.
- These Arduino programs are one part of the complete pineapple ripeness detection pipeline.

## Project Context

These Arduino sketches are part of our graduation project on electronic-nose-based non-destructive pineapple ripeness detection. The collected gas sensing data is later used in the machine learning workflow and deployed to Raspberry Pi and related system interfaces.

## Author

This folder is part of our graduation project repository.
