export interface OwnedHeroState {
  level: number;
  shards: number;
  equippedGearId?: string;
}

export interface StageProgressState {
  cleared: boolean;
  stars: number;
}

export interface QuestProgressEntry {
  progress: number;
  claimed: boolean;
}

export interface ChestOpenResult {
  chestId: string;
  gold: number;
  gems: number;
  heroShards: { heroId: string; amount: number; newlyUnlocked: boolean }[];
  gear: { gearId: string; amount: number }[];
}
