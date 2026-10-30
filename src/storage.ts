import { normalizeSettings, type Settings } from './core/settings';
import { type Deck, isDeck } from './ui/deck.svelte';
import { isTheme, type Theme } from './ui/theme.svelte';

// Gespeichert wird nur im Browser dieses Geräts. Ist der Speicher gesperrt (privates Fenster,
// Vorschau), läuft alles ohne ihn weiter.

const SETTINGS_KEY = 'illu13-settings';
const SOLO_BEST_KEY = 'illu13-best-solo';
const DECK_KEY = 'illu13-deck';
const THEME_KEY = 'illu13-theme';

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

/** Kartendesign dieses Geräts – getrennt von den Spieleinstellungen, die an zwei Geräten mitreisen. */
export function loadDeck(): Deck {
  const value = read(DECK_KEY);
  return isDeck(value) ? value : 'classic';
}
export const saveDeck = (deck: Deck): void => write(DECK_KEY, deck);

/** Farbschema dieses Geräts. */
export function loadTheme(): Theme {
  const value = read(THEME_KEY);
  return isTheme(value) ? value : 'auto';
}
export const saveTheme = (theme: Theme): void => write(THEME_KEY, theme);
