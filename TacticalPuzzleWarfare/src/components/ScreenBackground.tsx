import React from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../theme';
import { images } from '../theme/images';

interface ScreenBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  watermark?: boolean;
}

export function ScreenBackground({ children, style, watermark = true }: ScreenBackgroundProps) {
  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={[colors.surfaceContainerLowest, colors.surface, colors.surfaceContainerLow]}
        style={StyleSheet.absoluteFill}
      />
      {watermark ? (
        <Image source={images.sigil} style={styles.watermark} resizeMode="contain" />
      ) : null}
      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  watermark: {
    position: 'absolute',
    width: 420,
    height: 420,
    top: -60,
    right: -110,
    opacity: 0.07,
  },
});
