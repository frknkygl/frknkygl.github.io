import React from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { HeroDef } from '../data/types';
import { elementColors, rarityColors, radius } from '../theme';
import { images } from '../theme/images';
import { ELEMENT_ICON, Icon } from './Icon';

interface HeroPortraitProps {
  hero: HeroDef;
  size?: number;
  showRarityBorder?: boolean;
}

const HERO_ART: Record<string, ImageSourcePropType> = {
  malakor: images.portraitCommander,
};

export function HeroPortrait({ hero, size = 64, showRarityBorder = true }: HeroPortraitProps) {
  const art = hero.hasArt ? HERO_ART[hero.id] : undefined;
  const ec = elementColors[hero.element];
  const rc = rarityColors[hero.rarity];

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: radius.lg,
          borderColor: showRarityBorder ? rc.text : 'transparent',
          shadowColor: rc.text,
        },
      ]}
    >
      {art ? (
        <Image source={art} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={[ec.core, '#0f0e11']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
        />
      )}
      {!art ? (
        <View style={styles.iconOverlay}>
          <Icon name={ELEMENT_ICON[hero.element]} size={Math.round(size * 0.42)} color="rgba(255,255,255,0.92)" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0e11',
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  iconOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
