import type { RuleKey } from './registry';

/**
 * Richtungen, in die die Stapel in der Variante „Wenn die Weltordnung sich verschiebt“ weiterrücken.
 * Die Werte landen in gespeicherten Einstellungen – daher nicht umbenennen.
 */
export const ROTATION_DIRS = ['rechts', 'links'] as const;
export type RotationDir = (typeof ROTATION_DIRS)[number];

/** Die Richtung in Worten – in den Extras der Startseite und im Regelfenster */
export const DIR_LABELS: Record<RotationDir, string> = {
  rechts: 'nach rechts (Herz → Pik → Karo → Kreuz → Herz)',
  links: 'nach links (Herz → Kreuz → Karo → Pik → Herz)',
};

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
  return rules.map((_, suit) => rules[pileColumn(suit, 1, dir, rules.length)] as RuleKey);
}
