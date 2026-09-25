import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { isAdjacent } from '../../game/engine';
import type { Board, Pos, SwapResult } from '../../game/types';
import { colors, radius } from '../../theme';
import { playSound } from '../../utils/sound';
import { RuneTile } from './RuneTile';

export interface PendingSwap {
  nonce: number;
  posA: Pos;
  posB: Pos;
  result: SwapResult;
}

interface RuneBoardProps {
  board: Board;
  pending: PendingSwap | null;
  onSwapAttempt: (posA: Pos, posB: Pos) => void;
  onAnimationComplete: () => void;
  interactive: boolean;
  hapticsEnabled: boolean;
}

const STEP_DELAY_MS = 430;
const SWAP_DELAY_MS = 190;
const BOARD_PADDING = 4;
const TAP_THRESHOLD = 14;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function swapPositions(board: Board, a: Pos, b: Pos): Board {
  const next = board.map((row) => row.slice());
  const tmp = next[a.row][a.col];
  next[a.row][a.col] = next[b.row][b.col];
  next[b.row][b.col] = tmp;
  return next;
}

function posFromXY(x: number, y: number, cellSize: number, cols: number, rows: number): Pos {
  const col = Math.max(0, Math.min(cols - 1, Math.floor(x / cellSize)));
  const row = Math.max(0, Math.min(rows - 1, Math.floor(y / cellSize)));
  return { row, col };
}

export function RuneBoard({ board, pending, onSwapAttempt, onAnimationComplete, interactive, hapticsEnabled }: RuneBoardProps) {
  const [displayBoard, setDisplayBoard] = useState<Board>(board);
  const [selected, setSelected] = useState<Pos | null>(null);
  const [busy, setBusy] = useState(false);
  const [boardWidth, setBoardWidth] = useState(0);

  const displayBoardRef = useRef(board);
  const busyRef = useRef(false);
  const lastNonce = useRef(0);
  const gestureStartRef = useRef<Pos | null>(null);

  const cols = board[0]?.length ?? 6;
  const rows = board.length;
  const availableWidth = boardWidth > 0 ? boardWidth - BOARD_PADDING * 2 : 0;
  const cellSize = availableWidth > 0 ? Math.floor(availableWidth / cols) : 0;

  function updateBoard(b: Board) {
    displayBoardRef.current = b;
    setDisplayBoard(b);
  }

  useEffect(() => {
    if (!busyRef.current) {
      updateBoard(board);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  useEffect(() => {
    if (!pending || pending.nonce === lastNonce.current) return;
    lastNonce.current = pending.nonce;
    let cancelled = false;
    busyRef.current = true;
    setBusy(true);
    setSelected(null);

    (async () => {
      const before = displayBoardRef.current;
      const swapped = swapPositions(before, pending.posA, pending.posB);
      updateBoard(swapped);
      await delay(SWAP_DELAY_MS);
      if (cancelled) return;

      if (!pending.result.valid) {
        if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        playSound('invalid');
        updateBoard(before);
        await delay(SWAP_DELAY_MS);
      } else {
        for (const step of pending.result.steps) {
          if (cancelled) return;
          if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          if (step.label) playSound('special');
          else if (step.comboIndex > 1) playSound('combo');
          else playSound('match');
          updateBoard(step.boardAfter);
          await delay(STEP_DELAY_MS);
        }
      }

      if (!cancelled) {
        busyRef.current = false;
        setBusy(false);
        onAnimationComplete();
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  const handleCellPress = (pos: Pos) => {
    if (!interactive || busy) return;
    if (!selected) {
      setSelected(pos);
      if (hapticsEnabled) Haptics.selectionAsync().catch(() => {});
      playSound('tap');
      return;
    }
    if (selected.row === pos.row && selected.col === pos.col) {
      setSelected(null);
      return;
    }
    if (isAdjacent(selected, pos)) {
      onSwapAttempt(selected, pos);
      setSelected(null);
      return;
    }
    setSelected(pos);
    if (hapticsEnabled) Haptics.selectionAsync().catch(() => {});
  };

  const handleGestureStart = (x: number, y: number) => {
    if (!interactive || busy || cellSize <= 0) {
      gestureStartRef.current = null;
      return;
    }
    gestureStartRef.current = posFromXY(x, y, cellSize, cols, rows);
  };

  const handleGestureEnd = (dx: number, dy: number) => {
    const start = gestureStartRef.current;
    gestureStartRef.current = null;
    if (!start || !interactive || busy) return;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < TAP_THRESHOLD && absY < TAP_THRESHOLD) {
      handleCellPress(start);
      return;
    }

    const target: Pos =
      absX > absY
        ? { row: start.row, col: start.col + (dx > 0 ? 1 : -1) }
        : { row: start.row + (dy > 0 ? 1 : -1), col: start.col };

    if (target.row < 0 || target.row >= rows || target.col < 0 || target.col >= cols) return;

    setSelected(null);
    onSwapAttempt(start, target);
  };

  const panGesture = Gesture.Pan()
    .enabled(interactive && !busy && cellSize > 0)
    .maxPointers(1)
    .onBegin((e) => {
      'worklet';
      runOnJS(handleGestureStart)(e.x, e.y);
    })
    .onEnd((e) => {
      'worklet';
      runOnJS(handleGestureEnd)(e.translationX, e.translationY);
    });

  const flatTiles = displayBoard.flatMap((row, r) => row.map((tile, c) => ({ tile, row: r, col: c })));

  return (
    <View style={styles.boardOuter} onLayout={(e) => setBoardWidth(e.nativeEvent.layout.width)}>
      {cellSize > 0 ? (
        <View style={{ width: cellSize * cols, height: cellSize * rows, alignSelf: 'center', margin: BOARD_PADDING }}>
          {flatTiles.map(({ tile, row, col }) => (
            <RuneTile
              key={tile.uid}
              tile={tile}
              x={col * cellSize}
              y={row * cellSize}
              size={cellSize}
              selected={!!selected && selected.row === row && selected.col === col}
            />
          ))}
          <GestureDetector gesture={panGesture}>
            <View style={StyleSheet.absoluteFill} />
          </GestureDetector>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  boardOuter: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
});
