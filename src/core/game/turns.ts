import { currentPlayer, hasCards } from './players';
import { rulesetFor } from './ruleset';
import type { DrawPolicy } from './ruleset/types';
import type { GameState } from './types';

/**
 * Schließt einen Zug ab: zählt in der letzten Runde die verbleibenden Züge herunter, beendet das Spiel oder gibt an
 * die nächste Person weiter. Wer keine Karten mehr hat, setzt aus. Wann die letzte Runde beginnt, entscheiden
 * Nachziehen (leerer Stapel) und Spielende (z. B. erreichtes Ziel).
 */
export function finishTurn(state: GameState): void {
  const { draw, ending } = rulesetFor(state.settings);
  let played = true;
  for (;;) {
    countDownFinalRound(state, draw);
    // ob jemand gerade das Ziel erreicht hat, zählt nur nach einem echten Zug, nicht nach einem ausgesetzten
    if (played) ending.checkFinalRound(state);
    if (state.finalTurnsLeft === 0) {
      endGame(state);
      return;
    }
    passTurn(state);
    if (hasCards(currentPlayer(state))) return;
    // wer keine Karten mehr hat, setzt aus – auch das zählt in der letzten Runde als Zug
    state.log.push({ kind: 'skip', player: state.current });
    played = false;
  }
}

/** In der letzten Runde ist ein Zug weniger übrig; ist der Nachziehstapel gerade aufgebraucht, beginnt sie jetzt. */
function countDownFinalRound(state: GameState, draw: DrawPolicy): void {
  if (state.finalTurnsLeft !== null) state.finalTurnsLeft--;
  else if (draw.exhausted(state)) {
    state.finalTurnsLeft = state.players.length;
    state.log.push({ kind: 'final', players: state.players.length });
  }
}

/** Die nächste Person ist am Zug (nach der letzten wieder die erste). */
function passTurn(state: GameState): void {
  state.current = (state.current + 1) % state.players.length;
}

function endGame(state: GameState): void {
  state.over = true;
  state.log.push({ kind: 'end' });
}

/** In der letzten Runde: wer noch einen Zug hat, in Zugreihenfolge ab der Person am Zug – sonst niemand. */
export function lastTurnPlayers(state: GameState): number[] {
  if (state.finalTurnsLeft === null || state.over) return [];
  const count = state.players.length;
  return Array.from({ length: Math.min(state.finalTurnsLeft, count) }, (_, i) => (state.current + i) % count);
}
