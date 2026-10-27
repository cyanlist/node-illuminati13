import type { Card } from './cards';
import { RULES, type RuleKey } from './rules';

/** Die Zahl, um die sich alles dreht. */
export const TARGET = 13;

export type Piles = readonly (readonly Card[])[];

/** Ergebnis der „Entschlüsselung“ einer Handkarte. */
export interface TrueValue {
  value: number;
  /** Rechenweg ohne Ergebnis, z. B. „4 + 5“; leer, wenn der Stapel leer ist */
  formula: string;
  /** Der Rechenweg ist schon der Wert (z. B. „Hand kopiert Stapel“) */
  direct: boolean;
  /** Der Stapel ist leer, die Karte zählt ihre Zahl */
  empty: boolean;
}

/** Wahrer Wert einer Handkarte: nach der Regel ihres Stapels, bei leerem Stapel ihre Zahl. */
export function trueValue(card: Card, piles: Piles, rules: readonly RuleKey[]): TrueValue {
  const top = piles[card.suit]?.at(-1);
  const ruleKey = rules[card.suit];
  if (!top || !ruleKey) return { value: card.rank, formula: '', direct: true, empty: true };
  const rule = RULES[ruleKey];
  return {
    value: rule.calc(top.rank, card.rank),
    formula: rule.show(top.rank, card.rank),
    direct: rule.direct ?? false,
    empty: false,
  };
}

export const sumOfValues = (cards: readonly Card[], piles: Piles, rules: readonly RuleKey[]): number =>
  cards.reduce((sum, card) => sum + trueValue(card, piles, rules).value, 0);
