import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface MatchBurstProps {
  x: number; // center x within the board
  y: number; // center y within the board
  size: number; // cell size, used to scale the burst radius
  color: string;
  big?: boolean;
}

const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

// A short-lived radial flash + particle-spray fired at a matched tile's
// grid position. Purely decorative and unmounted by the parent shortly
// after the animation finishes.
export function MatchBurst({ x, y, size, color, big }: MatchBurstProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: big ? 520 : 380, easing: Easing.out(Easing.cubic) });
  }, [big, progress]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ scale: 0.3 + progress.value * (big ? 2.1 : 1.4) }],
  }));

  const ringSize = size * 0.66;

  return (
    <View pointerEvents="none" style={[styles.wrap, { left: x - size / 2, top: y - size / 2, width: size, height: size }]}>
      <Animated.View
        style={[
          styles.ring,
          {
            borderColor: color,
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            left: (size - ringSize) / 2,
            top: (size - ringSize) / 2,
          },
          ringStyle,
        ]}
      />
      {ANGLES.slice(0, big ? 8 : 6).map((angle) => (
        <Particle key={angle} angle={angle} color={color} size={size} big={big} />
      ))}
    </View>
  );
}

function Particle({ angle, color, size, big }: { angle: number; color: string; size: number; big?: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: big ? 480 : 340, easing: Easing.out(Easing.cubic) });
  }, [big, progress]);

  const radius = size * (big ? 0.62 : 0.44);
  const rad = (angle * Math.PI) / 180;
  const dotSize = Math.max(3, Math.round(size * (big ? 0.15 : 0.1)));

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: Math.cos(rad) * radius * progress.value },
      { translateY: Math.sin(rad) * radius * progress.value },
      { scale: 1 - progress.value * 0.5 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          shadowColor: color,
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          left: size / 2 - dotSize / 2,
          top: size / 2 - dotSize / 2,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  ring: { position: 'absolute', borderWidth: 2 },
  particle: { position: 'absolute', shadowOpacity: 0.9, shadowRadius: 4 },
});
