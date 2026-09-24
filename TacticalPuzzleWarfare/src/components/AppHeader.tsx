import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ENERGY_MAX, useGameStore } from '../store/useGameStore';
import { colors, spacing, type } from '../theme';
import { CurrencyPill } from './CurrencyPill';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const gold = useGameStore((s) => s.gold);
  const gems = useGameStore((s) => s.gems);
  const energy = useGameStore((s) => s.energy);

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.currencyRow}>
        <CurrencyPill icon="cash" value={gold.toLocaleString('tr-TR')} color={colors.primary} />
        <CurrencyPill icon="diamond-stone" value={gems} color={colors.tertiary} />
        <CurrencyPill icon="lightning-bolt" value={`${energy}/${ENERGY_MAX}`} color={colors.energy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.margin,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  title: { ...type.headlineMd, color: colors.primary },
  subtitle: { ...type.bodyMd, color: colors.onSurfaceVariant, marginTop: 2 },
  currencyRow: { flexDirection: 'row', gap: spacing.sm },
});
