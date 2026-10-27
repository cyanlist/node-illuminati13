import { describe, expect, it } from 'vitest';
import { bestCombo, findCombos } from '../src/core/combos';
import { CLASSIC_RULES, RULE_KEYS, RULES, rotateRules } from '../src/core/rules';
import { sumOfValues, trueValue } from '../src/core/values';
import { card, seededRng } from './helpers';

// Beispiel aus der Anleitung: auf den Stapeln liegen ♥4, ♠2, ♦10 und ♣6
const piles = [[card(0, 4)], [card(1, 2)], [card(2, 10)], [card(3, 6)]];
const hand = [card(0, 5), card(1, 7), card(3, 3), card(3, 8), card(2, 13)];

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

  it('findet die Kombination aus dem Beispiel', () => {
    const proof = [card(1, 7), card(2, 13), card(3, 8)];
    expect(sumOfValues(proof, piles, CLASSIC_RULES)).toBe(13);
    const ids = (cards: { id: number }[]) => cards.map((c) => c.id).sort((a, b) => a - b);
    expect(findCombos(hand, piles, CLASSIC_RULES).map(ids)).toContainEqual(ids(proof));
  });

  it('wählt die größte Kombination', () => {
    const combo = bestCombo(hand, piles, CLASSIC_RULES, seededRng(1));
    const sizes = findCombos(hand, piles, CLASSIC_RULES).map((c) => c.length);
    expect(combo?.length).toBe(Math.max(...sizes));
  });

  it('gibt null zurück, wenn es keine 13 gibt', () => {
    expect(bestCombo([card(0, 1), card(1, 1)], [[], [], [], []], CLASSIC_RULES)).toBeNull();
  });
});

describe('Regeln', () => {
  it('verschiebt die Regeln nach rechts und nach links', () => {
    expect(rotateRules(CLASSIC_RULES, 'rechts')).toEqual(['max', 'plus', 'minus', 'copy']);
    expect(rotateRules(CLASSIC_RULES, 'links')).toEqual(['minus', 'copy', 'max', 'plus']);
  });

  it('rechnet alle zehn Regeln mit Stapel 6 und Hand 4', () => {
    const results = Object.fromEntries(RULE_KEYS.map((key) => [key, RULES[key].calc(6, 4)]));
    expect(results).toEqual({
      plus: 10,
      minus: 2,
      copy: 6,
      max: 6,
      min: 4,
      rminus: -2,
      dist: 2,
      mirror: 9,
      plain: 4,
      mean: 5,
    });
  });
});
