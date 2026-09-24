import type { QuestTemplate } from './types';

export const DAILY_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'daily-clear-stages',
    label: '3 sefer bölgesini tamamla',
    goalType: 'clearStages',
    target: 3,
    rewardGold: 260,
    rewardXp: 80,
    rewardGems: 4,
    period: 'daily',
  },
  {
    id: 'daily-match-runes',
    label: '150 rün eşleştir',
    goalType: 'matchRunes',
    target: 150,
    rewardGold: 180,
    rewardXp: 60,
    rewardGems: 2,
    period: 'daily',
  },
  {
    id: 'daily-use-ultimates',
    label: '4 kahraman yeteneği kullan',
    goalType: 'useUltimates',
    target: 4,
    rewardGold: 220,
    rewardXp: 70,
    rewardGems: 3,
    period: 'daily',
  },
  {
    id: 'daily-open-chest',
    label: '1 kasa aç',
    goalType: 'openChests',
    target: 1,
    rewardGold: 140,
    rewardXp: 40,
    rewardGems: 2,
    period: 'daily',
  },
  {
    id: 'daily-earn-stars',
    label: '6 yıldız kazan',
    goalType: 'earnStars',
    target: 6,
    rewardGold: 300,
    rewardXp: 90,
    rewardGems: 3,
    period: 'daily',
  },
];

export const WEEKLY_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'weekly-clear-stages',
    label: '20 sefer bölgesi tamamla',
    goalType: 'clearStages',
    target: 20,
    rewardGold: 1800,
    rewardXp: 500,
    rewardGems: 20,
    period: 'weekly',
  },
  {
    id: 'weekly-level-hero',
    label: 'Bir kahramanı 5 kez yükselt',
    goalType: 'levelUpHero',
    target: 5,
    rewardGold: 1200,
    rewardXp: 300,
    rewardGems: 14,
    period: 'weekly',
  },
  {
    id: 'weekly-open-chests',
    label: '6 kasa aç',
    goalType: 'openChests',
    target: 6,
    rewardGold: 1000,
    rewardXp: 260,
    rewardGems: 12,
    period: 'weekly',
  },
];

export const QUEST_TEMPLATE_MAP: Record<string, QuestTemplate> = Object.fromEntries(
  [...DAILY_QUEST_TEMPLATES, ...WEEKLY_QUEST_TEMPLATES].map((t) => [t.id, t])
);
