import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { Layout, SlideInUp, ZoomOut } from 'react-native-reanimated';

import type { Tile } from '../../game/types';
import { colors, elementColors } from '../../theme';
import { elementRuneImage } from '../../theme/images';
import { Icon } from '../Icon';

interface RuneTileProps {
  tile: Tile;
  x: number;
  y: number;
  size: number;
  selected?: boolean;
}

const SPECIAL_ICON = {
  lineH: 'arrow-left-right-bold' as const,
  lineV: 'arrow-up-down-bold' as const,
  bomb: 'bomb' as const,
  prism: 'star-four-points' as const,
};

// entering/exiting only ever play on genuine mount/unmount of a keyed tile
// (new uid from refill, or a uid disappearing after a match) — a tile that
// persists across renders just gets the `layout` transition instead.
export function RuneTile({ tile, x, y, size, selected }: RuneTileProps) {
  const pad = 4;
  const inner = size - pad * 2;
  const isPrism = tile.special === 'prism';
  const ec = tile.element ? elementColors[tile.element] : undefined;

  return (
    <Animated.View
      layout={Layout.springify().damping(16).stiffness(180)}
      entering={SlideInUp.duration(320).springify().damping(15)}
      exiting={ZoomOut.duration(240)}
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          left: x,
          top: y,
        },
      ]}
    >
      <View
        style={[
          styles.tile,
          {
            width: inner,
            height: inner,
            borderColor: selected ? colors.primary : tile.special ? colors.primaryFixedDim : 'rgba(0,0,0,0.5)',
            borderWidth: selected ? 3 : tile.special ? 2 : 1,
            backgroundColor: isPrism
              ? '#1c1420'
              : ec
                ? colors.surfaceContainerLow
                : colors.surfaceContainerLow,
            shadowColor: isPrism ? colors.tertiary : ec?.core ?? colors.primary,
          },
          selected && styles.selectedGlow,
        ]}
      >
        {tile.element && !isPrism ? (
          <Image source={elementRuneImage[tile.element]} style={{ width: inner * 0.62, height: inner * 0.62 }} resizeMode="contain" />
        ) : null}
        {tile.special ? (
          <View style={[styles.specialBadge, { backgroundColor: isPrism ? 'rgba(220,189,255,0.25)' : 'rgba(242,195,107,0.25)' }]}>
            <Icon
              name={SPECIAL_ICON[tile.special]}
              size={Math.round(inner * 0.42)}
              color={isPrism ? colors.tertiary : colors.primary}
            />
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cell: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.65,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  selectedGlow: {
    shadowOpacity: 0.95,
    shadowRadius: 10,
  },
  specialBadge: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
});
