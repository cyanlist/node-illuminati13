import type { GameState, Player } from './types';

export interface Ranking {
  /** Nach Punkten, dann nach 13er-Kombinationen sortiert */
  order: Player[];
  /** Gleich viele Punkte und gleich viele 13er */
  tie: boolean;
  /** Punktgleich, aber durch die Zahl der 13er entschieden */
  decidedByCombos: boolean;
}

export function ranking(state: GameState): Ranking {
  const order = [...state.players].sort((a, b) => b.points - a.points || b.combos - a.combos);
  const [first, second] = order;
  const samePoints = !!first && !!second && first.points === second.points;
  const tie = samePoints && first?.combos === second?.combos;
  return { order, tie, decidedByCombos: samePoints && !tie };
}
