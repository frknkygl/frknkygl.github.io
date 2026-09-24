import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, type } from '../theme';
import { Icon, type IconName } from './Icon';

interface CurrencyPillProps {
  icon: IconName;
  value: string | number;
  color?: string;
}

export function CurrencyPill({ icon, value, color = colors.primary }: CurrencyPillProps) {
  return (
    <View style={styles.pill}>
      <Icon name={icon} size={14} color={color} />
      <Text style={[styles.value, { color }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  value: {
    ...type.statMd,
    fontSize: 13,
  },
});
