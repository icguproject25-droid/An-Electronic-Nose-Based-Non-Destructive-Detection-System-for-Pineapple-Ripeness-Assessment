import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Ellipse, G } from 'react-native-svg';
import { Colors } from '@/constants/colors';

interface PineappleIconProps {
  size?: number;
  style?: object;
}

export function PineappleIcon({ size = 120, style }: PineappleIconProps) {
  const scale = size / 120;
  
  return (
    <View style={[styles.container, { width: size, height: size * 1.4 }, style]}>
      <Svg width={size} height={size * 1.4} viewBox="0 0 120 168">
        <G>
          <Path
            d="M60 15 L50 5 L55 20 L45 10 L52 25 L40 18 L50 30 L38 25 L48 35 L35 32 L45 42 L60 35 L75 42 L85 32 L72 35 L82 25 L70 30 L80 18 L68 25 L75 10 L65 20 L70 5 L60 15"
            fill={Colors.leafGreen}
          />
          <Path
            d="M60 10 L55 0 L58 15 L48 3 L55 18 L60 10"
            fill={Colors.freshGreen}
          />
          <Path
            d="M60 10 L65 0 L62 15 L72 3 L65 18 L60 10"
            fill={Colors.freshGreen}
          />
          <Ellipse
            cx="60"
            cy="100"
            rx="40"
            ry="55"
            fill={Colors.pineappleYellow}
          />
          <Ellipse
            cx="60"
            cy="100"
            rx="38"
            ry="52"
            fill={Colors.pineappleGold}
          />
          {[0, 1, 2, 3, 4].map((row) =>
            [0, 1, 2, 3].map((col) => {
              const offsetX = row % 2 === 0 ? 0 : 10;
              const x = 30 + col * 20 + offsetX;
              const y = 60 + row * 20;
              return (
                <Path
                  key={`${row}-${col}`}
                  d={`M${x} ${y} Q${x + 5} ${y - 5} ${x + 10} ${y} Q${x + 5} ${y + 5} ${x} ${y}`}
                  fill={Colors.ripeOrange}
                  opacity={0.6}
                />
              );
            })
          )}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
