import { goalOf, turnsTaken } from './goal';
import type { GameState, Player } from './types';

/** Wertung am Spielende. */
export interface Ranking {
  /** Nach Punkten, dann nach 13er-Kombinationen sortiert */
  order: Player[];
  /** Gleich viele Punkte und gleich viele 13er */
  tie: boolean;
  /** Punktgleich, aber durch die Zahl der 13er entschieden */
  decidedByCombos: boolean;
}

/** Wer gewinnt: die meisten Punkte, bei Gleichstand die meisten 13er-Kombinationen. */
export function ranking(state: GameState): Ranking {
  const order = [...state.players].sort((a, b) => b.points - a.points || b.combos - a.combos);
  const [first, second] = order;
  const samePoints = !!first && !!second && first.points === second.points;
  const tie = samePoints && first?.combos === second?.combos;
  return { order, tie, decidedByCombos: samePoints && !tie };
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
