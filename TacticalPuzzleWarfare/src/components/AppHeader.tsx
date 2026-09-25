import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ENERGY_MAX, useGameStore } from '../store/useGameStore';
import { colors, spacing, type } from '../theme';
import { images } from '../theme/images';
import { trUpper } from '../utils/text';
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
      <View style={styles.titleRow}>
        <Image source={images.sigil} style={styles.sigil} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {trUpper(subtitle)}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.currencyRow}>
        <CurrencyPill icon="cash" value={gold.toLocaleString('tr-TR')} color={colors.primary} />
        <CurrencyPill icon="diamond-stone" value={gems} color={colors.tertiary} />
        <CurrencyPill icon="lightning-bolt" value={`${energy}/${ENERGY_MAX}`} color={colors.energy} />
      </View>
      <View style={styles.accentLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.margin,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sigil: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  title: { ...type.headlineLg, color: colors.primary, letterSpacing: 0.4 },
  subtitle: { ...type.labelCaps, color: colors.onSurfaceVariant, marginTop: 2 },
  currencyRow: { flexDirection: 'row', gap: spacing.sm },
  accentLine: {
    height: 2,
    marginTop: 2,
    marginHorizontal: -spacing.margin,
    backgroundColor: colors.primaryFixedDim,
    opacity: 0.55,
    shadowColor: colors.primary,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});
