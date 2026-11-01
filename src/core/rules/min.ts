import { defineRule } from './rule';

/** Zusatzregel: die kleinere der beiden Karten. */
export const min = defineRule({
  label: 'Minimum(Stapel, Hand)',
  short: 'min(S, H)',
  calc: (stack, hand) => Math.min(stack, hand),
  show: (stack, hand) => `min(${stack}, ${hand})`,
  explain: (stack, hand, value) =>
    `Es zählt die kleinere der beiden Zahlen – zwischen ${stack} und ${hand} ist das die ${value}.`,
});
