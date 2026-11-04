import { currentPlayer } from './players';
import { rulesetFor } from './ruleset';
import type { GameState } from './types';

/**
 * Schließt einen Zug ab: zählt in der letzten Runde die verbleibenden Züge herunter, beendet das Spiel oder gibt an
 * die nächste Person weiter. Wer keine Karten mehr hat, setzt aus. Wann die letzte Runde beginnt, entscheiden
 * Nachziehen (leerer Stapel) und Spielende (z. B. erreichtes Ziel).
 */
export function finishTurn(state: GameState): void {
  const { draw, ending } = rulesetFor(state.settings);
  for (let played = true; ; played = false) {
    if (state.finalTurnsLeft !== null) state.finalTurnsLeft--;
    else if (draw.exhausted(state)) {
      state.finalTurnsLeft = state.players.length;
      state.log.push({ kind: 'final', players: state.players.length });
    }
    // nur nach einem echten Zug, nicht nach einem ausgesetzten
    if (played) ending.checkFinalRound(state);
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

/** In der letzten Runde: wer noch einen Zug hat, in Zugreihenfolge ab der Person am Zug – sonst niemand. */
export function lastTurnPlayers(state: GameState): number[] {
  if (state.finalTurnsLeft === null || state.over) return [];
  const count = state.players.length;
  return Array.from({ length: Math.min(state.finalTurnsLeft, count) }, (_, i) => (state.current + i) % count);
}
