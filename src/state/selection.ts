/**
 * Was die markierten Karten gerade ergeben – danach richten sich der Ablegen-Knopf und das Ablegen selbst.
 */
import type { Card } from '../core/cards';
import { sumOfValues, TARGET } from '../core/values';
import { table } from './table.svelte';

export type Selection =
  | { kind: 'none' }
  /** Die wahren Werte ergeben zusammen 13 */
  | { kind: 'proof'; cards: Card[] }
  /** Eine einzelne Karte ohne 13 – sie kann abgeworfen werden */
  | { kind: 'discard'; card: Card }
  /** Mehrere Karten, die nicht 13 ergeben */
  | { kind: 'invalid'; sum: number };

export function judgeSelection(): Selection {
  const game = table.game;
  const cards = table.selectedCards;
  const [first] = cards;
  if (!game || !first) return { kind: 'none' };
  const sum = sumOfValues(cards, game.piles, game.rules);
  if (sum === TARGET) return { kind: 'proof', cards };
  if (cards.length === 1) return { kind: 'discard', card: first };
  return { kind: 'invalid', sum };
}
