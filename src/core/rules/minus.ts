import { defineRule, signed } from './rule';

/** Aus der Anleitung (Pik): Stapelkarte minus Handkarte – kann negativ werden. */
export const minus = defineRule({
  label: 'Stapel − Hand',
  short: 'S − H',
  calc: (stack, hand) => stack - hand,
  show: (stack, hand) => `${stack} − ${hand}`,
  explain: (stack, hand) =>
    `Nimm deine Zahl von der Stapelkarte weg: ${stack} weniger ${hand} sind ${signed(stack - hand)}. Das Ergebnis darf auch unter 0 liegen.`,
});
