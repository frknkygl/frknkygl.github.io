import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Icon, PrimaryButton } from '../../components';
import { GEAR_MAP } from '../../data/gear';
import { HERO_MAP } from '../../data/heroes';
import { nextStageId, STAGE_MAP } from '../../data/stages';
import { colors, radius, spacing, type } from '../../theme';

export default function VictoryScreen() {
  const { stageId, result, stars } = useLocalSearchParams<{ stageId: string; result: string; stars: string }>();
  const router = useRouter();
  const stage = stageId ? STAGE_MAP[stageId] : undefined;
  const won = result === 'win';
  const starCount = Number(stars ?? 0);
  const next = stageId ? nextStageId(stageId) : undefined;

  if (!stage) return null;

  const shardHero = stage.heroShardDrop ? HERO_MAP[stage.heroShardDrop.heroId] : undefined;
  const gear = stage.gearDropId ? GEAR_MAP[stage.gearDropId] : undefined;

  const handleClose = () => router.back();
  const handleNext = () => {
    if (!next) return;
    router.replace({ pathname: '/battle/[stageId]', params: { stageId: next } });
  };
  const handleRetry = () => {
    router.replace({ pathname: '/battle/[stageId]', params: { stageId: stage.id } });
  };

  return (
    <View style={styles.overlay}>
      <Animated.View entering={FadeIn.duration(250)} style={styles.backdrop} />
      <Animated.View entering={ZoomIn.duration(320).springify().damping(14)} style={styles.card}>
        <Icon
          name={won ? 'trophy' : 'skull-crossbones'}
          size={56}
          color={won ? colors.primary : colors.secondary}
        />
        <Text style={[styles.title, { color: won ? colors.primary : colors.secondary }]}>
          {won ? 'ZAFER!' : 'YENİLGİ'}
        </Text>
        <Text style={styles.subtitle}>{stage.bossName} {won ? 'yenildi' : 'seni yendi'}</Text>

        {won ? (
          <>
            <View style={styles.starsRow}>
              {[0, 1, 2].map((i) => (
                <Icon key={i} name={i < starCount ? 'star' : 'star-outline'} size={32} color={i < starCount ? colors.primary : colors.outline} />
              ))}
            </View>
            <View style={styles.rewardsBox}>
              <RewardChip icon="cash" text={`+${stage.rewardGold.toLocaleString('tr-TR')}`} />
              <RewardChip icon="chart-line" text={`+${stage.rewardXp} XP`} />
              {stage.rewardGems > 0 ? <RewardChip icon="diamond-stone" text={`+${stage.rewardGems}`} /> : null}
              {shardHero ? <RewardChip icon="account-group" text={`+${stage.heroShardDrop!.amount} ${shardHero.name.split(' ')[0]}`} /> : null}
              {gear ? <RewardChip icon="sword-cross" text={gear.name} /> : null}
            </View>
          </>
        ) : (
          <Text style={styles.loseText}>Birliğini güçlendirip tekrar dene.</Text>
        )}

        <View style={styles.buttonCol}>
          {won && next ? <PrimaryButton label="Sonraki Sefer" icon="chevron-right" onPress={handleNext} fullWidth /> : null}
          {!won ? <PrimaryButton label="Tekrar Dene" icon="sword-cross" onPress={handleRetry} fullWidth /> : null}
          <PrimaryButton label="Sefer Haritası" variant="secondary" icon="map" onPress={handleClose} fullWidth />
        </View>
      </Animated.View>
    </View>
  );
}

function RewardChip({ icon, text }: { icon: React.ComponentProps<typeof Icon>['name']; text: string }) {
  return (
    <View style={styles.rewardChip}>
      <Icon name={icon} size={14} color={colors.primary} />
      <Text style={styles.rewardChipText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.88)',
  },
  card: {
    width: '86%',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.primaryFixedDim,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: { ...type.displayHero, fontSize: 30 },
  subtitle: { ...type.bodyLg, color: colors.onSurfaceVariant },
  starsRow: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.xs },
  rewardsBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.md,
  },
  rewardChipText: { ...type.labelCaps, color: colors.onSurface },
  loseText: { ...type.bodyLg, color: colors.onSurfaceVariant, textAlign: 'center' },
  buttonCol: { gap: spacing.sm, alignSelf: 'stretch', marginTop: spacing.sm },
});
