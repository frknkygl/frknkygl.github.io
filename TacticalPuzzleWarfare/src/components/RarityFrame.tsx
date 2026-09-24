import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { rarityColors, type RarityId, radius } from '../theme';

interface RarityFrameProps {
  rarity: RarityId;
  children: React.ReactNode;
  style?: ViewStyle;
  size?: number;
}

export function RarityFrame({ rarity, children, style, size = 64 }: RarityFrameProps) {
  const c = rarityColors[rarity];
  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderColor: c.text,
          shadowColor: c.text,
          backgroundColor: c.bg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOpacity: 0.55,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});
