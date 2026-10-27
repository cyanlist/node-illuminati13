/**
 * Beschriftung und Zustand der beiden Knöpfe unter der Hand: Tipp und Ablegen.
 */
import { canTakeHint, HINT_COST } from '../core/game';
import { sumOfValues, TARGET } from '../core/values';
import { num, pts } from '../ui/format';
import { table } from './table.svelte';

export interface MainButton {
  label: string;
  disabled: boolean;
  /** Die Auswahl ergibt 13 – der Knopf wird grün */
  win: boolean;
}

/** Der eine Ablegen-Knopf: grau ohne Auswahl, sonst „13 beweisen“, „Karte abwerfen“ oder die Summe als Hinweis. */
export function mainButton(): MainButton {
  const game = table.game;
  const selected = table.selectedCards;
  if (!game || selected.length === 0) return { label: 'Ablegen', disabled: true, win: false };
  // ohne angezeigte Werte verrät der Knopf nichts – entschieden wird erst beim Drücken
  if (!game.settings.showValues) return { label: 'Ablegen', disabled: false, win: false };
  const sum = sumOfValues(selected, game.piles, game.rules);
  if (sum === TARGET) return { label: `13 beweisen · +${pts(selected.length)}`, disabled: false, win: true };
  if (selected.length === 1) return { label: 'Karte abwerfen', disabled: false, win: false };
  return { label: `Ergibt ${num(sum)}, keine 13`, disabled: true, win: false };
}

export interface HintButton {
  /** Tipps sind in den Einstellungen ausgeschaltet */
  hidden: boolean;
  label: string;
  disabled: boolean;
  /** Erklärung, warum der Knopf gesperrt ist */
  title?: string;
}

/** Der Tipp-Knopf: zeigt die Kosten, solange in diesem Zug noch kein Tipp bezahlt ist. */
export function hintButton(): HintButton {
  const game = table.game;
  if (!game || game.settings.hints === 'off') return { hidden: true, label: 'Tipp', disabled: true };
  // schon bezahlt: derselbe Tipp noch einmal, ohne Kosten
  if (table.hintTaken !== null || !game.settings.hintCost)
    return { hidden: false, label: 'Tipp', disabled: false };
  const affordable = canTakeHint(game);
  return {
    hidden: false,
    label: `Tipp · −${pts(HINT_COST)}`,
    disabled: !affordable,
    title: affordable ? undefined : 'Ein Tipp kostet einen Punkt – sammle erst einen.',
  };
}
