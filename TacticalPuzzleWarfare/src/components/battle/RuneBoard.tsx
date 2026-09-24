import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { isAdjacent } from '../../game/engine';
import type { Board, Pos, SwapResult } from '../../game/types';
import { colors, radius } from '../../theme';
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

export function RuneBoard({ board, pending, onSwapAttempt, onAnimationComplete, interactive, hapticsEnabled }: RuneBoardProps) {
  const [displayBoard, setDisplayBoard] = useState<Board>(board);
  const [selected, setSelected] = useState<Pos | null>(null);
  const [busy, setBusy] = useState(false);
  const [boardWidth, setBoardWidth] = useState(0);

  const displayBoardRef = useRef(board);
  const busyRef = useRef(false);
  const lastNonce = useRef(0);

  const cols = board[0]?.length ?? 6;
  const rows = board.length;
  const cellSize = boardWidth > 0 ? Math.floor(boardWidth / cols) : 0;

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
        updateBoard(before);
        await delay(SWAP_DELAY_MS);
      } else {
        for (const step of pending.result.steps) {
          if (cancelled) return;
          if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
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

  const flatTiles = displayBoard.flatMap((row, r) => row.map((tile, c) => ({ tile, row: r, col: c })));

  return (
    <View
      style={styles.boardOuter}
      onLayout={(e) => setBoardWidth(e.nativeEvent.layout.width)}
    >
      {cellSize > 0 ? (
        <View style={{ width: cellSize * cols, height: cellSize * rows, alignSelf: 'center' }}>
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
          <View style={StyleSheet.absoluteFill} pointerEvents={interactive && !busy ? 'auto' : 'none'}>
            {Array.from({ length: rows }).map((_, r) =>
              Array.from({ length: cols }).map((__, c) => (
                <Pressable
                  key={`${r}-${c}`}
                  onPress={() => handleCellPress({ row: r, col: c })}
                  style={{ position: 'absolute', left: c * cellSize, top: r * cellSize, width: cellSize, height: cellSize }}
                />
              ))
            )}
          </View>
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
    padding: 4,
  },
});
