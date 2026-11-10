/**
 * Was die Person am Gerät tun kann: Karten markieren, Tipp holen, ablegen, Reihenfolge wählen, aufdecken.
 */
import type { Card, SuitIndex } from '../core/cards';
import { canTakeHint, type Move, NO_THIRTEEN, rulesetFor, takeHint } from '../core/game';
import { isOnline } from '../core/settings';
import { playTurn, reviewMove } from './flow';
import { send } from './online.svelte';
import { judgeSelection } from './selection';
import { requireGame, table } from './table.svelte';

export function toggleCard(id: number): void {
  if (!table.canPlay) return;
  table.message = '';
  table.hinted = [];
  table.selected = table.selected.includes(id)
    ? table.selected.filter((x) => x !== id)
    : [...table.selected, id];
}

/**
 * Tipp: Was er zeigt, bestimmt die Tipp-Stufe des Regelwerks – eine Meldung und ggf. markierte Karten.
 * Bezahlt wird ein Tipp nur einmal pro Zug; danach zeigt er dasselbe gratis.
 */
export function showHint(): void {
  if (!table.canPlay) return;
  const game = requireGame();
  const { hint } = rulesetFor(game.settings);
  if (!hint) return;
  if (table.hintCombo === null) {
    if (!canTakeHint(game)) return;
    const at = game.log.length;
    table.hintCombo = takeHint(game)?.map((card) => card.id) ?? [];
    // kostet der Tipp einen Punkt, muss das andere Gerät ihn ebenso abziehen
    if (isOnline(game.settings) && game.settings.hintCost) send({ type: 'hint', at });
  }
  const combo = table.hintCombo;
  const reveal = combo.length === 0 ? NO_THIRTEEN : hint.reveal(combo);
  table.message = reveal.message;
  if (reveal.highlight.length > 0) {
    table.selected = [...reveal.highlight];
    table.hinted = [...reveal.highlight];
  }
}

/** Der Ablegen-Knopf: 13 → Beweis (ggf. erst Reihenfolge wählen), eine Karte → abwerfen, sonst Hinweis. */
export function playSelection(): void {
  if (!table.canPlay) return;
  const selection = judgeSelection();
  switch (selection.kind) {
    case 'proof':
      playProof(selection.cards);
      return;
    case 'discard':
      playIfAllowed({ type: 'discard', cardId: selection.card.id });
      return;
    case 'invalid':
      // ohne Summe – sonst könnte man sich beim Kopfrechnen zur 13 durchprobieren
      reject('Keine 13er-Kombination.');
      return;
  }
}

/** Der Knopf schüttelt den Kopf, darunter steht warum – `cards` werden dazu markiert. */
function reject(message: string, cards: number[] = []): void {
  table.message = message;
  table.hinted = cards;
  table.rejected++;
}

/** In der Lernrunde darf nur der vorgesehene Zug gespielt werden – sonst gibt es einen Einwand statt des Zugs. */
function allowed(move: Move): boolean {
  const objection = reviewMove(move);
  if (objection) reject(objection.message, objection.cards);
  return !objection;
}

function playIfAllowed(move: Move): void {
  if (allowed(move)) void playTurn(move);
}

/** Beweis ablegen – liegen zwei Karten derselben Farbe dabei, erst wählen lassen, welche oben landet. */
function playProof(cards: Card[]): void {
  // standardmäßig liegt die zuletzt gewählte Karte einer Farbe oben
  const topPick: Partial<Record<SuitIndex, number>> = {};
  for (const card of cards) topPick[card.suit] = card.id;
  if (!allowed({ type: 'proof', cardIds: cards.map((card) => card.id), topPick })) return;
  const sameSuitTwice = cards.some((card) => cards.filter((c) => c.suit === card.suit).length > 1);
  if (sameSuitTwice) {
    table.topPick = topPick;
    table.phase = 'order';
    return;
  }
  void playTurn({ type: 'proof', cardIds: cards.map((card) => card.id), topPick });
}

export function chooseTop(suit: SuitIndex, cardId: number): void {
  if (table.topPick) table.topPick[suit] = cardId;
}

export function confirmOrder(): void {
  if (table.phase !== 'order' || table.anim) return;
  const ids = table.selectedCards.map((card) => card.id);
  const topPick = { ...table.topPick };
  cancelOrder();
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
