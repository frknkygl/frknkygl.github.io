import React from 'react';
import { Tabs } from 'expo-router';

import { Icon, type IconName } from '../../components/Icon';
import { colors } from '../../theme';

const TAB_ICONS: Record<string, IconName> = {
  index: 'map',
  heroes: 'account-group',
  shop: 'treasure-chest',
  quests: 'clipboard-list',
  profile: 'account',
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopColor: colors.outlineVariant,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'BarlowCondensed_600SemiBold',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        },
        tabBarIcon: ({ color, size }) => <Icon name={TAB_ICONS[route.name] ?? 'help-circle'} color={color as string} size={size} />,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Sefer' }} />
      <Tabs.Screen name="heroes" options={{ title: 'Kahramanlar' }} />
      <Tabs.Screen name="shop" options={{ title: 'Mağaza' }} />
      <Tabs.Screen name="quests" options={{ title: 'Görevler' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
