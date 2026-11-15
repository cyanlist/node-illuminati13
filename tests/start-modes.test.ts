import { describe, expect, it } from 'vitest';
import { GAME_MODES } from '../src/core/settings';
import { MODE_OPTIONS, modeOption } from '../src/features/start/modes';

describe('Spielarten der Startseite', () => {
  it('bietet jede Spielart genau einmal an', () => {
    expect(MODE_OPTIONS.map((option) => option.mode).sort()).toEqual([...GAME_MODES].sort());
  });

  it('spielt per Kachel gleich los – nur zwei Geräte müssen sich erst verbinden', () => {
    expect(MODE_OPTIONS.filter((option) => !option.quickStart).map((option) => option.mode)).toEqual([
      'online',
    ]);
    expect(modeOption('online').title).toBe('Zu zweit, zwei Geräte');
  });
});
