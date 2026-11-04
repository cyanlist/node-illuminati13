/**
 * Die Tipp-Stufen: wie viel der Tipp-Knopf verrät – Verhalten und alle Texte an einer Stelle.
 * Neue Stufe: Wert in HINT_LEVELS (settings.ts) ergänzen und hier beschreiben.
 */
import { cardCount } from '../../cards';
import { HINT_LEVELS, type HintLevel } from '../../settings';
import type { HintReveal, HintStyle } from './types';

/** Tipps ausgeschaltet – kein Knopf; nur für das Tipps-Fenster und die Übersicht der Startseite. */
export const HINTS_OFF = {
  title: 'Aus',
  description: 'Kein Tipp-Knopf – du findest jede 13 selbst.',
} as const;

/** Was jede Stufe meldet, wenn die Hand keine 13 hergibt. */
export const NO_THIRTEEN: HintReveal = {
  message: 'Hier verbirgt sich keine 13. Wähle eine Karte zum Abwerfen.',
  highlight: [],
};

export const HINT_STYLES: Record<HintStyle['id'], HintStyle> = {
  exists: {
    id: 'exists',
    title: 'Ja oder nein',
    description: 'Verrät nur, ob es gerade eine 13 gibt.',
    rulesText: 'Der Tipp-Knopf verrät nur, ob es gerade eine 13 gibt – welche, findest du selbst heraus.',
    reveal: () => ({ message: 'Hier steckt eine 13.', highlight: [] }),
  },
  nudge: {
    id: 'nudge',
    title: 'Andeutung',
    description: 'Verrät, ob es eine 13 gibt und aus wie vielen Karten.',
    rulesText: 'Der Tipp-Knopf verrät, ob es gerade eine 13 gibt und aus wie vielen Karten.',
    reveal: (combo) => ({ message: `Hier steckt eine 13 aus ${cardCount(combo.length)}.`, highlight: [] }),
  },
  full: {
    id: 'full',
    title: 'Volle Hilfe',
    description: 'Markiert die Karten einer 13 – zum Lernen der Regeln.',
    rulesText: 'Der Tipp-Knopf markiert die Karten einer 13 – zum Lernen der Regeln.',
    reveal: (combo) => ({ message: '', highlight: [...combo] }),
  },
};

/** Die Stufe zu einer Einstellung; null, wenn Tipps ausgeschaltet sind. */
export const hintStyle = (level: HintLevel): HintStyle | null =>
  level === 'off' ? null : HINT_STYLES[level];

/** Titel und Beschreibung aller Stufen in der Reihenfolge der Einstellungen – für das Tipps-Fenster. */
export const HINT_CHOICES: { value: HintLevel; title: string; description: string }[] = HINT_LEVELS.map(
  (level) => {
    const { title, description } = hintStyle(level) ?? HINTS_OFF;
    return { value: level, title, description };
  },
);
