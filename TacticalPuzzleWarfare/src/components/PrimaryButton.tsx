import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { colors, radius, spacing, type } from '../theme';
import { playSound } from '../utils/sound';
import { trUpper } from '../utils/text';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'attack' | 'secondary' | 'ghost' | 'danger';

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

const VARIANT_STYLES: Record<
  Variant,
  { gradient: [string, string, ...string[]]; border: string; text: string; glow: string }
> = {
  primary: {
    gradient: ['#ffdea6', '#eec068', '#a97a2c'],
    border: '#7a5210',
    text: '#3a2600',
    glow: 'rgba(242,195,107,0.55)',
  },
  attack: {
    gradient: ['#ff6b52', '#c22929', '#6e0f0f'],
    border: '#4a0808',
    text: '#fff2ee',
    glow: 'rgba(194,41,41,0.6)',
  },
  secondary: {
    gradient: [colors.surfaceContainerHigh, colors.surfaceContainer],
    border: colors.outlineVariant,
    text: colors.onSurface,
    glow: 'transparent',
  },
  ghost: {
    gradient: ['transparent', 'transparent'],
    border: colors.outlineVariant,
    text: colors.onSurfaceVariant,
    glow: 'transparent',
  },
  danger: {
    gradient: ['#ffb4ac', '#931114'],
    border: '#5c0a0c',
    text: '#3a0002',
    glow: 'rgba(147,17,20,0.55)',
  },
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
    playSound('button');
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrapper,
        fullWidth && styles.fullWidth,
        { borderColor: v.border, shadowColor: v.glow },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <LinearGradient colors={v.gradient} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.bevel} />
      <View style={styles.content}>
        {icon ? <Icon name={icon} size={16} color={v.text} /> : null}
        <Text style={[styles.label, { color: v.text }]} numberOfLines={1}>
          {trUpper(label)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  bevel: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '48%',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  pressed: {
    transform: [{ translateY: 1 }, { scale: 0.99 }],
    opacity: 0.94,
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
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
