// Central registry of bundled art assets pulled from the original Stitch mockups
// plus AI-generated character/boss art produced for this project.
import sigil from '../../assets/images/sigil.png';
import portraitCommander from '../../assets/images/portrait-commander.jpg';
import chestSealed from '../../assets/images/chest-sealed.jpg';
import chestOpen from '../../assets/images/chest-open.jpg';
import relicBloodSeal from '../../assets/images/relic-blood-seal.jpg';
import relicSummoningCore from '../../assets/images/relic-summoning-core.jpg';
import runeFire from '../../assets/images/rune-fire.png';
import runeHoly from '../../assets/images/rune-holy.png';
import runeNature from '../../assets/images/rune-nature.png';
import runeIron from '../../assets/images/rune-iron.png';
import runeVoid from '../../assets/images/rune-void.png';

import bossSkorax from '../../assets/images/boss-skorax.jpg';
import bossVareth from '../../assets/images/boss-vareth.jpg';
import bossThrell from '../../assets/images/boss-threll.jpg';
import bossDrevahl from '../../assets/images/boss-drevahl.jpg';
import bossNyxReflection from '../../assets/images/boss-nyx-reflection.jpg';

import portraitSera from '../../assets/images/portrait-sera.jpg';
import portraitElyth from '../../assets/images/portrait-elyth.jpg';
import portraitFenwyr from '../../assets/images/portrait-fenwyr.jpg';
import portraitBaldrik from '../../assets/images/portrait-baldrik.jpg';
import portraitNyx from '../../assets/images/portrait-nyx.jpg';

export const images = {
  sigil,
  portraitCommander,
  chestSealed,
  chestOpen,
  relicBloodSeal,
  relicSummoningCore,
  runeFire,
  runeHoly,
  runeNature,
  runeIron,
  runeVoid,
  bossSkorax,
  bossVareth,
  bossThrell,
  bossDrevahl,
  bossNyxReflection,
  portraitSera,
  portraitElyth,
  portraitFenwyr,
  portraitBaldrik,
  portraitNyx,
};

export const elementRuneImage = {
  fire: images.runeFire,
  holy: images.runeHoly,
  nature: images.runeNature,
  iron: images.runeIron,
  void: images.runeVoid,
} as const;

// Chapter-boss art, keyed by the stage id that ends each chapter (see data/stages.ts).
export const bossArtByStageId: Record<string, typeof bossSkorax> = {
  'kizil-topraklar-6': images.bossSkorax,
  'unutulmus-katedral-6': images.bossVareth,
  'yesil-bataklik-6': images.bossThrell,
  'demir-kale-6': images.bossDrevahl,
  'golge-diyari-6': images.bossNyxReflection,
};
