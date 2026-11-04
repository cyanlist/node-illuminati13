import { describe, expect, it } from 'vitest';
import { newGame } from '../src/core/game';
import { type DeviceInfo, devReport } from '../src/features/settings/dev-report';
import { seededRng, settings } from './helpers';

const device: DeviceInfo = {
  origin: 'https://cyanlist.github.io',
  userAgent: 'Testbrowser',
  viewport: { width: 390, height: 844, dpr: 3 },
  theme: 'auto',
  deck: 'Klassisch',
};
const build = { version: '1.2.3', commit: 'abc1234', dirty: true, date: '2026-11-05T10:00:00.000Z' };

describe('Entwicklerinfo', () => {
  it('nennt Version, Commit und wo die Seite läuft', () => {
    const text = devReport({ device, game: null, build });
    expect(text).toContain('Version: 1.2.3 · abc1234 + lokal');
    expect(text).toContain('GitHub Pages');
    expect(text).toContain('390×844');
    expect(text).toContain('Spiel: keins gestartet');
  });

  it('beschreibt das laufende Spiel samt Einstellungen', () => {
    const game = newGame(
      settings({ mode: 'cpu', cpuLevel: 'hard', truth: true, truthGoal: 13 }),
      seededRng(3),
    );
    const text = devReport({ device, game, build });
    expect(text).toContain('Gegen den Computer (Stärke: schwer)');
    expect(text).toContain('Varianten: Wahre Wahrheit – bis 13 Punkte');
    expect(text).toContain(`Einstellungen: ${JSON.stringify(game.settings)}`);
    expect(text).not.toContain('Spielstand:');
  });

  it('hängt auf Wunsch den ganzen Spielstand an', () => {
    const game = newGame(settings(), seededRng(3));
    const text = devReport({ device, game, build, withState: true });
    const state = text.split('Spielstand: ')[1] ?? '';
    expect(JSON.parse(state)).toEqual(JSON.parse(JSON.stringify(game)));
  });
});
