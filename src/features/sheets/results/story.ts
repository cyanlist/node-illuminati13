/**
 * Ein Satz zum Verlauf des Spiels, der über der kleinen Linie im Ergebnis steht: knapp, Aufholjagd oder von
 * Anfang an vorn. Die Zahlen dafür liest leadStory (core/game/history.ts) aus dem Protokoll.
 */
import type { LeadStory, Player } from '../../../core/game';

/** Ab so vielen Punkten Rückstand zwischendurch war es eine Aufholjagd */
export const COMEBACK = 5;

const TIMES: Record<number, string> = { 1: 'einmal', 2: 'zweimal', 3: 'dreimal' };
const times = (n: number): string => TIMES[n] ?? `${n}-mal`;

export function storyLine(story: LeadStory, winner: Player, winnerIndex: number, tie: boolean): string {
  if (tie)
    return story.changes > 0
      ? `Die Führung wechselte ${times(story.changes)} – am Ende gleichauf.`
      : 'Kopf an Kopf bis zum Schluss.';
  const lay = winner.you ? 'Du lagst' : `${winner.name} lag`;
  if (story.deficit >= COMEBACK) return `Aufholjagd: ${lay} zwischendurch ${story.deficit} Punkte zurück.`;
  if (story.changes > 0) return `Die Führung wechselte ${times(story.changes)}.`;
  if (story.firstLeader === winnerIndex) return `${lay} von Anfang an vorn.`;
  return 'Lange gleichauf – entschieden erst am Ende.';
}
