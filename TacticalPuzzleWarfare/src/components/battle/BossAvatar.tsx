import React, { useEffect } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { ElementId } from '../../data/types';
import { elementColors } from '../../theme';
import { ELEMENT_ICON, Icon } from '../Icon';

interface BossAvatarProps {
  element: ElementId;
  isBoss: boolean;
  size?: number;
  artSource?: ImageSourcePropType;
}

// Falls back to a stylized sigil (rotating rune ring + layered element/skull
// glyph) when no unique art exists for this enemy; renders the real
// illustration when `artSource` is provided (currently the five chapter
// bosses).
export function BossAvatar({ element, isBoss, size = 76, artSource }: BossAvatarProps) {
  const ec = elementColors[element];
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 14000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse, rotation]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + pulse.value * 0.5,
    transform: [{ scale: 1 + pulse.value * 0.05 }],
  }));

  const ringSize = size * 1.35;

  return (
    <View style={[styles.wrap, { width: ringSize, height: ringSize }]}>
      <Animated.View
        style={[
          styles.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderColor: `${ec.core}55`,
          },
          ringStyle,
        ]}
      >
        <View style={[styles.ringNotch, { backgroundColor: ec.core, top: -2 }]} />
        <View style={[styles.ringNotch, { backgroundColor: ec.core, bottom: -2 }]} />
      </Animated.View>

      <Animated.View
        style={[
          styles.core,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            borderColor: ec.core,
            shadowColor: ec.core,
          },
          glowStyle,
        ]}
      >
        {artSource ? (
          <Image source={artSource} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <>
            <LinearGradient
              colors={[ec.core, '#0f0e11']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
            />
            <Icon name={ELEMENT_ICON[element]} size={Math.round(size * 0.62)} color="rgba(255,255,255,0.22)" style={styles.auraIcon} />
            <Icon name={isBoss ? 'skull-crossbones' : 'sword-cross'} size={Math.round(size * 0.44)} color="#fff" />
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  ringNotch: {
    position: 'absolute',
    alignSelf: 'center',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  core: {
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  auraIcon: {
    position: 'absolute',
  },
});
