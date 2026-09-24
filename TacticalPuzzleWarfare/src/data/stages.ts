import type { ChapterDef, ElementId, StageDef } from './types';

interface ChapterSeed {
  id: string;
  name: string;
  description: string;
  element: ElementId;
  bossNames: string[]; // 5 regular + 1 chapter-boss name
  chapterBossShard?: { heroId: string; amount: number };
  chapterBossGearId?: string;
}

const CHAPTER_SEEDS: ChapterSeed[] = [
  {
    id: 'kizil-topraklar',
    name: 'Kızıl Topraklar',
    description: 'Yanmış ovalar ve kızıl küllerin arasında ilerleyen ilk sefer.',
    element: 'fire',
    bossNames: [
      'Kor Uşağı',
      'Alevden Muhafız',
      'Küllenmiş Süvari',
      'Cehennem Tazısı',
      'Yanık Cellat',
      'Ateş Lordu Skorax',
    ],
    chapterBossShard: { heroId: 'sera', amount: 6 },
    chapterBossGearId: 'warblade',
  },
  {
    id: 'unutulmus-katedral',
    name: 'Unutulmuş Katedral',
    description: 'Çökmüş kubbelerin altında kutsallığını yitirmiş bir mabet.',
    element: 'holy',
    bossNames: [
      'Sahte Rahip',
      'Zincirli Melek',
      'Tapınak Bekçisi',
      'Kutsanmamış Şövalye',
      'Çan Kulesi Hayaleti',
      'Baş Piskopos Vareth',
    ],
    chapterBossShard: { heroId: 'elyth', amount: 6 },
    chapterBossGearId: 'bastion-plate',
  },
  {
    id: 'yesil-bataklik',
    name: 'Yeşil Bataklık',
    description: 'Zehirli sisler ve boğucu köklerle kaplı unutulmuş bataklık.',
    element: 'nature',
    bossNames: [
      'Sürüngen Devriye',
      'Diken Kolu',
      'Bataklık Şamanı',
      'Küf Kraliçesi',
      'Kök Canavarı',
      'Yaşlı Ağaç Ruhu Threll',
    ],
    chapterBossShard: { heroId: 'fenwyr', amount: 6 },
    chapterBossGearId: 'runic-greatsword',
  },
  {
    id: 'demir-kale',
    name: 'Demir Kale',
    description: 'Asla düşmemiş dediği kalenin son savunma hatları.',
    element: 'iron',
    bossNames: [
      'Zırhlı Nöbetçi',
      'Kale Falangası',
      'Mekanik Cellat',
      'Pas Devi',
      'Kapı Bekçisi Orn',
      'Baş Komutan Drevahl',
    ],
    chapterBossShard: { heroId: 'baldrik', amount: 6 },
    chapterBossGearId: 'wyrmscale-armor',
  },
  {
    id: 'golge-diyari',
    name: 'Gölge Diyarı',
    description: 'Işığın asla ulaşmadığı, gerçekliğin çözüldüğü son sınır.',
    element: 'void',
    bossNames: [
      'Gölge Yankısı',
      'Kabus Süvarisi',
      'Boşluk Dikeni',
      'Unutulmuş Muhafız',
      'Kozmik Vaiz',
      'Gölge Üstadı Nyx (Yansıma)',
    ],
    chapterBossShard: { heroId: 'nyx', amount: 10 },
    chapterBossGearId: 'relic-blood-seal',
  },
];

const STAGES_PER_CHAPTER = 6;

function buildStages(): { stages: StageDef[]; chapters: ChapterDef[] } {
  const stages: StageDef[] = [];
  const chapters: ChapterDef[] = [];

  CHAPTER_SEEDS.forEach((seed, chapterIdx) => {
    const stageIds: string[] = [];

    for (let i = 0; i < STAGES_PER_CHAPTER; i++) {
      const globalIndex = chapterIdx * STAGES_PER_CHAPTER + i; // 0-based overall
      const isBoss = i === STAGES_PER_CHAPTER - 1;
      const id = `${seed.id}-${i + 1}`;

      const difficultyBase = Math.pow(1.16, globalIndex);
      const bossHp = Math.round((900 + 260 * globalIndex) * difficultyBase * (isBoss ? 1.55 : 1));
      const bossAtk = Math.round((26 + 3.4 * globalIndex) * (isBoss ? 1.35 : 1));

      stages.push({
        id,
        chapterId: seed.id,
        index: globalIndex,
        name: isBoss ? `${seed.name}: Son Nöbet` : `${seed.name} ${i + 1}. Bölge`,
        bossName: seed.bossNames[i],
        bossElement: seed.element,
        bossHp,
        bossAtk,
        bossAttackInterval: isBoss ? 3 : 4,
        moveLimit: isBoss ? 26 : 22,
        energyCost: isBoss ? 10 : 6,
        isChapterBoss: isBoss,
        rewardGold: Math.round((140 + 34 * globalIndex) * (isBoss ? 1.8 : 1)),
        rewardXp: Math.round((60 + 14 * globalIndex) * (isBoss ? 1.8 : 1)),
        rewardGems: isBoss ? 8 + chapterIdx * 2 : 0,
        heroShardDrop: isBoss ? seed.chapterBossShard : undefined,
        gearDropId: isBoss ? seed.chapterBossGearId : i === 2 ? 'iron-shield' : undefined,
        recommendedPower: Math.round(bossHp / 11 + bossAtk * 1.8),
      });
      stageIds.push(id);
    }

    chapters.push({
      id: seed.id,
      index: chapterIdx,
      name: seed.name,
      description: seed.description,
      element: seed.element,
      stageIds,
    });
  });

  return { stages, chapters };
}

const built = buildStages();
export const STAGES: StageDef[] = built.stages;
export const CHAPTERS: ChapterDef[] = built.chapters;

export const STAGE_MAP: Record<string, StageDef> = Object.fromEntries(
  STAGES.map((s) => [s.id, s])
);

export const FIRST_STAGE_ID = STAGES[0].id;

export function nextStageId(stageId: string): string | undefined {
  const stage = STAGE_MAP[stageId];
  if (!stage) return undefined;
  const idx = STAGES.findIndex((s) => s.id === stageId);
  return STAGES[idx + 1]?.id;
}
