/**
 * Fenster, die man selbst öffnet und schließt: Regeln, Protokoll und Einstellungen – dazu, ob das
 * Ergebnisfenster weggeklickt ist. Alle anderen Fenster folgen dem Spielablauf (`table.phase`) oder der
 * Verbindung (`online.sheetOpen`).
 */
import { loadLogPanel, saveLogPanel } from '../storage';

class SheetState {
  rulesOpen = $state(false);
  /** Protokoll als Fenster – auf schmalen Bildschirmen */
  logOpen = $state(false);
  /** Protokoll als Seitenleiste über dem Tisch – auf breiten Bildschirmen; bleibt über Spiele hinweg gemerkt */
  logPanel = $state(loadLogPanel());
  /** Einstellungen dieses Geräts (Kartendesign, Farbschema) */
  settingsOpen = $state(false);
  /** Ergebnisfenster ausgeblendet – als Gast an zwei Geräten, solange die Gastgeber*in neu mischt */
  resultsHidden = $state(false);
}

export const sheets = new SheetState();

/** Beim Wechsel zwischen Startseite und Tisch: Regeln und Protokoll schließen. */
export function closeSheets(): void {
  sheets.rulesOpen = false;
  sheets.logOpen = false;
}

/** Ab dieser Breite klappt das Protokoll als Seitenleiste auf statt als Fenster */
const WIDE = '(min-width: 980px)';

/** Der Protokoll-Knopf: auf breiten Bildschirmen die Seitenleiste auf- und zuklappen, sonst das Fenster öffnen. */
export function toggleLog(): void {
  if (!window.matchMedia(WIDE).matches) {
    sheets.logOpen = true;
    return;
  }
  setLogPanel(!sheets.logPanel);
}

export function setLogPanel(open: boolean): void {
  sheets.logPanel = open;
  saveLogPanel(open);
}
