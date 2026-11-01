import type { GameState } from './types';

/** Punkte, bei denen das kurze Spiel „Bis 13“ endet. */
export const GOAL_POINTS = 13;

/** Das Ziel in Punkten – oder null, wenn bis zum leeren Nachziehstapel gespielt wird. */
export const goalOf = (state: GameState): number | null =>
  state.settings.ending === 'thirteen' ? GOAL_POINTS : null;

/** Wie viele Züge eine Person schon gemacht hat (Beweise und Abwürfe) – im Solo die Wertung bei „Bis 13“. */
export function turnsTaken(state: GameState, player: number): number {
  return state.log.filter(
    (entry) => (entry.kind === 'proof' || entry.kind === 'discard') && entry.player === player,
  ).length;
}

/** Wer das Spiel begonnen hat; bis die Reihe wieder an dieser Person ist, ist eine Runde komplett. */
function starter(state: GameState): number {
  const begins = state.log.find((entry) => entry.kind === 'begins');
  return begins?.kind === 'begins' ? begins.player : 0;
}

/**
 * „Bis 13“: Hat die Person am Zug gerade die 13 Punkte erreicht, wird nur noch die Runde zu Ende gespielt –
 * so hatten am Ende alle gleich viele Züge, egal wer begonnen hat. Läuft schon die letzte Runde nach leerem
 * Nachziehstapel, bleibt es bei der kürzeren.
 */
export function checkGoal(state: GameState): void {
  const goal = goalOf(state);
  const player = state.players[state.current];
  if (goal === null || !player || player.points < goal) return;
  if (state.log.some((entry) => entry.kind === 'goal')) return;
  const count = state.players.length;
  const untilRoundEnds = (starter(state) - state.current - 1 + count) % count;
  state.finalTurnsLeft = Math.min(state.finalTurnsLeft ?? untilRoundEnds, untilRoundEnds);
  state.log.push({ kind: 'goal', player: state.current, turnsLeft: state.finalTurnsLeft });
}

/** Allein: die Punkte – bei „Bis 13“ die Züge bis zum Ziel, oder null, wenn es nicht erreicht wurde. */
export function soloScore(state: GameState): number | null {
  if (goalOf(state) === null) return state.players[0]?.points ?? 0;
  return state.log.some((entry) => entry.kind === 'goal') ? turnsTaken(state, 0) : null;
}

/** Schlägt `score` den bisherigen Bestwert (0 = noch keiner)? Bei „Bis 13“ sind weniger Züge besser. */
export function beatsBest(state: GameState, score: number, best: number): boolean {
  if (goalOf(state) === null) return score > best;
  return best === 0 || score < best;
}
