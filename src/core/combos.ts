import { type Card, pickRandom, type Rng } from './cards';
import type { RuleKey } from './rules';
import { type Piles, TARGET, trueValue } from './values';

/** Alle Teilmengen der Hand, deren wahre Werte zusammen genau 13 ergeben. */
export function findCombos(hand: readonly Card[], piles: Piles, rules: readonly RuleKey[]): Card[][] {
  const values = new Map(hand.map((card) => [card.id, trueValue(card, piles, rules).value]));
  const sum = (cards: readonly Card[]): number =>
    cards.reduce((total, card) => total + (values.get(card.id) ?? 0), 0);
  return subsets(hand).filter((cards) => sum(cards) === TARGET);
}

/**
 * Alle nicht leeren Teilmengen – bei höchstens fünf Handkarten sind das 31. Jede Zahl von 1 bis 2ⁿ − 1 steht als
 * Bitmuster für eine Teilmenge: Ist Bit i gesetzt, gehört Karte i dazu.
 */
function subsets<T>(items: readonly T[]): T[][] {
  const all: T[][] = [];
  for (let mask = 1; mask < 1 << items.length; mask++)
    all.push(items.filter((_, i) => (mask & (1 << i)) !== 0));
  return all;
}

/** Die Kombinationen mit den meisten Karten. */
export function largestCombos(combos: readonly Card[][]): Card[][] {
  const size = Math.max(...combos.map((combo) => combo.length));
  return combos.filter((combo) => combo.length === size);
}

/** Eine der größten 13er-Kombinationen (bei Gleichstand zufällig) oder null. */
export function bestCombo(
  hand: readonly Card[],
  piles: Piles,
  rules: readonly RuleKey[],
  rng: Rng = Math.random,
): Card[] | null {
  const largest = largestCombos(findCombos(hand, piles, rules));
  return largest.length > 0 ? pickRandom(largest, rng) : null;
}
