import type { LogEntry, ProofPart } from '../core/game';
import { RULES, type RuleKey } from '../core/rules';
import type { TrueValue } from '../core/values';

/** Zahl mit echtem Minuszeichen. */
export const num = (n: number): string => (n < 0 ? `−${Math.abs(n)}` : String(n));

export const pts = (n: number): string => `${n} ${n === 1 ? 'Punkt' : 'Punkte'}`;

export const cardCount = (n: number): string => `${n} ${n === 1 ? 'Karte' : 'Karten'}`;

/** Rechenweg unter einer Handkarte, z. B. „4 + 5“ oder „= 10“. */
export function formulaText(value: TrueValue): string {
  if (value.empty) return 'Stapel leer';
  return value.direct ? `= ${value.formula}` : value.formula;
}

/** Rechenweg im Protokoll, z. B. „4 + 5 = 9“. */
export function calcText(part: ProofPart): string {
  if (part.empty) return num(part.value);
  if (part.direct) return `= ${part.formula}`;
  return `${part.formula} = ${num(part.value)}`;
}

export function ruleExample(key: RuleKey): string {
  const rule = RULES[key];
  const value = num(rule.calc(6, 4));
  return `Beispiel: Stapel 6, Hand 4 → ${rule.direct ? value : `${rule.show(6, 4)} = ${value}`}`;
}

export const ruleLabel = (key: RuleKey | undefined): string => (key ? RULES[key].label : '');

/** Protokolleinträge, die nur Hintergrund liefern, erscheinen gedämpft. */
export const isSystemEntry = (entry: LogEntry): boolean =>
  entry.kind !== 'begins' && entry.kind !== 'proof' && entry.kind !== 'discard';
