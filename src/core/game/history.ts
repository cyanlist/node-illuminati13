/** Was sich aus dem Protokoll eines Spiels ablesen lässt. */
import { type RotationDir, type RuleKey, rotateRules } from '../rules';
import type { GameState } from './types';

/**
 * Die Punkte aller Personen nach jedem Zug, beginnend mit lauter Nullen – für den Verlauf im Ergebnis.
 * Ein bezahlter Tipp zieht seinen Punkt gleich ab; zu sehen ist das mit dem nächsten Zug.
 */
export function scoreHistory(state: GameState): number[][] {
  const points = state.players.map(() => 0);
  const add = (player: number, delta: number): void => {
    points[player] = (points[player] ?? 0) + delta;
  };
  const history = [[...points]];
  for (const entry of state.log) {
    if (entry.kind === 'hint') add(entry.player, -entry.cost);
    if (entry.kind === 'proof') add(entry.player, entry.points);
    if (isTurn(entry.kind)) history.push([...points]);
  }
  return history;
}

/** Protokolleinträge, die für einen Zug stehen – auch Aussetzen zählt */
const isTurn = (kind: string): boolean => kind === 'proof' || kind === 'discard' || kind === 'skip';

/**
 * Die Regeln der vier Stapel, wie sie zu Beginn des Spiels galten. In der Variante „Wenn die Weltordnung sich
 * verschiebt“ sind sie inzwischen weitergerückt – hier wird jede Verschiebung zurückgedreht.
 */
export function rulesAtStart(state: GameState): RuleKey[] {
  const back: RotationDir = state.settings.dir === 'rechts' ? 'links' : 'rechts';
  let rules = [...state.rules];
  for (let i = 0; i < state.rotations; i++) rules = rotateRules(rules, back);
  return rules;
}

/** Wie viele Züge eine Person schon gemacht hat (Beweise und Abwürfe). */
export function turnsTaken(state: GameState, player: number): number {
  return state.log.filter(
    (entry) => (entry.kind === 'proof' || entry.kind === 'discard') && entry.player === player,
  ).length;
}

/** Wer das Spiel begonnen hat; bis die Reihe wieder an dieser Person ist, ist eine Runde komplett. */
export function starter(state: GameState): number {
  const begins = state.log.find((entry) => entry.kind === 'begins');
  return begins?.kind === 'begins' ? begins.player : 0;
}

/**
 * Wie viele Züge nach dem der Person am Zug die Runde noch dauert – bis die Person dran wäre, die begonnen hat.
 * Zu zweit: 1, wenn die Startperson am Zug ist, sonst 0.
 */
export function turnsUntilRoundEnds(state: GameState): number {
  const count = state.players.length;
  return (starter(state) - state.current - 1 + count) % count;
}
