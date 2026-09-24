import { GEAR_MAP } from '../data/gear';
import { HERO_MAP, heroStatAtLevel } from '../data/heroes';
import type { RarityId } from '../data/types';
import { HEROES } from '../data/heroes';
import type { OwnedHeroState } from './types';

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function weekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-W${week}`;
}

export function pickWeightedRarity(weights: Record<RarityId, number>, roll: number): RarityId {
  const entries = Object.entries(weights) as [RarityId, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let target = roll * total;
  for (const [rarity, weight] of entries) {
    if (target < weight) return rarity;
    target -= weight;
  }
  return entries[entries.length - 1][0];
}

export function pickRandomHeroOfRarity(rarity: RarityId, rand: () => number): string {
  const pool = HEROES.filter((h) => h.rarity === rarity);
  const source = pool.length > 0 ? pool : HEROES;
  return source[Math.floor(rand() * source.length)].id;
}

export function pickRandomGearOfRarity(rarity: RarityId, rand: () => number): string | undefined {
  const GEAR_LIST = Object.values(GEAR_MAP).filter((g) => g.rarity === rarity && !g.hasArt);
  if (GEAR_LIST.length === 0) return undefined;
  return GEAR_LIST[Math.floor(rand() * GEAR_LIST.length)].id;
}

export function computeHeroRuntime(
  heroId: string,
  owned: OwnedHeroState
): { atk: number; hp: number; def: number } | undefined {
  const def = HERO_MAP[heroId];
  if (!def) return undefined;
  const base = heroStatAtLevel(def, owned.level);
  const gear = owned.equippedGearId ? GEAR_MAP[owned.equippedGearId] : undefined;
  return {
    atk: base.atk + (gear?.atkBonus ?? 0),
    hp: base.hp + (gear?.hpBonus ?? 0),
    def: base.def + (gear?.defBonus ?? 0),
  };
}

export function xpToNextLevel(level: number): number {
  return Math.round(120 + level * 55);
}

export function buildSquadRuntime(squadIds: string[], ownedHeroes: Record<string, OwnedHeroState>) {
  return squadIds
    .map((heroId) => {
      const def = HERO_MAP[heroId];
      const owned = ownedHeroes[heroId];
      if (!def || !owned) return undefined;
      const stats = computeHeroRuntime(heroId, owned);
      if (!stats) return undefined;
      return {
        heroId,
        name: def.name,
        element: def.element,
        atk: stats.atk,
        def: stats.def,
        hp: stats.hp,
        maxHp: stats.hp,
        mana: 0,
        ultimateCost: def.ultimateCost,
        ultimateKind: def.ultimateKind,
        ultimatePower: def.ultimatePower,
        ultimateName: def.ultimateName,
        ultimateDescription: def.ultimateDescription,
      };
    })
    .filter((h): h is NonNullable<typeof h> => h != null);
}
