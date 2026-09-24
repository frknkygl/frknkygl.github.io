import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { CHEST_MAP, LEGENDARY_CHEST_GUARANTEED_RELIC_ID } from '../data/chests';
import { GEAR_MAP } from '../data/gear';
import { HEROES, HERO_MAP, MAX_HERO_LEVEL, STARTER_HERO_IDS, heroUpgradeCost } from '../data/heroes';
import { DAILY_QUEST_TEMPLATES, QUEST_TEMPLATE_MAP, WEEKLY_QUEST_TEMPLATES } from '../data/quests';
import { STAGES, STAGE_MAP } from '../data/stages';
import type { QuestGoalType, QuestTemplate } from '../data/types';
import {
  computeHeroRuntime,
  pickRandomGearOfRarity,
  pickRandomHeroOfRarity,
  pickWeightedRarity,
  todayKey,
  weekKey,
  xpToNextLevel,
} from './helpers';
import type { ChestOpenResult, OwnedHeroState, QuestProgressEntry, StageProgressState } from './types';

export const ENERGY_MAX = 60;
export const ENERGY_REGEN_MS = 4 * 60 * 1000;
export const DAILY_QUEST_COUNT = 4;
export const WEEKLY_QUEST_COUNT = 3;

interface GameState {
  initialized: boolean;
  hasHydrated: boolean;

  playerLevel: number;
  playerXp: number;

  gold: number;
  gems: number;
  energy: number;
  energyLastTs: number;

  ownedHeroes: Record<string, OwnedHeroState>;
  squad: string[];

  gearInventory: Record<string, number>;

  stageProgress: Record<string, StageProgressState>;

  dailyQuestIds: string[];
  weeklyQuestIds: string[];
  questProgress: Record<string, QuestProgressEntry>;
  lastDailyResetDay: string;
  lastWeeklyResetWeek: string;

  hapticsEnabled: boolean;
  soundEnabled: boolean;

  lastChestResult: ChestOpenResult | null;

  // actions
  setHasHydrated: (v: boolean) => void;
  ensureInitialized: () => void;

  tickEnergy: () => void;
  spendEnergy: (amount: number) => boolean;
  refillEnergyWithGems: (cost: number) => boolean;

  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  addGems: (amount: number) => void;
  spendGems: (amount: number) => boolean;
  addXp: (amount: number) => void;

  addHeroShards: (heroId: string, amount: number) => boolean;
  levelUpHero: (heroId: string) => boolean;
  setSquad: (heroIds: string[]) => void;
  equipGear: (heroId: string, gearId: string | undefined) => void;
  addGear: (gearId: string, amount?: number) => void;

  openChest: (chestId: string) => ChestOpenResult | null;
  clearLastChestResult: () => void;

  completeStage: (stageId: string, starsEarned: number) => void;
  isStageUnlocked: (stageId: string) => boolean;

  refreshQuestCycles: () => void;
  progressQuest: (goalType: QuestGoalType, amount: number) => void;
  claimQuest: (questId: string) => boolean;

  toggleHaptics: () => void;
  toggleSound: () => void;

  resetProgress: () => void;
}

function initialHeroes(): Record<string, OwnedHeroState> {
  const map: Record<string, OwnedHeroState> = {};
  for (const id of STARTER_HERO_IDS) {
    map[id] = { level: 1, shards: 0 };
  }
  return map;
}

function pickQuestSubset(templates: QuestTemplate[], count: number, seed: number): string[] {
  const ids = templates.map((t) => t.id);
  const shuffled = [...ids];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function freshQuestProgress(ids: string[]): Record<string, QuestProgressEntry> {
  const out: Record<string, QuestProgressEntry> = {};
  for (const id of ids) out[id] = { progress: 0, claimed: false };
  return out;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      initialized: false,
      hasHydrated: false,

      playerLevel: 1,
      playerXp: 0,

      gold: 500,
      gems: 120,
      energy: ENERGY_MAX,
      energyLastTs: Date.now(),

      ownedHeroes: {},
      squad: [],

      gearInventory: {},

      stageProgress: {},

      dailyQuestIds: [],
      weeklyQuestIds: [],
      questProgress: {},
      lastDailyResetDay: '',
      lastWeeklyResetWeek: '',

      hapticsEnabled: true,
      soundEnabled: true,

      lastChestResult: null,

      setHasHydrated: (v) => set({ hasHydrated: v }),

      ensureInitialized: () => {
        const state = get();
        if (state.initialized) {
          get().refreshQuestCycles();
          return;
        }
        set({
          initialized: true,
          ownedHeroes: initialHeroes(),
          squad: [...STARTER_HERO_IDS],
          energyLastTs: Date.now(),
        });
        get().refreshQuestCycles();
      },

      tickEnergy: () => {
        const state = get();
        if (state.energy >= ENERGY_MAX) {
          if (state.energyLastTs !== Date.now()) set({ energyLastTs: Date.now() });
          return;
        }
        const now = Date.now();
        const elapsed = now - state.energyLastTs;
        const gained = Math.floor(elapsed / ENERGY_REGEN_MS);
        if (gained <= 0) return;
        const newEnergy = Math.min(ENERGY_MAX, state.energy + gained);
        const consumedMs = gained * ENERGY_REGEN_MS;
        set({ energy: newEnergy, energyLastTs: state.energyLastTs + consumedMs });
      },

      spendEnergy: (amount) => {
        get().tickEnergy();
        const state = get();
        if (state.energy < amount) return false;
        set({ energy: state.energy - amount });
        return true;
      },

      refillEnergyWithGems: (cost) => {
        const ok = get().spendGems(cost);
        if (!ok) return false;
        set({ energy: ENERGY_MAX, energyLastTs: Date.now() });
        return true;
      },

      addGold: (amount) => set((s) => ({ gold: s.gold + Math.max(0, Math.round(amount)) })),
      spendGold: (amount) => {
        const state = get();
        if (state.gold < amount) return false;
        set({ gold: state.gold - amount });
        return true;
      },
      addGems: (amount) => set((s) => ({ gems: s.gems + Math.max(0, Math.round(amount)) })),
      spendGems: (amount) => {
        const state = get();
        if (state.gems < amount) return false;
        set({ gems: state.gems - amount });
        return true;
      },

      addXp: (amount) => {
        let { playerLevel, playerXp } = get();
        playerXp += Math.max(0, Math.round(amount));
        let needed = xpToNextLevel(playerLevel);
        while (playerXp >= needed) {
          playerXp -= needed;
          playerLevel += 1;
          needed = xpToNextLevel(playerLevel);
        }
        set({ playerLevel, playerXp });
      },

      addHeroShards: (heroId, amount) => {
        if (!HERO_MAP[heroId] || amount <= 0) return false;
        const state = get();
        const existing = state.ownedHeroes[heroId];
        let newlyUnlocked = false;
        const next = { ...state.ownedHeroes };
        if (!existing) {
          newlyUnlocked = true;
          next[heroId] = { level: 1, shards: Math.max(0, amount - 1) };
        } else {
          next[heroId] = { ...existing, shards: existing.shards + amount };
        }
        set({ ownedHeroes: next });
        return newlyUnlocked;
      },

      levelUpHero: (heroId) => {
        const state = get();
        const owned = state.ownedHeroes[heroId];
        const def = HERO_MAP[heroId];
        if (!owned || !def) return false;
        if (owned.level >= MAX_HERO_LEVEL) return false;
        const cost = heroUpgradeCost(owned.level);
        if (state.gold < cost.gold || owned.shards < cost.shards) return false;
        set({
          gold: state.gold - cost.gold,
          ownedHeroes: {
            ...state.ownedHeroes,
            [heroId]: { ...owned, level: owned.level + 1, shards: owned.shards - cost.shards },
          },
        });
        get().progressQuest('levelUpHero', 1);
        return true;
      },

      setSquad: (heroIds) => {
        const state = get();
        const valid = heroIds.filter((id) => !!state.ownedHeroes[id]).slice(0, 3);
        set({ squad: valid });
      },

      equipGear: (heroId, gearId) => {
        const state = get();
        const owned = state.ownedHeroes[heroId];
        if (!owned) return;
        if (gearId) {
          const totalOwned = state.gearInventory[gearId] ?? 0;
          const equippedElsewhere = Object.entries(state.ownedHeroes).filter(
            ([id, h]) => id !== heroId && h.equippedGearId === gearId
          ).length;
          if (equippedElsewhere >= totalOwned) return;
        }
        set({
          ownedHeroes: {
            ...state.ownedHeroes,
            [heroId]: { ...owned, equippedGearId: gearId },
          },
        });
      },

      addGear: (gearId, amount = 1) => {
        set((s) => ({
          gearInventory: { ...s.gearInventory, [gearId]: (s.gearInventory[gearId] ?? 0) + amount },
        }));
      },

      openChest: (chestId) => {
        const chest = CHEST_MAP[chestId];
        const state = get();
        if (!chest) return null;

        if (chest.costGold != null) {
          if (state.gold < chest.costGold) return null;
        } else if (chest.costGems != null) {
          if (state.gems < chest.costGems) return null;
        }

        const rand = Math.random;
        const gold = Math.round(chest.goldRange[0] + rand() * (chest.goldRange[1] - chest.goldRange[0]));
        const gems = Math.round(chest.gemRange[0] + rand() * (chest.gemRange[1] - chest.gemRange[0]));

        const heroShardMap = new Map<string, number>();
        for (let i = 0; i < chest.shardRollCount; i++) {
          const rarity = pickWeightedRarity(chest.rarityWeights, rand());
          const heroId = pickRandomHeroOfRarity(rarity, rand);
          const amount = rarity === 'legendary' ? 3 : rarity === 'epic' ? 2 : 1;
          heroShardMap.set(heroId, (heroShardMap.get(heroId) ?? 0) + amount);
        }

        const gearGained: { gearId: string; amount: number }[] = [];
        if (rand() < chest.gearChance) {
          const rarity = pickWeightedRarity(chest.rarityWeights, rand());
          const gearId = pickRandomGearOfRarity(rarity, rand);
          if (gearId) gearGained.push({ gearId, amount: 1 });
        }
        if (chestId === 'legendary') {
          gearGained.push({ gearId: LEGENDARY_CHEST_GUARANTEED_RELIC_ID, amount: 1 });
        }

        // commit
        const s = get();
        if (chest.costGold != null) s.spendGold(chest.costGold);
        else if (chest.costGems != null) s.spendGems(chest.costGems);
        s.addGold(gold);
        if (gems > 0) s.addGems(gems);

        const heroShardsResult: ChestOpenResult['heroShards'] = [];
        heroShardMap.forEach((amount, heroId) => {
          const newlyUnlocked = s.addHeroShards(heroId, amount);
          heroShardsResult.push({ heroId, amount, newlyUnlocked });
        });

        gearGained.forEach(({ gearId, amount }) => s.addGear(gearId, amount));

        const result: ChestOpenResult = { chestId, gold, gems, heroShards: heroShardsResult, gear: gearGained };
        set({ lastChestResult: result });
        get().progressQuest('openChests', 1);
        return result;
      },

      clearLastChestResult: () => set({ lastChestResult: null }),

      completeStage: (stageId, starsEarned) => {
        const stage = STAGE_MAP[stageId];
        if (!stage) return;
        const state = get();
        const prev = state.stageProgress[stageId];
        const stars = Math.max(prev?.stars ?? 0, starsEarned);
        set({
          stageProgress: { ...state.stageProgress, [stageId]: { cleared: true, stars } },
        });

        const s = get();
        s.addGold(stage.rewardGold);
        s.addXp(stage.rewardXp);
        if (stage.rewardGems > 0) s.addGems(stage.rewardGems);
        if (stage.heroShardDrop) s.addHeroShards(stage.heroShardDrop.heroId, stage.heroShardDrop.amount);
        if (stage.gearDropId) s.addGear(stage.gearDropId, 1);

        if (!prev?.cleared) {
          s.progressQuest('clearStages', 1);
        }
        s.progressQuest('earnStars', Math.max(0, stars - (prev?.stars ?? 0)));
      },

      isStageUnlocked: (stageId) => {
        const idx = STAGES.findIndex((st) => st.id === stageId);
        if (idx <= 0) return true;
        const prevStage = STAGES[idx - 1];
        return !!get().stageProgress[prevStage.id]?.cleared;
      },

      refreshQuestCycles: () => {
        const state = get();
        const today = todayKey();
        const week = weekKey();
        const patch: Partial<GameState> = {};

        if (state.lastDailyResetDay !== today) {
          const seed = today.split('-').reduce((a, b) => a + Number(b), 0) || 1;
          const dailyIds = pickQuestSubset(DAILY_QUEST_TEMPLATES, DAILY_QUEST_COUNT, seed);
          patch.dailyQuestIds = dailyIds;
          patch.lastDailyResetDay = today;
          patch.questProgress = { ...state.questProgress, ...freshQuestProgress(dailyIds) };
        }
        if (state.lastWeeklyResetWeek !== week) {
          const seed = week.length;
          const weeklyIds = pickQuestSubset(WEEKLY_QUEST_TEMPLATES, WEEKLY_QUEST_COUNT, seed + 7);
          patch.weeklyQuestIds = weeklyIds;
          patch.lastWeeklyResetWeek = week;
          patch.questProgress = { ...(patch.questProgress ?? state.questProgress), ...freshQuestProgress(weeklyIds) };
        }
        if (Object.keys(patch).length > 0) set(patch as GameState);
      },

      progressQuest: (goalType, amount) => {
        if (amount <= 0) return;
        const state = get();
        const activeIds = [...state.dailyQuestIds, ...state.weeklyQuestIds];
        const nextProgress = { ...state.questProgress };
        let changed = false;
        for (const id of activeIds) {
          const template = QUEST_TEMPLATE_MAP[id];
          if (!template || template.goalType !== goalType) continue;
          const entry = nextProgress[id] ?? { progress: 0, claimed: false };
          if (entry.claimed) continue;
          nextProgress[id] = { ...entry, progress: Math.min(template.target, entry.progress + amount) };
          changed = true;
        }
        if (changed) set({ questProgress: nextProgress });
      },

      claimQuest: (questId) => {
        const state = get();
        const template = QUEST_TEMPLATE_MAP[questId];
        const entry = state.questProgress[questId];
        if (!template || !entry || entry.claimed || entry.progress < template.target) return false;
        set({ questProgress: { ...state.questProgress, [questId]: { ...entry, claimed: true } } });
        const s = get();
        s.addGold(template.rewardGold);
        s.addXp(template.rewardXp);
        if (template.rewardGems > 0) s.addGems(template.rewardGems);
        return true;
      },

      toggleHaptics: () => set((s) => ({ hapticsEnabled: !s.hapticsEnabled })),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

      resetProgress: () => {
        set({
          initialized: false,
          playerLevel: 1,
          playerXp: 0,
          gold: 500,
          gems: 120,
          energy: ENERGY_MAX,
          energyLastTs: Date.now(),
          ownedHeroes: {},
          squad: [],
          gearInventory: {},
          stageProgress: {},
          dailyQuestIds: [],
          weeklyQuestIds: [],
          questProgress: {},
          lastDailyResetDay: '',
          lastWeeklyResetWeek: '',
          lastChestResult: null,
        });
        get().ensureInitialized();
      },
    }),
    {
      name: 'rune-warfare-save',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => {
        const { lastChestResult: _omit, ...rest } = state;
        return rest;
      },
    }
  )
);

export function getHeroRuntime(heroId: string) {
  const state = useGameStore.getState();
  const owned = state.ownedHeroes[heroId];
  if (!owned) return undefined;
  return computeHeroRuntime(heroId, owned);
}

export const ALL_HERO_IDS = HEROES.map((h) => h.id);
export const GEAR_LOOKUP = GEAR_MAP;
