import { describe, expect, it } from 'vitest';
import { chooseCpuMove } from '../src/core/ai';
import type { Card } from '../src/core/cards';
import { findCombos } from '../src/core/combos';
import { applyMove, currentPlayer, finishTurn, type GameState, type Move } from '../src/core/game';
import {
  expectedCards,
  LESSON,
  LESSON_END,
  type Line,
  lessonGame,
  lessonTurn,
  reviewLessonMove,
  scriptedOpponent,
  YOUR_TURNS,
  type YourTurn,
  yourTurnNumber,
} from '../src/core/lesson';
import { seededRng } from './helpers';

const ids = (cards: readonly Card[]): number[] => cards.map((card) => card.id).sort((a, b) => a - b);

/** Der vorgesehene eigene Zug – bei mehreren Karten einer Farbe liegt `top` oben (sonst die zuletzt genannte). */
function yourMove(turn: YourTurn, top: 'first' | 'last'): Move {
  if (turn.expected.type === 'discard') return { type: 'discard', cardId: turn.expected.card.id };
  const cards = turn.expected.cards;
  const topPick: Record<number, number> = {};
  for (const card of top === 'first' ? [...cards].reverse() : cards) topPick[card.suit] = card.id;
  return { type: 'proof', cardIds: cards.map((card) => card.id), topPick };
}

/** Spielt das Drehbuch durch und prüft jeden eigenen Zug vorher. */
function playScript(game: GameState, top: 'first' | 'last'): void {
  const opponent = scriptedOpponent(chooseCpuMove);
  for (const turn of LESSON) {
    expect(lessonTurn(game)).toBe(turn);
    expect(game.current).toBe(turn.who === 'you' ? 0 : 1);
    if (turn.who === 'you') {
      const combos = findCombos(currentPlayer(game).hand, game.piles, game.rules).map(ids);
      // genau die vorgesehene 13 – oder gar keine, wenn abgeworfen werden soll
      expect(combos).toEqual(turn.expected.type === 'proof' ? [ids(expectedCards(turn))] : []);
      applyMove(game, yourMove(turn, top));
    } else applyMove(game, opponent(game));
    finishTurn(game);
  }
}

const words = (line: Line): string =>
  line.map((part) => (typeof part === 'string' ? part : `X ${part.rank}`)).join('');

describe('Lernrunde', () => {
  it('beginnt mit dir, angespielten Stapeln und allen 52 Karten', () => {
    const game = lessonGame(seededRng(1));
    const all = [...game.deck, ...game.piles.flat(), ...game.players.flatMap((p) => p.hand)];
    expect(new Set(all.map((card) => card.id)).size).toBe(52);
    expect(game.current).toBe(0);
    expect(game.players.map((p) => p.name)).toEqual(['Du', 'Weishaupt']);
    expect(game.piles.every((pile) => pile.length === 1)).toBe(true);
  });

  it.each(['first', 'last'] as const)(
    'geht in jedem Zug genau so auf, wie es das Drehbuch erklärt – Pik oben: %s',
    (top) => {
      const game = lessonGame(seededRng(2));
      playScript(game, top);
      expect(lessonTurn(game)).toBeNull();
      expect(game.over).toBe(false);
      expect(game.players.map((p) => p.points)).toEqual([2 + 3 + 2, 2]);
      expect(yourTurnNumber(game)).toBe(YOUR_TURNS);
    },
  );

  it('nimmt nur den vorgesehenen Zug an und verlangt vorher den Tipp, wo er dran ist', () => {
    const game = lessonGame(seededRng(3));
    const [first] = LESSON as [YourTurn];
    expect(reviewLessonMove(game, yourMove(first, 'last'), false)).toBeNull();
    const wrong = reviewLessonMove(
      game,
      { type: 'discard', cardId: currentPlayer(game).hand[2]?.id ?? -1 },
      false,
    );
    expect(wrong?.cards).toEqual(ids(expectedCards(first)));

    // bis zum Tipp-Zug spielen
    const opponent = scriptedOpponent(chooseCpuMove);
    while (lessonTurn(game)?.who !== 'you' || !(lessonTurn(game) as YourTurn).hint) {
      const turn = lessonTurn(game);
      applyMove(game, turn?.who === 'you' ? yourMove(turn, 'last') : opponent(game));
      finishTurn(game);
    }
    const hintTurn = lessonTurn(game) as YourTurn;
    const move = yourMove(hintTurn, 'last');
    expect(reviewLessonMove(game, move, false)?.message).toBe(hintTurn.hint?.first);
    expect(reviewLessonMove(game, move, true)).toBeNull();
  });

  it('lässt nach dem Drehbuch alles zu und Weishaupt spielt wie der Computer weiter', () => {
    const game = lessonGame(seededRng(4));
    playScript(game, 'last');
    const discard: Move = { type: 'discard', cardId: currentPlayer(game).hand[0]?.id ?? -1 };
    expect(reviewLessonMove(game, discard, false)).toBeNull();
    const move = scriptedOpponent(() => discard)(game);
    expect(move).toBe(discard);
  });

  it('hält jeden Satz kurz genug für drei Zeilen auf dem Handy', () => {
    const lines: Line[] = [LESSON_END];
    for (const turn of LESSON) {
      if (turn.who === 'opponent') lines.push(turn.line);
      else {
        lines.push(...turn.pages.map((page) => page.line), turn.task.line, turn.done);
        if (turn.order) lines.push(turn.order);
        if (turn.hint) lines.push(turn.hint.next.line);
      }
    }
    for (const line of lines) expect(words(line).length, words(line)).toBeLessThanOrEqual(125);
  });
});
