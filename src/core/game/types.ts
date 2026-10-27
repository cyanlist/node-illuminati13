import type { Card, SuitIndex } from '../cards';
import type { RotationDir, RuleKey } from '../rules';
import type { RuleMode, Settings } from '../settings';
import type { TrueValue } from '../values';

export const HAND_SIZE = 5;

export interface Player {
  name: string;
  cpu: boolean;
  /** Die Person am eigenen Gerät – Texte sprechen sie mit „Du“ an */
  you: boolean;
  hand: Card[];
  points: number;
  /** Anzahl gefundener 13er-Kombinationen (entscheidet bei Punktgleichstand) */
  combos: number;
}

/** Eine Karte eines Beweises mit ihrem Rechenweg. */
export interface ProofPart extends TrueValue {
  card: Card;
}

/** Ein Protokolleintrag als Daten; die Oberfläche macht daraus Text. */
export type LogEntry =
  | { kind: 'intro' }
  | { kind: 'rules'; ruleMode: Exclude<RuleMode, 'classic'>; rules: RuleKey[] }
  | { kind: 'variant'; dir: RotationDir }
  | { kind: 'begins'; player: number }
  | { kind: 'proof'; player: number; parts: ProofPart[]; points: number }
  | { kind: 'discard'; player: number; card: Card }
  | { kind: 'rotation'; count: number; dir: RotationDir }
  | { kind: 'skip'; player: number }
  | { kind: 'final'; players: number }
  | { kind: 'end' };

export interface GameState {
  settings: Settings;
  /** Nachziehstapel; gezogen wird vom Ende */
  deck: Card[];
  /** Ablagestapel je Farbe; die oberste Karte liegt am Ende */
  piles: Card[][];
  /** Regel je Stapel */
  rules: RuleKey[];
  /** Wie oft sich die Weltordnung schon verschoben hat (Variante) */
  rotations: number;
  players: Player[];
  current: number;
  /** null, solange der Nachziehstapel Karten hat; danach die noch verbleibenden Züge */
  finalTurnsLeft: number | null;
  over: boolean;
  log: LogEntry[];
  /** Index des letzten Zugs (Beweis oder Abwurf) im Protokoll */
  lastMove: number | null;
}

/**
 * Ein Zug als reine Daten:
 * - `proof`: Karten, deren wahre Werte zusammen 13 ergeben; `topPick` nennt je Farbe die Karte, die oben landen soll.
 * - `discard`: eine einzelne Karte abwerfen.
 */
export type Move =
  | { type: 'proof'; cardIds: number[]; topPick?: Partial<Record<SuitIndex, number>> }
  | { type: 'discard'; cardId: number };

/** Eine abgelegte Karte und der Stand der Regeln direkt danach – für die Animation. */
export interface PlacementStep {
  card: Card;
  rules: RuleKey[];
  rotations: number;
  rotated: boolean;
}

export interface MoveResult {
  /** Die abgelegten Karten in der Reihenfolge, in der sie auf die Stapel kamen */
  steps: PlacementStep[];
  /** ids der nachgezogenen Karten */
  drawn: number[];
  /** Bei einem Beweis: die Karten mit ihrem Rechenweg in der gewählten Reihenfolge; beim Abwurf leer */
  parts: ProofPart[];
}
