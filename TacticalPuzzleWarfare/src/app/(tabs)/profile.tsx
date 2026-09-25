import React, { useMemo } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import {
  AppHeader,
  HeroPortrait,
  Icon,
  OrnateFrame,
  PrimaryButton,
  ScreenBackground,
  SectionHeader,
  StatBar,
} from '../../components';
import { CHAPTERS } from '../../data/stages';
import { HERO_MAP } from '../../data/heroes';
import { images } from '../../theme/images';
import { colors, elementColors, radius, spacing, type } from '../../theme';
import { useGameStore } from '../../store/useGameStore';
import { computeHeroRuntime, xpToNextLevel } from '../../store/helpers';
import { trUpper } from '../../utils/text';

export default function ProfileScreen() {
  const playerLevel = useGameStore((s) => s.playerLevel);
  const playerXp = useGameStore((s) => s.playerXp);
  const hapticsEnabled = useGameStore((s) => s.hapticsEnabled);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleHaptics = useGameStore((s) => s.toggleHaptics);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const ownedHeroes = useGameStore((s) => s.ownedHeroes);
  const squad = useGameStore((s) => s.squad);
  const stageProgress = useGameStore((s) => s.stageProgress);

  const ownedHeroesCount = Object.keys(ownedHeroes).length;
  const clearedStages = Object.values(stageProgress).filter((p) => p.cleared).length;
  const totalStars = Object.values(stageProgress).reduce((sum, p) => sum + p.stars, 0);
  const needed = xpToNextLevel(playerLevel);

  const squadPower = useMemo(() => {
    return squad.reduce((sum, heroId) => {
      const owned = ownedHeroes[heroId];
      if (!owned) return sum;
      const stats = computeHeroRuntime(heroId, owned);
      if (!stats) return sum;
      return sum + stats.atk + stats.def + Math.round(stats.hp / 10);
    }, 0);
  }, [squad, ownedHeroes]);

  const handleReset = () => {
    Alert.alert(
      'İlerlemeyi sıfırla',
      'Tüm ilerlemen, kahramanların ve kaynakların silinecek. Bu işlem geri alınamaz. Emin misin?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Sıfırla', style: 'destructive', onPress: () => resetProgress() },
      ]
    );
  };

  return (
    <ScreenBackground>
      <AppHeader title="Profil" subtitle="Komutan bilgileri ve ayarlar" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <OrnateFrame accentColor={colors.primary} style={styles.profileCard}>
          <Image source={images.portraitCommander} style={styles.avatar} />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.name}>Lord Malakor&apos;un Komutanı</Text>
            <StatBar
              value={playerXp}
              max={needed}
              color={colors.primary}
              label={`Seviye ${playerLevel}`}
              valueLabel={`${playerXp}/${needed} XP`}
            />
          </View>
        </OrnateFrame>

        <View style={styles.statsGrid}>
          <StatBox icon="account-group" value={ownedHeroesCount} label="Kahraman" />
          <StatBox icon="map-check" value={clearedStages} label="Tamamlanan Sefer" />
          <StatBox icon="star" value={totalStars} label="Toplam Yıldız" />
          <StatBox icon="sword-cross" value={squadPower} label="Birlik Gücü" />
        </View>

        <SectionHeader title="Aktif Birlik" subtitle={`${squad.length}/3 kahraman sefere hazır`} />
        <View style={styles.squadRow}>
          {squad.length > 0 ? (
            squad.map((heroId) => {
              const hero = HERO_MAP[heroId];
              if (!hero) return null;
              return (
                <View key={heroId} style={styles.squadItem}>
                  <HeroPortrait hero={hero} size={52} />
                  <Text style={styles.squadName} numberOfLines={1}>
                    {hero.name.split(' ')[0]}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptySquad}>Kahramanlar sekmesinden birliğini seç.</Text>
          )}
        </View>

        <SectionHeader title="Sefer İlerlemesi" subtitle="Bölüm başına tamamlanma oranı" />
        <View style={styles.chaptersBox}>
          {CHAPTERS.map((chapter) => {
            const cleared = chapter.stageIds.filter((id) => stageProgress[id]?.cleared).length;
            const ec = elementColors[chapter.element];
            return (
              <StatBar
                key={chapter.id}
                value={cleared}
                max={chapter.stageIds.length}
                color={ec.core}
                label={chapter.name}
                valueLabel={`${cleared}/${chapter.stageIds.length}`}
              />
            );
          })}
        </View>

        <SectionHeader title="Ayarlar" />
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Titreşim (Haptic)</Text>
          <Switch value={hapticsEnabled} onValueChange={toggleHaptics} trackColor={{ true: colors.primaryContainer }} />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Ses</Text>
          <Switch value={soundEnabled} onValueChange={toggleSound} trackColor={{ true: colors.primaryContainer }} />
        </View>

        <View style={{ height: spacing.lg }} />
        <SectionHeader title="Tehlikeli Bölge" />
        <PrimaryButton label="İlerlemeyi Sıfırla" variant="danger" icon="alert-circle-outline" onPress={handleReset} fullWidth />
        <View style={{ height: spacing.xl * 2 }} />
      </ScrollView>
    </ScreenBackground>
  );
}

function StatBox({ icon, value, label }: { icon: React.ComponentProps<typeof Icon>['name']; value: number; label: string }) {
  return (
    <View style={styles.statBox}>
      <Icon name={icon} size={18} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{trUpper(label)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.margin, gap: spacing.md },
  profileCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.6)',
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  avatar: { width: 64, height: 64, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.primary },
  name: { ...type.headlineSm, color: colors.primary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statBox: {
    width: '47%',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(242,195,107,0.22)',
    padding: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { ...type.statLg, color: colors.primary },
  statLabel: { ...type.labelCaps, color: colors.onSurfaceVariant, marginTop: 2 },
  squadRow: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
  },
  squadItem: { alignItems: 'center', gap: 4, width: 60 },
  squadName: { ...type.labelXs, color: colors.onSurfaceVariant },
  emptySquad: { ...type.bodyMd, color: colors.onSurfaceVariant },
  chaptersBox: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    gap: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(242,195,107,0.15)',
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  settingLabel: { ...type.bodyLg, color: colors.onSurface },
});
