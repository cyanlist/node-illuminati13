/**
 * Was die Person am Gerät tun kann: Karten markieren, Tipp holen, ablegen, Reihenfolge wählen, aufdecken.
 */
import type { SuitIndex } from '../core/cards';
import { bestCombo } from '../core/combos';
import { currentPlayer } from '../core/game';
import { sumOfValues, TARGET } from '../core/values';
import { num } from '../ui/format';
import { playTurn } from './flow';
import { requireGame, table } from './table.svelte';

/** Nur am Zug und nicht, während noch Karten fliegen. */
const canPlay = (): boolean => table.game !== null && table.phase === 'play' && !table.anim;

export function toggleCard(id: number): void {
  if (!canPlay()) return;
  table.message = '';
  table.hint = [];
  table.selected = table.selected.includes(id)
    ? table.selected.filter((x) => x !== id)
    : [...table.selected, id];
}

export function showHint(): void {
  if (!canPlay()) return;
  const game = requireGame();
  const combo = bestCombo(currentPlayer(game).hand, game.piles, game.rules);
  table.selected = combo ? combo.map((card) => card.id) : [];
  table.hint = [...table.selected];
  table.message = combo ? '' : 'Hier verbirgt sich keine 13. Wähle eine Karte zum Abwerfen.';
}

/** Der Ablegen-Knopf: 13 → Beweis (ggf. erst Reihenfolge wählen), eine Karte → abwerfen, sonst Hinweis. */
export function playSelection(): void {
  if (!canPlay()) return;
  const game = requireGame();
  const cards = table.selectedCards;
  const ids = cards.map((card) => card.id);
  const [first] = cards;
  if (!first) return;
  const sum = sumOfValues(cards, game.piles, game.rules);

  if (sum === TARGET) {
    // standardmäßig liegt die zuletzt gewählte Karte einer Farbe oben
    const topPick: Partial<Record<SuitIndex, number>> = {};
    for (const card of cards) topPick[card.suit] = card.id;
    const sameSuitTwice = cards.some((card) => cards.filter((c) => c.suit === card.suit).length > 1);
    if (sameSuitTwice) {
      table.topPick = topPick;
      table.phase = 'order';
      return;
    }
    void playTurn({ type: 'proof', cardIds: ids, topPick });
  } else if (cards.length === 1) {
    void playTurn({ type: 'discard', cardId: first.id });
  } else {
    table.message = `Deine Auswahl ergibt ${num(sum)}, nicht 13. Wähle eine 13 oder eine einzelne Karte zum Abwerfen.`;
  }
}

export function chooseTop(suit: SuitIndex, cardId: number): void {
  if (table.topPick) table.topPick[suit] = cardId;
}

export function confirmOrder(): void {
  if (table.phase !== 'order' || table.anim) return;
  const ids = table.selectedCards.map((card) => card.id);
  const topPick = { ...table.topPick };
  table.topPick = null;
  table.phase = 'play';
  void playTurn({ type: 'proof', cardIds: ids, topPick });
}

export function cancelOrder(): void {
  table.topPick = null;
  table.phase = 'play';
}

/** Zu zweit: die Person am Zug deckt ihre Karten auf. */
export function revealHand(): void {
  if (table.phase === 'handoff') table.phase = 'play';
}
