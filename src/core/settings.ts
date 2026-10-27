import { CLASSIC_RULES, isRuleKey, type RotationDir, type RuleKey } from './rules';

/** Wer spielt: gegen den Computer, zu zweit an einem Gerät oder allein. */
export type GameMode = 'cpu' | 'hotseat' | 'solo';
/** Woher die Regeln der Stapel kommen. */
export type RuleMode = 'classic' | 'custom' | 'random';
/**
 * Wie viel der Tipp verrät: gar nichts (kein Tipp-Knopf), nur ob es eine 13 gibt und aus wie vielen Karten,
 * oder welche Karten es sind.
 */
export type HintLevel = 'off' | 'nudge' | 'full';
/** Wie gut der Computer Kombinationen erkennt (siehe ai.ts). */
export type CpuLevel = 'easy' | 'medium' | 'hard';

export interface Settings {
  mode: GameMode;
  /** Stärke des Computers – nur im Spiel gegen den Computer */
  cpuLevel: CpuLevel;
  /** Name 1 (bzw. „Du“) und Name 2 für das Spiel zu zweit */
  names: [string, string];
  showValues: boolean;
  /** Variante „Wenn die Weltordnung sich verschiebt“ */
  variant: boolean;
  dir: RotationDir;
  ruleMode: RuleMode;
  /** Regel je Stapel (Herz, Pik, Karo, Kreuz) bei eigener Zuordnung */
  customRules: RuleKey[];
  hints: HintLevel;
  /** Ein Tipp kostet einen Punkt */
  hintCost: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  mode: 'cpu',
  cpuLevel: 'medium',
  names: ['Du', ''],
  showValues: true,
  variant: false,
  dir: 'rechts',
  ruleMode: 'classic',
  customRules: [...CLASSIC_RULES],
  hints: 'nudge',
  hintCost: false,
};

const oneOf = <T extends string>(value: unknown, options: readonly T[], fallback: T): T =>
  options.includes(value as T) ? (value as T) : fallback;

const flag = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback);

/** Macht aus gespeicherten – evtl. veralteten oder kaputten – Daten gültige Einstellungen. */
export function normalizeSettings(raw: unknown): Settings {
  const data = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const names = Array.isArray(data.names) ? data.names : [];
  const rules = data.customRules;
  const d = DEFAULT_SETTINGS;
  return {
    mode: oneOf(data.mode, ['cpu', 'hotseat', 'solo'], d.mode),
    cpuLevel: oneOf(data.cpuLevel, ['easy', 'medium', 'hard'], d.cpuLevel),
    names: [
      typeof names[0] === 'string' ? names[0] : d.names[0],
      typeof names[1] === 'string' ? names[1] : d.names[1],
    ],
    showValues: flag(data.showValues, d.showValues),
    variant: flag(data.variant, d.variant),
    dir: oneOf(data.dir, ['rechts', 'links'], d.dir),
    ruleMode: oneOf(data.ruleMode, ['classic', 'custom', 'random'], d.ruleMode),
    customRules:
      Array.isArray(rules) && rules.length === 4 && rules.every(isRuleKey) ? [...rules] : [...d.customRules],
    hints: oneOf(data.hints, ['off', 'nudge', 'full'], d.hints),
    hintCost: flag(data.hintCost, d.hintCost),
  };
}
