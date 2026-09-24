import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppHeader, ChestCard, PrimaryButton, ScreenBackground, SectionHeader } from '../../components';
import { CHESTS } from '../../data/chests';
import { ENERGY_REFILL_COST_GEMS, GEM_PACKS, GOLD_PACKS } from '../../data/shop';
import { colors, radius, spacing, type } from '../../theme';
import { ENERGY_MAX, useGameStore } from '../../store/useGameStore';

export default function ShopScreen() {
  const router = useRouter();
  const gold = useGameStore((s) => s.gold);
  const gems = useGameStore((s) => s.gems);
  const energy = useGameStore((s) => s.energy);
  const openChest = useGameStore((s) => s.openChest);
  const addGold = useGameStore((s) => s.addGold);
  const addGems = useGameStore((s) => s.addGems);
  const spendGems = useGameStore((s) => s.spendGems);
  const refillEnergyWithGems = useGameStore((s) => s.refillEnergyWithGems);

  const handleOpenChest = (chestId: string) => {
    const result = openChest(chestId);
    if (!result) {
      Alert.alert('Yetersiz kaynak', 'Bu kasayı açmak için yeterli altın veya elmasın yok.');
      return;
    }
    router.push({ pathname: '/chest/[chestId]', params: { chestId } });
  };

  const handleBuyGoldPack = (cost: number, grantGold: number) => {
    if (!spendGems(cost)) {
      Alert.alert('Yetersiz elmas', 'Bu paketi almak için yeterli elmasın yok.');
      return;
    }
    addGold(grantGold);
    Alert.alert('Satın alındı', `${grantGold.toLocaleString('tr-TR')} altın hesabına eklendi.`);
  };

  const handleBuyGemPack = (grantGems: number) => {
    addGems(grantGems);
    Alert.alert('Satın alındı (demo)', `${grantGems} elmas hesabına eklendi. Bu bir demo satın alımıdır, gerçek ödeme alınmaz.`);
  };

  const handleRefillEnergy = () => {
    if (energy >= ENERGY_MAX) {
      Alert.alert('Enerji dolu', 'Enerjin zaten tam dolu.');
      return;
    }
    if (!refillEnergyWithGems(ENERGY_REFILL_COST_GEMS)) {
      Alert.alert('Yetersiz elmas', `Enerji doldurmak için ${ENERGY_REFILL_COST_GEMS} elmasa ihtiyacın var.`);
      return;
    }
    Alert.alert('Enerji dolduruldu', 'Enerjin tamamen dolduruldu.');
  };

  return (
    <ScreenBackground>
      <AppHeader title="Mağaza" subtitle={`${gold.toLocaleString('tr-TR')} altın · ${gems} elmas`} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.demoNotice}>
          Bu, çevrimdışı bir demo oyundur. "Satın alma" butonları gerçek bir ödeme başlatmaz; anında sanal para
          ekler.
        </Text>

        <SectionHeader title="Enerji" subtitle="Sefere çıkmak için enerji harca" />
        <View style={styles.energyRow}>
          <Text style={styles.energyValue}>
            {energy}/{ENERGY_MAX}
          </Text>
          <PrimaryButton label={`${ENERGY_REFILL_COST_GEMS} Elmasla Doldur`} icon="lightning-bolt" onPress={handleRefillEnergy} />
        </View>

        <SectionHeader title="Kasalar" subtitle="Kahraman kırıntısı, ekipman ve altın kazan" />
        <View style={{ gap: spacing.sm }}>
          {CHESTS.map((chest) => (
            <ChestCard key={chest.id} chest={chest} onOpen={() => handleOpenChest(chest.id)} />
          ))}
        </View>

        <SectionHeader title="Altın Paketleri" subtitle="Elmas karşılığında altın satın al" />
        <View style={styles.packGrid}>
          {GOLD_PACKS.map((pack) => (
            <View key={pack.id} style={styles.packCard}>
              <Text style={styles.packName}>{pack.name}</Text>
              <Text style={styles.packDesc}>{pack.description}</Text>
              {pack.bonus ? <Text style={styles.packBonus}>{pack.bonus}</Text> : null}
              <PrimaryButton
                label={pack.priceLabel}
                icon="diamond-stone"
                variant="secondary"
                onPress={() => handleBuyGoldPack(pack.costGems ?? 0, pack.grantGold ?? 0)}
              />
            </View>
          ))}
        </View>

        <SectionHeader title="Elmas Paketleri" subtitle="Demo satın alma — gerçek ödeme yoktur" />
        <View style={styles.packGrid}>
          {GEM_PACKS.map((pack) => (
            <View key={pack.id} style={styles.packCard}>
              <Text style={styles.packName}>{pack.name}</Text>
              <Text style={styles.packDesc}>{pack.description}</Text>
              {pack.bonus ? <Text style={styles.packBonus}>{pack.bonus}</Text> : null}
              <PrimaryButton label={pack.priceLabel} icon="diamond-stone" onPress={() => handleBuyGemPack(pack.grantGems ?? 0)} />
            </View>
          ))}
        </View>
        <View style={{ height: spacing.xl * 2 }} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.margin, gap: spacing.sm },
  demoNotice: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    backgroundColor: colors.surfaceContainer,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  energyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  energyValue: { ...type.statLg, color: colors.energy },
  packGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  packCard: {
    width: '31%',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.sm,
    gap: 4,
    alignItems: 'center',
  },
  packName: { ...type.labelCaps, color: colors.primary, textAlign: 'center' },
  packDesc: { ...type.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center', fontSize: 11 },
  packBonus: { ...type.labelXs, color: colors.success },
});
