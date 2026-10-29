import { defineRule } from './rule';

/** Zusatzregel: der Abstand zwischen beiden Karten, nie negativ. */
export const distance = defineRule({
  label: 'Abstand(Stapel, Hand)',
  short: '|S − H|',
  calc: (stack, hand) => Math.abs(stack - hand),
  show: (stack, hand) => `|${stack} − ${hand}|`,
  explain: (stack, hand) =>
    `Wie weit liegen beide Zahlen auseinander? Von ${Math.min(stack, hand)} bis ${Math.max(stack, hand)} sind es ${Math.abs(stack - hand)} Schritte.`,
});
