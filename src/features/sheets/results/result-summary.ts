/**
 * Was das Ergebnis eines Spiels aussagt – einmal ausgerechnet für das Ergebnisfenster und für das Bild, das man
 * davon teilt (result-image.ts): Überschrift und Satz, wer gewinnt, der Verlauf mit einem Satz dazu, allein der
 * Vergleich mit dem Bestwert und womit gespielt wurde (Stapelregeln vom Spielbeginn, Varianten).
 */
import { SUIT_INDICES, type SuitIndex } from '../../../core/cards';
import {
  type Ending,
  type GameState,
  leadStory,
  type Player,
  type Ranking,
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
  const history = scoreHistory(game);
  const startRules = rulesAtStart(game);
  const { title, subtitle, comparison } = headline(game, result, ending, soloBest);

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

/** Überschrift, Satz darunter und – allein – der Vergleich mit dem Bestwert */
interface Headline {
  title: string;
  subtitle: string;
  comparison: Comparison | null;
}

function headline(game: GameState, result: Ranking, ending: Ending, soloBest: number): Headline {
  const winner = result.order[0];
  if (!winner) return { title: '', subtitle: '', comparison: null };
  if (game.players.length > 1) return duelHeadline(result, winner);
  if (ending.goal === null) return soloPointsHeadline(winner, ending, soloBest);
  return soloGoalHeadline(winner, ending, ending.goal, ending.soloScore(game), soloBest);
}

/** Zu zweit: wer gewinnt und wodurch – oder Gleichstand */
function duelHeadline(result: Ranking, winner: Player): Headline {
  if (result.tie)
    return {
      title: 'Gleichstand',
      subtitle: 'Gleich viele Punkte und gleich viele 13er. Die Wahrheit bleibt geteilt.',
      comparison: null,
    };
  return {
    title: winner.you ? 'Du gewinnst!' : `${winner.name} gewinnt!`,
    subtitle: result.decidedByCombos
      ? 'Punktgleich, aber mit mehr gefundenen 13er-Kombinationen.'
      : 'Die Wahrheit wurde am klarsten bewiesen.',
    comparison: null,
  };
}

/** Allein, ganzes Deck: die Punkte – mehr ist besser */
function soloPointsHeadline(player: Player, ending: Ending, best: number): Headline {
  const found = `Du hast die 13 ${player.combos}-mal gefunden.`;
  const title = pts(player.points);
  if (best === 0) return { title, subtitle: found, comparison: null };
  const subtitle = ending.beatsBest(player.points, best)
    ? `${found} Neuer Bestwert! Bisher waren es ${best}.`
    : `${found} Dein Bestwert: ${best}.`;
  return {
    title,
    subtitle,
    comparison: { today: player.points, best, unit: 'Punkte', fewerIsBetter: false },
  };
}

/** Allein mit Punkteziel: in wie vielen Zügen (`turns`; null, wenn das Ziel nicht erreicht wurde) – weniger ist besser */
function soloGoalHeadline(
  player: Player,
  ending: Ending,
  goal: number,
  turns: number | null,
  best: number,
): Headline {
  const record = best === 0 ? '' : `Dein Bestwert: ${goal} Punkte ${inTurns(best)}.`;
  if (turns === null)
    return {
      title: pts(player.points),
      subtitle: `Der Stapel war leer, bevor du ${goal} Punkte hattest. ${record}`.trim(),
      comparison: null,
    };
  const title = `${goal} Punkte ${inTurns(turns)}`;
  if (best === 0)
    return { title, subtitle: `Du hast die 13 ${player.combos}-mal gefunden.`, comparison: null };
  const subtitle = ending.beatsBest(turns, best)
    ? `Neuer Bestwert! Bisher waren es ${turnCount(best)}.`
    : record;
  return { title, subtitle, comparison: { today: turns, best, unit: 'Züge', fewerIsBetter: true } };
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
