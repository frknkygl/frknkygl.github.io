import React from 'react';
import { Tabs } from 'expo-router';

import { GameTabBar } from '../../components';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GameTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Sefer' }} />
      <Tabs.Screen name="heroes" options={{ title: 'Kahramanlar' }} />
      <Tabs.Screen name="shop" options={{ title: 'Mağaza' }} />
      <Tabs.Screen name="quests" options={{ title: 'Görevler' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
