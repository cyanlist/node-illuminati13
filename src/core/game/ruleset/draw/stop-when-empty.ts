import type { DrawPolicy } from '../types';

/** Nachziehen, solange der Nachziehstapel reicht; ist er leer, beginnt die letzte Runde. */
export const stopWhenEmpty: DrawPolicy = {
  refill(state, player, target) {
    const drawn: number[] = [];
    while (player.hand.length < target) {
      const card = state.deck.pop();
      if (!card) break;
      player.hand.push(card);
      drawn.push(card.id);
    }
    return drawn;
  },
  endsWhenEmpty: true,
};
