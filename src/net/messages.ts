/**
 * Was zwei verbundene Geräte einander schicken. Beide Geräte führen denselben Spielstand: Gastgeber*in
 * schickt ihn zu Beginn einmal ganz, danach nur noch die Züge – jedes Gerät wendet sie gleich an.
 */
import type { GameState, Move } from '../core/game';
import type { Settings } from '../core/settings';

export type Message =
  /** Gleich nach dem Verbinden: wie man heißt */
  | { type: 'hello'; name: string }
  /** Gastgeber*in → Gast: wie das nächste Spiel gerade eingestellt ist – der Gast sieht es nur an */
  | { type: 'settings'; settings: Settings }
  /** Gastgeber*in → Gast: neues Spiel oder der aktuelle Stand nach einer Unterbrechung */
  | { type: 'start'; game: GameState }
  /** Ein Zug; `at` ist die Länge des Protokolls davor – so fällt auf, wenn die Stände auseinanderlaufen */
  | { type: 'move'; move: Move; at: number }
  /** Die Person am Zug hat einen Tipp geholt (kann einen Punkt kosten) */
  | { type: 'hint'; at: number }
  /** Gast → Gastgeber*in: bitte den ganzen Stand noch einmal schicken */
  | { type: 'resync' }
  /** Gast → Gastgeber*in: noch eine Runde */
  | { type: 'again' }
  /** Lebenszeichen, alle paar Sekunden in beide Richtungen (heartbeat.ts) */
  | { type: 'ping' };

/** Alle Arten von Nachrichten – fehlt eine neue hier, meldet es die Typprüfung */
const TYPES: Record<Message['type'], true> = {
  hello: true,
  settings: true,
  start: true,
  move: true,
  hint: true,
  resync: true,
  again: true,
  ping: true,
};

/** Liest eine Nachricht; null, wenn sie nicht von dieser App stammt. */
export function parseMessage(text: string): Message | null {
  try {
    const data: unknown = JSON.parse(text);
    if (typeof data !== 'object' || data === null) return null;
    const { type } = data as { type?: unknown };
    return typeof type === 'string' && Object.hasOwn(TYPES, type) ? (data as Message) : null;
  } catch {
    return null;
  }
}
