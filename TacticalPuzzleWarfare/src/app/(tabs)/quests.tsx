import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader, PrimaryButton, ScreenBackground, SectionHeader, StatBar } from '../../components';
import { QUEST_TEMPLATE_MAP } from '../../data/quests';
import { colors, radius, spacing, type } from '../../theme';
import { useGameStore } from '../../store/useGameStore';

function QuestRow({ questId }: { questId: string }) {
  const template = QUEST_TEMPLATE_MAP[questId];
  const entry = useGameStore((s) => s.questProgress[questId]);
  const claimQuest = useGameStore((s) => s.claimQuest);
  if (!template) return null;

  const progress = entry?.progress ?? 0;
  const claimed = entry?.claimed ?? false;
  const complete = progress >= template.target;

  return (
    <View style={styles.questCard}>
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={styles.questLabel}>{template.label}</Text>
        <StatBar value={progress} max={template.target} color={colors.primary} valueLabel={`${progress}/${template.target}`} />
        <View style={styles.rewardRow}>
          <Text style={styles.rewardText}>+{template.rewardGold} altın</Text>
          <Text style={styles.rewardText}>+{template.rewardXp} xp</Text>
          {template.rewardGems > 0 ? <Text style={styles.rewardText}>+{template.rewardGems} elmas</Text> : null}
        </View>
      </View>
      <PrimaryButton
        label={claimed ? 'Alındı' : 'Topla'}
        variant={claimed ? 'ghost' : complete ? 'primary' : 'secondary'}
        disabled={claimed || !complete}
        onPress={() => claimQuest(questId)}
      />
    </View>
  );
}

export default function QuestsScreen() {
  const dailyQuestIds = useGameStore((s) => s.dailyQuestIds);
  const weeklyQuestIds = useGameStore((s) => s.weeklyQuestIds);

  return (
    <ScreenBackground>
      <AppHeader title="Görevler" subtitle="Günlük ve haftalık görevlerle ödül kazan" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Günlük Görevler" subtitle="Her gün sıfırlanır" />
        <View style={{ gap: spacing.sm }}>
          {dailyQuestIds.map((id) => (
            <QuestRow key={id} questId={id} />
          ))}
        </View>

        <View style={{ height: spacing.lg }} />
        <SectionHeader title="Haftalık Görevler" subtitle="Her hafta sıfırlanır" />
        <View style={{ gap: spacing.sm }}>
          {weeklyQuestIds.map((id) => (
            <QuestRow key={id} questId={id} />
          ))}
        </View>
        <View style={{ height: spacing.xl * 2 }} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.margin },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(242,195,107,0.22)',
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  questLabel: { ...type.bodyLg, color: colors.onSurface },
  rewardRow: { flexDirection: 'row', gap: spacing.sm },
  rewardText: { ...type.labelXs, color: colors.onSurfaceVariant },
});
