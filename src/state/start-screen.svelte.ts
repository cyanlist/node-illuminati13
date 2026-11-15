/**
 * Welche Ebene die Startseite zeigt: erst die Spielart (`modes`), dann das Einrichten der gewählten Spielart
 * (`setup`). Wer ein Spiel startet, kommt danach wieder auf die erste Ebene zurück – außer über „Andere
 * Einstellungen“ am Spielende, das direkt zum Einrichten führt.
 */
import { goHome } from './flow';

export type StartStep = 'modes' | 'setup';

class StartScreen {
  step = $state<StartStep>('modes');
}

export const startScreen = new StartScreen();

/** Vom Tisch direkt zum Einrichten der Spielart, die gerade gespielt wurde. */
export function openSetup(): void {
  goHome();
  startScreen.step = 'setup';
}
