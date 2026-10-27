import { describe, expect, it } from 'vitest';
import { canTakeHint, type GameState, HINT_COST, newGame, takeHint } from '../src/core/game';
import type { Settings } from '../src/core/settings';
import { card, seededRng, settings } from './helpers';

/** Solo-Spiel mit der Hand aus dem Beispiel der Anleitung, in der es eine 13 aus drei Karten gibt. */
function hintGame(overrides: Partial<Settings> = {}): GameState {
  const game = newGame(settings({ mode: 'solo', ...overrides }), seededRng(3));
  game.piles = [[card(0, 4)], [card(1, 2)], [card(2, 10)], [card(3, 6)]];
  const [player] = game.players;
  if (player) player.hand = [card(0, 5), card(1, 7), card(3, 3), card(3, 8), card(2, 13)];
  return game;
}

describe('Tipp', () => {
  it('findet die größte 13er-Kombination, ohne Kosten nichts abzuziehen', () => {
    const game = hintGame({ hints: 'full', hintCost: false });
    const combo = takeHint(game, seededRng(1));
    expect(combo?.length).toBe(3);
    expect(game.players[0]?.points).toBe(0);
    expect(game.log.some((entry) => entry.kind === 'hint')).toBe(false);
  });

  it('kostet mit eingeschalteten Kosten einen Punkt und steht im Protokoll', () => {
    const game = hintGame({ hintCost: true });
    const [player] = game.players;
    if (player) player.points = 4;
    takeHint(game);
    expect(player?.points).toBe(4 - HINT_COST);
    expect(game.log.at(-1)).toEqual({ kind: 'hint', player: 0, cost: HINT_COST });
  });

  it('geht mit Kosten nicht ins Minus', () => {
    const game = hintGame({ hintCost: true });
    expect(canTakeHint(game)).toBe(false);
    expect(() => takeHint(game)).toThrow();
    expect(game.players[0]?.points).toBe(0);
  });

  it('gibt es nicht, wenn Tipps ausgeschaltet sind', () => {
    const game = hintGame({ hints: 'off' });
    expect(canTakeHint(game)).toBe(false);
    expect(() => takeHint(game)).toThrow();
  });

  it('meldet null, wenn sich keine 13 bilden lässt', () => {
    const game = hintGame();
    const [player] = game.players;
    if (player) player.hand = [card(0, 1), card(0, 2)];
    game.piles = [[], [], [], []];
    expect(takeHint(game)).toBeNull();
  });
});
