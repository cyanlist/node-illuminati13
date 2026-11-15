import type { GameState, Player } from './types';

/** Wertung am Spielende. */
export interface Ranking {
  /** Nach Punkten sortiert, bei Punktgleichstand nach den wenigsten 13er-Kombinationen */
  order: Player[];
  /** Gleich viele Punkte und gleich viele 13er */
  tie: boolean;
  /** Punktgleich, aber durch die Zahl der 13er entschieden */
  decidedByCombos: boolean;
}

/**
 * Bei Punktgleichstand: Wer seine Punkte mit weniger 13er-Kombinationen geholt hat, hat größere Beweise gefunden –
 * das belohnt die Suche nach langen Kombinationen statt vieler kleiner.
 */
export const TIE_BREAK_TEXT =
  'Bei Punktgleichstand gewinnt, wer dafür weniger 13er-Kombinationen gebraucht hat – große Beweise zahlen sich aus.';

/** Wer gewinnt: die meisten Punkte, bei Gleichstand die wenigsten 13er-Kombinationen (also die größeren Beweise). */
export function ranking(state: GameState): Ranking {
  const order = [...state.players].sort((a, b) => b.points - a.points || a.combos - b.combos);
  const [first, second] = order;
  const samePoints = !!first && !!second && first.points === second.points;
  const tie = samePoints && first?.combos === second?.combos;
  return { order, tie, decidedByCombos: samePoints && !tie };
}
