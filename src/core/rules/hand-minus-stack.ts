import { defineRule, signed } from './rule';

/** Zusatzregel: Handkarte minus Stapelkarte – das Gegenstück zu „Stapel − Hand“. */
export const handMinusStack = defineRule({
  label: 'Hand − Stapel',
  short: 'H − S',
  calc: (stack, hand) => hand - stack,
  show: (stack, hand) => `${hand} − ${stack}`,
  explain: (stack, hand) =>
    `Nimm die Stapelkarte von deiner Zahl weg: ${hand} weniger ${stack} sind ${signed(hand - stack)}. Das Ergebnis darf auch unter 0 liegen.`,
});
