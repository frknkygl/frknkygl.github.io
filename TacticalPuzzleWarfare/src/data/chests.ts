import type { ChestDef } from './types';

export const CHESTS: ChestDef[] = [
  {
    id: 'bronze',
    name: 'Bronz Kasa',
    description: 'Küçük miktarda altın ve nadiren kahraman kırıntısı içerir.',
    costGold: 400,
    goldRange: [80, 220],
    gemRange: [0, 0],
    shardRollCount: 1,
    gearChance: 0.25,
    rarityWeights: { common: 70, rare: 26, epic: 4, legendary: 0 },
  },
  {
    id: 'silver',
    name: 'Gümüş Kasa',
    description: 'Dengeli ödüller ve daha yüksek kahraman kırıntısı şansı.',
    costGold: 1200,
    goldRange: [200, 480],
    gemRange: [0, 4],
    shardRollCount: 2,
    gearChance: 0.4,
    rarityWeights: { common: 48, rare: 38, epic: 12, legendary: 2 },
  },
  {
    id: 'gold',
    name: 'Altın Kasa',
    description: 'Zengin ödüller, garantili ekipman ve yüksek nadir kahraman şansı.',
    costGems: 90,
    goldRange: [400, 900],
    gemRange: [4, 12],
    shardRollCount: 3,
    gearChance: 0.7,
    rarityWeights: { common: 25, rare: 42, epic: 26, legendary: 7 },
  },
  {
    id: 'legendary',
    name: 'Kadim Mühür Sandığı',
    description: 'Ağır işlemeli, zincirlerle mühürlenmiş kadim kasa. En nadir ödülleri saklar.',
    costGems: 260,
    goldRange: [900, 1800],
    gemRange: [10, 26],
    shardRollCount: 5,
    gearChance: 1,
    rarityWeights: { common: 5, rare: 25, epic: 44, legendary: 26 },
  },
];

export const CHEST_MAP: Record<string, ChestDef> = Object.fromEntries(
  CHESTS.map((c) => [c.id, c])
);

export const LEGENDARY_CHEST_GUARANTEED_RELIC_ID = 'relic-summoning-core';
