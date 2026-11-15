import { normalizeSettings, type Settings } from './core/settings';
import { type Deck, isDeck } from './ui/deck.svelte';
import { isTheme, type Theme } from './ui/theme.svelte';

// Gespeichert wird nur im Browser dieses Geräts. Ist der Speicher gesperrt (privates Fenster,
// Vorschau), läuft alles ohne ihn weiter.

const SETTINGS_KEY = 'illu13-settings';

const DECK_KEY = 'illu13-deck';
const THEME_KEY = 'illu13-theme';
const LOG_PANEL_KEY = 'illu13-log-panel';

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
/** Wurde auf diesem Gerät schon einmal ein Spiel gestartet? (Erst dann gibt es eine „zuletzt“ gespielte Spielart.) */
export const hasSavedSettings = (): boolean => read(SETTINGS_KEY) !== null;
export const saveSettings = (settings: Settings): void => write(SETTINGS_KEY, settings);

/** Bestwert allein – je Spielende unter eigenem Namen (`Ending.recordName`), z. B. illu13-best-solo-13 */
export function loadSoloBest(recordName: string): number {
  const value = read(`illu13-${recordName}`);
  return typeof value === 'number' ? value : 0;
}
export const saveSoloBest = (recordName: string, score: number): void => write(`illu13-${recordName}`, score);

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

/** Breite Bildschirme: Protokoll als Seitenleiste offen – wer es offen mag, findet es beim nächsten Spiel wieder offen. */
export const loadLogPanel = (): boolean => read(LOG_PANEL_KEY) === true;
export const saveLogPanel = (open: boolean): void => write(LOG_PANEL_KEY, open);
