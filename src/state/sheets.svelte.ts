/**
 * Fenster, die man selbst öffnet und schließt: Regeln, Protokoll und Einstellungen – dazu, ob das
 * Ergebnisfenster weggeklickt ist. Alle anderen Fenster folgen dem Spielablauf (`table.phase`) oder der
 * Verbindung (`online.sheetOpen`).
 */
class SheetState {
  rulesOpen = $state(false);
  /** Protokoll als Fenster – auf schmalen Bildschirmen, wo es nicht neben dem Tisch steht */
  logOpen = $state(false);
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
