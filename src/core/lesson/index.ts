/**
 * Die Lernrunde: ein Spiel gegen Weishaupt nach festem Drehbuch (script.ts). Der Spielstand ist ein ganz normaler –
 * nur Karten und Reihenfolge sind vorbereitet. Wo das Drehbuch gerade steht, lässt sich aus dem Protokoll ablesen:
 * Jeder gespielte Zug rückt es einen Schritt weiter. Nach dem letzten Zug geht das Spiel frei weiter.
 */
import type { CpuPlayer } from '../ai';
import { type Card, createDeck, type Rng, shuffle } from '../cards';
import { type GameState, type Move, newGame, playerAt } from '../game';
import {
  type Expected,
  LESSON,
  LESSON_SETTINGS,
  LESSON_SETUP,
  type LessonTurn,
  OPPONENT,
  type YourTurn,
} from './script';

export * from './script';

/** Ein neues Spiel der Lernrunde: du beginnst, die Stapel sind angespielt, die ersten Karten zum Nachziehen liegen fest. */
export function lessonGame(rng: Rng = Math.random): GameState {
  const game = newGame(LESSON_SETTINGS, rng);
  const { piles, hands, draws } = LESSON_SETUP;
  const placed = new Set([...piles.flat(), ...hands.flat(), ...draws].map((card) => card.id));
  const rest = shuffle(
    createDeck().filter((card) => !placed.has(card.id)),
    rng,
  );
  game.piles = piles.map((pile) => [...pile]);
  hands.forEach((hand, index) => {
    playerAt(game, index).hand = [...hand];
  });
  // gezogen wird vom Ende – die erste Karte zum Nachziehen liegt also ganz hinten
  game.deck = [...rest, ...[...draws].reverse()];
  playerAt(game, 1).name = OPPONENT;
  game.current = 0;
  // die Stapel sind schon angespielt – der übliche Satz „die vier Stapel sind leer“ passt hier nicht
  game.log = [{ kind: 'begins', player: 0 }];
  return game;
}

/** Wie viele Züge (Beweise und Abwürfe) schon gespielt sind. */
export const movesPlayed = (game: GameState): number =>
  game.log.filter((entry) => entry.kind === 'proof' || entry.kind === 'discard').length;

/** Der Zug, bei dem das Drehbuch steht – null, sobald es durchgespielt ist. */
export const lessonTurn = (game: GameState): LessonTurn | null => LESSON[movesPlayed(game)] ?? null;

/** Der Zug, der gerade abgespielt wird (bzw. zuletzt gespielt wurde). */
export const previousTurn = (game: GameState): LessonTurn | null => LESSON[movesPlayed(game) - 1] ?? null;

/** Deine Züge im Drehbuch – für „Zug 2 von 4“. */
export const YOUR_TURNS = LESSON.filter((turn) => turn.who === 'you').length;

/** Der wievielte eigene Zug gerade dran ist (ab 1); nach dem Drehbuch alle. */
export function yourTurnNumber(game: GameState): number {
  return LESSON.slice(0, movesPlayed(game) + 1).filter((turn) => turn.who === 'you').length;
}

/** Weishaupt spielt, was das Drehbuch vorsieht – danach (und außerhalb des Drehbuchs) wie der normale Computer. */
export function scriptedOpponent(fallback: CpuPlayer): CpuPlayer {
  return (state, rng) => {
    const turn = lessonTurn(state);
    return turn?.who === 'opponent' ? turn.move : fallback(state, rng);
  };
}

/** Ein Einwand gegen einen eigenen Zug: was unter dem Knopf steht und welche Karten markiert werden. */
export interface Objection {
  message: string;
  cards: number[];
}

/**
 * Prüft einen eigenen Zug gegen das Drehbuch: null, wenn er passt (oder das Drehbuch durch ist), sonst ein Einwand.
 * `hintTaken`: In diesem Zug wurde schon ein Tipp geholt.
 */
export function reviewLessonMove(game: GameState, move: Move, hintTaken: boolean): Objection | null {
  const turn = lessonTurn(game);
  if (turn?.who !== 'you') return null;
  if (turn.hint && !hintTaken) return { message: turn.hint.first, cards: [] };
  if (matches(turn.expected, move)) return null;
  return { message: turn.help, cards: turn.pointOut ? expectedCards(turn).map((card) => card.id) : [] };
}

/** Dieselben Karten wie vorgesehen – welche einer Farbe oben landet, darf man frei wählen. */
function matches(expected: Expected, move: Move): boolean {
  if (expected.type === 'discard') return move.type === 'discard' && move.cardId === expected.card.id;
  if (move.type !== 'proof') return false;
  const ids = new Set(move.cardIds);
  return ids.size === expected.cards.length && expected.cards.every((card) => ids.has(card.id));
}

export function expectedCards(turn: YourTurn): Card[] {
  return turn.expected.type === 'proof' ? turn.expected.cards : [turn.expected.card];
}
