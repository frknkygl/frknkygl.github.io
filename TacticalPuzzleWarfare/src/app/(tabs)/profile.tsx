import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { AppHeader, PrimaryButton, ScreenBackground, SectionHeader, StatBar } from '../../components';
import { images } from '../../theme/images';
import { colors, radius, spacing, type } from '../../theme';
import { useGameStore } from '../../store/useGameStore';
import { xpToNextLevel } from '../../store/helpers';

export default function ProfileScreen() {
  const playerLevel = useGameStore((s) => s.playerLevel);
  const playerXp = useGameStore((s) => s.playerXp);
  const hapticsEnabled = useGameStore((s) => s.hapticsEnabled);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleHaptics = useGameStore((s) => s.toggleHaptics);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const ownedHeroesCount = useGameStore((s) => Object.keys(s.ownedHeroes).length);
  const stageProgress = useGameStore((s) => s.stageProgress);

  const clearedStages = Object.values(stageProgress).filter((p) => p.cleared).length;
  const needed = xpToNextLevel(playerLevel);

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
        <View style={styles.profileCard}>
          <Image source={images.portraitCommander} style={styles.avatar} />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.name}>Lord Malakor'un Komutanı</Text>
            <StatBar value={playerXp} max={needed} color={colors.primary} label={`Seviye ${playerLevel}`} valueLabel={`${playerXp}/${needed} XP`} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{ownedHeroesCount}</Text>
            <Text style={styles.statLabel}>Kahraman</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{clearedStages}</Text>
            <Text style={styles.statLabel}>Tamamlanan Sefer</Text>
          </View>
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

const styles = StyleSheet.create({
  content: { padding: spacing.margin, gap: spacing.md },
  profileCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
  },
  avatar: { width: 64, height: 64, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.primary },
  name: { ...type.headlineSm, color: colors.primary },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: { ...type.statLg, color: colors.primary },
  statLabel: { ...type.labelCaps, color: colors.onSurfaceVariant, textTransform: 'uppercase', marginTop: 2 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  settingLabel: { ...type.bodyLg, color: colors.onSurface },
});
