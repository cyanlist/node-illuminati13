import type { Card, Rng } from '../cards';
import { bestCombo } from '../combos';
import { currentPlayer } from './players';
import type { GameState } from './types';

/** Was ein Tipp kostet, wenn „Ein Tipp kostet einen Punkt“ eingeschaltet ist. */
export const HINT_COST = 1;

/** Darf die Person am Zug einen Tipp holen? Mit Kosten nur, wenn sie den Punkt hat – ins Minus geht es nicht. */
export function canTakeHint(state: GameState): boolean {
  const { hints, hintCost } = state.settings;
  if (hints === 'off' || state.over) return false;
  return !hintCost || currentPlayer(state).points >= HINT_COST;
}

/**
 * Tipp für die Person am Zug: eine der größten 13er-Kombinationen ihrer Hand, oder null, wenn es keine gibt.
 * Wie viel davon gezeigt wird, entscheidet die Oberfläche anhand von `settings.hints`.
 * Kostet der Tipp etwas, wird der Punkt abgezogen und im Protokoll vermerkt.
 */
export function takeHint(state: GameState, rng: Rng = Math.random): Card[] | null {
  if (!canTakeHint(state)) throw new Error('Ein Tipp ist gerade nicht möglich.');
  const player = currentPlayer(state);
  if (state.settings.hintCost) {
    player.points -= HINT_COST;
    state.log.push({ kind: 'hint', player: state.current, cost: HINT_COST });
  }
  return bestCombo(player.hand, state.piles, state.rules, rng);
}
