/**
 * Welche Karten beim Nachmischen von welchem Ablagestapel kommen: alles, was nach dem Ablegen auf einem Stapel
 * lag – außer dem, was danach noch dort liegt (die oberste Karte). Im Spielstand ist das Nachmischen dann schon
 * passiert; die Anzeige braucht die Karten aber, um sie erst liegen zu lassen und dann einzusammeln.
 */
import type { Card } from '../core/cards';
import type { PlacementStep } from '../core/game';

export function gatheredCards(
  before: readonly (readonly Card[])[],
  steps: readonly PlacementStep[],
  after: readonly (readonly Card[])[],
): Card[][] {
  return before.map((pile, suit) => {
    const placed = steps.filter((step) => step.card.suit === suit).map((step) => step.card);
    const stays = new Set((after[suit] ?? []).map((card) => card.id));
    return [...pile, ...placed].filter((card) => !stays.has(card.id));
  });
}
