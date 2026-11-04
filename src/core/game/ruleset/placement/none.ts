import type { PlacementEffect } from '../types';

/** Ohne Variante: Eine abgelegte Karte liegt einfach oben auf ihrem Stapel. */
export const noEffect: PlacementEffect = {
  id: 'none',
  announcement: null,
  rulesSection: null,
  afterPlace: () => false,
  rulesAfter: (state) => state.rules,
  triggers: () => false,
};
