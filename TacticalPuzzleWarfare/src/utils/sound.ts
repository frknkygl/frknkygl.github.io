import { createAudioPlayer } from 'expo-audio';

import tapSfx from '../../assets/sfx/tap.wav';
import matchSfx from '../../assets/sfx/match.wav';
import comboSfx from '../../assets/sfx/combo.wav';
import specialSfx from '../../assets/sfx/special.wav';
import invalidSfx from '../../assets/sfx/invalid.wav';
import victorySfx from '../../assets/sfx/victory.wav';
import defeatSfx from '../../assets/sfx/defeat.wav';
import buttonSfx from '../../assets/sfx/button.wav';
import chestOpenSfx from '../../assets/sfx/chest_open.wav';
import ultimateSfx from '../../assets/sfx/ultimate.wav';

const SOUND_SOURCES = {
  tap: tapSfx,
  match: matchSfx,
  combo: comboSfx,
  special: specialSfx,
  invalid: invalidSfx,
  victory: victorySfx,
  defeat: defeatSfx,
  button: buttonSfx,
  chestOpen: chestOpenSfx,
  ultimate: ultimateSfx,
};

export type SoundKey = keyof typeof SOUND_SOURCES;

// Roughly matches each file's real duration (see gen_sfx.py) plus a little
// headroom, used purely to know when it's safe to release the player.
const SOUND_DURATIONS_MS: Record<SoundKey, number> = {
  tap: 200,
  match: 350,
  combo: 450,
  special: 600,
  invalid: 300,
  victory: 900,
  defeat: 950,
  button: 150,
  chestOpen: 650,
  ultimate: 550,
};

let soundEnabled = true;

export function setSoundEnabled(value: boolean) {
  soundEnabled = value;
}

export function playSound(key: SoundKey) {
  if (!soundEnabled) return;
  try {
    const player = createAudioPlayer(SOUND_SOURCES[key]);
    player.volume = 1;
    player.play();
    setTimeout(() => {
      try {
        player.remove();
      } catch {
        // already released
      }
    }, SOUND_DURATIONS_MS[key]);
  } catch {
    // Audio unavailable (e.g. simulator quirk) — never let sound break gameplay.
  }
}
