/**
 * Was zwei verbundene Geräte einander schicken. Beide Geräte führen denselben Spielstand: Gastgeber*in
 * schickt ihn zu Beginn einmal ganz, danach nur noch die Züge – jedes Gerät wendet sie gleich an.
 */
import type { GameState, Move } from '../core/game';

export type Message =
  /** Gleich nach dem Verbinden: wie man heißt */
  | { type: 'hello'; name: string }
  /** Gastgeber*in → Gast: neues Spiel oder der aktuelle Stand nach einer Unterbrechung */
  | { type: 'start'; game: GameState }
  /** Ein Zug; `at` ist die Länge des Protokolls davor – so fällt auf, wenn die Stände auseinanderlaufen */
  | { type: 'move'; move: Move; at: number }
  /** Die Person am Zug hat einen Tipp geholt (kann einen Punkt kosten) */
  | { type: 'hint'; at: number }
  /** Gast → Gastgeber*in: bitte den ganzen Stand noch einmal schicken */
  | { type: 'resync' }
  /** Gast → Gastgeber*in: noch eine Runde */
  | { type: 'again' };

const TYPES = new Set<string>(['hello', 'start', 'move', 'hint', 'resync', 'again']);

/** Liest eine Nachricht; null, wenn sie nicht von dieser App stammt. */
export function parseMessage(text: string): Message | null {
  try {
    const data: unknown = JSON.parse(text);
    if (typeof data !== 'object' || data === null) return null;
    const { type } = data as { type?: unknown };
    return typeof type === 'string' && TYPES.has(type) ? (data as Message) : null;
  } catch {
    return null;
  }
}
