import { normalizeSettings, type Settings } from './core/settings';

// Gespeichert wird nur im Browser dieses Geräts. Ist der Speicher gesperrt (privates Fenster,
// Vorschau), läuft alles ohne ihn weiter.

const SETTINGS_KEY = 'illu13-settings';
const SOLO_BEST_KEY = 'illu13-best-solo';

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Speicher nicht verfügbar – dann eben ohne
  }
}

export const loadSettings = (): Settings => normalizeSettings(read(SETTINGS_KEY));
export const saveSettings = (settings: Settings): void => write(SETTINGS_KEY, settings);

export function loadSoloBest(): number {
  const value = read(SOLO_BEST_KEY);
  return typeof value === 'number' ? value : 0;
}
export const saveSoloBest = (points: number): void => write(SOLO_BEST_KEY, points);
