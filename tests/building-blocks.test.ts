import { describe, expect, it } from 'vitest';
import { newGame, type Player } from '../src/core/game';
import { drawCard, drawUpTo } from '../src/core/game/deck';
import { turnsUntilRoundEnds } from '../src/core/game/history';
import { cardsInHand, deductPoints, hasCards, removeFromHand, scoreProof } from '../src/core/game/players';
import { card, seededRng, settings } from './helpers';

const player = (hand = [card(0, 5), card(1, 7), card(2, 1)]): Player => ({
  name: 'Anna',
  cpu: false,
  you: true,
  hand,
  points: 0,
  combos: 0,
});

describe('Bausteine einer Person', () => {
  it('zählt einen Beweis: je Karte ein Punkt und eine gefundene 13 mehr', () => {
    const anna = player();
    scoreProof(anna, 3);
    expect(anna).toMatchObject({ points: 3, combos: 1 });
    deductPoints(anna, 1);
    expect(anna.points).toBe(2);
  });

  it('nimmt Karten aus der Hand – nur solche, die wirklich dort sind', () => {
    const anna = player();
    const [five] = cardsInHand(anna, [card(0, 5).id]);
    removeFromHand(anna, five ? [five] : []);
    expect(anna.hand.map((c) => c.rank)).toEqual([7, 1]);
    expect(() => cardsInHand(anna, [card(0, 5).id])).toThrow('nicht auf der Hand');
    expect(() => cardsInHand(anna, [card(1, 7).id, card(1, 7).id])).toThrow('doppelt');
    expect(hasCards(anna)).toBe(true);
    expect(hasCards(player([]))).toBe(false);
  });
});

describe('Nachziehstapel', () => {
  it('zieht von oben, bis die Hand voll ist oder der Stapel leer', () => {
    const game = newGame(settings({ mode: 'solo' }), seededRng(1));
    const anna = player([]);
    const top = game.deck.at(-1);
    expect(drawCard(game, anna)).toEqual(top);
    game.deck = game.deck.slice(-2);
    expect(drawUpTo(game, anna, 5)).toHaveLength(2);
    expect(anna.hand).toHaveLength(3);
    expect(drawCard(game, anna)).toBeNull();
  });
});

describe('Runde', () => {
  it('weiß, wie viele Züge sie noch dauert – zu zweit 1, wenn die Startperson am Zug ist, sonst 0', () => {
    const game = newGame(settings({ mode: 'hotseat' }), seededRng(2));
    const first = game.current;
    expect(turnsUntilRoundEnds(game)).toBe(1);
    game.current = 1 - first;
    expect(turnsUntilRoundEnds(game)).toBe(0);
  });
});
