import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { elementColors, type ElementId, spacing, type } from '../theme';
import { ELEMENT_ICON, Icon } from './Icon';

interface ElementBadgeProps {
  element: ElementId;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function ElementBadge({ element, size = 'sm', showLabel }: ElementBadgeProps) {
  const c = elementColors[element];
  const dim = size === 'sm' ? 22 : 30;
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.badge,
          {
            width: dim,
            height: dim,
            borderColor: c.core,
            backgroundColor: c.glow,
            shadowColor: c.core,
          },
        ]}
      >
        <Icon name={ELEMENT_ICON[element]} size={size === 'sm' ? 12 : 16} color={c.core} />
      </View>
      {showLabel ? <Text style={[styles.label, { color: c.core }]}>{c.label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  badge: {
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },
  label: { ...type.labelCaps, textTransform: 'uppercase' },
});
