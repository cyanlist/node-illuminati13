import type { Card, SuitIndex } from '../cards';
import { sumOfValues, TARGET, trueValue } from '../values';
import { cardsInHand, currentPlayer, removeFromHand, scoreProof } from './players';
import { type Ruleset, rulesetFor } from './ruleset';
import {
  type GameState,
  HAND_SIZE,
  type LogEntry,
  type Move,
  type MoveResult,
  type PlacementStep,
  type Player,
  type ProofPart,
} from './types';

/** Prüft den Zug der Person am Zug und führt ihn aus. Wirft bei ungültigen Zügen, ohne etwas zu verändern. */
export function applyMove(state: GameState, move: Move): MoveResult {
  if (state.over) throw new Error('Das Spiel ist schon vorbei.');
  const player = currentPlayer(state);
  const ruleset = rulesetFor(state.settings);
  return move.type === 'proof'
    ? applyProof(state, ruleset, player, move.cardIds, move.topPick ?? {})
    : applyDiscard(state, ruleset, player, move.cardId);
}

/** Beweis: Karten, die zusammen 13 ergeben, bringen je einen Punkt; danach auf fünf Karten nachziehen. */
function applyProof(
  state: GameState,
  ruleset: Ruleset,
  player: Player,
  cardIds: number[],
  topPick: Partial<Record<SuitIndex, number>>,
): MoveResult {
  const cards = cardsInHand(player, cardIds);
  if (cards.length === 0) throw new Error('Ein Beweis braucht mindestens eine Karte.');
  const sum = sumOfValues(cards, state.piles, state.rules);
  if (sum !== TARGET) throw new Error(`Die Karten ergeben ${sum}, nicht ${TARGET}.`);
  // der Rechenweg mit den Stapeln vor dem Ablegen – fürs Protokoll und die Beweis-Bühne
  const parts: ProofPart[] = cards.map((card) => ({ card, ...trueValue(card, state.piles, state.rules) }));

  removeFromHand(player, cards);
  scoreProof(player, cards.length);
  const steps = topCardsLast(cards, topPick).map((card) => placeCard(state, ruleset, card));
  const { drawn, reshuffled } = ruleset.draw.refill(state, player, HAND_SIZE);

  logMove(state, { kind: 'proof', player: state.current, parts, points: cards.length });
  logRotations(state, steps);
  logReshuffle(state, reshuffled);
  return { steps, drawn, parts, reshuffled };
}

/** Noch keine Erleuchtung: eine Karte auf ihren Stapel, eine nachziehen. */
function applyDiscard(state: GameState, ruleset: Ruleset, player: Player, cardId: number): MoveResult {
  const [card] = cardsInHand(player, [cardId]);
  if (!card) throw new Error('Keine Karte zum Abwerfen gewählt.');
  const handSize = player.hand.length;

  removeFromHand(player, [card]);
  const steps = [placeCard(state, ruleset, card)];
  const { drawn, reshuffled } = ruleset.draw.refill(state, player, handSize);

  logMove(state, { kind: 'discard', player: state.current, card });
  logRotations(state, steps);
  logReshuffle(state, reshuffled);
  return { steps, drawn, parts: [], reshuffled };
}

/** Die gewählte oberste Karte jeder Farbe kommt zuletzt auf ihren Stapel – so liegt sie danach oben. */
function topCardsLast(cards: readonly Card[], topPick: Partial<Record<SuitIndex, number>>): Card[] {
  const isTop = (card: Card): boolean => topPick[card.suit] === card.id;
  return [...cards.filter((card) => !isTop(card)), ...cards.filter(isTop)];
}

/** Legt die Karte auf ihren Stapel; was danach passiert (z. B. die Weltordnung verschieben), regelt der Baustein. */
function placeCard(state: GameState, ruleset: Ruleset, card: Card): PlacementStep {
  const pile = state.piles[card.suit];
  if (!pile) throw new Error(`Es gibt keinen Stapel ${card.suit}.`);
  pile.push(card);
  const rotated = ruleset.placement.afterPlace(state, card);
  return { card, rules: [...state.rules], rotations: state.rotations, rotated };
}

/** Der Zug ins Protokoll – `lastMove` merkt sich, wo er steht (für die Marke „Letzter Zug“). */
function logMove(state: GameState, entry: LogEntry): void {
  state.log.push(entry);
  state.lastMove = state.log.length - 1;
}

function logRotations(state: GameState, steps: readonly PlacementStep[]): void {
  const count = steps.filter((step) => step.rotated).length;
  if (count > 0) state.log.push({ kind: 'rotation', count, dir: state.settings.dir });
}

/** Erst nach dem Zug ins Protokoll – gemischt wird ja beim Nachziehen, also nach dem Ablegen. */
function logReshuffle(state: GameState, cards: number): void {
  if (cards > 0) state.log.push({ kind: 'reshuffle', cards, count: state.reshuffles });
}
