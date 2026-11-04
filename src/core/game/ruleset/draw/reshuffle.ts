import { shuffle } from '../../../cards';
import { stateRng } from '../../../random';
import type { GameState } from '../../types';
import type { DrawPolicy } from '../types';

/** Sicherheitsnetz: Nach so vielen Mischungen ist Schluss, damit kein Spiel endlos läuft. */
export const MAX_RESHUFFLES = 10;

/**
 * Nachziehen mit Nachmischen („Die wahre Wahrheit erkennen“): Ist der Nachziehstapel leer, werden die Ablagestapel
 * bis auf ihre oberste Karte gemischt und bilden einen neuen. Die obersten Karten bleiben liegen, damit die Regeln
 * weiter etwas zum Rechnen haben. Gemischt wird mit dem Zufall aus dem Spielstand – an zwei Geräten also gleich.
 */
export const reshuffle: DrawPolicy = {
  id: 'reshuffle',
  refill(state, player, target) {
    const drawn: number[] = [];
    let reshuffled = 0;
    while (player.hand.length < target) {
      if (state.deck.length === 0) {
        const cards = reshuffleDeck(state);
        if (cards === 0) break;
        reshuffled += cards;
      }
      const card = state.deck.pop();
      if (!card) break;
      player.hand.push(card);
      drawn.push(card.id);
    }
    return { drawn, reshuffled };
  },
  // die letzte Runde beginnt erst, wenn nicht mehr gemischt wird – oder niemand mehr Karten hat
  exhausted: (state) =>
    state.deck.length === 0 &&
    (state.reshuffles >= MAX_RESHUFFLES || state.players.every((player) => player.hand.length === 0)),
  emptyText: () =>
    `Ist der Nachziehstapel leer, werden die Ablagestapel bis auf ihre oberste Karte gemischt und bilden einen neuen – höchstens ${MAX_RESHUFFLES}-mal, danach hat jede*r noch einen letzten Zug.`,
};

/** Mischt die Karten unter den obersten zu einem neuen Nachziehstapel; gibt zurück, wie viele es waren. */
function reshuffleDeck(state: GameState): number {
  if (state.reshuffles >= MAX_RESHUFFLES) return 0;
  const cards = state.piles.flatMap((pile) => pile.splice(0, Math.max(0, pile.length - 1)));
  if (cards.length === 0) return 0;
  state.deck = shuffle(cards, stateRng(state));
  state.reshuffles++;
  return cards.length;
}
