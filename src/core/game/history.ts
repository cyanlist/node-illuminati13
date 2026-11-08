/** Was sich aus dem Protokoll eines Spiels ablesen lässt. */
import { type RotationDir, type RuleKey, rotateRules } from '../rules';
import type { GameState } from './types';

/**
 * Die Punkte aller Personen nach jedem Zug, beginnend mit lauter Nullen – für den Verlauf im Ergebnis.
 * Ein bezahlter Tipp zieht seinen Punkt gleich ab; zu sehen ist das mit dem nächsten Zug.
 */
export function scoreHistory(state: GameState): number[][] {
  const points = state.players.map(() => 0);
  const history = [[...points]];
  for (const entry of state.log) {
    if (entry.kind === 'hint') points[entry.player] = (points[entry.player] ?? 0) - entry.cost;
    if (entry.kind === 'proof') points[entry.player] = (points[entry.player] ?? 0) + entry.points;
    if (entry.kind === 'proof' || entry.kind === 'discard' || entry.kind === 'skip')
      history.push([...points]);
  }
  return history;
}

/** Wie die Führung im Lauf des Spiels verlief – aus Sicht derjenigen, die am Ende vorn liegt. */
export interface LeadStory {
  /** Wie oft eine andere Person die alleinige Führung übernommen hat */
  changes: number;
  /** Wer als Erstes allein vorn lag; null, wenn nie jemand vorn lag */
  firstLeader: number | null;
  /** Größter Rückstand der Person `winner` im Lauf des Spiels (0: nie zurück) */
  deficit: number;
}

export function leadStory(history: readonly (readonly number[])[], winner: number): LeadStory {
  let changes = 0;
  let firstLeader: number | null = null;
  let leader: number | null = null;
  let deficit = 0;
  for (const points of history) {
    const best = Math.max(...points);
    const ahead = points.flatMap((p, i) => (p === best ? [i] : []));
    if (ahead.length === 1) {
      const now = ahead[0] as number;
      if (leader !== null && now !== leader) changes++;
      leader = now;
      firstLeader ??= now;
    }
    const others = points.filter((_, i) => i !== winner);
    if (others.length > 0) deficit = Math.max(deficit, Math.max(...others) - (points[winner] ?? 0));
  }
  return { changes, firstLeader, deficit };
}

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
