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

/** Ein Paket mit festen Regeln für Herz, Pik, Karo und Kreuz. */
const fixedPack = (id: string, title: string, description: string, rules: readonly RuleKey[]): RulePack => ({
  id,
  title,
  description,
  rules: () => [...rules],
  matches: (current) => sameRules(current, rules),
});

// Die Kommentare nennen Messwerte aus je 400 Partien Computer gegen Computer (Stärke „Schwer“):
// wie oft eine 13 möglich ist und wie viele Karten ein Beweis im Schnitt hat.
export const RULE_PACKS: readonly RulePack[] = [
  // 54 % · 2,1 Karten
  fixedPack('classic', 'Klassisch', 'Die vier Regeln aus der Anleitung.', CLASSIC_RULES),
  // 62 % · 2,1 Karten · nie negativ
  fixedPack('gentle', 'Sanft', 'Leicht zu rechnen, kein Wert wird negativ.', ['mean', 'min', 'max', 'copy']),
  // 59 % · 2,2 Karten
  fixedPack('opposites', 'Gegensätze', 'Plus und Minus, Maximum und Minimum.', [
    'plus',
    'minus',
    'max',
    'min',
  ]),
  // 68 % · 2,9 Karten
  fixedPack('mirror', 'Spiegelwelt', 'Alles verdreht – dafür große Beweise.', [
    'mirror',
    'rminus',
    'dist',
    'min',
  ]),
  {
    id: 'random',
    title: 'Zufällig',
    description: 'Vier verschiedene Regeln, jetzt ausgelost.',
    rules: (rng) => randomRules(rng),
  },
];
