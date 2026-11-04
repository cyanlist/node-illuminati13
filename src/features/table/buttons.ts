/**
 * Beschriftung und Zustand der beiden Knöpfe unter der Hand: Ablegen und Tipp.
 */
import { canTakeHint, HINT_COST, lastTurnPlayers, rulesetFor } from '../../core/game';
import { judgeSelection } from '../../state/selection';
import { table } from '../../state/table.svelte';
import { num, pts } from '../../ui/format';

export interface MainButton {
  label: string;
  disabled: boolean;
  /** Die Auswahl ergibt 13 – der Knopf wird grün */
  win: boolean;
}

/**
 * Der eine Ablegen-Knopf: grau ohne Auswahl, sonst „13 beweisen“, „Karte abwerfen“ oder die Summe als Hinweis.
 * In der letzten Runde steht dazu „letzter Zug“ – außer beim grünen „13 beweisen“, das soll kurz bleiben.
 */
export function mainButton(): MainButton {
  const game = table.game;
  const last = game !== null && lastTurnPlayers(game).includes(game.current) ? ' · letzter Zug' : '';
  const selection = judgeSelection();
  if (selection.kind === 'none') return { label: `Ablegen${last}`, disabled: true, win: false };
  // ohne angezeigte Werte verrät der Knopf nichts – entschieden wird erst beim Drücken
  if (!game?.settings.showValues) return { label: `Ablegen${last}`, disabled: false, win: false };
  switch (selection.kind) {
    case 'proof':
      return { label: `13 beweisen · +${pts(selection.cards.length)}`, disabled: false, win: true };
    case 'discard':
      return { label: `Karte abwerfen${last}`, disabled: false, win: false };
    case 'invalid':
      return { label: `Ergibt ${num(selection.sum)}, keine 13`, disabled: true, win: false };
  }
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
  if (!game || !rulesetFor(game.settings).hint) return { hidden: true, label: 'Tipp', disabled: true };
  // schon bezahlt: derselbe Tipp noch einmal, ohne Kosten
  if (table.hintCombo !== null || !game.settings.hintCost)
    return { hidden: false, label: 'Tipp', disabled: false };
  const affordable = canTakeHint(game);
  return {
    hidden: false,
    label: `Tipp · −${pts(HINT_COST)}`,
    disabled: !affordable,
    title: affordable ? undefined : 'Ein Tipp kostet einen Punkt – sammle erst einen.',
  };
}
