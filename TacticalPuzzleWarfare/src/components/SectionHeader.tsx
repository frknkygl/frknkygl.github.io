import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, right }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.accentBar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
    minHeight: 20,
    borderRadius: 2,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  title: { ...type.headlineSm, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.6 },
  subtitle: { ...type.bodyMd, color: colors.onSurfaceVariant, marginTop: 2 },
});
