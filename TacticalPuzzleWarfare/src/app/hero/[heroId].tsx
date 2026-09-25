import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ElementBadge, HeroPortrait, Icon, PrimaryButton, ScreenBackground, SectionHeader } from '../../components';
import { GEAR } from '../../data/gear';
import { HERO_MAP, MAX_HERO_LEVEL, heroStatAtLevel, heroUpgradeCost } from '../../data/heroes';
import { colors, radius, rarityColors, spacing, type } from '../../theme';
import { useGameStore } from '../../store/useGameStore';
import { trUpper } from '../../utils/text';

export default function HeroDetailScreen() {
  const { heroId } = useLocalSearchParams<{ heroId: string }>();
  const router = useRouter();
  const hero = heroId ? HERO_MAP[heroId] : undefined;

  const owned = useGameStore((s) => (heroId ? s.ownedHeroes[heroId] : undefined));
  const squad = useGameStore((s) => s.squad);
  const gold = useGameStore((s) => s.gold);
  const gearInventory = useGameStore((s) => s.gearInventory);
  const ownedHeroes = useGameStore((s) => s.ownedHeroes);
  const levelUpHero = useGameStore((s) => s.levelUpHero);
  const equipGear = useGameStore((s) => s.equipGear);
  const setSquad = useGameStore((s) => s.setSquad);

  if (!hero) {
    return (
      <ScreenBackground>
        <View style={styles.center}>
          <Text style={styles.notFound}>Kahraman bulunamadı.</Text>
        </View>
      </ScreenBackground>
    );
  }

  const rc = rarityColors[hero.rarity];
  const inSquad = squad.includes(hero.id);

  const handleToggleSquad = () => {
    if (!owned) return;
    if (inSquad) {
      setSquad(squad.filter((id) => id !== hero.id));
    } else {
      if (squad.length >= 3) {
        Alert.alert('Birlik dolu', 'Birlikte en fazla 3 kahraman olabilir. Önce birinden vazgeç.');
        return;
      }
      setSquad([...squad, hero.id]);
    }
  };

  const handleLevelUp = () => {
    if (!owned) return;
    const ok = levelUpHero(hero.id);
    if (!ok) {
      Alert.alert('Yükseltilemedi', 'Yeterli altın veya kahraman kırıntın yok.');
    }
  };

  const stats = owned ? heroStatAtLevel(hero, owned.level) : heroStatAtLevel(hero, 1);
  const cost = owned ? heroUpgradeCost(owned.level) : undefined;
  const equippedGear = owned?.equippedGearId ? GEAR.find((g) => g.id === owned.equippedGearId) : undefined;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="chevron-left" size={20} color={colors.onSurface} />
          <Text style={styles.backLabel}>Geri</Text>
        </Pressable>

        <View style={styles.headerRow}>
          <View style={{ opacity: owned ? 1 : 0.4 }}>
            <HeroPortrait hero={hero} size={96} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.name}>{hero.name}</Text>
            <Text style={styles.title}>{hero.title}</Text>
            <View style={styles.badgeRow}>
              <ElementBadge element={hero.element} showLabel />
              <Text style={[styles.rarity, { color: rc.text }]}>{trUpper(rc.label)}</Text>
              {owned ? <Text style={styles.level}>Sv. {owned.level}/{MAX_HERO_LEVEL}</Text> : null}
            </View>
          </View>
        </View>

        <Text style={styles.lore}>{hero.lore}</Text>

        {owned ? (
          <>
            <SectionHeader title="İstatistikler" />
            <View style={styles.statsGrid}>
              <StatChip icon="sword-cross" label="Saldırı" value={stats.atk} color={colors.secondary} />
              <StatChip icon="heart" label="Can" value={stats.hp} color={colors.vitality} />
              <StatChip icon="shield" label="Savunma" value={stats.def} color={colors.armor} />
            </View>

            <SectionHeader title={hero.ultimateName} subtitle={`Yetenek maliyeti: ${hero.ultimateCost} mana`} />
            <Text style={styles.ultimateDesc}>{hero.ultimateDescription}</Text>

            <SectionHeader title="Yükseltme" subtitle={`${owned.shards} kırıntı sahibisin`} />
            {owned.level < MAX_HERO_LEVEL && cost ? (
              <PrimaryButton
                label={`Yükselt (${cost.gold.toLocaleString('tr-TR')} altın · ${cost.shards} kırıntı)`}
                onPress={handleLevelUp}
                disabled={gold < cost.gold || owned.shards < cost.shards}
                fullWidth
                icon="arrow-up-bold"
              />
            ) : (
              <Text style={styles.maxedText}>Maksimum seviyeye ulaştı.</Text>
            )}

            <SectionHeader title="Ekipman" subtitle={equippedGear ? equippedGear.name : 'Ekipman takılı değil'} />
            <View style={styles.gearGrid}>
              <Pressable
                onPress={() => equipGear(hero.id, undefined)}
                style={[styles.gearChip, !equippedGear && styles.gearChipActive]}
              >
                <Text style={styles.gearChipText}>Yok</Text>
              </Pressable>
              {GEAR.map((gear) => {
                const totalOwned = gearInventory[gear.id] ?? 0;
                const equippedElsewhere = Object.entries(ownedHeroes).filter(
                  ([id, h]) => id !== hero.id && h.equippedGearId === gear.id
                ).length;
                const available = totalOwned - equippedElsewhere;
                const isEquipped = owned.equippedGearId === gear.id;
                const canEquip = isEquipped || available > 0;
                if (totalOwned <= 0) return null;
                return (
                  <Pressable
                    key={gear.id}
                    disabled={!canEquip}
                    onPress={() => equipGear(hero.id, gear.id)}
                    style={[styles.gearChip, isEquipped && styles.gearChipActive, !canEquip && styles.gearChipDisabled]}
                  >
                    <Text style={styles.gearChipText} numberOfLines={1}>
                      {gear.name} {available > 0 ? `x${available}` : isEquipped ? '(takılı)' : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ height: spacing.md }} />
            <PrimaryButton
              label={inSquad ? 'Birlikten Çıkar' : 'Birliğe Ekle'}
              variant={inSquad ? 'danger' : 'primary'}
              icon={inSquad ? 'close-circle-outline' : 'sword-cross'}
              onPress={handleToggleSquad}
              fullWidth
            />
          </>
        ) : (
          <View style={styles.lockedBox}>
            <Icon name="lock" size={28} color={colors.outline} />
            <Text style={styles.lockedText}>
              Bu kahramanı açığa çıkarmak için kasalardan veya sefer ödüllerinden kırıntı topla.
            </Text>
          </View>
        )}
        <View style={{ height: spacing.xl * 2 }} />
      </ScrollView>
    </ScreenBackground>
  );
}

function StatChip({ icon, label, value, color }: { icon: React.ComponentProps<typeof Icon>['name']; label: string; value: number; color: string }) {
  return (
    <View style={styles.statChip}>
      <Icon name={icon} size={18} color={color} />
      <Text style={styles.statChipValue}>{value}</Text>
      <Text style={styles.statChipLabel}>{trUpper(label)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.margin, gap: spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { ...type.bodyLg, color: colors.onSurfaceVariant },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: spacing.sm },
  backLabel: { ...type.bodyLg, color: colors.onSurface },
  headerRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  name: { ...type.headlineMd, color: colors.primary },
  title: { ...type.bodyMd, color: colors.onSurfaceVariant },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  rarity: { ...type.labelCaps },
  level: { ...type.labelCaps, color: colors.onSurfaceVariant },
  lore: { ...type.bodyLg, color: colors.onSurfaceVariant, fontStyle: 'italic', marginTop: spacing.sm },
  statsGrid: { flexDirection: 'row', gap: spacing.sm },
  statChip: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingVertical: spacing.sm,
  },
  statChipValue: { ...type.statLg, color: colors.onSurface, fontSize: 20 },
  statChipLabel: { ...type.labelXs, color: colors.onSurfaceVariant },
  ultimateDesc: { ...type.bodyLg, color: colors.onSurfaceVariant },
  maxedText: { ...type.bodyLg, color: colors.primary },
  gearGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  gearChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainer,
  },
  gearChipActive: { borderColor: colors.primary, backgroundColor: colors.surfaceContainerHigh },
  gearChipDisabled: { opacity: 0.4 },
  gearChipText: { ...type.labelCaps, color: colors.onSurface },
  lockedBox: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl, backgroundColor: colors.surfaceContainer, borderRadius: radius.lg },
  lockedText: { ...type.bodyLg, color: colors.onSurfaceVariant, textAlign: 'center' },
});
