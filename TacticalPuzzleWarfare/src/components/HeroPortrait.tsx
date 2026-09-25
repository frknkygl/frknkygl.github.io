import React from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
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
  const initial = hero.name.replace(/^(Lord|Lady)\s+/i, '').charAt(0).toLocaleUpperCase('tr-TR');
  const badgeSize = Math.max(16, Math.round(size * 0.32));

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
        <>
          <LinearGradient
            colors={[ec.core, '#0f0e11']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.05, y: 0 }}
            end={{ x: 0.95, y: 1 }}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0.35 }}
            end={{ x: 0.5, y: 1 }}
          />
          <Text
            style={[
              styles.initial,
              { fontSize: Math.round(size * 0.5), lineHeight: Math.round(size * 0.58) },
            ]}
          >
            {initial}
          </Text>
          <View
            style={[
              styles.elementBadge,
              {
                width: badgeSize,
                height: badgeSize,
                borderRadius: badgeSize / 2,
                right: size * 0.05,
                bottom: size * 0.05,
                borderColor: ec.core,
              },
            ]}
          >
            <Icon name={ELEMENT_ICON[hero.element]} size={Math.round(badgeSize * 0.6)} color={ec.core} />
          </View>
        </>
      )}
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
  initial: {
    fontFamily: 'EBGaramond_700Bold',
    color: 'rgba(255,255,255,0.92)',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  elementBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(15,14,17,0.85)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
