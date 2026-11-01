import { describe, expect, it } from 'vitest';
import { CLASSIC_RULES } from '../src/core/rules';
import { trueValue } from '../src/core/values';
import { card, exampleHand, examplePiles } from './helpers';

const piles = examplePiles();
const hand = exampleHand();

describe('wahre Werte', () => {
  it('rechnet das Beispiel aus der Anleitung nach', () => {
    expect(hand.map((c) => trueValue(c, piles, CLASSIC_RULES).value)).toEqual([9, -5, 6, 8, 10]);
  });

  it('liefert den Rechenweg', () => {
    expect(trueValue(card(0, 5), piles, CLASSIC_RULES)).toMatchObject({ formula: '4 + 5', direct: false });
    expect(trueValue(card(2, 13), piles, CLASSIC_RULES)).toMatchObject({ formula: '10', direct: true });
  });

  it('zählt bei leerem Stapel die Zahl der Karte', () => {
    expect(trueValue(card(1, 7), [[], [], [], []], CLASSIC_RULES)).toEqual({
      value: 7,
      formula: '',
      direct: true,
      empty: true,
    });
  });
});
