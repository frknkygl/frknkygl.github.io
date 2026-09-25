import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius } from '../theme';

interface OrnateFrameProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accentColor?: string;
  cornerSize?: number;
}

// A carved-obsidian panel with small brass corner brackets, used for the
// "important" surfaces (boss panel, victory card, chapter banner...).
export function OrnateFrame({ children, style, accentColor = colors.primary, cornerSize = 16 }: OrnateFrameProps) {
  return (
    <View style={[styles.panel, style]}>
      {children}
      <Corner color={accentColor} size={cornerSize} position="topLeft" />
      <Corner color={accentColor} size={cornerSize} position="topRight" />
      <Corner color={accentColor} size={cornerSize} position="bottomLeft" />
      <Corner color={accentColor} size={cornerSize} position="bottomRight" />
    </View>
  );
}

function Corner({
  color,
  size,
  position,
}: {
  color: string;
  size: number;
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}) {
  const isTop = position === 'topLeft' || position === 'topRight';
  const isLeft = position === 'topLeft' || position === 'bottomLeft';
  return (
    <View
      pointerEvents="none"
      style={[
        styles.corner,
        {
          width: size,
          height: size,
          top: isTop ? -2 : undefined,
          bottom: isTop ? undefined : -2,
          left: isLeft ? -2 : undefined,
          right: isLeft ? undefined : -2,
          borderColor: color,
          borderTopWidth: isTop ? 2.5 : 0,
          borderBottomWidth: isTop ? 0 : 2.5,
          borderLeftWidth: isLeft ? 2.5 : 0,
          borderRightWidth: isLeft ? 0 : 2.5,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radius.lg,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
  },
});
