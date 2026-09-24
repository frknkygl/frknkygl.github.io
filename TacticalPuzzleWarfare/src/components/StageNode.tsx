import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { StageDef } from '../data/types';
import { colors, elementColors, radius, spacing, type } from '../theme';
import { ELEMENT_ICON, Icon } from './Icon';

interface StageNodeProps {
  stage: StageDef;
  stars: number;
  unlocked: boolean;
  cleared: boolean;
  onPress?: () => void;
}

export function StageNode({ stage, stars, unlocked, cleared, onPress }: StageNodeProps) {
  const ec = elementColors[stage.bossElement];
  const isBoss = stage.isChapterBoss;
  const dim = isBoss ? 76 : 60;

  return (
    <Pressable
      onPress={unlocked ? onPress : undefined}
      style={({ pressed }) => [styles.wrap, pressed && unlocked && styles.pressed]}
    >
      <View
        style={[
          styles.node,
          {
            width: dim,
            height: dim,
            borderColor: unlocked ? ec.core : colors.outlineVariant,
            backgroundColor: unlocked ? ec.glow : colors.surfaceContainerLowest,
            shadowColor: ec.core,
          },
          isBoss && styles.bossNode,
        ]}
      >
        {unlocked ? (
          <Icon
            name={isBoss ? 'skull-crossbones' : ELEMENT_ICON[stage.bossElement]}
            size={isBoss ? 30 : 22}
            color={unlocked ? colors.onSurface : colors.outline}
          />
        ) : (
          <Icon name="lock" size={20} color={colors.outline} />
        )}
      </View>
      {unlocked ? (
        <View style={styles.starsRow}>
          {[0, 1, 2].map((i) => (
            <Icon
              key={i}
              name={i < stars ? 'star' : 'star-outline'}
              size={12}
              color={i < stars ? colors.primary : colors.outline}
            />
          ))}
        </View>
      ) : null}
      <Text numberOfLines={2} style={[styles.label, !unlocked && styles.labelLocked]}>
        {isBoss ? stage.bossName : stage.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: 92, gap: 4 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  node: {
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.55,
    shadowRadius: 8,
  },
  bossNode: {
    borderRadius: radius.lg,
    borderWidth: 3,
  },
  starsRow: { flexDirection: 'row', gap: 1 },
  label: { ...type.labelXs, color: colors.onSurfaceVariant, textAlign: 'center' },
  labelLocked: { color: colors.outline },
});
