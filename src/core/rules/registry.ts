import { type Rng, shuffle } from '../cards';
import { copy } from './copy';
import { distance } from './distance';
import { handMinusStack } from './hand-minus-stack';
import { max } from './max';
import { mean } from './mean';
import { min } from './min';
import { minus } from './minus';
import { mirror } from './mirror';
import { plain } from './plain';
import { plus } from './plus';
import type { Rule } from './rule';

/**
 * Alle Regeln, die ein Stapel haben kann. Neue Regel: eigene Datei anlegen und hier eintragen.
 * Die Schlüssel landen in gespeicherten Einstellungen – bestehende daher nicht umbenennen.
 */
export const RULES = {
  // die vier Regeln aus der Anleitung
  plus,
  minus,
  copy,
  max,
  // Zusatzregeln für eigene oder ausgeloste Zuordnungen
  min,
  rminus: handMinusStack,
  dist: distance,
  mirror,
  plain,
  mean,
} satisfies Record<string, Rule>;

export type RuleKey = keyof typeof RULES;

export const RULE_KEYS = Object.keys(RULES) as RuleKey[];

/** Herz, Pik, Karo, Kreuz – wie auf dem Spielplan. */
export const CLASSIC_RULES: readonly RuleKey[] = ['plus', 'minus', 'copy', 'max'];

export const isRuleKey = (value: unknown): value is RuleKey =>
  typeof value === 'string' && Object.hasOwn(RULES, value);

/** Vier verschiedene, zufällig gezogene Regeln. */
export const randomRules = (rng?: Rng): RuleKey[] => shuffle([...RULE_KEYS], rng).slice(0, 4);
