import type { Rng } from '../cards';
import { CLASSIC_RULES, type RuleKey, randomRules } from './registry';

/**
 * Ein Regelpaket füllt alle vier Stapel auf einen Schlag. Auf der Startseite erscheint jedes Paket als Knopf
 * über den Auswahlfeldern; neue Pakete sind nur ein Eintrag mehr in RULE_PACKS.
 */
export interface RulePack {
  id: string;
  title: string;
  description: string;
  /** Die Regeln für Herz, Pik, Karo und Kreuz */
  rules(rng?: Rng): RuleKey[];
  /** Erkennt, ob die Felder gerade genau diesem Paket entsprechen – Pakete mit Zufall erkennt man nie wieder */
  matches?(rules: readonly RuleKey[]): boolean;
}

export const sameRules = (a: readonly RuleKey[], b: readonly RuleKey[]): boolean =>
  a.length === b.length && a.every((key, i) => key === b[i]);

export const RULE_PACKS: readonly RulePack[] = [
  {
    id: 'classic',
    title: 'Klassisch',
    description: 'Die vier Regeln aus der Anleitung.',
    rules: () => [...CLASSIC_RULES],
    matches: (rules) => sameRules(rules, CLASSIC_RULES),
  },
  {
    id: 'random',
    title: 'Zufällig',
    description: 'Vier verschiedene Regeln, jetzt ausgelost.',
    rules: (rng) => randomRules(rng),
  },
];
