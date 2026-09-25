import React, { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Icon, OrnateFrame, PrimaryButton, type IconName } from '../../components';
import { GEAR_MAP } from '../../data/gear';
import { HERO_MAP } from '../../data/heroes';
import { colors, radius, rarityColors, spacing, type } from '../../theme';
import { images } from '../../theme/images';
import { useGameStore } from '../../store/useGameStore';
import { playSound } from '../../utils/sound';

export default function ChestOpenScreen() {
  const router = useRouter();
  const result = useGameStore((s) => s.lastChestResult);
  const clearLastChestResult = useGameStore((s) => s.clearLastChestResult);

  useEffect(() => {
    playSound('chestOpen');
    return () => clearLastChestResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    clearLastChestResult();
    router.back();
  };

  return (
    <View style={styles.overlay}>
      <Animated.View entering={FadeIn.duration(250)} style={styles.backdrop} />
      <Animated.View entering={ZoomIn.duration(260)} style={styles.cardOuter}>
        <OrnateFrame accentColor={colors.primary} style={styles.card} cornerSize={20}>
          <View style={styles.chestGlow}>
            <Image source={images.chestOpen} style={styles.chestArt} resizeMode="cover" />
          </View>
          <Text style={styles.title}>KASA AÇILDI!</Text>

          <ScrollView style={styles.rewardsScroll} contentContainerStyle={styles.rewardsContent}>
            {result ? (
              <>
                <RewardRow label="Altın" value={`+${result.gold.toLocaleString('tr-TR')}`} icon="cash" color={colors.primary} />
                {result.gems > 0 ? (
                  <RewardRow label="Elmas" value={`+${result.gems}`} icon="diamond-stone" color={colors.tertiary} />
                ) : null}
                {result.heroShards.map((s) => {
                  const hero = HERO_MAP[s.heroId];
                  const rc = hero ? rarityColors[hero.rarity] : rarityColors.common;
                  return (
                    <RewardRow
                      key={s.heroId}
                      label={hero ? `${hero.name}${s.newlyUnlocked ? ' (YENİ!)' : ''}` : s.heroId}
                      value={`+${s.amount} kırıntı`}
                      icon="account-group"
                      color={rc.text}
                    />
                  );
                })}
                {result.gear.map((g) => {
                  const gear = GEAR_MAP[g.gearId];
                  const rc = gear ? rarityColors[gear.rarity] : rarityColors.common;
                  return (
                    <RewardRow key={g.gearId} label={gear?.name ?? g.gearId} value={`x${g.amount}`} icon="sword-cross" color={rc.text} />
                  );
                })}
              </>
            ) : (
              <Text style={styles.emptyText}>Ödül bulunamadı.</Text>
            )}
          </ScrollView>

          <PrimaryButton label="Devam Et" onPress={handleContinue} fullWidth />
        </OrnateFrame>
      </Animated.View>
    </View>
  );
}

function RewardRow({ label, value, icon, color }: { label: string; value: string; icon: IconName; color: string }) {
  return (
    <View style={styles.rewardRow}>
      <Icon name={icon} size={16} color={color} />
      <Text style={[styles.rewardLabel, { color }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.rewardValue}>{value}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.82)',
  },
  cardOuter: { width: '86%', maxHeight: '80%' },
  card: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.7)',
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  chestGlow: {
    width: 156,
    height: 156,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(242,195,107,0.12)',
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 20,
    marginBottom: 4,
  },
  chestArt: { width: 132, height: 132, borderRadius: radius.lg },
  title: {
    ...type.headlineLg,
    color: colors.primary,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  rewardsScroll: { alignSelf: 'stretch', maxHeight: 260 },
  rewardsContent: { gap: 6 },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  rewardLabel: { ...type.bodyLg, flex: 1 },
  rewardValue: { ...type.bodyLg, color: colors.onSurface },
  emptyText: { ...type.bodyLg, color: colors.onSurfaceVariant },
});
