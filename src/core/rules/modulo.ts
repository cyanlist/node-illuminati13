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
  explain: (stack, hand) => {
    if (hand < stack)
      return `Die ${stack} passt kein einziges Mal in die ${hand} – also bleibt die ${hand} ganz übrig.`;
    const times = Math.floor(hand / stack);
    const rest = hand % stack;
    // geschützte Leerzeichen: die Klammer bricht nicht mitten in der Rechnung um
    const fit = `Die ${stack} passt ${times}-mal in die ${hand} (${times} × ${stack} = ${times * stack}).`;
    return rest === 0 ? `${fit} Es bleibt nichts übrig, also 0.` : `${fit} Übrig bleiben ${rest}.`;
  },
});
