/**
 * Der Nachziehstapel: gezogen wird die oberste Karte (das Ende der Liste) – beim Ziehen in die Hand und beim
 * Auffüllen der Hand nach einem Zug.
 */
import type { Card } from '../cards';
import type { GameState, Player } from './types';

/** Zieht die oberste Karte in die Hand; null, wenn der Nachziehstapel leer ist. */
export function drawCard(state: GameState, player: Player): Card | null {
  const card = state.deck.pop();
  if (!card) return null;
  player.hand.push(card);
  return card;
}

/** Zieht nach, bis die Hand `target` Karten hat oder der Nachziehstapel leer ist – die ids der gezogenen Karten. */
export function drawUpTo(state: GameState, player: Player, target: number): number[] {
  const drawn: number[] = [];
  while (player.hand.length < target) {
    const card = drawCard(state, player);
    if (!card) break;
    drawn.push(card.id);
  }
  return drawn;
}
