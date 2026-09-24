import type { ElementId } from '../data/types';

export type RuneElement = ElementId;
export const RUNE_ELEMENTS: RuneElement[] = ['fire', 'holy', 'nature', 'iron', 'void'];

export type SpecialKind = 'lineH' | 'lineV' | 'bomb' | 'prism';

export interface Tile {
  uid: number;
  element?: RuneElement; // undefined only for 'prism' specials
  special?: SpecialKind;
}

export type Board = Tile[][]; // board[row][col]

export interface Pos {
  row: number;
  col: number;
}

export interface RemovedTile extends Pos {
  uid: number;
  element?: RuneElement;
  special?: SpecialKind;
}

export interface SpecialSpawn extends Pos {
  special: SpecialKind;
  element?: RuneElement;
  uid: number;
}

export interface CascadeStep {
  removed: RemovedTile[];
  spawned: SpecialSpawn[];
  boardAfter: Board;
  damageUnits: number;
  manaGained: Partial<Record<RuneElement, number>>;
  comboIndex: number;
  label?: string;
}

export interface SwapResult {
  valid: boolean;
  reason?: string;
  steps: CascadeStep[];
  totalDamageUnits: number;
  totalManaGained: Partial<Record<RuneElement, number>>;
  finalBoard: Board;
  maxCombo: number;
}
