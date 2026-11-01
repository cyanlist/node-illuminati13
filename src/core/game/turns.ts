import { checkGoal } from './goal';
import { currentPlayer } from './players';
import type { GameState } from './types';

/**
 * Schließt einen Zug ab: zählt nach leerem Nachziehstapel (oder bei „Bis 13“ nach erreichtem Ziel) die letzten
 * Züge herunter, beendet das Spiel oder gibt an die nächste Person weiter. Wer keine Karten mehr hat, setzt aus.
 */
export function finishTurn(state: GameState): void {
  for (let played = true; ; played = false) {
    if (state.finalTurnsLeft !== null) state.finalTurnsLeft--;
    else if (state.deck.length === 0) {
      state.finalTurnsLeft = state.players.length;
      state.log.push({ kind: 'final', players: state.players.length });
    }
    // nur nach einem echten Zug, nicht nach einem ausgesetzten
    if (played) checkGoal(state);
    if (state.finalTurnsLeft === 0) {
      state.over = true;
      state.log.push({ kind: 'end' });
      return;
    }
    state.current = (state.current + 1) % state.players.length;
    if (currentPlayer(state).hand.length > 0) return;
    state.log.push({ kind: 'skip', player: state.current });
  }
}
