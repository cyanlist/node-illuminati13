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

/** Eine der größten 13er-Kombinationen (bei Gleichstand zufällig) oder null. */
export function bestCombo(
  hand: readonly Card[],
  piles: Piles,
  rules: readonly RuleKey[],
  rng: Rng = Math.random,
): Card[] | null {
  const combos = findCombos(hand, piles, rules);
  if (combos.length === 0) return null;
  const size = Math.max(...combos.map((combo) => combo.length));
  const largest = combos.filter((combo) => combo.length === size);
  return pickRandom(largest, rng);
}
