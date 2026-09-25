import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, radius, type } from '../theme';
import { trUpper } from '../utils/text';

interface StatBarProps {
  value: number;
  max: number;
  color: string;
  trackColor?: string;
  height?: number;
  label?: string;
  valueLabel?: string;
  secondaryValue?: number; // e.g. shield overlay
  secondaryColor?: string;
}

export function StatBar({
  value,
  max,
  color,
  trackColor = colors.surfaceContainerLowest,
  height = 10,
  label,
  valueLabel,
  secondaryValue,
  secondaryColor = colors.armor,
}: StatBarProps) {
  const pct = useSharedValue(0);
  const safeMax = Math.max(1, max);
  const targetPct = Math.max(0, Math.min(1, value / safeMax));

  useEffect(() => {
    pct.value = withTiming(targetPct, { duration: 380 });
  }, [targetPct, pct]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${pct.value * 100}%`,
  }));

  const secondaryPct = secondaryValue ? Math.min(1, secondaryValue / safeMax) : 0;

  return (
    <View style={styles.wrap}>
      {label || valueLabel ? (
        <View style={styles.labelRow}>
          {label ? <Text style={styles.label}>{trUpper(label)}</Text> : <View />}
          {valueLabel ? <Text style={styles.value}>{valueLabel}</Text> : null}
        </View>
      ) : null}
      <View style={[styles.track, { height, backgroundColor: trackColor, borderRadius: radius.sm }]}>
        <Animated.View style={[styles.fill, { backgroundColor: color, borderRadius: radius.sm }, animatedStyle]} />
        {secondaryPct > 0 ? (
          <View
            style={[
              styles.secondaryFill,
              { backgroundColor: secondaryColor, width: `${secondaryPct * 100}%`, borderRadius: radius.sm },
            ]}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  label: { ...type.labelCaps, color: colors.onSurfaceVariant },
  value: { ...type.labelCaps, color: colors.onSurface },
  track: {
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.6)',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  secondaryFill: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.85,
  },
});
