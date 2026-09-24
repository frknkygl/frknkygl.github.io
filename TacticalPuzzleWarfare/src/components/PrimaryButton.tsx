import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors, radius, spacing, type } from '../theme';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  icon?: IconName;
  fullWidth?: boolean;
  style?: ViewStyle;
  haptics?: boolean;
}

const VARIANT_STYLES: Record<Variant, { bg: string; border: string; text: string }> = {
  primary: { bg: colors.primaryContainer, border: colors.primaryFixed, text: colors.onPrimary },
  secondary: { bg: colors.surfaceContainerHigh, border: colors.outlineVariant, text: colors.onSurface },
  ghost: { bg: 'transparent', border: colors.outlineVariant, text: colors.onSurfaceVariant },
  danger: { bg: colors.secondaryContainer, border: colors.secondary, text: colors.onSecondary },
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  icon,
  fullWidth,
  style,
  haptics = true,
}: PrimaryButtonProps) {
  const v = VARIANT_STYLES[variant];

  const handlePress = () => {
    if (disabled) return;
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon ? <Icon name={icon} size={16} color={v.text} /> : null}
        <Text style={[styles.label, { color: v.text }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    ...type.titleTactical,
    textTransform: 'uppercase',
  },
});
