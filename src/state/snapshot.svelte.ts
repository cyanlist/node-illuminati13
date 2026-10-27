/**
 * Spielstand über eine neue Version hinweg: Der Claude-Artifact-Viewer fragt beim Aktualisieren
 * nach einem Schnappschuss und reicht ihn der neuen Version weiter.
 */
import type { GameState } from '../core/game';
import { afterMove, scheduleCpu } from './flow';
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
    resultsHidden: table.resultsHidden,
    soloBest: table.soloBest,
  };
}

const isSnapshot = (data: unknown): data is Snapshot =>
  typeof data === 'object' && data !== null && (data as { version?: unknown }).version === 2;

/** Übernimmt einen Schnappschuss (falls vorhanden) und setzt den Spielablauf fort. */
export function restoreSnapshot(data: unknown): void {
  if (!isSnapshot(data)) return;
  table.game = data.game;
  table.view = data.view;
  table.phase = data.phase;
  table.resultsHidden = data.resultsHidden;
  table.soloBest = data.soloBest;
  // ein unterbrochenes Ablegen ist im Spielstand schon erledigt – also gleich weiter
  if (data.animating) afterMove();
  else if (data.view === 'game' && data.phase === 'cpu') scheduleCpu();
}
