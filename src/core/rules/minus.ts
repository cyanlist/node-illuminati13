import { defineRule } from './rule';

/** Aus der Anleitung (Pik): Stapelkarte minus Handkarte – kann negativ werden. */
export const minus = defineRule({
  label: 'Stapel − Hand',
  short: 'S − H',
  calc: (stack, hand) => stack - hand,
  show: (stack, hand) => `${stack} − ${hand}`,
});
