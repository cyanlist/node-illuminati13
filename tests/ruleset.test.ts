import { describe, expect, it } from 'vitest';
import { MAX_RANK } from '../src/core/cards';
import {
  finishTurn,
  firstTo,
  fullDeck,
  type GameState,
  GOAL_POINTS,
  HINT_CHOICES,
  HINT_STYLES,
  NO_THIRTEEN,
  newGame,
  noEffect,
  rulesetFor,
  stopWhenEmpty,
  worldOrder,
} from '../src/core/game';
import { CLASSIC_RULES, rotateRules } from '../src/core/rules';
import { HINT_LEVELS } from '../src/core/settings';
import { card, seededRng, settings } from './helpers';

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
    const plain = rulesetFor(settings({ ending: 'deck', variant: false, hints: 'off' }));
    expect(plain.ending.goal).toBe(null);
    expect(plain.placement.id).toBe('none');
    expect(plain.hint).toBe(null);
    expect(plain.draw).toBe(stopWhenEmpty);

    const all = rulesetFor(settings({ ending: 'thirteen', variant: true, dir: 'links', hints: 'nudge' }));
    expect(all.ending.goal).toBe(GOAL_POINTS);
    expect(all.placement.id).toBe('world-order');
    expect(all.placement.announcement).toEqual({ kind: 'variant', dir: 'links' });
    expect(all.hint?.id).toBe('nudge');
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
    expect(goal20.endText(false)).toContain('20 Punkte');
  });

  it('„Bis 13“ behält den bisherigen Namen für den Bestwert', () => {
    expect(firstTo(GOAL_POINTS).recordName).toBe('best-solo-13');
  });
});

describe('Nachziehen', () => {
  it('zieht bis zur Handgröße, solange der Nachziehstapel reicht', () => {
    const game = newGame(settings({ mode: 'solo' }), seededRng(5));
    const [player] = game.players;
    if (!player) throw new Error('eine Person erwartet');
    player.hand = player.hand.slice(0, 2);
    game.deck = game.deck.slice(0, 2);
    const drawn = stopWhenEmpty.refill(game, player, 5);
    expect(drawn).toHaveLength(2);
    expect(player.hand).toHaveLength(4);
    expect(game.deck).toHaveLength(0);
    expect(stopWhenEmpty.endsWhenEmpty).toBe(true);
  });

  it('nach leerem Nachziehstapel beginnt die letzte Runde', () => {
    const game = newGame(settings({ mode: 'hotseat' }), seededRng(2));
    game.deck = [];
    finishTurn(game);
    expect(game.finalTurnsLeft).toBe(2);
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
