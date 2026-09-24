import type { ElementId } from '../data/types';
import { isStrongAgainst } from '../data/elements';
import type { Rng } from './rng';
import { pick } from './rng';
import type {
  Board,
  CascadeStep,
  Pos,
  RemovedTile,
  RuneElement,
  SpecialKind,
  SpecialSpawn,
  SwapResult,
  Tile,
} from './types';
import { RUNE_ELEMENTS } from './types';

export const BOARD_COLS = 6;
export const BOARD_ROWS = 7;
export const MAX_CASCADE_ITERATIONS = 25;

export interface IdGen {
  next: () => number;
}

export function createIdGen(start = 1): IdGen {
  let n = start;
  return { next: () => n++ };
}

function cellKey(p: Pos): string {
  return `${p.row},${p.col}`;
}

export function inBounds(pos: Pos, cols: number, rows: number): boolean {
  return pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols;
}

export function isAdjacent(a: Pos, b: Pos): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return dr + dc === 1;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((t) => ({ ...t })));
}

function swapInPlace(board: Board, a: Pos, b: Pos) {
  const tmp = board[a.row][a.col];
  board[a.row][a.col] = board[b.row][b.col];
  board[b.row][b.col] = tmp;
}

function randomElement(rng: Rng): RuneElement {
  return pick(rng, RUNE_ELEMENTS);
}

function wouldMatch(
  board: (Tile | undefined)[][],
  currentRow: Tile[],
  r: number,
  c: number,
  element: RuneElement
): boolean {
  if (c >= 2 && currentRow[c - 1]?.element === element && currentRow[c - 2]?.element === element) {
    return true;
  }
  if (r >= 2 && board[r - 1]?.[c]?.element === element && board[r - 2]?.[c]?.element === element) {
    return true;
  }
  return false;
}

export function generateBoard(cols: number, rows: number, rng: Rng, idGen: IdGen): Board {
  const board: Board = [];
  for (let r = 0; r < rows; r++) {
    const row: Tile[] = [];
    for (let c = 0; c < cols; c++) {
      let element: RuneElement = randomElement(rng);
      let attempts = 0;
      while (attempts < 12 && wouldMatch(board, row, r, c, element)) {
        element = randomElement(rng);
        attempts++;
      }
      row.push({ uid: idGen.next(), element });
    }
    board.push(row);
  }
  return board;
}

interface Run {
  cells: Pos[];
  orientation: 'h' | 'v';
  element: RuneElement;
}

function findRuns(board: Board, cols: number, rows: number): Run[] {
  const runs: Run[] = [];

  for (let r = 0; r < rows; r++) {
    let c = 0;
    while (c < cols) {
      const tile = board[r][c];
      if (!tile.special && tile.element) {
        let end = c;
        while (end + 1 < cols && !board[r][end + 1].special && board[r][end + 1].element === tile.element) {
          end++;
        }
        const len = end - c + 1;
        if (len >= 3) {
          const cells: Pos[] = [];
          for (let cc = c; cc <= end; cc++) cells.push({ row: r, col: cc });
          runs.push({ cells, orientation: 'h', element: tile.element });
        }
        c = end + 1;
      } else {
        c++;
      }
    }
  }

  for (let c = 0; c < cols; c++) {
    let r = 0;
    while (r < rows) {
      const tile = board[r][c];
      if (!tile.special && tile.element) {
        let end = r;
        while (end + 1 < rows && !board[end + 1][c].special && board[end + 1][c].element === tile.element) {
          end++;
        }
        const len = end - r + 1;
        if (len >= 3) {
          const cells: Pos[] = [];
          for (let rr = r; rr <= end; rr++) cells.push({ row: rr, col: c });
          runs.push({ cells, orientation: 'v', element: tile.element });
        }
        r = end + 1;
      } else {
        r++;
      }
    }
  }

  return runs;
}

interface Cluster {
  cellsMap: Map<string, Pos>;
  runs: Run[];
  element: RuneElement;
}

function buildClusters(runs: Run[]): Cluster[] {
  const parent = new Map<string, string>();
  function find(x: string): string {
    let cur = x;
    while (parent.get(cur) !== cur) {
      const p = parent.get(cur);
      if (p === undefined) break;
      parent.set(cur, parent.get(p) ?? p);
      cur = p;
    }
    return cur;
  }
  function union(a: string, b: string) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }

  for (const run of runs) {
    for (const cell of run.cells) {
      const k = cellKey(cell);
      if (!parent.has(k)) parent.set(k, k);
    }
    const firstKey = cellKey(run.cells[0]);
    for (let i = 1; i < run.cells.length; i++) {
      union(firstKey, cellKey(run.cells[i]));
    }
  }

  const groups = new Map<string, { cells: Map<string, Pos>; runs: Run[] }>();
  for (const run of runs) {
    const root = find(cellKey(run.cells[0]));
    if (!groups.has(root)) groups.set(root, { cells: new Map(), runs: [] });
    const g = groups.get(root)!;
    g.runs.push(run);
    for (const cell of run.cells) g.cells.set(cellKey(cell), cell);
  }

  return Array.from(groups.values()).map((g) => ({
    cellsMap: g.cells,
    runs: g.runs,
    element: g.runs[0].element,
  }));
}

interface ClusterOutcome {
  cells: Pos[];
  element: RuneElement;
  special?: SpecialKind;
}

function decideClusterOutcome(cluster: Cluster): ClusterOutcome {
  const cells = Array.from(cluster.cellsMap.values());
  const maxLen = Math.max(...cluster.runs.map((r) => r.cells.length));
  const hasH = cluster.runs.some((r) => r.orientation === 'h' && r.cells.length >= 3);
  const hasV = cluster.runs.some((r) => r.orientation === 'v' && r.cells.length >= 3);

  let special: SpecialKind | undefined;
  if (maxLen >= 5) {
    special = 'prism';
  } else if (hasH && hasV) {
    special = 'bomb';
  } else if (maxLen === 4) {
    special = hasH ? 'lineH' : 'lineV';
  }

  return { cells, element: cluster.element, special };
}

function pickOriginCell(cluster: Cluster, hints: Pos[]): Pos {
  for (const hint of hints) {
    const k = cellKey(hint);
    if (cluster.cellsMap.has(k)) return cluster.cellsMap.get(k)!;
  }
  const longest = cluster.runs.reduce((a, b) => (b.cells.length > a.cells.length ? b : a));
  return longest.cells[Math.floor(longest.cells.length / 2)];
}

type Grid = (Tile | null)[][];

interface ResolvePass {
  removed: RemovedTile[];
  spawned: SpecialSpawn[];
  grid: Grid;
}

function resolveMatchesOnce(board: Board, idGen: IdGen, hints: Pos[]): ResolvePass | null {
  const runs = findRuns(board, board[0].length, board.length);
  if (runs.length === 0) return null;

  const clusters = buildClusters(runs);
  const removed: RemovedTile[] = [];
  const spawned: SpecialSpawn[] = [];
  const grid: Grid = board.map((row) => row.map((t) => ({ ...t }) as Tile | null));

  for (const cluster of clusters) {
    const outcome = decideClusterOutcome(cluster);
    const originCell = outcome.special ? pickOriginCell(cluster, hints) : undefined;

    for (const cell of outcome.cells) {
      if (originCell && cell.row === originCell.row && cell.col === originCell.col) continue;
      const t = board[cell.row][cell.col];
      removed.push({ row: cell.row, col: cell.col, uid: t.uid, element: t.element, special: t.special });
      grid[cell.row][cell.col] = null;
    }

    if (outcome.special && originCell) {
      const uid = idGen.next();
      grid[originCell.row][originCell.col] = {
        uid,
        element: outcome.special === 'prism' ? undefined : outcome.element,
        special: outcome.special,
      };
      spawned.push({ row: originCell.row, col: originCell.col, special: outcome.special, element: outcome.element, uid });
    }
  }

  return { removed, spawned, grid };
}

function applyGravityAndRefill(grid: Grid, cols: number, rows: number, rng: Rng, idGen: IdGen): Board {
  const result: Board = Array.from({ length: rows }, () => new Array(cols));
  for (let c = 0; c < cols; c++) {
    const colTiles: Tile[] = [];
    for (let r = 0; r < rows; r++) {
      const cell = grid[r][c];
      if (cell) colTiles.push(cell);
    }
    const missing = rows - colTiles.length;
    const newTiles: Tile[] = [];
    for (let i = 0; i < missing; i++) {
      newTiles.push({ uid: idGen.next(), element: randomElement(rng) });
    }
    const finalCol = [...newTiles, ...colTiles];
    for (let r = 0; r < rows; r++) {
      result[r][c] = finalCol[r];
    }
  }
  return result;
}

const SPECIAL_TRIGGER_BONUS: Record<SpecialKind, number> = {
  lineH: 4,
  lineV: 4,
  bomb: 8,
  prism: 14,
};

function computeDamageAndMana(
  removed: RemovedTile[],
  comboIndex: number,
  bossElement: ElementId
): { units: number; mana: Partial<Record<RuneElement, number>> } {
  let units = 0;
  const mana: Partial<Record<RuneElement, number>> = {};
  const comboMult = 1 + 0.25 * (comboIndex - 1);

  for (const t of removed) {
    if (t.special) continue;
    if (!t.element) continue;
    const weak = isStrongAgainst(t.element, bossElement);
    units += weak ? 1.5 : 1;
    mana[t.element] = (mana[t.element] ?? 0) + 1;
  }

  units *= comboMult;
  return { units, mana };
}

function mergeMana(
  a: Partial<Record<RuneElement, number>>,
  b: Partial<Record<RuneElement, number>>
): Partial<Record<RuneElement, number>> {
  const out: Partial<Record<RuneElement, number>> = { ...a };
  for (const key of Object.keys(b) as RuneElement[]) {
    out[key] = (out[key] ?? 0) + (b[key] ?? 0);
  }
  return out;
}

function performCascadeLoop(
  board: Board,
  rng: Rng,
  idGen: IdGen,
  bossElement: ElementId,
  startCombo: number,
  originHints: Pos[]
): CascadeStep[] {
  const cols = board[0].length;
  const rows = board.length;
  const steps: CascadeStep[] = [];
  let current = board;
  let combo = startCombo;
  let hints = originHints;

  for (let i = 0; i < MAX_CASCADE_ITERATIONS; i++) {
    const pass = resolveMatchesOnce(current, idGen, hints);
    if (!pass) break;
    const settled = applyGravityAndRefill(pass.grid, cols, rows, rng, idGen);
    const { units, mana } = computeDamageAndMana(pass.removed, combo, bossElement);
    steps.push({
      removed: pass.removed,
      spawned: pass.spawned,
      boardAfter: settled,
      damageUnits: units,
      manaGained: mana,
      comboIndex: combo,
    });
    current = settled;
    hints = [];
    combo++;
  }

  return steps;
}

function shapePositions(kind: 'lineH' | 'lineV' | 'bomb', pos: Pos, cols: number, rows: number): Pos[] {
  if (kind === 'lineH') {
    const cells: Pos[] = [];
    for (let c = 0; c < cols; c++) cells.push({ row: pos.row, col: c });
    return cells;
  }
  if (kind === 'lineV') {
    const cells: Pos[] = [];
    for (let r = 0; r < rows; r++) cells.push({ row: r, col: pos.col });
    return cells;
  }
  const cells: Pos[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = pos.row + dr;
      const c = pos.col + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) cells.push({ row: r, col: c });
    }
  }
  return cells;
}

function dedupePositions(cells: Pos[]): Pos[] {
  const map = new Map<string, Pos>();
  for (const c of cells) map.set(cellKey(c), c);
  return Array.from(map.values());
}

function elementMatchPositions(board: Board, element: RuneElement | undefined, cols: number, rows: number): Pos[] {
  const cells: Pos[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = board[r][c];
      if (!t.special && t.element === element) cells.push({ row: r, col: c });
    }
  }
  return cells;
}

function allBoardPositions(cols: number, rows: number): Pos[] {
  const cells: Pos[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ row: r, col: c });
  return cells;
}

interface SpecialActivation {
  positions: Pos[];
  bonus: number;
  label: string;
}

function activateSingleSpecial(
  board: Board,
  special: SpecialKind,
  pos: Pos,
  pairedElement: RuneElement | undefined,
  cols: number,
  rows: number
): SpecialActivation {
  if (special === 'prism') {
    return {
      positions: elementMatchPositions(board, pairedElement, cols, rows),
      bonus: SPECIAL_TRIGGER_BONUS.prism,
      label: 'KOZMİK GİRDAP',
    };
  }
  const positions = shapePositions(special, pos, cols, rows);
  return {
    positions,
    bonus: SPECIAL_TRIGGER_BONUS[special],
    label: special === 'bomb' ? '3x3 ALAN BOMBASI' : 'HAT KIRICI',
  };
}

function activateComboSpecials(
  board: Board,
  specialA: { special: SpecialKind; element?: RuneElement },
  posA: Pos,
  specialB: { special: SpecialKind; element?: RuneElement },
  posB: Pos,
  cols: number,
  rows: number
): SpecialActivation {
  const isPrismA = specialA.special === 'prism';
  const isPrismB = specialB.special === 'prism';

  if (isPrismA && isPrismB) {
    return { positions: allBoardPositions(cols, rows), bonus: 40, label: 'MUTLAK YOK OLUŞ' };
  }
  if (isPrismA || isPrismB) {
    const other = isPrismA ? specialB : specialA;
    const otherPos = isPrismA ? posB : posA;
    const cells = elementMatchPositions(board, other.element, cols, rows);
    cells.push(...shapePositions(other.special as 'lineH' | 'lineV' | 'bomb', otherPos, cols, rows));
    return { positions: dedupePositions(cells), bonus: 24, label: 'PRİZMA FÜZYONU' };
  }
  if (specialA.special === 'bomb' && specialB.special === 'bomb') {
    const midRow = Math.round((posA.row + posB.row) / 2);
    const midCol = Math.round((posA.col + posB.col) / 2);
    const cells: Pos[] = [];
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const r = midRow + dr;
        const c = midCol + dc;
        if (r >= 0 && r < rows && c >= 0 && c < cols) cells.push({ row: r, col: c });
      }
    }
    return { positions: cells, bonus: 16, label: '5x5 NÜKLEER PATLAMA' };
  }
  const cells = [
    ...shapePositions(specialA.special as 'lineH' | 'lineV' | 'bomb', posA, cols, rows),
    ...shapePositions(specialB.special as 'lineH' | 'lineV' | 'bomb', posB, cols, rows),
  ];
  return { positions: dedupePositions(cells), bonus: 10, label: 'ÇİFTE TETİKLEME' };
}

export function hasAnyValidMove(board: Board): boolean {
  const rows = board.length;
  const cols = board[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].special) return true;
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const neighbors: Pos[] = [];
      if (c + 1 < cols) neighbors.push({ row: r, col: c + 1 });
      if (r + 1 < rows) neighbors.push({ row: r + 1, col: c });
      for (const n of neighbors) {
        const trial = cloneBoard(board);
        swapInPlace(trial, { row: r, col: c }, n);
        if (findRuns(trial, cols, rows).length > 0) return true;
      }
    }
  }
  return false;
}

export function attemptSwap(
  board: Board,
  rng: Rng,
  idGen: IdGen,
  posA: Pos,
  posB: Pos,
  bossElement: ElementId
): SwapResult {
  const cols = board[0].length;
  const rows = board.length;

  if (!inBounds(posA, cols, rows) || !inBounds(posB, cols, rows) || !isAdjacent(posA, posB)) {
    return { valid: false, reason: 'not-adjacent', steps: [], totalDamageUnits: 0, totalManaGained: {}, finalBoard: board, maxCombo: 0 };
  }

  const tileA = board[posA.row][posA.col];
  const tileB = board[posB.row][posB.col];

  if (tileA.special || tileB.special) {
    const working = cloneBoard(board);
    swapInPlace(working, posA, posB);
    // after swap, tileA now sits at posB and tileB now sits at posA
    let activation: SpecialActivation;
    let removedFromUid: (uid: number) => RemovedTile | null;

    if (tileA.special && tileB.special) {
      activation = activateComboSpecials(
        working,
        { special: tileA.special, element: tileA.element },
        posB,
        { special: tileB.special, element: tileB.element },
        posA,
        cols,
        rows
      );
    } else if (tileA.special) {
      activation = activateSingleSpecial(working, tileA.special, posB, tileB.element, cols, rows);
    } else {
      activation = activateSingleSpecial(working, tileB.special!, posA, tileA.element, cols, rows);
    }

    const positions = dedupePositions([...activation.positions, posA, posB]);
    const grid: Grid = working.map((row) => row.map((t) => ({ ...t }) as Tile | null));
    const removed: RemovedTile[] = [];
    for (const pos of positions) {
      const t = working[pos.row][pos.col];
      if (!t) continue;
      removed.push({ row: pos.row, col: pos.col, uid: t.uid, element: t.element, special: t.special });
      grid[pos.row][pos.col] = null;
    }

    const settled = applyGravityAndRefill(grid, cols, rows, rng, idGen);
    const { units, mana } = computeDamageAndMana(removed, 1, bossElement);
    const explosionStep: CascadeStep = {
      removed,
      spawned: [],
      boardAfter: settled,
      damageUnits: units + activation.bonus,
      manaGained: mana,
      comboIndex: 1,
      label: activation.label,
    };

    const restSteps = performCascadeLoop(settled, rng, idGen, bossElement, 2, []);
    const steps = [explosionStep, ...restSteps];
    const totalDamageUnits = steps.reduce((sum, s) => sum + s.damageUnits, 0);
    const totalManaGained = steps.reduce((acc, s) => mergeMana(acc, s.manaGained), {} as Partial<Record<RuneElement, number>>);
    const maxCombo = steps.length > 0 ? steps[steps.length - 1].comboIndex : 1;

    return { valid: true, steps, totalDamageUnits, totalManaGained, finalBoard: settled, maxCombo };
  }

  const working = cloneBoard(board);
  swapInPlace(working, posA, posB);
  const runs = findRuns(working, cols, rows);
  if (runs.length === 0) {
    return { valid: false, reason: 'no-match', steps: [], totalDamageUnits: 0, totalManaGained: {}, finalBoard: board, maxCombo: 0 };
  }

  const steps = performCascadeLoop(working, rng, idGen, bossElement, 1, [posB, posA]);
  const totalDamageUnits = steps.reduce((sum, s) => sum + s.damageUnits, 0);
  const totalManaGained = steps.reduce((acc, s) => mergeMana(acc, s.manaGained), {} as Partial<Record<RuneElement, number>>);
  const finalBoard = steps.length > 0 ? steps[steps.length - 1].boardAfter : working;
  const maxCombo = steps.length > 0 ? steps[steps.length - 1].comboIndex : 1;

  return { valid: true, steps, totalDamageUnits, totalManaGained, finalBoard, maxCombo };
}

export function ensurePlayableBoard(board: Board, rng: Rng, idGen: IdGen): Board {
  let current = board;
  let guard = 0;
  while (!hasAnyValidMove(current) && guard < 5) {
    current = generateBoard(current[0].length, current.length, rng, idGen);
    guard++;
  }
  return current;
}
