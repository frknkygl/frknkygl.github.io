import type { ElementId, StageDef, UltimateKind } from '../data/types';
import { isStrongAgainst } from '../data/elements';
import {
  attemptSwap,
  BOARD_COLS,
  BOARD_ROWS,
  createIdGen,
  ensurePlayableBoard,
  generateBoard,
} from './engine';
import type { IdGen } from './engine';
import type { Rng } from './rng';
import type { Board, Pos, RuneElement, SwapResult } from './types';

export const DAMAGE_UNIT_SCALE = 0.34;

export interface SquadHeroRuntime {
  heroId: string;
  name: string;
  element: RuneElement;
  atk: number;
  def: number;
  hp: number;
  maxHp: number;
  mana: number;
  ultimateCost: number;
  ultimateKind: UltimateKind;
  ultimatePower: number;
  ultimateName: string;
  ultimateDescription: string;
}

export type BattleStatus = 'playing' | 'won' | 'lost';

export interface BattleLogEntry {
  id: number;
  text: string;
}

export interface BattleState {
  board: Board;
  stage: StageDef;
  bossHp: number;
  bossMaxHp: number;
  bossAttackCountdown: number;
  bossStunned: boolean;
  movesLeft: number;
  partyHp: number;
  partyMaxHp: number;
  shieldCharges: number;
  poisonPerTurn: number;
  poisonTurnsLeft: number;
  squad: SquadHeroRuntime[];
  status: BattleStatus;
  turnCount: number;
  log: BattleLogEntry[];
}

let logIdCounter = 1;

function pushLog(state: BattleState, text: string) {
  state.log.push({ id: logIdCounter++, text });
  if (state.log.length > 40) state.log.shift();
}

export function createBattleState(
  stage: StageDef,
  squad: SquadHeroRuntime[],
  rng: Rng,
  idGen: IdGen = createIdGen()
): BattleState {
  const board = ensurePlayableBoard(generateBoard(BOARD_COLS, BOARD_ROWS, rng, idGen), rng, idGen);
  const partyMaxHp = squad.reduce((sum, h) => sum + h.maxHp, 0);

  return {
    board,
    stage,
    bossHp: stage.bossHp,
    bossMaxHp: stage.bossHp,
    bossAttackCountdown: stage.bossAttackInterval,
    bossStunned: false,
    movesLeft: stage.moveLimit,
    partyHp: partyMaxHp,
    partyMaxHp,
    shieldCharges: 0,
    poisonPerTurn: 0,
    poisonTurnsLeft: 0,
    squad,
    status: 'playing',
    turnCount: 0,
    log: [],
  };
}

function teamAtk(state: BattleState): number {
  return state.squad.reduce((sum, h) => sum + h.atk, 0);
}

function avgDef(state: BattleState): number {
  if (state.squad.length === 0) return 0;
  return state.squad.reduce((sum, h) => sum + h.def, 0) / state.squad.length;
}

function applyPoisonTick(state: BattleState) {
  if (state.poisonTurnsLeft > 0 && state.bossHp > 0) {
    state.bossHp = Math.max(0, state.bossHp - state.poisonPerTurn);
    state.poisonTurnsLeft -= 1;
    if (state.bossHp <= 0) {
      pushLog(state, 'Zehir düşmanı tüketti!');
    }
  }
}

function applyBossAttackIfDue(state: BattleState) {
  if (state.bossHp <= 0) return;
  state.bossAttackCountdown -= 1;
  if (state.bossAttackCountdown > 0) return;
  state.bossAttackCountdown = state.stage.bossAttackInterval;

  if (state.bossStunned) {
    state.bossStunned = false;
    pushLog(state, `${state.stage.bossName} sersemlemiş durumda, saldıramadı!`);
    return;
  }

  if (state.shieldCharges > 0) {
    state.shieldCharges -= 1;
    pushLog(state, `Kalkan ${state.stage.bossName} saldırısını tamamen emdi.`);
    return;
  }

  const raw = state.stage.bossAtk;
  const mitigated = Math.max(Math.round(raw * 0.35), Math.round(raw - avgDef(state)));
  state.partyHp = Math.max(0, state.partyHp - mitigated);
  pushLog(state, `${state.stage.bossName} birliğe ${mitigated} hasar verdi.`);
}

function finalizeStatus(state: BattleState) {
  if (state.bossHp <= 0) {
    state.bossHp = 0;
    state.status = 'won';
  } else if (state.partyHp <= 0) {
    state.partyHp = 0;
    state.status = 'lost';
  } else if (state.movesLeft <= 0) {
    state.status = 'lost';
  }
}

export interface SwapOutcome {
  state: BattleState;
  result: SwapResult;
}

export function applySwap(state: BattleState, rng: Rng, idGen: IdGen, posA: Pos, posB: Pos): SwapOutcome {
  if (state.status !== 'playing') {
    return { state, result: { valid: false, steps: [], totalDamageUnits: 0, totalManaGained: {}, finalBoard: state.board, maxCombo: 0 } };
  }

  const result = attemptSwap(state.board, rng, idGen, posA, posB, state.stage.bossElement);
  if (!result.valid) {
    return { state, result };
  }

  const next: BattleState = { ...state, log: [...state.log] };
  next.board = ensurePlayableBoard(result.finalBoard, rng, idGen);

  const atk = teamAtk(next);
  const rawDamage = result.totalDamageUnits * DAMAGE_UNIT_SCALE * atk;
  next.bossHp = Math.max(0, next.bossHp - Math.round(rawDamage));

  next.squad = next.squad.map((hero) => {
    const gained = result.totalManaGained[hero.element] ?? 0;
    if (gained <= 0) return hero;
    return { ...hero, mana: Math.min(hero.ultimateCost, hero.mana + gained) };
  });

  next.movesLeft -= 1;
  next.turnCount += 1;

  applyPoisonTick(next);
  if (next.bossHp > 0) {
    applyBossAttackIfDue(next);
  }

  finalizeStatus(next);
  return { state: next, result };
}

export function applyUltimate(state: BattleState, heroIndex: number): BattleState {
  if (state.status !== 'playing') return state;
  const hero = state.squad[heroIndex];
  if (!hero || hero.mana < hero.ultimateCost) return state;

  const next: BattleState = { ...state, log: [...state.log] };
  const heroCopy = { ...hero, mana: 0 };
  next.squad = next.squad.map((h, i) => (i === heroIndex ? heroCopy : h));

  const weaknessBonus = isStrongAgainst(hero.element, state.stage.bossElement) ? 1.3 : 1;
  const baseDamage = Math.round(hero.atk * hero.ultimatePower * weaknessBonus);

  switch (hero.ultimateKind) {
    case 'directDamage':
    case 'lineBreaker':
    case 'prismBomb': {
      next.bossHp = Math.max(0, next.bossHp - baseDamage);
      pushLog(next, `${hero.name} "${hero.ultimateName}" ile ${baseDamage} hasar verdi!`);
      break;
    }
    case 'areaBomb': {
      next.bossHp = Math.max(0, next.bossHp - baseDamage);
      next.poisonPerTurn = Math.max(next.poisonPerTurn, Math.round(hero.atk * 0.15));
      next.poisonTurnsLeft = Math.max(next.poisonTurnsLeft, 3);
      pushLog(next, `${hero.name} "${hero.ultimateName}" ile ${baseDamage} hasar verdi ve zehirledi!`);
      break;
    }
    case 'heal': {
      const healAmount = Math.round(next.partyMaxHp * hero.ultimatePower);
      next.partyHp = Math.min(next.partyMaxHp, next.partyHp + healAmount);
      next.shieldCharges += 1;
      pushLog(next, `${hero.name} "${hero.ultimateName}" ile birliği ${healAmount} iyileştirdi.`);
      break;
    }
    case 'shield': {
      const charges = Math.max(1, Math.round(hero.ultimatePower));
      next.shieldCharges += charges;
      pushLog(next, `${hero.name} "${hero.ultimateName}" ile ${charges} kalkan yükledi.`);
      break;
    }
    case 'stun': {
      next.bossHp = Math.max(0, next.bossHp - baseDamage);
      next.bossStunned = true;
      pushLog(next, `${hero.name} "${hero.ultimateName}" ile düşmanı felç etti ve ${baseDamage} hasar verdi!`);
      break;
    }
  }

  finalizeStatus(next);
  return next;
}
