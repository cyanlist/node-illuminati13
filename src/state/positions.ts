/**
 * Bildschirmpositionen für die Ablege-Animation: Karten fliegen von der Hand bzw. den verdeckten Karten
 * des Gegenübers zu ihrem Stapel. Die Komponenten markieren die Stellen mit data-Attributen.
 */
import type { SuitIndex } from '../core/cards';

const rectOf = (selector: string): DOMRect | null =>
  document.querySelector(selector)?.getBoundingClientRect() ?? null;

export const pileRect = (suit: SuitIndex): DOMRect | null => rectOf(`[data-pile="${suit}"]`);

export const drawPileRect = (): DOMRect | null => rectOf('[data-draw-pile]');

/**
 * Wo eine Karte gerade liegt: offen in der Hand oder – beim Gegenüber – als verdeckte Karte an Platz `slot`.
 * Gemessen wird erst beim Abflug, weil die übrigen Karten bis dahin schon nachgerückt sein können.
 */
export function launchRect(cardId: number, player: number, slot: number): DOMRect | null {
  return rectOf(`[data-hand-card="${cardId}"]`) ?? rectOf(`[data-opponent-slot="${player}-${slot}"]`);
}
