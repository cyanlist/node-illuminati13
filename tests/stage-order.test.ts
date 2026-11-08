import { describe, expect, it } from 'vitest';
import { type Card, SUIT_INDICES, type SuitIndex } from '../src/core/cards';
import { pileColumn } from '../src/core/rules';
import { inColumnOrder } from '../src/state/stage-order';

const card = (id: number, suit: SuitIndex, rank: number): { card: Card } => ({ card: { id, suit, rank } });
const ids = (parts: { card: Card }[]) => parts.map((part) => part.card.id);

/** Wie table.columns: die Farben in der Reihenfolge ihrer Spalten auf dem Board */
const columnsAfter = (rotations: number): SuitIndex[] =>
  [...SUIT_INDICES].sort(
    (a, b) => pileColumn(a, rotations, 'rechts', 4) - pileColumn(b, rotations, 'rechts', 4),
  );

describe('Reihenfolge auf der Beweis-Bühne', () => {
  // angetippt: Kreuz, Herz, Karo
  const tapped = [card(1, 3, 5), card(2, 0, 2), card(3, 2, 6)];

  it('legt die Karten so nebeneinander wie ihre Stapel auf dem Board', () => {
    expect(ids(inColumnOrder(tapped, [0, 1, 2, 3]))).toEqual([2, 3, 1]);
  });

  it('folgt der aktuellen Lage, wenn die Weltordnung die Stapel verschoben hat', () => {
    // nach einer Verschiebung nach rechts liegt Kreuz ganz links
    expect(columnsAfter(1)).toEqual([3, 0, 1, 2]);
    expect(ids(inColumnOrder(tapped, columnsAfter(1)))).toEqual([1, 2, 3]);
  });

  it('lässt Karten derselben Farbe in ihrer Reihenfolge', () => {
    const sameSuit = [card(4, 1, 9), card(5, 0, 1), card(6, 1, 3)];
    expect(ids(inColumnOrder(sameSuit, [0, 1, 2, 3]))).toEqual([5, 4, 6]);
  });
});
