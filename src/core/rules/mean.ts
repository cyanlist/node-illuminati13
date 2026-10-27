import { defineRule } from './rule';

/** Zusatzregel: der abgerundete Mittelwert beider Karten. */
export const mean = defineRule({
  label: 'Mittelwert (abgerundet)',
  short: 'Ø(S, H)',
  calc: (stack, hand) => Math.floor((stack + hand) / 2),
  show: (stack, hand) => `Ø(${stack}, ${hand})`,
});
