/**
 * Was die Person am Gerät tun kann: Karten markieren, Tipp holen, ablegen, Reihenfolge wählen, aufdecken.
 */
import type { SuitIndex } from '../core/cards';
import { canTakeHint, takeHint } from '../core/game';
import { sumOfValues, TARGET } from '../core/values';
import { cardCount, num } from '../ui/format';
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

/**
 * Tipp je nach Einstellung: Andeutung (ob es eine 13 gibt und aus wie vielen Karten) oder volle Hilfe
 * (die Karten werden markiert). Bezahlt wird ein Tipp nur einmal pro Zug; danach zeigt er dasselbe gratis.
 */
export function showHint(): void {
  if (!canPlay()) return;
  const game = requireGame();
  if (table.hintTaken === null) {
    if (!canTakeHint(game)) return;
    table.hintTaken = takeHint(game)?.map((card) => card.id) ?? [];
  }
  const combo = table.hintTaken;

  if (combo.length === 0) {
    table.message = 'Hier verbirgt sich keine 13. Wähle eine Karte zum Abwerfen.';
  } else if (game.settings.hints === 'full') {
    table.selected = [...combo];
    table.hint = [...combo];
    table.message = '';
  } else {
    table.message = `Hier steckt eine 13 aus ${cardCount(combo.length)}.`;
  }
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
