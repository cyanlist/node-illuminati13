/**
 * Die vier Spielarten der Startseite: Titel der Kachel auf der ersten Ebene und ob ein Tipp darauf gleich losspielt.
 * Zwei Geräte müssen sich erst verbinden – diese Kachel führt immer zum Einrichten.
 */
import type { CpuLevel, GameMode } from '../../core/settings';

export const CPU_LEVEL_OPTIONS: { value: CpuLevel; label: string; description: string }[] = [
  {
    value: 'easy',
    label: 'Leicht',
    description: 'Übersieht viele 13en, vor allem große, und wirft wahllos ab.',
  },
  { value: 'medium', label: 'Mittel', description: 'Findet kleine 13en meist, große nur manchmal.' },
  { value: 'hard', label: 'Schwer', description: 'Sieht jede 13 und legt immer die größte.' },
];

export interface ModeOption {
  mode: GameMode;
  title: string;
  /** Ein Tipp auf die Kachel startet sofort mit den letzten Einstellungen */
  quickStart: boolean;
}

export const MODE_OPTIONS: readonly ModeOption[] = [
  { mode: 'cpu', title: 'Gegen den Computer', quickStart: true },
  { mode: 'solo', title: 'Allein', quickStart: true },
  { mode: 'hotseat', title: 'Zu zweit, ein Gerät', quickStart: true },
  { mode: 'online', title: 'Zu zweit, zwei Geräte', quickStart: false },
];

export function modeOption(mode: GameMode): ModeOption {
  const option = MODE_OPTIONS.find((o) => o.mode === mode);
  if (!option) throw new Error(`Unbekannte Spielart: ${mode}`);
  return option;
}
