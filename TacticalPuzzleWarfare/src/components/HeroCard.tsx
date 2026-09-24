import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { HeroDef } from '../data/types';
import type { OwnedHeroState } from '../store/types';
import { colors, radius, rarityColors, spacing, type } from '../theme';
import { HeroPortrait } from './HeroPortrait';
import { Icon } from './Icon';

interface HeroCardProps {
  hero: HeroDef;
  owned?: OwnedHeroState;
  onPress?: () => void;
  selected?: boolean;
  locked?: boolean;
}

export function HeroCard({ hero, owned, onPress, selected, locked }: HeroCardProps) {
  const rc = rarityColors[hero.rarity];
  const isOwned = !!owned;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: selected ? colors.primary : colors.outlineVariant },
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={{ opacity: isOwned ? 1 : 0.38 }}>
        <HeroPortrait hero={hero} size={56} />
      </View>
      {locked ? (
        <View style={styles.lockOverlay}>
          <Icon name="lock" size={18} color={colors.onSurfaceVariant} />
        </View>
      ) : null}
      <Text numberOfLines={1} style={styles.name}>
        {hero.name}
      </Text>
      <View style={styles.metaRow}>
        <Text style={[styles.rarity, { color: rc.text }]} numberOfLines={1}>
          {rc.label}
        </Text>
        {isOwned ? <Text style={styles.level}>Sv.{owned!.level}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 96,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    gap: 4,
  },
  selected: {
    backgroundColor: colors.surfaceContainerHigh,
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  pressed: { opacity: 0.85 },
  lockOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { ...type.bodyLg, color: colors.onSurface, fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rarity: { ...type.labelXs, textTransform: 'uppercase' },
  level: { ...type.labelXs, color: colors.onSurfaceVariant },
});
