import type { Card, SuitIndex } from '../cards';
import { rotateRules } from '../rules';
import { TARGET, trueValue } from '../values';
import { currentPlayer } from './players';
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
  return move.type === 'proof'
    ? applyProof(state, player, move.cardIds, move.topPick ?? {})
    : applyDiscard(state, player, move.cardId);
}

/** Beweis: Karten, die zusammen 13 ergeben, bringen je einen Punkt; danach auf fünf Karten nachziehen. */
function applyProof(
  state: GameState,
  player: Player,
  cardIds: number[],
  topPick: Partial<Record<SuitIndex, number>>,
): MoveResult {
  const cards = cardsFromHand(player, cardIds);
  if (cards.length === 0) throw new Error('Ein Beweis braucht mindestens eine Karte.');
  const parts: ProofPart[] = cards.map((card) => ({ card, ...trueValue(card, state.piles, state.rules) }));
  const sum = parts.reduce((total, part) => total + part.value, 0);
  if (sum !== TARGET) throw new Error(`Die Karten ergeben ${sum}, nicht ${TARGET}.`);

  removeFromHand(player, cards);
  player.points += cards.length;
  player.combos++;
  // die gewählte oberste Karte jeder Farbe kommt zuletzt auf ihren Stapel
  const ordered = [...cards].sort(
    (a, b) => Number(topPick[a.suit] === a.id) - Number(topPick[b.suit] === b.id),
  );
  const steps = ordered.map((card) => placeCard(state, card));
  const drawn = refill(state, player, HAND_SIZE);

  logMove(state, { kind: 'proof', player: state.current, parts, points: cards.length });
  logRotations(state, steps);
  return { steps, drawn };
}

/** Noch keine Erleuchtung: eine Karte auf ihren Stapel, eine nachziehen. */
function applyDiscard(state: GameState, player: Player, cardId: number): MoveResult {
  const [card] = cardsFromHand(player, [cardId]);
  if (!card) throw new Error('Keine Karte zum Abwerfen gewählt.');
  const handSize = player.hand.length;

  removeFromHand(player, [card]);
  const steps = [placeCard(state, card)];
  const drawn = refill(state, player, handSize);

  logMove(state, { kind: 'discard', player: state.current, card });
  logRotations(state, steps);
  return { steps, drawn };
}

function cardsFromHand(player: Player, ids: readonly number[]): Card[] {
  if (new Set(ids).size !== ids.length) throw new Error('Eine Karte wurde doppelt gewählt.');
  return ids.map((id) => {
    const card = player.hand.find((c) => c.id === id);
    if (!card) throw new Error(`Die Karte ${id} ist nicht auf der Hand.`);
    return card;
  });
}

function removeFromHand(player: Player, cards: readonly Card[]): void {
  const ids = new Set(cards.map((card) => card.id));
  player.hand = player.hand.filter((card) => !ids.has(card.id));
}

function placeCard(state: GameState, card: Card): PlacementStep {
  const pile = state.piles[card.suit];
  if (!pile) throw new Error(`Es gibt keinen Stapel ${card.suit}.`);
  pile.push(card);
  // Variante: landet eine 13 oben auf einem Stapel, wandern alle Regeln weiter
  const rotated = state.settings.variant && card.rank === 13;
  if (rotated) {
    state.rules = rotateRules(state.rules, state.settings.dir);
    state.rotations++;
  }
  return { card, rules: [...state.rules], rotations: state.rotations, rotated };
}

function refill(state: GameState, player: Player, target: number): number[] {
  const drawn: number[] = [];
  while (player.hand.length < target) {
    const card = state.deck.pop();
    if (!card) break;
    player.hand.push(card);
    drawn.push(card.id);
  }
  return drawn;
}

function logMove(state: GameState, entry: LogEntry): void {
  state.lastMove = state.log.push(entry) - 1;
}

function logRotations(state: GameState, steps: readonly PlacementStep[]): void {
  const count = steps.filter((step) => step.rotated).length;
  if (count > 0) state.log.push({ kind: 'rotation', count, dir: state.settings.dir });
}
