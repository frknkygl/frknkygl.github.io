import React, { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppHeader, ScreenBackground, StageNode } from '../../components';
import { CHAPTERS, STAGE_MAP } from '../../data/stages';
import { colors, spacing, type } from '../../theme';
import { useGameStore } from '../../store/useGameStore';

export default function CampaignScreen() {
  const router = useRouter();

  const energy = useGameStore((s) => s.energy);
  const squad = useGameStore((s) => s.squad);
  const stageProgress = useGameStore((s) => s.stageProgress);
  const isStageUnlocked = useGameStore((s) => s.isStageUnlocked);
  const playerLevel = useGameStore((s) => s.playerLevel);

  const totalStars = useMemo(
    () => Object.values(stageProgress).reduce((sum, p) => sum + p.stars, 0),
    [stageProgress]
  );

  const handleStagePress = (stageId: string) => {
    const stage = STAGE_MAP[stageId];
    if (!stage) return;
    if (squad.length === 0) {
      Alert.alert('Birlik boş', 'Sefere çıkmadan önce en az bir kahraman seçmelisin.', [
        { text: 'Tamam' },
      ]);
      return;
    }
    if (energy < stage.energyCost) {
      Alert.alert('Yetersiz enerji', 'Bu seferi başlatmak için yeterli enerjin yok. Enerji dolana kadar bekle ya da elmasla doldur.', [
        { text: 'Tamam' },
      ]);
      return;
    }
    router.push({ pathname: '/battle/[stageId]', params: { stageId } });
  };

  return (
    <ScreenBackground>
      <AppHeader title="Rün Savaşları" subtitle={`Komutan Seviyesi ${playerLevel} · ${totalStars} yıldız`} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {CHAPTERS.map((chapter) => (
          <View key={chapter.id} style={styles.chapterCard}>
            <View style={styles.chapterHeaderRow}>
              <Text style={styles.chapterTitle}>{chapter.name}</Text>
            </View>
            <Text style={styles.chapterDesc}>{chapter.description}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stagesRow}>
              {chapter.stageIds.map((stageId) => {
                const stage = STAGE_MAP[stageId];
                const progress = stageProgress[stageId];
                const unlocked = isStageUnlocked(stageId);
                return (
                  <StageNode
                    key={stageId}
                    stage={stage}
                    stars={progress?.stars ?? 0}
                    unlocked={unlocked}
                    cleared={!!progress?.cleared}
                    onPress={() => handleStagePress(stageId)}
                  />
                );
              })}
            </ScrollView>
          </View>
        ))}
        <View style={{ height: spacing.xl * 2 }} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: spacing.margin, gap: spacing.md },
  chapterCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(242,195,107,0.22)',
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  chapterHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chapterTitle: { ...type.headlineSm, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  chapterDesc: { ...type.bodyMd, color: colors.onSurfaceVariant, marginTop: 2, marginBottom: spacing.sm },
  stagesRow: { gap: spacing.sm, paddingVertical: spacing.xs },
});
