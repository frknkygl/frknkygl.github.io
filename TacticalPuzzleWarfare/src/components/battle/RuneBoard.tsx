import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { isAdjacent } from '../../game/engine';
import type { Board, Pos, RemovedTile, SwapResult } from '../../game/types';
import { colors, elementColors, radius } from '../../theme';
import { playSound } from '../../utils/sound';
import { MatchBurst } from './MatchBurst';
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
const DRAG_MAX_OFFSET_RATIO = 0.4;
const BURST_LIFETIME_MS = 560;

interface Burst {
  id: number;
  row: number;
  col: number;
  color: string;
  big: boolean;
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function colorForRemoved(tile: RemovedTile): string {
  if (tile.element) return elementColors[tile.element].core;
  return colors.tertiary;
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
  const [dragPos, setDragPos] = useState<Pos | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);

  const displayBoardRef = useRef(board);
  const busyRef = useRef(false);
  const lastNonce = useRef(0);
  const gestureStartRef = useRef<Pos | null>(null);
  const burstIdRef = useRef(0);

  const dragDX = useSharedValue(0);
  const dragDY = useSharedValue(0);
  const dragScale = useSharedValue(1);
  const comboFlash = useSharedValue(0);
  const comboFlashColor = useSharedValue<string>(colors.primary);

  const cols = board[0]?.length ?? 6;
  const rows = board.length;
  const availableWidth = boardWidth > 0 ? boardWidth - BOARD_PADDING * 2 : 0;
  const cellSize = availableWidth > 0 ? Math.floor(availableWidth / cols) : 0;
  const dragMaxOffset = cellSize * DRAG_MAX_OFFSET_RATIO;

  const spawnBursts = (removed: RemovedTile[], big: boolean) => {
    const newBursts: Burst[] = removed.map((r) => ({
      id: ++burstIdRef.current,
      row: r.row,
      col: r.col,
      color: colorForRemoved(r),
      big,
    }));
    if (newBursts.length === 0) return;
    setBursts((prev) => [...prev, ...newBursts]);
    const ids = newBursts.map((b) => b.id);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => !ids.includes(b.id)));
    }, BURST_LIFETIME_MS);
  };

  const flashCombo = (color: string, intensity: number) => {
    comboFlashColor.value = color;
    comboFlash.value = withSequence(
      withTiming(intensity, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) })
    );
  };

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
          const big = !!step.label || step.comboIndex > 1;
          spawnBursts(step.removed, big);
          if (step.label) {
            playSound('special');
            flashCombo(colors.tertiary, 0.4);
          } else if (step.comboIndex > 1) {
            playSound('combo');
            flashCombo(colors.primary, Math.min(0.55, 0.22 + step.comboIndex * 0.08));
          } else {
            playSound('match');
          }
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
    const pos = posFromXY(x, y, cellSize, cols, rows);
    gestureStartRef.current = pos;
    setDragPos(pos);
  };

  const handleGestureEnd = (dx: number, dy: number) => {
    const start = gestureStartRef.current;
    gestureStartRef.current = null;
    setTimeout(() => setDragPos(null), 150);
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
      dragDX.value = 0;
      dragDY.value = 0;
      dragScale.value = withTiming(1.08, { duration: 90 });
      runOnJS(handleGestureStart)(e.x, e.y);
    })
    .onUpdate((e) => {
      'worklet';
      dragDX.value = e.translationX;
      dragDY.value = e.translationY;
    })
    .onEnd((e) => {
      'worklet';
      dragScale.value = withTiming(1, { duration: 140 });
      dragDX.value = withTiming(0, { duration: 140 });
      dragDY.value = withTiming(0, { duration: 140 });
      runOnJS(handleGestureEnd)(e.translationX, e.translationY);
    })
    .onFinalize(() => {
      'worklet';
      dragScale.value = withTiming(1, { duration: 140 });
      dragDX.value = withTiming(0, { duration: 140 });
      dragDY.value = withTiming(0, { duration: 140 });
    });

  const dragAnimatedStyle = useAnimatedStyle(() => {
    const absX = Math.abs(dragDX.value);
    const absY = Math.abs(dragDY.value);
    const lockedX = absX >= absY ? dragDX.value : 0;
    const lockedY = absY > absX ? dragDY.value : 0;
    const clampedX = Math.max(-dragMaxOffset, Math.min(dragMaxOffset, lockedX));
    const clampedY = Math.max(-dragMaxOffset, Math.min(dragMaxOffset, lockedY));
    return {
      transform: [{ translateX: clampedX }, { translateY: clampedY }, { scale: dragScale.value }],
      zIndex: 10,
    };
  });

  const comboFlashStyle = useAnimatedStyle(() => ({
    opacity: comboFlash.value,
    backgroundColor: comboFlashColor.value,
  }));

  const flatTiles = displayBoard.flatMap((row, r) => row.map((tile, c) => ({ tile, row: r, col: c })));

  return (
    <View style={styles.boardOuter} onLayout={(e) => setBoardWidth(e.nativeEvent.layout.width)}>
      {cellSize > 0 ? (
        <View style={{ width: cellSize * cols, height: cellSize * rows, alignSelf: 'center', margin: BOARD_PADDING }}>
          {flatTiles.map(({ tile, row, col }) => {
            const isDragging = !!dragPos && dragPos.row === row && dragPos.col === col;
            return (
              <RuneTile
                key={tile.uid}
                tile={tile}
                x={col * cellSize}
                y={row * cellSize}
                size={cellSize}
                selected={!!selected && selected.row === row && selected.col === col}
                dragging={isDragging}
                dragStyle={isDragging ? dragAnimatedStyle : undefined}
              />
            );
          })}
          {bursts.map((b) => (
            <MatchBurst
              key={b.id}
              x={b.col * cellSize + cellSize / 2}
              y={b.row * cellSize + cellSize / 2}
              size={cellSize}
              color={b.color}
              big={b.big}
            />
          ))}
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.comboFlash, comboFlashStyle]} />
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
  comboFlash: {
    borderRadius: radius.lg,
  },
});
