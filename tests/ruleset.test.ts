import { describe, expect, it } from 'vitest';
import { chooseCpuMove } from '../src/core/ai';
import { createDeck, MAX_RANK } from '../src/core/cards';
import {
  applyMove,
  finishTurn,
  firstTo,
  fullDeck,
  type GameState,
  HINT_CHOICES,
  HINT_STYLES,
  MAX_RESHUFFLES,
  NO_THIRTEEN,
  newGame,
  noEffect,
  reshuffle,
  rulesetFor,
  stopWhenEmpty,
  turnsTaken,
  worldOrder,
} from '../src/core/game';
import { CLASSIC_RULES, rotateRules } from '../src/core/rules';
import { HINT_LEVELS } from '../src/core/settings';
import { card, playOut, seededRng, settings } from './helpers';

/** Das kurze Punkteziel – früher eine eigene Variante „Bis 13“ */
const SHORT_GOAL = 13;

const cardsInPlay = (game: GameState): number =>
  game.deck.length + game.piles.flat().length + game.players.reduce((n, p) => n + p.hand.length, 0);

/** Zu zweit, Person 0 hat begonnen; Person `scorer` hat gerade ihren Zug beendet und `points` Punkte. */
function scoredGame(scorer: number, points: number): GameState {
  const game = newGame(settings({ mode: 'hotseat' }), seededRng(3));
  game.log = [{ kind: 'intro' }, { kind: 'begins', player: 0 }];
  game.current = scorer;
  const player = game.players[scorer];
  if (player) player.points = points;
  return game;
}

describe('Regelwerk', () => {
  it('setzt die Bausteine aus den Einstellungen zusammen', () => {
    const plain = rulesetFor(settings({ truth: false, variant: false, hints: 'off' }));
    expect(plain.ending.goal).toBe(null);
    expect(plain.placement.id).toBe('none');
    expect(plain.hint).toBe(null);
    expect(plain.draw).toBe(stopWhenEmpty);

    const all = rulesetFor(
      settings({ truth: true, truthGoal: SHORT_GOAL, variant: true, dir: 'links', hints: 'nudge' }),
    );
    expect(all.ending.goal).toBe(SHORT_GOAL);
    expect(all.placement.id).toBe('world-order');
    expect(all.placement.announcement).toEqual({ kind: 'variant', dir: 'links' });
    expect(all.hint?.id).toBe('nudge');
  });

  it('„Die wahre Wahrheit erkennen“: Punkteziel aus den Einstellungen und Nachmischen', () => {
    const truth = rulesetFor(settings({ truth: true, truthGoal: 23 }));
    expect(truth.ending.goal).toBe(23);
    expect(truth.ending.recordName).toBe('best-solo-23');
    expect(truth.draw).toBe(reshuffle);
  });
});

describe('Spielende', () => {
  it('Ganzes Deck: keine letzte Runde wegen Punkten, gewertet werden die Punkte', () => {
    const game = scoredGame(0, 40);
    fullDeck.checkFinalRound(game);
    expect(game.finalTurnsLeft).toBe(null);
    expect(fullDeck.recordName).toBe('best-solo');
    expect(fullDeck.beatsBest(12, 11)).toBe(true);
    expect(fullDeck.beatsBest(11, 11)).toBe(false);
  });

  it('ein anderes Punkteziel lässt sich einstecken: firstTo(20)', () => {
    const goal20 = firstTo(20);
    const below = scoredGame(0, 19);
    goal20.checkFinalRound(below);
    expect(below.finalTurnsLeft).toBe(null);

    // die beginnende Person erreicht das Ziel: das Gegenüber hat noch einen Zug
    const reached = scoredGame(0, 20);
    goal20.checkFinalRound(reached);
    expect(reached.finalTurnsLeft).toBe(1);
    expect(reached.log.at(-1)).toEqual({ kind: 'goal', player: 0, turnsLeft: 1 });
    // nur einmal ausgelöst
    goal20.checkFinalRound(reached);
    expect(reached.log.filter((entry) => entry.kind === 'goal')).toHaveLength(1);

    expect(goal20.goal).toBe(20);
    expect(goal20.recordName).toBe('best-solo-20');
    expect(goal20.endText(false, stopWhenEmpty)).toContain('20 Punkte');
  });

  it('„Bis 13“ behält den bisherigen Namen für den Bestwert', () => {
    expect(firstTo(SHORT_GOAL).recordName).toBe('best-solo-13');
  });
});

describe('Nachziehen', () => {
  it('zieht bis zur Handgröße, solange der Nachziehstapel reicht', () => {
    const game = newGame(settings({ mode: 'solo' }), seededRng(5));
    const [player] = game.players;
    if (!player) throw new Error('eine Person erwartet');
    player.hand = player.hand.slice(0, 2);
    game.deck = game.deck.slice(0, 2);
    const { drawn, reshuffled } = stopWhenEmpty.refill(game, player, 5);
    expect(drawn).toHaveLength(2);
    expect(reshuffled).toBe(0);
    expect(player.hand).toHaveLength(4);
    expect(game.deck).toHaveLength(0);
    expect(stopWhenEmpty.exhausted(game)).toBe(true);
  });

  it('Nachmischen: die Karten unter den obersten bilden den neuen Nachziehstapel', () => {
    const game = newGame(settings({ mode: 'solo', truth: true }), seededRng(8));
    const [player] = game.players;
    if (!player) throw new Error('eine Person erwartet');
    // Nachziehstapel leer, auf jedem Stapel drei Karten
    game.piles = game.piles.map((_, suit) => game.deck.filter((c) => c.suit === suit).slice(0, 3));
    game.deck = [];
    player.hand = player.hand.slice(0, 3);
    const tops = game.piles.map((pile) => pile.at(-1));

    const twin: GameState = JSON.parse(JSON.stringify(game));
    const { drawn, reshuffled } = reshuffle.refill(game, player, 5);
    expect(reshuffled).toBe(8);
    expect(drawn).toHaveLength(2);
    expect(game.deck).toHaveLength(6);
    expect(game.piles.map((pile) => pile.length)).toEqual([1, 1, 1, 1]);
    expect(game.piles.map((pile) => pile.at(-1))).toEqual(tops);
    expect(game.reshuffles).toBe(1);
    expect(reshuffle.exhausted(game)).toBe(false);

    // ein zweites Gerät mit demselben Stand mischt genau gleich
    const [twinPlayer] = twin.players;
    if (!twinPlayer) throw new Error('eine Person erwartet');
    reshuffle.refill(twin, twinPlayer, 5);
    expect(twin.deck).toEqual(game.deck);
    expect(twin.rngState).toBe(game.rngState);
  });

  it('Nachmischen hört nach höchstens MAX_RESHUFFLES Mischungen auf', () => {
    const game = newGame(settings({ mode: 'solo', truth: true }), seededRng(8));
    game.deck = [];
    expect(reshuffle.exhausted(game)).toBe(false);
    game.reshuffles = MAX_RESHUFFLES;
    expect(reshuffle.exhausted(game)).toBe(true);
    const [player] = game.players;
    if (!player) throw new Error('eine Person erwartet');
    player.hand = [];
    expect(reshuffle.refill(game, player, 5)).toEqual({ drawn: [], reshuffled: 0 });
  });

  it('nach leerem Nachziehstapel beginnt die letzte Runde', () => {
    const game = newGame(settings({ mode: 'hotseat' }), seededRng(2));
    game.deck = [];
    finishTurn(game);
    expect(game.finalTurnsLeft).toBe(2);
  });
});

describe('Die wahre Wahrheit erkennen', () => {
  it('ganze Partie Computer gegen Computer: es wird nachgemischt, bis jemand das Ziel erreicht', () => {
    const rng = seededRng(21);
    const game = newGame(settings({ mode: 'hotseat', truth: true, truthGoal: 52 }), rng);
    playOut(game, rng, 5000, () => expect(cardsInPlay(game)).toBe(createDeck().length));
    expect(game.over).toBe(true);
    expect(game.reshuffles).toBeGreaterThan(0);
    expect(Math.max(...game.players.map((p) => p.points))).toBeGreaterThanOrEqual(52);
    expect(turnsTaken(game, 0)).toBe(turnsTaken(game, 1));
    // jede Mischung steht im Protokoll, und zwar nach dem Zug, bei dem nachgezogen wurde
    const entries = game.log.filter((entry) => entry.kind === 'reshuffle');
    expect(entries).toHaveLength(game.reshuffles);
    const first = game.log.findIndex((entry) => entry.kind === 'reshuffle');
    expect(['proof', 'discard', 'rotation']).toContain(game.log[first - 1]?.kind);
  });

  it('zwei Geräte, die nur die Züge austauschen, bleiben über alle Mischungen gleich', () => {
    const rng = seededRng(34);
    const host = newGame(settings({ mode: 'hotseat', truth: true, truthGoal: 23 }), rng);
    const guest: GameState = JSON.parse(JSON.stringify(host));
    for (let turn = 0; turn < 3000 && !host.over; turn++) {
      const move = chooseCpuMove(host, rng);
      applyMove(host, move);
      finishTurn(host);
      applyMove(guest, move);
      finishTurn(guest);
    }
    expect(host.over).toBe(true);
    expect(host.reshuffles).toBeGreaterThan(0);
    expect(guest).toEqual(host);
  });
});

describe('Ablage-Effekt', () => {
  it('Weltordnung: eine 13 verschiebt die Regeln, andere Karten nicht', () => {
    const game = newGame(settings({ variant: true, dir: 'rechts' }), seededRng(6));
    const effect = worldOrder('rechts');
    expect(effect.triggers(game, card(2, MAX_RANK))).toBe(true);
    expect(effect.triggers(game, card(2, MAX_RANK - 1))).toBe(false);

    // vorausberechnen ändert nichts am Spielstand
    expect(effect.rulesAfter(game, card(2, MAX_RANK))).toEqual(rotateRules(CLASSIC_RULES, 'rechts'));
    expect(game.rules).toEqual([...CLASSIC_RULES]);

    expect(effect.afterPlace(game, card(2, MAX_RANK - 1))).toBe(false);
    expect(effect.afterPlace(game, card(2, MAX_RANK))).toBe(true);
    expect(game.rules).toEqual(rotateRules(CLASSIC_RULES, 'rechts'));
    expect(game.rotations).toBe(1);
    expect(effect.rulesSection?.text).toContain('nach rechts');
  });

  it('ohne Variante passiert beim Ablegen nichts', () => {
    const game = newGame(settings(), seededRng(6));
    expect(noEffect.afterPlace(game, card(2, MAX_RANK))).toBe(false);
    expect(noEffect.triggers(game, card(2, MAX_RANK))).toBe(false);
    expect(noEffect.rulesAfter(game, card(2, MAX_RANK))).toEqual([...CLASSIC_RULES]);
    expect(game.rotations).toBe(0);
  });
});

describe('Tipp-Stufen', () => {
  const combo = [3, 7, 11];

  it('verraten unterschiedlich viel über dieselbe 13', () => {
    expect(HINT_STYLES.exists.reveal(combo)).toEqual({ message: 'Hier steckt eine 13.', highlight: [] });
    expect(HINT_STYLES.nudge.reveal(combo)).toEqual({
      message: 'Hier steckt eine 13 aus 3 Karten.',
      highlight: [],
    });
    expect(HINT_STYLES.full.reveal(combo)).toEqual({ message: '', highlight: combo });
    expect(NO_THIRTEEN.highlight).toEqual([]);
  });

  it('stehen im Tipps-Fenster in der Reihenfolge der Einstellungen, „Aus“ zuerst', () => {
    expect(HINT_CHOICES.map((choice) => choice.value)).toEqual([...HINT_LEVELS]);
    expect(HINT_CHOICES[0]?.title).toBe('Aus');
  });
});
