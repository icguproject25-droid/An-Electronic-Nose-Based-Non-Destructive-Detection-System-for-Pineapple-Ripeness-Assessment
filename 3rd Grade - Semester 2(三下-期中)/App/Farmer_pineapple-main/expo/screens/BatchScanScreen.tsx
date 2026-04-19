import { Stack, router, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { theme } from "@/constants/theme";
import { startScan } from "@/services/api";
import { useAppStore } from "@/store/app-store";
import { AnomalyFlag, Ripeness, Sample, ScanResult } from "@/types/models";
import { createId } from "@/utils/helpers";
import { getBatchSamples } from "@/utils/metrics";

const RIPENESS_COLORS: Record<Ripeness, string> = {
  unripe: "#FFD93D",
  ripe: "#2ECC71",
  overripe: "#F28C28",
};

const ANOMALY_COLORS: Record<AnomalyFlag, string> = {
  normal: "#2ECC71",
  isolate: "#E74C3C",
};

function playWebBeep(): void {
  if (typeof window === "undefined") {
    return;
  }

  const audioContextConstructor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!audioContextConstructor) {
    return;
  }

  const context = new audioContextConstructor();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, context.currentTime);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.24);

  setTimeout(() => {
    void context.close();
  }, 300);
}

export default function BatchScanScreen() {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const { batches, samples, settings, addSample, tx } = useAppStore();
  const batch = useMemo(() => batches.find((item) => item.batch_id === batchId), [batches, batchId]);
  const scannedSamples = useMemo(() => getBatchSamples(samples, batchId ?? ""), [samples, batchId]);
  const currentSampleNumber = scannedSamples.length + 1;

  const [countdown, setCountdown] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorText, setErrorText] = useState<string>("");

  const ringPulse = useRef<Animated.Value>(new Animated.Value(1)).current;
  const radarRotation = useRef<Animated.Value>(new Animated.Value(0)).current;
  const sweepOpacity = useRef<Animated.Value>(new Animated.Value(0.35)).current;

  useEffect(() => {
    if (!batch) {
      return;
    }

    if (scannedSamples.length >= batch.target_samples) {
      router.replace(`/batches/${batch.batch_id}/summary`);
    }
  }, [batch, scannedSamples.length]);

  useEffect(() => {
    if (!isScanning) {
      ringPulse.stopAnimation();
      radarRotation.stopAnimation();
      sweepOpacity.stopAnimation();
      ringPulse.setValue(1);
      radarRotation.setValue(0);
      sweepOpacity.setValue(0.35);
      return;
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, {
          toValue: 1.06,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringPulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(radarRotation, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sweepOpacity, {
          toValue: 0.7,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sweepOpacity, {
          toValue: 0.3,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [isScanning, radarRotation, ringPulse, sweepOpacity]);

  useEffect(() => {
    if (countdown <= 0 || !isScanning) {
      return;
    }

    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, isScanning]);

  const playBeep = useCallback((): void => {
    if (Platform.OS === "web") {
      playWebBeep();
      return;
    }

    void Speech.stop();
    Speech.speak("嗶", {
      language: settings.language === "zh" ? "zh-TW" : "en-US",
      pitch: 1.6,
      rate: 1.1,
    });
  }, [settings.language]);

  useEffect(() => {
    if (countdown !== 0 || !isScanning) {
      return;
    }

    const run = async (): Promise<void> => {
      try {
        console.log("[scan.run] starting", { backendUrl: settings.backendUrl, batchId });
        const scan = await startScan(settings.backendUrl);
        console.log("[scan.run] result", scan);
        setResult(scan);
        playBeep();
      } catch (error) {
        console.log("[scan.run] failed", error);
        setErrorText(settings.language === "zh" ? "檢測失敗，請重試" : "Scan failed. Please try again.");
      } finally {
        setIsScanning(false);
      }
    };

    void run();
  }, [batchId, countdown, isScanning, playBeep, settings.backendUrl, settings.language]);

  useEffect(() => {
    return () => {
      void Speech.stop();
    };
  }, []);

  const speakGuidance = useCallback((): void => {
    if (!batch) {
      return;
    }

    void Speech.stop();
    const message =
      settings.language === "zh"
        ? `已開始檢測鳳梨氣味特徵。 目前批次 ${batch.name}。 第${currentSampleNumber}顆樣本，請保持鳳梨在感測器中。`
        : `Scanning pineapple aroma profile. Current batch ${batch.name}. Sample ${currentSampleNumber}. Please keep the pineapple inside the sensor.`;

    Speech.speak(message, {
      language: settings.language === "zh" ? "zh-TW" : "en-US",
      pitch: 1,
      rate: settings.language === "zh" ? 0.92 : 0.95,
    });
  }, [batch, currentSampleNumber, settings.language]);

  if (!batch) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>{tx("noData")}</Text>
      </View>
    );
  }

  const startDetecting = (): void => {
    setErrorText("");
    setResult(null);
    setIsScanning(true);
    setCountdown(30);
    speakGuidance();
  };

  const saveAndNext = (): void => {
    if (!result) {
      return;
    }

    const sample: Sample = {
      sample_id: createId("sample"),
      batch_id: batch.batch_id,
      seq_no: currentSampleNumber,
      scan_time: new Date().toISOString(),
      ripeness: result.ripeness,
      tss_brix: result.tss_brix,
      blackheart_risk: result.blackheart_risk,
      anomaly_flag: result.anomaly_flag,
    };

    console.log("[scan.save]", sample);
    addSample(sample);
    setResult(null);
    setErrorText("");
  };

  const radarRotate = radarRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container} testID="batch-scan-screen">
      <Stack.Screen options={{ title: tx("scan") }} />

      <View style={styles.infoCard}>
        <Text style={styles.batchName}>{batch.name}</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoPill}>
            <Text style={styles.infoLabel}>{tx("sampleIndex")}</Text>
            <Text style={styles.infoValue}>{currentSampleNumber} / {batch.target_samples}</Text>
          </View>
          <View style={styles.infoPill}>
            <Text style={styles.infoLabel}>{tx("farmArea")}</Text>
            <Text style={styles.infoValue}>{batch.block || "-"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.scanCard}>
        {!result ? (
          <>
            <Text style={styles.instruction}>{tx("placePineapple")}</Text>

            <Animated.View style={[styles.radarWrap, { transform: [{ scale: ringPulse }] }]}>
              <View style={styles.radarCircleOuter} />
              <View style={styles.radarCircleMiddle} />
              <View style={styles.radarCircleInner} />
              <View style={styles.radarCrossHorizontal} />
              <View style={styles.radarCrossVertical} />
              <Animated.View
                style={[
                  styles.radarSweep,
                  {
                    opacity: isScanning ? sweepOpacity : 0.18,
                    transform: [{ rotate: radarRotate }],
                  },
                ]}
              />
              <View style={styles.radarCenterDot} />
            </Animated.View>

            <Text style={styles.countdown}>{isScanning ? countdown : 30}</Text>
            <Text style={styles.statusText}>{isScanning ? tx("sensing") : tx("scanReady")}</Text>

            {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

            {!isScanning ? (
              <AppButton label={tx("startScan")} onPress={startDetecting} style={styles.primaryButton} testID="scan-start-btn" />
            ) : null}
          </>
        ) : (
          <View style={styles.resultWrap}>
            <View style={[styles.resultCard, { backgroundColor: `${RIPENESS_COLORS[result.ripeness]}22` }]}>
              <Text style={styles.resultLabel}>{tx("ripenessLabel")}</Text>
              <Text style={[styles.resultValue, { color: RIPENESS_COLORS[result.ripeness] }]}>
                {result.ripeness === "unripe" ? tx("unripe") : result.ripeness === "ripe" ? tx("ripe") : tx("overripe")}
              </Text>
            </View>

            <View style={[styles.resultCard, { backgroundColor: `${ANOMALY_COLORS[result.anomaly_flag]}22` }]}>
              <Text style={styles.resultLabel}>{tx("abnormalStatus")}</Text>
              <Text style={[styles.resultValue, { color: ANOMALY_COLORS[result.anomaly_flag] }]}>
                {result.anomaly_flag === "normal" ? tx("normal") : tx("abnormal")}
              </Text>
            </View>

            <AppButton label={tx("saveAndScanNext")} onPress={saveAndNext} style={styles.primaryButton} testID="save-next-btn" />
          </View>
        )}
      </View>
    </View>
  );
}

const radarSize = 244;
const radarLineWidth = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF3EA",
    padding: 16,
    gap: 16,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#D9E2D1",
    padding: 18,
    gap: 14,
  },
  batchName: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    color: theme.colors.dark,
    textAlign: "center",
  },
  infoGrid: {
    flexDirection: "row",
    gap: 10,
  },
  infoPill: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#F4F7EF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.muted,
  },
  infoValue: {
    fontSize: 22,
    fontWeight: "900",
    color: theme.colors.dark,
  },
  scanCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#D9E2D1",
    paddingVertical: 22,
    paddingHorizontal: 18,
    justifyContent: "center",
    gap: 16,
  },
  instruction: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "900",
    color: theme.colors.dark,
    textAlign: "center",
  },
  radarWrap: {
    alignSelf: "center",
    width: radarSize,
    height: radarSize,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECF6E8",
    overflow: "hidden",
  },
  radarCircleOuter: {
    position: "absolute",
    width: radarSize,
    height: radarSize,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#C9DEC0",
  },
  radarCircleMiddle: {
    position: "absolute",
    width: radarSize * 0.68,
    height: radarSize * 0.68,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#C9DEC0",
  },
  radarCircleInner: {
    position: "absolute",
    width: radarSize * 0.36,
    height: radarSize * 0.36,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#C9DEC0",
  },
  radarCrossHorizontal: {
    position: "absolute",
    width: radarSize,
    height: 1,
    backgroundColor: "#C9DEC0",
  },
  radarCrossVertical: {
    position: "absolute",
    width: 1,
    height: radarSize,
    backgroundColor: "#C9DEC0",
  },
  radarSweep: {
    position: "absolute",
    width: radarSize / 2,
    height: radarLineWidth,
    backgroundColor: "#2F7D32",
    borderRadius: 999,
    left: radarSize / 2,
  },
  radarCenterDot: {
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: "#2F7D32",
  },
  countdown: {
    fontSize: 88,
    lineHeight: 94,
    fontWeight: "900",
    color: "#2F7D32",
    textAlign: "center",
  },
  statusText: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.muted,
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.danger,
    textAlign: "center",
  },
  resultWrap: {
    gap: 14,
  },
  resultCard: {
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 18,
    gap: 8,
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.muted,
  },
  resultValue: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "900",
  },
  primaryButton: {
    minHeight: 80,
    borderRadius: 24,
    backgroundColor: "#2F7D32",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.muted,
  },
});
