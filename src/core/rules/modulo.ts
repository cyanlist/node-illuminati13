import { defineRule } from './rule';

/**
 * Zusatzregel: der Rest, wenn man die Handkarte durch die Stapelkarte teilt. Bei hoher Stapelkarte bleibt
 * eine kleinere Handkarte, wie sie ist; bei niedriger wird es wild (Stapel 2: nur noch 0 oder 1).
 */
export const modulo = defineRule({
  label: 'Rest von Hand ÷ Stapel',
  short: 'H mod S',
  calc: (stack, hand) => hand % stack,
  show: (stack, hand) => `${hand} mod ${stack}`,
  example: [4, 11],
});
