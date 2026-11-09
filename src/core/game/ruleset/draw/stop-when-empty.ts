import { drawUpTo } from '../../deck';
import type { DrawPolicy } from '../types';

/** Nachziehen, solange der Nachziehstapel reicht; ist er leer, beginnt die letzte Runde. */
export const stopWhenEmpty: DrawPolicy = {
  id: 'stop',
  refill: (state, player, target) => ({ drawn: drawUpTo(state, player, target), reshuffled: 0 }),
  exhausted: (state) => state.deck.length === 0,
  emptyText: (solo) =>
    solo
      ? 'Ist der Nachziehstapel leer, hast du noch einen letzten Zug.'
      : 'Ist der Nachziehstapel leer, spielt jede*r noch einen letzten Zug.',
};
