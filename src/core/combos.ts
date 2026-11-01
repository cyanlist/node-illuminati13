import { type Card, pickRandom, type Rng } from './cards';
import type { RuleKey } from './rules';
import { type Piles, TARGET, trueValue } from './values';

/** Alle Teilmengen der Hand, deren wahre Werte zusammen genau 13 ergeben. */
export function findCombos(hand: readonly Card[], piles: Piles, rules: readonly RuleKey[]): Card[][] {
  const values = hand.map((card) => trueValue(card, piles, rules).value);
  const combos: Card[][] = [];
  // jede Bitmaske steht für eine Teilmenge der (höchstens fünf) Handkarten
  for (let mask = 1; mask < 1 << hand.length; mask++) {
    let sum = 0;
    const cards: Card[] = [];
    hand.forEach((card, i) => {
      if (mask & (1 << i)) {
        sum += values[i] ?? 0;
        cards.push(card);
      }
    });
    if (sum === TARGET) combos.push(cards);
  }
  return combos;
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
