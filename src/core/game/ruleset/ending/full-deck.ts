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
  endText: (solo, draw) =>
    `${draw.emptyText(solo)} ${solo ? 'Danach zählen deine Punkte.' : 'Bei Punktgleichstand gewinnt, wer mehr 13er-Kombinationen gefunden hat.'}`,
};
