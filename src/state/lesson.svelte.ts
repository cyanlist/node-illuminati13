/**
 * Die Lernrunde am Tisch: Sie begleitet das Spiel als `Guide` (flow.ts) – Weishaupt spielt nach Drehbuch, eigene Züge
 * werden geprüft, und vor manchen Zügen wartet der Tisch, bis man die Erklärung gelesen hat. Was in der Erklärzeile
 * steht, liefert `coach()` (Coach.svelte zeigt es an).
 */
import { chooseCpuMove } from '../core/ai';
import type { GameState } from '../core/game';
import {
  type Focus,
  LESSON_END,
  type Line,
  lessonGame,
  lessonTurn,
  previousTurn,
  reviewLessonMove,
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
  /** Nach dem Drehbuch frei weitergespielt – die Erklärzeile verschwindet */
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

/** Was die Erklärzeile gerade zeigt. */
export interface Coach {
  line: Line;
  focus: Focus | null;
  /** Der wievielte eigene Zug (ab 1) und wie viele es gibt */
  step: number;
  steps: number;
  /** „Weiter“ vor dem Zug, am Ende die Wahl, wie es weitergeht */
  action: 'next' | 'end' | null;
}

export function coach(game: GameState): Coach {
  const view = { step: yourTurnNumber(game), steps: YOUR_TURNS };
  // während ein Zug abgespielt wird, kommentiert die Zeile ihn
  if (table.anim) {
    const played = previousTurn(game);
    const line = played?.who === 'you' ? played.done : (played?.line ?? []);
    return { ...view, line, focus: null, action: null };
  }
  const turn = lessonTurn(game);
  if (!turn) return { ...view, line: LESSON_END, focus: null, action: 'end' };
  if (turn.who === 'opponent') return { ...view, line: turn.line, focus: null, action: null };
  const page = table.paused ? turn.pages[lesson.page] : undefined;
  if (page) return { ...view, line: page.line, focus: page.focus ?? null, action: 'next' };
  if (table.phase === 'order' && turn.order) return { ...view, line: turn.order, focus: null, action: null };
  const task = turn.hint && table.hintCombo !== null ? turn.hint.next : turn.task;
  return { ...view, line: task.line, focus: task.focus ?? null, action: null };
}
