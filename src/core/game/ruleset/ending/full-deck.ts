import type { Ending } from '../types';

/**
 * Ganzes Deck: gespielt wird, bis der Nachziehstapel leer ist (die letzte Runde danach steuert das Nachziehen).
 * Es gewinnen die meisten Punkte; allein zählen die Punkte selbst.
 */
export const fullDeck: Ending = {
  goal: null,
  recordName: 'best-solo',
  checkFinalRound: () => {},
  soloScore: (state) => state.players[0]?.points ?? 0,
  beatsBest: (score, best) => score > best,
  aimText: (solo) =>
    solo ? 'Sammle so viele Punkte wie möglich.' : 'Wer am Ende die meisten Punkte hat, gewinnt.',
  endText: (solo) =>
    solo
      ? 'Ist der Nachziehstapel leer, hast du noch einen letzten Zug. Danach zählen deine Punkte.'
      : 'Ist der Nachziehstapel leer, spielt jede*r noch einen letzten Zug. Bei Punktgleichstand gewinnt, wer mehr 13er-Kombinationen gefunden hat.',
};
