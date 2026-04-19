import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

import { theme } from "@/constants/theme";

export interface PieChartSegment {
  key: string;
  label: string;
  color: string;
  value: number;
}

interface RipenessPieChartProps {
  title?: string;
  totalLabel: string;
  totalValue: number;
  segments: PieChartSegment[];
  size?: number;
  strokeWidth?: number;
  testID?: string;
}

export function RipenessPieChart({
  title,
  totalLabel,
  totalValue,
  segments,
  size = 240,
  strokeWidth = 42,
  testID,
}: RipenessPieChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const normalizedSegments = useMemo(() => {
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);

    return {
      total,
      items: segments.map((segment) => ({
        ...segment,
        percentage: total > 0 ? Math.round((segment.value / total) * 100) : 0,
      })),
    };
  }, [segments]);

  return (
    <View style={styles.container} testID={testID}>
      {title ? <Text style={styles.title}>{title}</Text> : null}

      <View style={[styles.chartWrap, { width: size, height: size }] }>
        <Svg width={size} height={size}>
          <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {normalizedSegments.total > 0 ? (
              normalizedSegments.items.reduce(
                (acc, segment) => {
                  const segmentLength = (segment.value / normalizedSegments.total) * circumference;
                  acc.nodes.push(
                    <Circle
                      key={segment.key}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke={segment.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                      strokeDashoffset={-acc.offset}
                      strokeLinecap="butt"
                      fill="transparent"
                    />,
                  );
                  acc.offset += segmentLength;
                  return acc;
                },
                { nodes: [] as React.ReactNode[], offset: 0 },
              ).nodes
            ) : (
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#E3E8EE"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
            )}
          </G>
        </Svg>

        <View style={styles.centerWrap}>
          <Text style={styles.centerValue}>{totalValue}</Text>
          <Text style={styles.centerLabel}>{totalLabel}</Text>
        </View>
      </View>

      <View style={styles.legendList}>
        {normalizedSegments.items.map((segment) => (
          <View key={segment.key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
            <Text style={styles.legendLabel}>{segment.label}</Text>
            <Text style={styles.legendValue}>{segment.percentage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 18,
  },
  title: {
    width: "100%",
    fontSize: 30,
    fontWeight: "900",
    color: theme.colors.dark,
    textAlign: "center",
  },
  chartWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 12,
  },
  centerValue: {
    fontSize: 48,
    lineHeight: 52,
    fontWeight: "900",
    color: theme.colors.dark,
  },
  centerLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.muted,
    textAlign: "center",
  },
  legendList: {
    width: "100%",
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: "#F7FAF4",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 999,
    marginRight: 10,
  },
  legendLabel: {
    flex: 1,
    fontSize: 19,
    fontWeight: "800",
    color: theme.colors.text,
  },
  legendValue: {
    fontSize: 22,
    fontWeight: "900",
    color: theme.colors.dark,
  },
});
