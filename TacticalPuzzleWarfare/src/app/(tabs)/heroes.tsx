import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppHeader, HeroCard, ScreenBackground, SectionHeader } from '../../components';
import { HEROES } from '../../data/heroes';
import { spacing } from '../../theme';
import { useGameStore } from '../../store/useGameStore';

export default function HeroesScreen() {
  const router = useRouter();
  const ownedHeroes = useGameStore((s) => s.ownedHeroes);
  const squad = useGameStore((s) => s.squad);

  const ownedCount = Object.keys(ownedHeroes).length;

  return (
    <ScreenBackground>
      <AppHeader title="Kahramanlar" subtitle={`${ownedCount}/${HEROES.length} kahraman edinildi`} />
      <FlatList
        data={HEROES}
        keyExtractor={(h) => h.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <SectionHeader
            title="Birlik Yönetimi"
            subtitle={`Sefere çıkacak birliğini seç (${squad.length}/3) · kartlara dokunarak detaylara git`}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <HeroCard
              hero={item}
              owned={ownedHeroes[item.id]}
              locked={!ownedHeroes[item.id]}
              selected={squad.includes(item.id)}
              onPress={() => router.push({ pathname: '/hero/[heroId]', params: { heroId: item.id } })}
            />
          </View>
        )}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.margin, gap: spacing.sm },
  row: { gap: spacing.sm, justifyContent: 'flex-start' },
  cell: { marginBottom: spacing.sm },
});
