import { defineRule } from './rule';

/** Zusatzregel: der abgerundete Mittelwert beider Karten. */
export const mean = defineRule({
  label: 'Mittelwert (abgerundet)',
  short: 'Ø(S, H)',
  calc: (stack, hand) => Math.floor((stack + hand) / 2),
  show: (stack, hand) => `Ø(${stack}, ${hand})`,
  explain: (stack, hand) => {
    const sum = stack + hand;
    const rounded = sum % 2 ? ' (abgerundet)' : '';
    return `Die Mitte zwischen beiden Zahlen: ${stack} + ${hand} sind ${sum}, die Hälfte davon ist ${Math.floor(sum / 2)}${rounded}.`;
  },
});
