/**
 * Was das Ergebnis eines Spiels aussagt – einmal ausgerechnet für das Ergebnisfenster und für das Bild, das man
 * davon teilt (result-image.ts): Überschrift und Satz, wer gewinnt, der Verlauf mit einem Satz dazu, allein der
 * Vergleich mit dem Bestwert und womit gespielt wurde (Stapelregeln vom Spielbeginn, Varianten).
 */
import { SUIT_INDICES, type SuitIndex } from '../../../core/cards';
import {
  type GameState,
  leadStory,
  type Player,
  ranking,
  rulesAtStart,
  rulesetFor,
  scoreHistory,
} from '../../../core/game';
import { RULES } from '../../../core/rules';
import { inTurns, pts, turnCount } from '../../../ui/format';
import { variantNames } from '../../start/summaries';
import { storyLine } from './story';

/** Wo das Spiel öffentlich liegt – auch wenn gerade im Claude-Artifact oder lokal gespielt wird */
export const PUBLIC_URL = 'https://cyanlist.github.io/node-illuminati13/';

/** Allein: heute neben dem bisherigen Bestwert */
export interface Comparison {
  today: number;
  best: number;
  /** „Punkte“ oder „Züge“ */
  unit: string;
  /** Mit Punkteziel zählen die Züge – weniger ist besser */
  fewerIsBetter: boolean;
}

export interface ResultSummary {
  solo: boolean;
  tie: boolean;
  /** In der Reihenfolge der Wertung – wer gewinnt, zuerst */
  order: Player[];
  /** Platz derjenigen, die gewinnt (für den Verlauf); -1 ohne Spieler*innen */
  winnerIndex: number;
  title: string;
  subtitle: string;
  /** Punkte aller nach jedem Zug, in der Reihenfolge der Plätze */
  history: number[][];
  /** Der Satz über dem Verlauf */
  caption: string;
  goal: number | null;
  comparison: Comparison | null;
  /** Stapelregeln, wie sie zu Spielbeginn galten, in Kurzform („S + H“) */
  rules: { suit: SuitIndex; short: string }[];
  /** Eingeschaltete Varianten, z. B. „Weltordnung nach rechts“ */
  variants: string[];
}

/** `soloBest`: der bisherige Bestwert allein (0: noch keiner) */
export function summarize(game: GameState, soloBest: number): ResultSummary {
  const result = ranking(game);
  const solo = game.players.length === 1;
  const winner = result.order[0];
  const winnerIndex = winner ? game.players.indexOf(winner) : -1;
  const { ending } = rulesetFor(game.settings);
  const goal = ending.goal;
  // allein: Punkte oder mit Punkteziel die Züge; null, wenn das Ziel nicht erreicht wurde
  const score = ending.soloScore(game);
  const history = scoreHistory(game);
  const startRules = rulesAtStart(game);

  let title = '';
  let subtitle = '';
  let comparison: Comparison | null = null;
  if (winner && solo && goal !== null) {
    title = score !== null ? `${goal} Punkte ${inTurns(score)}` : pts(winner.points);
    const record = soloBest === 0 ? '' : ` Dein Bestwert: ${goal} Punkte ${inTurns(soloBest)}.`;
    if (score === null) subtitle = `Der Stapel war leer, bevor du ${goal} Punkte hattest.${record}`;
    else if (soloBest === 0) subtitle = `Du hast die 13 ${winner.combos}-mal gefunden.`;
    else
      subtitle = ending.beatsBest(score, soloBest)
        ? `Neuer Bestwert! Bisher waren es ${turnCount(soloBest)}.`
        : record.trim();
    if (score !== null && soloBest > 0)
      comparison = { today: score, best: soloBest, unit: 'Züge', fewerIsBetter: true };
  } else if (winner && solo) {
    title = pts(winner.points);
    const found = `Du hast die 13 ${winner.combos}-mal gefunden.`;
    if (soloBest === 0) subtitle = found;
    else
      subtitle = ending.beatsBest(winner.points, soloBest)
        ? `${found} Neuer Bestwert! Bisher waren es ${soloBest}.`
        : `${found} Dein Bestwert: ${soloBest}.`;
    if (soloBest > 0)
      comparison = { today: winner.points, best: soloBest, unit: 'Punkte', fewerIsBetter: false };
  } else if (winner) {
    title = result.tie ? 'Gleichstand' : winner.you ? 'Du gewinnst!' : `${winner.name} gewinnt!`;
    subtitle = result.tie
      ? 'Gleich viele Punkte und gleich viele 13er. Die Wahrheit bleibt geteilt.'
      : result.decidedByCombos
        ? 'Punktgleich, aber mit mehr gefundenen 13er-Kombinationen.'
        : 'Die Wahrheit wurde am klarsten bewiesen.';
  }

  return {
    solo,
    tie: result.tie,
    order: result.order,
    winnerIndex,
    title,
    subtitle,
    history,
    caption:
      solo || !winner
        ? 'Punkte nach jedem Zug'
        : storyLine(leadStory(history, winnerIndex), winner, winnerIndex, result.tie),
    goal,
    comparison,
    rules: SUIT_INDICES.map((suit) => ({ suit, short: RULES[startRules[suit] ?? 'plus'].short })),
    variants: variantNames(game.settings),
  };
}

/** Kurz unter das geteilte Bild: der Stand als Anzeigetafel und wo man selbst spielen kann. */
export function shareCaption(game: GameState): string {
  const [first, second] = ranking(game).order;
  const score = !first
    ? ''
    : !second
      ? `Allein: ${pts(first.points)}`
      : `${first.name} ${first.points} : ${second.points} ${second.name}`;
  return `Illuminati 13 – ${score}\nSelbst spielen: ${PUBLIC_URL}`;
}
