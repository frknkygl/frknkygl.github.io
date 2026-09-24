import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HERO_MAP } from '../../data/heroes';
import type { SquadHeroRuntime } from '../../game/battle';
import { colors, elementColors, radius, type } from '../../theme';
import { HeroPortrait } from '../HeroPortrait';

interface HeroUltimateSlotProps {
  hero: SquadHeroRuntime;
  onActivate: () => void;
  disabled?: boolean;
}

export function HeroUltimateSlot({ hero, onActivate, disabled }: HeroUltimateSlotProps) {
  const def = HERO_MAP[hero.heroId];
  const ready = hero.mana >= hero.ultimateCost;
  const pct = Math.min(1, hero.mana / hero.ultimateCost);
  const ec = elementColors[hero.element];
  const hpPct = Math.max(0, hero.hp / hero.maxHp);

  return (
    <Pressable
      onPress={ready && !disabled ? onActivate : undefined}
      style={({ pressed }) => [
        styles.wrap,
        { borderColor: ready ? colors.primary : colors.outlineVariant },
        ready && styles.readyGlow,
        pressed && ready && styles.pressed,
      ]}
    >
      {def ? <HeroPortrait hero={def} size={48} showRarityBorder={false} /> : null}
      <View style={[styles.manaTrack, { backgroundColor: colors.surfaceContainerLowest }]}>
        <View style={[styles.manaFill, { width: `${pct * 100}%`, backgroundColor: ready ? colors.primary : ec.core }]} />
      </View>
      <View style={[styles.hpTrack]}>
        <View style={[styles.hpFill, { width: `${hpPct * 100}%` }]} />
      </View>
      <Text numberOfLines={1} style={styles.name}>
        {hero.name.split(' ')[0]}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 64,
    alignItems: 'center',
    gap: 3,
    padding: 4,
    borderRadius: radius.lg,
    borderWidth: 2,
    backgroundColor: colors.surfaceContainer,
  },
  readyGlow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  pressed: { transform: [{ scale: 0.94 }] },
  manaTrack: {
    width: '100%',
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  manaFill: { height: '100%', borderRadius: 3 },
  hpTrack: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    overflow: 'hidden',
  },
  hpFill: { height: '100%', backgroundColor: colors.vitality },
  name: { ...type.labelXs, color: colors.onSurfaceVariant, fontSize: 9 },
});
