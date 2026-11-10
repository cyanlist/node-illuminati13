/**
 * Die Lernrunde am Tisch: Sie begleitet das Spiel als `Guide` (flow.ts) – Weishaupt spielt nach Drehbuch, eigene Züge
 * werden geprüft, und vor manchen Zügen wartet der Tisch, bis man die Erklärung gelesen hat. Was in der Sprechblase
 * steht und wohin die Sprechblase zeigt, liefert `coach()` (LessonOverlay.svelte zeigt es an).
 */
import { chooseCpuMove } from '../core/ai';
import type { SuitIndex } from '../core/cards';
import type { GameState } from '../core/game';
import {
  type Focus,
  LESSON_END,
  type Line,
  lessonGame,
  lessonTurn,
  previousTurn,
  reviewLessonMove,
  type SuitFocus,
  scriptedOpponent,
  YOUR_TURNS,
  yourTurnNumber,
} from '../core/lesson';
import { enterGame, type Guide, scheduleCpu } from './flow';
import { table } from './table.svelte';

class LessonState {
  /** Das Spiel der Lernrunde – nur solange es am Tisch liegt, erklärt der Tisch mit */
  game = $state.raw<GameState | null>(null);
  /** Welche Erklärung vor dem aktuellen Zug gerade dasteht */
  page = $state(0);
  /** Nach dem Drehbuch frei weitergespielt – Sprechblase und Grauschleier verschwinden */
  free = $state(false);

  get active(): boolean {
    return this.game !== null && this.game === table.game && !this.free;
  }
}

export const lesson = new LessonState();

const guide: Guide = {
  opponent: scriptedOpponent(chooseCpuMove),
  review: (game, move) => reviewLessonMove(game, move, table.hintCombo !== null),
  turnBegins(game) {
    lesson.page = 0;
    const turn = lessonTurn(game);
    if (turn?.who === 'you' && turn.showValues !== undefined) game.settings.showValues = turn.showValues;
    // vor dem Zug erst die Erklärungen lesen – und nach dem Drehbuch warten, bis man weiterspielen will
    table.paused = turn === null ? !lesson.free : turn.who === 'you' && turn.pages.length > 0;
  },
};

export function startLesson(): void {
  lesson.free = false;
  enterGame(lessonGame(), 0, guide);
  lesson.game = table.game;
}

/** „Weiter“: die nächste Erklärung – nach der letzten ist man am Zug. */
export function nextPage(): void {
  const turn = table.game ? lessonTurn(table.game) : null;
  lesson.page++;
  if (turn?.who !== 'you' || lesson.page >= turn.pages.length) table.paused = false;
}

/** Nach dem Drehbuch: gegen Weishaupt weiterspielen, der jetzt wie der Computer (leicht) spielt. */
export function playOn(): void {
  lesson.free = true;
  table.paused = false;
  if (table.phase === 'cpu') scheduleCpu();
}

/**
 * Bereiche am Tisch, auf die die Sprechblase zeigen kann: die Ziele aus dem Drehbuch und dazu das Board, der eigene
 * Platz, die Knöpfe unter der Hand und eine Spalte des Boards (Regel und Stapel einer Farbe).
 */
export type Target = Focus | 'board' | 'you' | 'actions' | `column-${SuitIndex}`;

/**
 * Wo die Sprechblase steht: in der Mitte, über einem Bereich, der gerade nicht gebraucht wird (`over`), oder neben
 * ihrem Ziel mit einem Pfeil darauf (`beside`, bevorzugt darüber oder darunter).
 */
export type Placement =
  | { kind: 'center' }
  | { kind: 'over'; target: Target }
  | { kind: 'beside'; target: Target; prefer: 'above' | 'below' };

/** Wie stark der Rest des Tisches abgedunkelt wird. */
export type Dim = 'none' | 'light' | 'strong';

/** Was die Lernrunde gerade zeigt. */
export interface Coach {
  line: Line;
  place: Placement;
  dim: Dim;
  /** Bereiche, die vom Grauschleier frei bleiben */
  free: Target[];
  /** Das, worum es geht – mit einem pulsierenden Rahmen */
  focus: Focus | null;
  /** Der wievielte eigene Zug (ab 1) und wie viele es gibt */
  step: number;
  steps: number;
  /** „Weiter“ vor dem Zug, am Ende die Wahl, wie es weitergeht */
  action: 'next' | 'end' | null;
}

/**
 * Bei einer Erklärung: was vom Grauschleier frei bleibt und wo die Blase steht – neben dem Ziel, dort, wo sie nichts
 * verdeckt, was der Satz braucht. Die Regeln rechnen mit den Stapeln darunter, also bleiben beide frei; was ein
 * Stapel verändert, sieht man an der Hand. Bei einer einzelnen Farbe zeigt die Blase auf ihre Spalte; frei bleiben
 * Regel, Stapel und die Handkarten dieser Farbe.
 */
function explain(focus: Focus): { free: Target[]; place: Placement } {
  const beside = (target: Target, prefer: 'above' | 'below'): Placement => ({
    kind: 'beside',
    target,
    prefer,
  });
  switch (focus) {
    case 'rules':
      return { free: ['rules', 'piles'], place: beside('board', 'above') };
    case 'hand':
      return { free: ['hand'], place: beside('hand', 'above') };
    case 'piles':
      return { free: ['piles', 'hand'], place: beside('board', 'above') };
    case 'hint':
      return { free: ['hint'], place: beside('hint', 'above') };
    case 'opponent':
      return { free: ['opponent'], place: beside('opponent', 'below') };
    default:
      return { free: [focus], place: beside(`column-${suitOf(focus)}`, 'above') };
  }
}

const suitOf = (focus: SuitFocus): SuitIndex => Number(focus.slice('suit-'.length)) as SuitIndex;

/** Während man selbst wählt, bleiben Hand, Knöpfe und Stapel frei – womit die Karten rechnen, muss man sehen. */
const WHILE_YOU_PLAY: Target[] = ['hand', 'actions', 'board'];

export function coach(game: GameState): Coach {
  const base = { step: yourTurnNumber(game), steps: YOUR_TURNS, focus: null, action: null };
  // was gerade abgespielt wird, soll man ungestört sehen: Die Blase liegt über dem Platz, der gerade nichts zu tun hat
  if (table.anim) {
    const played = previousTurn(game);
    if (played?.who === 'you')
      return { ...base, line: played.done, place: over('opponent'), dim: 'none', free: [] };
    return { ...base, line: played?.line ?? [], place: over('you'), dim: 'none', free: [] };
  }
  const turn = lessonTurn(game);
  if (!turn)
    return { ...base, line: LESSON_END, place: { kind: 'center' }, dim: 'strong', free: [], action: 'end' };
  if (turn.who === 'opponent') return { ...base, line: turn.line, place: over('you'), dim: 'none', free: [] };
  const page = table.paused ? turn.pages[lesson.page] : undefined;
  if (page) {
    const explained = page.focus ? explain(page.focus) : { free: [], place: { kind: 'center' } as const };
    return {
      ...base,
      line: page.line,
      place: explained.place,
      dim: 'strong',
      free: explained.free,
      focus: page.focus ?? null,
      action: 'next',
    };
  }
  if (table.phase === 'order' && turn.order)
    return { ...base, line: turn.order, place: over('opponent'), dim: 'none', free: [] };
  const task = turn.hint && table.hintCombo !== null ? turn.hint.next : turn.task;
  return {
    ...base,
    line: task.line,
    place: over('opponent'),
    dim: 'light',
    free: WHILE_YOU_PLAY,
    focus: task.focus ?? null,
  };
}

const over = (target: Target): Placement => ({ kind: 'over', target });
