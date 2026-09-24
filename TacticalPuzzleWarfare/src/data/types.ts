export type ElementId = 'fire' | 'holy' | 'nature' | 'iron' | 'void';

export type RarityId = 'common' | 'rare' | 'epic' | 'legendary';

export type Role = 'warrior' | 'tank' | 'mage' | 'support' | 'rogue';

export type UltimateKind =
  | 'directDamage' // big single hit to the boss
  | 'lineBreaker' // clears a row, moderate damage
  | 'areaBomb' // 3x3 damage + lingering poison
  | 'prismBomb' // clears a whole rune color, huge damage
  | 'heal' // restores party HP
  | 'shield' // absorbs the boss's next attack(s)
  | 'stun'; // skips the boss's next attack + damage

export interface HeroDef {
  id: string;
  name: string;
  title: string;
  element: ElementId;
  rarity: RarityId;
  role: Role;
  baseAtk: number;
  baseHp: number;
  baseDef: number;
  growthAtk: number;
  growthHp: number;
  growthDef: number;
  ultimateName: string;
  ultimateDescription: string;
  ultimateCost: number;
  ultimateKind: UltimateKind;
  ultimatePower: number;
  hasArt: boolean;
  lore: string;
}

export type GearSlot = 'weapon' | 'armor' | 'relic';

export interface GearDef {
  id: string;
  name: string;
  slot: GearSlot;
  rarity: RarityId;
  atkBonus: number;
  hpBonus: number;
  defBonus: number;
  description: string;
  hasArt?: boolean;
}

export interface StageDef {
  id: string;
  chapterId: string;
  index: number;
  name: string;
  bossName: string;
  bossElement: ElementId;
  bossHp: number;
  bossAtk: number;
  bossAttackInterval: number;
  moveLimit: number;
  energyCost: number;
  isChapterBoss: boolean;
  rewardGold: number;
  rewardXp: number;
  rewardGems: number;
  heroShardDrop?: { heroId: string; amount: number };
  gearDropId?: string;
  recommendedPower: number;
}

export interface ChapterDef {
  id: string;
  index: number;
  name: string;
  description: string;
  element: ElementId;
  stageIds: string[];
}

export type ChestId = 'bronze' | 'silver' | 'gold' | 'legendary';

export interface ChestDef {
  id: ChestId;
  name: string;
  description: string;
  costGold?: number;
  costGems?: number;
  goldRange: [number, number];
  gemRange: [number, number];
  shardRollCount: number;
  gearChance: number;
  rarityWeights: Record<RarityId, number>;
}

export type QuestGoalType =
  | 'clearStages'
  | 'matchRunes'
  | 'useUltimates'
  | 'levelUpHero'
  | 'openChests'
  | 'spendGold'
  | 'earnStars';

export interface QuestTemplate {
  id: string;
  label: string;
  goalType: QuestGoalType;
  target: number;
  rewardGold: number;
  rewardXp: number;
  rewardGems: number;
  period: 'daily' | 'weekly';
}
