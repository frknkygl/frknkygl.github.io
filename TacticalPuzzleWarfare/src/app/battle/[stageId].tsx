import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { ElementBadge, Icon, OrnateFrame, StatBar } from '../../components';
import { BossAvatar } from '../../components/battle/BossAvatar';
import { FloatingCombatText, type CombatPopup } from '../../components/battle/FloatingCombatText';
import { HeroUltimateSlot } from '../../components/battle/HeroUltimateSlot';
import { PendingSwap, RuneBoard } from '../../components/battle/RuneBoard';
import { STAGE_MAP } from '../../data/stages';
import { applySwap, applyUltimate, createBattleState, type BattleState } from '../../game/battle';
import { createIdGen } from '../../game/engine';
import { createRng } from '../../game/rng';
import type { Pos } from '../../game/types';
import { buildSquadRuntime } from '../../store/helpers';
import { useGameStore } from '../../store/useGameStore';
import { colors, elementColors, radius, spacing, type } from '../../theme';
import { playSound } from '../../utils/sound';
import { trUpper } from '../../utils/text';

export default function BattleScreen() {
  const { stageId } = useLocalSearchParams<{ stageId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const stage = stageId ? STAGE_MAP[stageId] : undefined;
  const squadIds = useGameStore((s) => s.squad);
  const ownedHeroes = useGameStore((s) => s.ownedHeroes);
  const spendEnergy = useGameStore((s) => s.spendEnergy);
  const completeStage = useGameStore((s) => s.completeStage);
  const hapticsEnabled = useGameStore((s) => s.hapticsEnabled);
  const progressQuest = useGameStore((s) => s.progressQuest);

  const rngRef = useRef(createRng(Date.now() ^ 0x9e3779b9));
  const idGenRef = useRef(createIdGen());
  const nonceRef = useRef(0);
  const popupIdRef = useRef(0);
  const startedRef = useRef(false);
  const pendingNextStateRef = useRef<BattleState | null>(null);

  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [pending, setPending] = useState<PendingSwap | null>(null);
  const [boardBusy, setBoardBusy] = useState(false);
  const [popups, setPopups] = useState<CombatPopup[]>([]);
  const [outcomeHandled, setOutcomeHandled] = useState(false);

  const squadRuntime = useMemo(() => buildSquadRuntime(squadIds, ownedHeroes), [squadIds, ownedHeroes]);

  useEffect(() => {
    if (!stage || startedRef.current) return;
    if (squadRuntime.length === 0) {
      router.back();
      return;
    }
    if (!spendEnergy(stage.energyCost)) {
      Alert.alert('Yetersiz enerji', 'Bu seferi başlatmak için yeterli enerjin yok.');
      router.back();
      return;
    }
    startedRef.current = true;
    setBattleState(createBattleState(stage, squadRuntime, rngRef.current, idGenRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const pushPopup = (text: string, sub?: string, color?: string) => {
    const id = ++popupIdRef.current;
    setPopups((p) => [...p, { id, text, sub, color }]);
  };

  const handlePopupDone = (id: number) => {
    setPopups((p) => p.filter((x) => x.id !== id));
  };

  const finishBattle = (finalState: BattleState) => {
    if (outcomeHandled) return;
    setOutcomeHandled(true);
    if (!stage) return;

    if (finalState.status === 'won') {
      playSound('victory');
      const partyHpPct = finalState.partyHp / Math.max(1, finalState.partyMaxHp);
      const movesLeftPct = finalState.movesLeft / Math.max(1, stage.moveLimit);
      let stars = 1;
      if (partyHpPct >= 0.5) stars += 1;
      if (movesLeftPct >= 0.3) stars += 1;
      completeStage(stage.id, stars);
      setTimeout(() => {
        router.replace({ pathname: '/victory/[stageId]', params: { stageId: stage.id, result: 'win', stars: String(stars) } });
      }, 550);
    } else {
      playSound('defeat');
      setTimeout(() => {
        router.replace({ pathname: '/victory/[stageId]', params: { stageId: stage.id, result: 'lose', stars: '0' } });
      }, 550);
    }
  };

  const handleSwapAttempt = (posA: Pos, posB: Pos) => {
    if (!battleState || boardBusy || battleState.status !== 'playing') return;
    const outcome = applySwap(battleState, rngRef.current, idGenRef.current, posA, posB);
    pendingNextStateRef.current = outcome.state;

    if (outcome.result.valid) {
      const dmg = Math.max(0, battleState.bossHp - outcome.state.bossHp);
      if (dmg > 0) {
        pushPopup(`-${Math.round(dmg).toLocaleString('tr-TR')}`, outcome.result.maxCombo > 1 ? `x${outcome.result.maxCombo} KOMBO` : undefined, colors.secondary);
      }
      const specialLabel = outcome.result.steps.find((s) => s.label)?.label;
      if (specialLabel) {
        pushPopup(specialLabel, undefined, colors.primary);
      }
      progressQuest('matchRunes', outcome.result.steps.reduce((sum, s) => sum + s.removed.filter((r) => !r.special).length, 0));
      setBoardBusy(true);
    }

    setPending({ nonce: ++nonceRef.current, posA, posB, result: outcome.result });
  };

  const handleAnimationComplete = () => {
    const next = pendingNextStateRef.current;
    setBoardBusy(false);
    if (!next) return;
    setBattleState(next);
    if (next.status !== 'playing') {
      finishBattle(next);
    }
  };

  const handleUltimate = (index: number) => {
    if (!battleState || boardBusy || battleState.status !== 'playing') return;
    const hero = battleState.squad[index];
    const next = applyUltimate(battleState, index);
    if (next === battleState) return;
    playSound('ultimate');
    setBattleState(next);
    pushPopup(hero.ultimateName, `${hero.name.split(' ')[0]} YETENEĞİ`, colors.tertiary);
    progressQuest('useUltimates', 1);
    if (next.status !== 'playing') {
      finishBattle(next);
    }
  };

  const handleFlee = () => {
    Alert.alert('Seferden kaç', 'Bu seferi terk etmek istediğine emin misin? Ödül kazanamayacaksın.', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Kaç', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  if (!stage || !battleState) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Sefer hazırlanıyor...</Text>
      </View>
    );
  }

  const ec = elementColors[stage.bossElement];
  const bossPct = battleState.bossHp / battleState.bossMaxHp;
  const partyPct = battleState.partyHp / battleState.partyMaxHp;

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.surfaceContainerLowest, colors.surface]} style={StyleSheet.absoluteFill} />

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable onPress={handleFlee} style={styles.fleeBtn}>
          <Icon name="close-circle-outline" size={22} color={colors.onSurfaceVariant} />
        </Pressable>
        <View style={styles.movesBox}>
          <Icon name="shoe-print" size={14} color={colors.onSurfaceVariant} />
          <Text style={styles.movesText}>{battleState.movesLeft} hamle</Text>
        </View>
      </View>

      <View style={styles.bossSection}>
        <OrnateFrame accentColor={ec.core} style={styles.bossPanel}>
          <LinearGradient
            colors={[`${ec.core}3d`, 'transparent']}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.bossTagRow}>
            <View style={[styles.bossTag, { borderColor: ec.core }]}>
              <Icon name={stage.isChapterBoss ? 'skull-crossbones' : 'sword-cross'} size={11} color={ec.core} />
              <Text style={[styles.bossTagText, { color: ec.core }]}>
                {stage.isChapterBoss ? 'BÖLÜM PATRONU' : 'DÜŞMAN DALGASI'}
              </Text>
            </View>
            <ElementBadge element={stage.bossElement} showLabel />
          </View>

          <View style={styles.bossRow}>
            <BossAvatar element={stage.bossElement} isBoss={stage.isChapterBoss} size={72} />
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.bossName} numberOfLines={2}>
                {stage.bossName.toLocaleUpperCase('tr-TR')}
              </Text>
              <StatBar
                value={battleState.bossHp}
                max={battleState.bossMaxHp}
                color={colors.vitality}
                valueLabel={`${Math.round(battleState.bossHp).toLocaleString('tr-TR')}/${battleState.bossMaxHp.toLocaleString('tr-TR')}`}
                height={16}
              />
              <Text style={styles.intentText}>
                {battleState.bossStunned
                  ? '⚡ SERSEMLEDİ'
                  : trUpper(`${battleState.bossAttackCountdown} hamle sonra saldıracak`)}
              </Text>
            </View>
          </View>
        </OrnateFrame>

        <View style={styles.partyRow}>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={styles.partyLabelRow}>
              <Text style={styles.partyLabel}>{trUpper('Birlik')}</Text>
              {battleState.shieldCharges > 0 ? (
                <View style={styles.shieldBadge}>
                  <Icon name="shield-check" size={12} color={colors.armor} />
                  <Text style={styles.shieldBadgeText}>x{battleState.shieldCharges}</Text>
                </View>
              ) : null}
            </View>
            <StatBar
              value={battleState.partyHp}
              max={battleState.partyMaxHp}
              color={colors.success}
              valueLabel={`${Math.round(battleState.partyHp)}/${battleState.partyMaxHp}`}
              height={10}
            />
          </View>
        </View>

        <View style={styles.ultimateRow}>
          {battleState.squad.map((hero, i) => (
            <HeroUltimateSlot key={hero.heroId} hero={hero} onActivate={() => handleUltimate(i)} disabled={boardBusy} />
          ))}
        </View>
      </View>

      <View style={styles.boardWrap}>
        <RuneBoard
          board={battleState.board}
          pending={pending}
          onSwapAttempt={handleSwapAttempt}
          onAnimationComplete={handleAnimationComplete}
          interactive={battleState.status === 'playing'}
          hapticsEnabled={hapticsEnabled}
        />
      </View>

      <View style={[styles.popupLayer, { top: insets.top }]} pointerEvents="none">
        {popups.map((p) => (
          <FloatingCombatText key={p.id} popup={p} onDone={handlePopupDone} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  loadingText: { ...type.bodyLg, color: colors.onSurfaceVariant },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.margin,
  },
  fleeBtn: { padding: 4 },
  movesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  movesText: { ...type.statMd, color: colors.onSurface, fontSize: 13 },
  bossSection: { paddingHorizontal: spacing.margin, gap: spacing.sm, paddingTop: spacing.sm },
  bossPanel: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.lg,
    padding: spacing.md,
    overflow: 'hidden',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  bossTagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bossTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bossTagText: { ...type.labelXs, letterSpacing: 1 },
  bossRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  bossName: {
    ...type.headlineLg,
    color: colors.onSurface,
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  intentText: { ...type.labelCaps, color: colors.secondary },
  partyRow: { flexDirection: 'row' },
  partyLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  partyLabel: { ...type.labelCaps, color: colors.onSurfaceVariant },
  shieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  shieldBadgeText: { ...type.labelXs, color: colors.armor },
  ultimateRow: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'space-between' },
  boardWrap: { flex: 1, paddingHorizontal: spacing.sm, paddingBottom: spacing.sm, justifyContent: 'center' },
  popupLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
