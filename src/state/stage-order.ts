/**
 * In welcher Reihenfolge die Karten eines Beweises auf der Bühne liegen: so, wie ihre Stapel gerade auf dem Board
 * nebeneinander liegen (Spalte 0 zuerst) – nicht in der Reihenfolge, in der sie angetippt wurden. So findet man zu
 * jeder Karte gleich den Stapel, mit dem sie verrechnet wird. Bei „Wenn die Weltordnung sich verschiebt“ zählt die
 * aktuelle Lage der Stapel. Karten derselben Farbe behalten ihre Reihenfolge.
 */
import type { Card, SuitIndex } from '../core/cards';

export function inColumnOrder<T extends { card: Card }>(
  parts: readonly T[],
  columns: readonly SuitIndex[],
): T[] {
  const column = (suit: SuitIndex): number => columns.indexOf(suit);
  // sort ist stabil: Gleiche Farben bleiben in ihrer Reihenfolge
  return [...parts].sort((a, b) => column(a.card.suit) - column(b.card.suit));
}
