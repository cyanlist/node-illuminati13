import type { RuleKey } from './registry';

/** Richtung, in die die Regeln in der Variante „Wenn die Weltordnung sich verschiebt“ wandern. */
export type RotationDir = 'rechts' | 'links';

/** Verschiebt die Regeln um eine Position: „rechts“ heißt, die Regel von Herz geht auf Pik über usw. */
export function rotateRules(rules: readonly RuleKey[], dir: RotationDir): RuleKey[] {
  const n = rules.length;
  return rules.map((_, i) => rules[dir === 'rechts' ? (i + n - 1) % n : (i + 1) % n] as RuleKey);
}
