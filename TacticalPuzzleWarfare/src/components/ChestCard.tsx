import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { ChestDef } from '../data/types';
import { colors, radius, spacing, type } from '../theme';
import { images } from '../theme/images';
import { PrimaryButton } from './PrimaryButton';

interface ChestCardProps {
  chest: ChestDef;
  onOpen: () => void;
  disabled?: boolean;
}

export function ChestCard({ chest, onOpen, disabled }: ChestCardProps) {
  const costLabel =
    chest.costGold != null ? `${chest.costGold.toLocaleString('tr-TR')} Altın` : `${chest.costGems} Elmas`;

  return (
    <View style={styles.card}>
      <Image source={images.chestSealed} style={styles.art} resizeMode="cover" />
      <View style={styles.body}>
        <Text style={styles.name}>{chest.name}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {chest.description}
        </Text>
        <PrimaryButton
          label={costLabel}
          onPress={onOpen}
          disabled={disabled}
          variant={chest.costGems != null ? 'primary' : 'secondary'}
          icon={chest.costGems != null ? 'diamond-stone' : 'cash'}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.sm,
    alignItems: 'center',
  },
  art: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
  },
  body: { flex: 1, gap: 4 },
  name: { ...type.headlineSm, color: colors.primary, fontSize: 16 },
  desc: { ...type.bodyMd, color: colors.onSurfaceVariant },
});
