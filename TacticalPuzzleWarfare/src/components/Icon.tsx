import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: React.ComponentProps<typeof MaterialCommunityIcons>['style'];
}

export function Icon({ name, size = 18, color = '#e6e1e5', style }: IconProps) {
  return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
}

export const ELEMENT_ICON: Record<'fire' | 'holy' | 'nature' | 'iron' | 'void', IconName> = {
  fire: 'fire',
  holy: 'white-balance-sunny',
  nature: 'leaf',
  iron: 'shield',
  void: 'eye',
};

export const RARITY_ICON: Record<'common' | 'rare' | 'epic' | 'legendary', IconName> = {
  common: 'star-outline',
  rare: 'star-outline',
  epic: 'star',
  legendary: 'crown',
};
