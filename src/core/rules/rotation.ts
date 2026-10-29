import type { RuleKey } from './registry';

/** Richtung, in die die Stapel in der Variante „Wenn die Weltordnung sich verschiebt“ weiterrücken. */
export type RotationDir = 'rechts' | 'links';

/**
 * Spalte auf dem Board, in der der Stapel einer Farbe nach `rotations` Verschiebungen liegt.
 * Die Regeln stehen fest über den Spalten; „rechts“ heißt, Herz rückt auf den Platz von Pik usw.
 */
export function pileColumn(suit: number, rotations: number, dir: RotationDir, columns: number): number {
  const steps = dir === 'rechts' ? rotations : -rotations;
  return (((suit + steps) % columns) + columns) % columns;
}

/**
 * Die Stapel rücken eine Spalte weiter, die Regeln bleiben stehen: Jede Farbe bekommt die Regel ihrer
 * neuen Spalte. Bei „rechts“ gilt für Herz danach die Regel, unter der vorher Pik lag.
 */
export function rotateRules(rules: readonly RuleKey[], dir: RotationDir): RuleKey[] {
  const n = rules.length;
  return rules.map((_, i) => rules[dir === 'rechts' ? (i + 1) % n : (i + n - 1) % n] as RuleKey);
}
