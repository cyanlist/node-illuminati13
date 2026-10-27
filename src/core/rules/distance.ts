import { defineRule } from './rule';

/** Zusatzregel: der Abstand zwischen beiden Karten, nie negativ. */
export const distance = defineRule({
  label: 'Abstand(Stapel, Hand)',
  short: '|S − H|',
  calc: (stack, hand) => Math.abs(stack - hand),
  show: (stack, hand) => `|${stack} − ${hand}|`,
});
