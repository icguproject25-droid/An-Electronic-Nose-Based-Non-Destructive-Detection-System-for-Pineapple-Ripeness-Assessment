import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/colors';

const { width, height } = Dimensions.get('window');

interface PineapplePatternProps {
  opacity?: number;
  fullScreen?: boolean;
}

export function PineapplePattern({ opacity = 0.15, fullScreen = true }: PineapplePatternProps) {
  const rows = fullScreen ? 20 : 8;
  const cols = 8;
  
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]} pointerEvents="none">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { marginLeft: rowIndex % 2 === 0 ? 0 : -20 }]}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <View
              key={colIndex}
              style={[
                styles.scale,
                {
                  opacity: opacity * (0.5 + Math.random() * 0.5),
                  backgroundColor: rowIndex % 3 === 0 ? Colors.pineappleGold : Colors.pineappleYellow,
                },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  fullScreen: {
    bottom: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  scale: {
    width: 60,
    height: 40,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.ripeOrange,
    margin: -5,
    transform: [{ rotate: '45deg' }],
  },
});
