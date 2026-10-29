import type { LogEntry, ProofPart } from '../core/game';
import { RULES, type RuleKey, signed } from '../core/rules';
import type { TrueValue } from '../core/values';

/** Zahl mit echtem Minuszeichen. */
export const num = signed;

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

/**
 * Die Beispielkarten für alle Regeln. Mit Stapel 6 zeigt diese Hand jede Regel samt Sonderfällen:
 * kleiner, gleich und größer als der Stapel – also auch 0, negative Werte, Abrunden und Reste.
 */
export const RULE_EXAMPLE = { stack: 6, hand: [2, 4, 6, 9, 13] } as const;

/** Ein Beispiel in einer Zeile fürs Regelfenster – mit der 9, die bei den meisten Regeln etwas Besonderes zeigt. */
export function ruleExample(key: RuleKey): string {
  const rule = RULES[key];
  const { stack } = RULE_EXAMPLE;
  const hand = 9;
  const value = num(rule.calc(stack, hand));
  return `Beispiel: Stapel ${stack}, Hand ${hand} → ${rule.direct ? value : `${rule.show(stack, hand)} = ${value}`}`;
}

export const ruleLabel = (key: RuleKey | undefined): string => (key ? RULES[key].label : '');

/** Protokolleinträge, die nur Hintergrund liefern, erscheinen gedämpft. */
export const isSystemEntry = (entry: LogEntry): boolean =>
  entry.kind !== 'begins' && entry.kind !== 'proof' && entry.kind !== 'discard';
