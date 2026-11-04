import { type Card, MAX_RANK } from '../../../cards';
import { DIR_LABELS, type RotationDir, rotateRules } from '../../../rules';
import type { PlacementEffect } from '../types';

/** Eine 13 – die höchste Karte – verschiebt die Weltordnung. */
const shifts = (card: Card): boolean => card.rank === MAX_RANK;

/**
 * Variante „Wenn die Weltordnung sich verschiebt“: Landet eine 13 oben auf einem Stapel, rücken alle vier Stapel
 * eine Spalte in Richtung `dir` weiter; die Regeln bleiben stehen, jeder Stapel gilt nach der Regel seiner neuen Spalte.
 */
export function worldOrder(dir: RotationDir): PlacementEffect {
  return {
    id: 'world-order',
    announcement: { kind: 'variant', dir },
    rulesSection: {
      title: 'Variante: Wenn die Weltordnung sich verschiebt',
      text: `Landet eine 13 auf einem Stapel, rücken alle vier Stapel eine Position ${DIR_LABELS[dir]} weiter – der letzte wieder an den Anfang. Die Regeln bleiben an ihrem Platz: Jeder Stapel gilt ab jetzt nach der Regel, unter der er nun liegt.`,
    },

    afterPlace(state, card) {
      if (!shifts(card)) return false;
      state.rules = rotateRules(state.rules, dir);
      state.rotations++;
      return true;
    },
    rulesAfter: (state, card) => (shifts(card) ? rotateRules(state.rules, dir) : state.rules),
    triggers: (_state, card) => shifts(card),
  };
}
