import type { ElementId } from './types';

// Each element is strong against the element it points to.
export const ELEMENT_WEAKNESS: Record<ElementId, ElementId> = {
  fire: 'nature',
  nature: 'iron',
  iron: 'void',
  void: 'holy',
  holy: 'fire',
};

export const ELEMENT_ORDER: ElementId[] = ['fire', 'holy', 'nature', 'iron', 'void'];

export function isStrongAgainst(attacker: ElementId, defenderElement: ElementId): boolean {
  return ELEMENT_WEAKNESS[attacker] === defenderElement;
}
