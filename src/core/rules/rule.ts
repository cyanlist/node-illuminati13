/**
 * Eine Illuminati-Regel: wie eine Handkarte mit der obersten Karte ihres Stapels verrechnet wird.
 * Jede Regel liegt in einer eigenen Datei in diesem Ordner und wird in `registry.ts` eingetragen.
 */
export interface Rule {
  /** Beschriftung über dem Stapel */
  label: string;
  /** Kurzform für schmale Bildschirme */
  short: string;
  /** Der Rechenweg ist schon der Wert selbst (z. B. „Hand kopiert Stapel“) */
  direct?: boolean;
  calc(stack: number, hand: number): number;
  /** Rechenweg ohne Ergebnis, z. B. „4 + 5“ */
  show(stack: number, hand: number): string;
}

/** Gibt die Regel unverändert zurück – sorgt nur dafür, dass jede Regeldatei typgeprüft ist. */
export const defineRule = (rule: Rule): Rule => rule;
