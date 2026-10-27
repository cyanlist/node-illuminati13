import { type Card, pickRandom, type Rng, SUIT_INDICES, type SuitIndex } from './cards';
import { bestCombo, findCombos } from './combos';
import { currentPlayer, type GameState, type Move } from './game';
import { rotateRules } from './rules';

/**
 * Zug des Computers: die größte mögliche 13er-Kombination. Gibt es keine, wirft er die Karte ab,
 * nach der seine Resthand am ehesten selbst eine 13 bilden könnte.
 */
export function chooseCpuMove(state: GameState, rng: Rng = Math.random): Move {
  const { hand } = currentPlayer(state);
  const combo = bestCombo(hand, state.piles, state.rules, rng);
  if (combo) {
    const topPick: Partial<Record<SuitIndex, number>> = {};
    for (const suit of SUIT_INDICES) {
      const sameSuit = combo.filter((card) => card.suit === suit);
      if (sameSuit.length > 0) topPick[suit] = pickRandom(sameSuit, rng).id;
    }
    return { type: 'proof', cardIds: combo.map((card) => card.id), topPick };
  }

  let bestScore = -1;
  let candidates: Card[] = [];
  for (const card of hand) {
    const score = discardScore(state, hand, card);
    if (score > bestScore) {
      bestScore = score;
      candidates = [card];
    } else if (score === bestScore) candidates.push(card);
  }
  return { type: 'discard', cardId: pickRandom(candidates, rng).id };
}

/** Wie gut die Resthand nach dem Abwerfen dieser Karte dasteht: Größe der besten 13, dann deren Anzahl. */
function discardScore(state: GameState, hand: readonly Card[], card: Card): number {
  const piles = state.piles.map((pile) => [...pile]);
  piles[card.suit]?.push(card);
  const rules =
    state.settings.variant && card.rank === 13 ? rotateRules(state.rules, state.settings.dir) : state.rules;
  const combos = findCombos(
    hand.filter((c) => c.id !== card.id),
    piles,
    rules,
  );
  if (combos.length === 0) return 0;
  return Math.max(...combos.map((combo) => combo.length)) * 10 + Math.min(combos.length, 9);
}
