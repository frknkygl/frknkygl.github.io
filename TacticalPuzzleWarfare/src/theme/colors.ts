// Palette lifted from the original Stitch design system (Arcane Relic & Iron).
export const colors = {
  surface: '#141316',
  surfaceDim: '#141316',
  surfaceBright: '#3a383c',
  surfaceContainerLowest: '#0f0e11',
  surfaceContainerLow: '#1c1b1e',
  surfaceContainer: '#201f22',
  surfaceContainerHigh: '#2b292d',
  surfaceContainerHighest: '#363437',

  onSurface: '#e6e1e5',
  onSurfaceVariant: '#d2c5b2',
  outline: '#9b8f7e',
  outlineVariant: '#4e4637',

  primary: '#f2c36b',
  onPrimary: '#412d00',
  primaryContainer: '#d4a853',
  onPrimaryContainer: '#3a2800',
  primaryFixed: '#ffdea6',
  primaryFixedDim: '#eec068',

  secondary: '#ffb4ac',
  onSecondary: '#690006',
  secondaryContainer: '#931114',
  onSecondaryContainer: '#ff9f95',

  tertiary: '#dcbdff',
  onTertiary: '#460084',
  tertiaryContainer: '#c89aff',
  onTertiaryContainer: '#2a0053',

  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',

  background: '#141316',
  onBackground: '#e6e1e5',

  // Elemental / runestone affinities
  elementFire: '#ff5533',
  elementFireDeep: '#9e1b1b',
  elementHoly: '#e5b338',
  elementNature: '#20a459',
  elementIron: '#7289a0',
  elementVoid: '#843bd7',

  vitality: '#c22929',
  armor: '#7289a0',
  gold: '#f2c36b',
  gem: '#dcbdff',
  energy: '#ff8a5b',

  success: '#20a459',
  white: '#ffffff',
  black: '#000000',
} as const;

export type ElementId = 'fire' | 'holy' | 'nature' | 'iron' | 'void';

export const elementColors: Record<ElementId, { core: string; glow: string; label: string }> = {
  fire: { core: '#ff5533', glow: 'rgba(255,85,51,0.55)', label: 'Ateş' },
  holy: { core: '#e5b338', glow: 'rgba(229,179,56,0.55)', label: 'Kutsal' },
  nature: { core: '#20a459', glow: 'rgba(32,164,89,0.55)', label: 'Doğa' },
  iron: { core: '#2c82de', glow: 'rgba(44,130,222,0.55)', label: 'Demir' },
  void: { core: '#843bd7', glow: 'rgba(132,59,215,0.55)', label: 'Gölge' },
};

export const rarityColors = {
  common: { text: '#c7c2c9', bg: '#3a383c', glow: 'rgba(199,194,201,0.35)', label: 'Adi' },
  rare: { text: '#7fc4ff', bg: '#1c3a52', glow: 'rgba(127,196,255,0.4)', label: 'Nadir' },
  epic: { text: '#dcbdff', bg: '#3a1f5c', glow: 'rgba(220,189,255,0.45)', label: 'Epik' },
  legendary: { text: '#f2c36b', bg: '#5d4200', glow: 'rgba(242,195,107,0.55)', label: 'Efsanevi' },
} as const;

export type RarityId = keyof typeof rarityColors;
