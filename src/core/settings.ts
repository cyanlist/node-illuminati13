import { SUIT_INDICES } from './cards';
import { CLASSIC_RULES, isRuleKey, ROTATION_DIRS, type RotationDir, type RuleKey, sameRules } from './rules';

// Die Werte landen in gespeicherten Einstellungen – bestehende daher nicht umbenennen.

/** Wer spielt: gegen den Computer, zu zweit an einem Gerät, zu zweit an zwei Geräten oder allein. */
export const GAME_MODES = ['cpu', 'hotseat', 'online', 'solo'] as const;
export type GameMode = (typeof GAME_MODES)[number];

/** Woher die Regeln der Stapel kommen. */
export const RULE_MODES = ['classic', 'custom', 'random'] as const;
export type RuleMode = (typeof RULE_MODES)[number];

/**
 * Wie viel der Tipp verrät: gar nichts (kein Tipp-Knopf), nur ob es eine 13 gibt, ob es eine gibt und aus wie
 * vielen Karten, oder welche Karten es sind.
 */
export const HINT_LEVELS = ['off', 'exists', 'nudge', 'full'] as const;
export type HintLevel = (typeof HINT_LEVELS)[number];

/** Wann das Spiel endet: wenn der Nachziehstapel leer ist oder – kürzer – sobald jemand 13 Punkte hat. */
export const ENDINGS = ['deck', 'thirteen'] as const;
export type Ending = (typeof ENDINGS)[number];

/** Wie gut der Computer Kombinationen erkennt (siehe ai.ts). */
export const CPU_LEVELS = ['easy', 'medium', 'hard'] as const;
export type CpuLevel = (typeof CPU_LEVELS)[number];

export interface Settings {
  mode: GameMode;
  /** Stärke des Computers – nur im Spiel gegen den Computer */
  cpuLevel: CpuLevel;
  /** Name 1 und Name 2; leer heißt „Du“ bzw. „Spieler*in 1/2“. An zwei Geräten: Gastgeber*in und Gast */
  names: [string, string];
  showValues: boolean;
  /** Mit offenen Karten: Die Hand des Gegenübers liegt offen, zu zweit entfällt die Übergabe */
  openHands: boolean;
  /** Variante „Wenn die Weltordnung sich verschiebt“ */
  variant: boolean;
  dir: RotationDir;
  ruleMode: RuleMode;
  /** Regel je Stapel (Herz, Pik, Karo, Kreuz) bei eigener Zuordnung */
  customRules: RuleKey[];
  hints: HintLevel;
  /** Ein Tipp kostet einen Punkt */
  hintCost: boolean;
  ending: Ending;
}

export const DEFAULT_SETTINGS: Settings = {
  mode: 'cpu',
  cpuLevel: 'medium',
  names: ['', ''],
  showValues: false,
  openHands: false,
  variant: false,
  dir: 'rechts',
  ruleMode: 'classic',
  customRules: [...CLASSIC_RULES],
  hints: 'nudge',
  hintCost: false,
  ending: 'deck',
};

/** Zu zweit an zwei Geräten? */
export const isOnline = (settings: Pick<Settings, 'mode'>): boolean => settings.mode === 'online';

const oneOf = <T extends string>(value: unknown, options: readonly T[], fallback: T): T =>
  options.includes(value as T) ? (value as T) : fallback;

const flag = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback);

/** Eine gültige Regel je Farbe? */
const validCustomRules = (value: unknown): value is RuleKey[] =>
  Array.isArray(value) && value.length === SUIT_INDICES.length && value.every(isRuleKey);

/** Macht aus gespeicherten – evtl. veralteten oder kaputten – Daten gültige Einstellungen. */
export function normalizeSettings(raw: unknown): Settings {
  const data = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const names = Array.isArray(data.names) ? data.names : [];
  const d = DEFAULT_SETTINGS;
  return {
    mode: oneOf(data.mode, GAME_MODES, d.mode),
    cpuLevel: oneOf(data.cpuLevel, CPU_LEVELS, d.cpuLevel),
    names: [
      // früher stand „Du“ als Name im Feld – zu zweit wurde daraus „Du ist an der Reihe“
      typeof names[0] === 'string' && names[0].trim() !== 'Du' ? names[0] : d.names[0],
      typeof names[1] === 'string' ? names[1] : d.names[1],
    ],
    showValues: flag(data.showValues, d.showValues),
    openHands: flag(data.openHands, d.openHands),
    variant: flag(data.variant, d.variant),
    dir: oneOf(data.dir, ROTATION_DIRS, d.dir),
    ruleMode: oneOf(data.ruleMode, RULE_MODES, d.ruleMode),
    customRules: validCustomRules(data.customRules) ? [...data.customRules] : [...d.customRules],
    hints: oneOf(data.hints, HINT_LEVELS, d.hints),
    hintCost: flag(data.hintCost, d.hintCost),
    ending: oneOf(data.ending, ENDINGS, d.ending),
  };
}

/**
 * Für die Startseite: Dort gibt es immer die vier Auswahlfelder. Im klassischen Modus zeigen sie
 * die klassischen Regeln, auch wenn von früher noch eine eigene Zuordnung gespeichert ist.
 */
export function settingsForEditing(settings: Settings): Settings {
  return settings.ruleMode === 'classic' ? { ...settings, customRules: [...CLASSIC_RULES] } : settings;
}

/**
 * Beim Spielstart: Ohne „Bei jedem Spiel neu auslosen“ gilt das Spiel als klassisch, wenn die Felder
 * den klassischen Regeln entsprechen, sonst als eigene Zuordnung.
 */
export function resolveRuleMode(settings: Settings): Settings {
  if (settings.ruleMode === 'random') return settings;
  return { ...settings, ruleMode: sameRules(settings.customRules, CLASSIC_RULES) ? 'classic' : 'custom' };
}
