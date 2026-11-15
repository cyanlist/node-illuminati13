import { describe, expect, it } from 'vitest';
import { newGame, type Player, rulesAtStart, scoreHistory } from '../src/core/game';
import { rotateRules } from '../src/core/rules';
import { PUBLIC_URL, shareCaption, summarize } from '../src/features/sheets/results/result-summary';
import { playOut, seededRng, settings } from './helpers';

describe('Verlauf', () => {
  it('endet bei den Punkten, die alle am Schluss haben – auch mit bezahlten Tipps', () => {
    const game = newGame(settings({ hints: 'exists', hintCost: true }), seededRng(3));
    playOut(game, seededRng(4));
    // einen bezahlten Tipp ins Protokoll schreiben, so wie takeHint es tut
    game.log.splice(3, 0, { kind: 'hint', player: 0, cost: 1 });
    (game.players[0] as Player).points -= 1;
    const history = scoreHistory(game);
    expect(history[0]).toEqual([0, 0]);
    expect(history.at(-1)).toEqual(game.players.map((p) => p.points));
    const moves = game.log.filter(
      (e) => e.kind === 'proof' || e.kind === 'discard' || e.kind === 'skip',
    ).length;
    expect(history).toHaveLength(moves + 1);
  });
});

describe('Was das Ergebnis zeigt und teilt', () => {
  it('nennt, wer gewinnt, die Stapelregeln vom Spielbeginn und die Varianten', () => {
    const game = newGame(
      settings({ variant: true, dir: 'rechts', truth: true, truthGoal: 33 }),
      seededRng(5),
    );
    const start = [...game.rules];
    // zwei Verschiebungen der Weltordnung im Lauf des Spiels
    game.rules = rotateRules(rotateRules(game.rules, 'rechts'), 'rechts');
    game.rotations = 2;
    expect(rulesAtStart(game)).toEqual(start);

    const [a, b] = game.players as [Player, Player];
    a.name = 'Anna';
    a.you = false;
    a.points = 24;
    a.combos = 7;
    b.name = 'Ben';
    b.points = 19;
    b.combos = 6;
    const summary = summarize(game, 0);
    expect(summary.title).toBe('Anna gewinnt!');
    expect(summary.order.map((p) => p.name)).toEqual(['Anna', 'Ben']);
    expect(summary.rules.map((r) => r.suit)).toEqual([0, 1, 2, 3]);
    expect(summary.rules).toHaveLength(4);
    expect(summary.variants).toEqual(['Wahre Wahrheit – bis 33 Punkte', 'Weltordnung nach rechts']);
    expect(summary.goal).toBe(33);
    expect(shareCaption(game)).toBe(`Illuminati 13 – Anna 24 : 19 Ben
Selbst spielen: ${PUBLIC_URL}`);
  });

  it('vergleicht allein mit dem Bestwert – erst, wenn es einen gibt', () => {
    const game = newGame(settings({ mode: 'solo' }), seededRng(6));
    (game.players[0] as Player).points = 31;
    (game.players[0] as Player).combos = 9;
    expect(summarize(game, 0).comparison).toBeNull();
    const summary = summarize(game, 34);
    expect(summary.title).toBe('31 Punkte');
    expect(summary.comparison).toEqual({ today: 31, best: 34, unit: 'Punkte', fewerIsBetter: false });
    expect(summary.variants).toEqual([]);
    expect(summary.rules.map((r) => r.short)).toEqual(['S + H', 'S − H', '= Stapel', 'max(S, H)']);
    expect(shareCaption(game)).toContain('Allein: 31 Punkte');
  });
});
