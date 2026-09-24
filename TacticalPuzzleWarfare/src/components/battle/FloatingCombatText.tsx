import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, type } from '../../theme';

export interface CombatPopup {
  id: number;
  text: string;
  sub?: string;
  color?: string;
}

export function FloatingCombatText({ popup, onDone }: { popup: CombatPopup; onDone: (id: number) => void }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSequence(
      withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 300 })
    );
    const t = setTimeout(() => onDone(popup.id), 1300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value < 0.85 ? 1 : 1 - (progress.value - 0.85) / 0.15,
    transform: [
      { translateY: -progress.value * 60 },
      { scale: 0.7 + Math.min(1, progress.value * 3) * 0.4 },
    ],
  }));

  return (
    <Animated.View style={[styles.wrap, style]} pointerEvents="none">
      <Text style={[styles.text, { color: popup.color ?? colors.secondary }]}>{popup.text}</Text>
      {popup.sub ? <Text style={styles.sub}>{popup.sub}</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  text: {
    ...type.headlineLg,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  sub: {
    ...type.labelCaps,
    color: colors.primary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});
