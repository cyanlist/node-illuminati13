import { shuffle } from '../../../cards';
import { stateRng } from '../../../random';
import { drawUpTo } from '../../deck';
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
    const drawn = drawUpTo(state, player, target);
    if (player.hand.length >= target) return { drawn, reshuffled: 0 };
    // der Nachziehstapel hat nicht gereicht: einmal nachmischen und weiterziehen (ein zweites Mal brächte nichts –
    // auf den Ablagestapeln liegt danach nur noch je die oberste Karte)
    const reshuffled = reshuffleDeck(state);
    if (reshuffled > 0) drawn.push(...drawUpTo(state, player, target));
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
