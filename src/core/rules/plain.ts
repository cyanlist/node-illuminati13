import { defineRule } from './rule';

/** Zusatzregel: die Handkarte zählt einfach ihre Zahl. */
export const plain = defineRule({
  label: 'Hand bleibt Hand',
  short: '= Hand',
  direct: true,
  calc: (_stack, hand) => hand,
  show: (_stack, hand) => `${hand}`,
});
