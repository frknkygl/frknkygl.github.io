// Central registry of bundled art assets pulled from the original Stitch mockups.
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
};

export const elementRuneImage = {
  fire: images.runeFire,
  holy: images.runeHoly,
  nature: images.runeNature,
  iron: images.runeIron,
  void: images.runeVoid,
} as const;
