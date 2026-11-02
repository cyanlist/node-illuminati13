/**
 * Spielstand über eine neue Version hinweg: Der Claude-Artifact-Viewer fragt beim Aktualisieren
 * nach einem Schnappschuss und reicht ihn der neuen Version weiter.
 */
import type { GameState } from '../core/game';
import { isRuleKey } from '../core/rules';
import { isOnline } from '../core/settings';
import { afterMove, scheduleCpu } from './flow';
import { sheets } from './sheets.svelte';
import { type Phase, table, type View } from './table.svelte';

interface Snapshot {
  version: 2;
  game: GameState;
  view: View;
  phase: Phase;
  animating: boolean;
  resultsHidden: boolean;
  soloBest: number;
}

export function takeSnapshot(): Snapshot | null {
  if (!table.game) return null;
  return {
    version: 2,
    game: $state.snapshot(table.game),
    view: table.view,
    phase: table.phase,
    animating: table.anim !== null,
    resultsHidden: sheets.resultsHidden,
    soloBest: table.soloBest,
  };
}

const isSnapshot = (data: unknown): data is Snapshot =>
  typeof data === 'object' && data !== null && (data as { version?: unknown }).version === 2;

/** Übernimmt einen Schnappschuss (falls vorhanden) und setzt den Spielablauf fort. */
export function restoreSnapshot(data: unknown): void {
  // ein Spiel an zwei Geräten lebt von der Verbindung – die übersteht eine neue Version nicht;
  // ebenso ein Spiel mit einer Regel, die es in dieser Version nicht mehr gibt
  if (!isSnapshot(data) || isOnline(data.game.settings) || !data.game.rules.every(isRuleKey)) return;
  table.game = data.game;
  table.view = data.view;
  // die gewählten Karten stehen nicht im Schnappschuss – das Reihenfolge-Fenster beginnt daher neu beim Wählen
  table.phase = data.phase === 'order' ? 'play' : data.phase;
  sheets.resultsHidden = data.resultsHidden;
  table.soloBest = data.soloBest;
  // ein unterbrochenes Ablegen ist im Spielstand schon erledigt – also gleich weiter
  if (data.animating) afterMove();
  else if (data.view === 'game' && data.phase === 'cpu') scheduleCpu();
}
