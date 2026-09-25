import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { colors, spacing, type } from '../theme';
import { playSound } from '../utils/sound';
import { trUpper } from '../utils/text';
import { Icon, type IconName } from './Icon';

const TAB_ICONS: Record<string, IconName> = {
  index: 'map',
  heroes: 'account-group',
  shop: 'treasure-chest',
  quests: 'clipboard-list',
  profile: 'account',
};

interface GameTabBarProps {
  state: { routes: { key: string; name: string }[]; index: number };
  descriptors: Record<string, { options: { title?: string } }>;
  navigation: {
    emit: (e: any) => any;
    navigate: (name: string) => void;
  };
  insets: { bottom: number };
}

export function GameTabBar({ state, descriptors, navigation, insets }: GameTabBarProps) {
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]}>
      <LinearGradient
        colors={[colors.surfaceContainerLowest, colors.surface]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.topGlow} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = (options.title ?? route.name) as string;
          const focused = state.index === index;
          const icon = TAB_ICONS[route.name] ?? 'help-circle';

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              Haptics.selectionAsync().catch(() => {});
              playSound('tap');
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab}>
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Icon name={icon} size={20} color={focused ? colors.onPrimary : colors.outline} />
              </View>
              <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
                {trUpper(label)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.6)',
  },
  topGlow: {
    height: 2,
    backgroundColor: colors.primaryFixedDim,
    opacity: 0.5,
    shadowColor: colors.primary,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  row: {
    flexDirection: 'row',
    paddingTop: 6,
    paddingHorizontal: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  iconWrap: {
    width: 40,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  label: {
    ...type.labelXs,
    color: colors.outline,
    fontSize: 9,
  },
  labelActive: {
    color: colors.primary,
  },
});
