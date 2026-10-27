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
