import { currentPlayer } from './players';
import type { GameState } from './types';

/**
 * Schließt einen Zug ab: zählt nach leerem Nachziehstapel die letzten Züge herunter, beendet das Spiel
 * oder gibt an die nächste Person weiter. Wer keine Karten mehr hat, setzt aus.
 */
export function finishTurn(state: GameState): void {
  for (;;) {
    if (state.finalTurnsLeft !== null) state.finalTurnsLeft--;
    else if (state.deck.length === 0) {
      state.finalTurnsLeft = state.players.length;
      state.log.push({ kind: 'final', players: state.players.length });
    }
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
