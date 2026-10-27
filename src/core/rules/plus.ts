import { defineRule } from './rule';

/** Aus der Anleitung (Herz): Stapelkarte plus Handkarte. */
export const plus = defineRule({
  label: 'Stapel + Hand',
  short: 'S + H',
  calc: (stack, hand) => stack + hand,
  show: (stack, hand) => `${stack} + ${hand}`,
});
