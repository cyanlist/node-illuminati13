import { describe, expect, it } from 'vitest';
import { MAX_RANK, SUIT_INDICES } from '../src/core/cards';
import { bestCombo, findCombos, largestCombos } from '../src/core/combos';
import {
  CLASSIC_RULES,
  isRuleKey,
  pileColumn,
  ROTATION_DIRS,
  RULE_KEYS,
  RULE_PACKS,
  RULES,
  type RuleKey,
  rotateRules,
  rotatesRules,
  sameRules,
  signed,
} from '../src/core/rules';
import { sumOfValues, TARGET } from '../src/core/values';
import { card, exampleHand, examplePiles, seededRng, settings } from './helpers';

/** Die Erklärung einer Regel – mit dem Wert, den die Regel dafür ausrechnet. */
const explain = (key: RuleKey, stack: number, hand: number): string =>
  RULES[key].explain(stack, hand, RULES[key].calc(stack, hand));

describe('Regeln', () => {
  it('rückt die Stapel nach rechts und nach links weiter', () => {
    expect(rotateRules(CLASSIC_RULES, 'rechts')).toEqual(['minus', 'copy', 'max', 'plus']);
    expect(rotateRules(CLASSIC_RULES, 'links')).toEqual(['max', 'plus', 'minus', 'copy']);
  });

  it('jede Farbe liegt nach dem Weiterrücken unter der Regel, die sie dann bekommt', () => {
    expect(pileColumn(0, 1, 'rechts', 4)).toBe(1);
    expect(pileColumn(3, 1, 'rechts', 4)).toBe(0);
    expect(pileColumn(0, 1, 'links', 4)).toBe(3);
    for (const dir of ROTATION_DIRS) {
      const rules = rotateRules(CLASSIC_RULES, dir);
      for (const suit of SUIT_INDICES) {
        expect(rules[suit]).toBe(CLASSIC_RULES[pileColumn(suit, 1, dir, SUIT_INDICES.length)]);
      }
    }
  });

  it('nur in der Variante und nur mit der höchsten Karte rücken die Stapel weiter', () => {
    const variant = settings({ variant: true });
    expect(rotatesRules(variant, card(2, MAX_RANK))).toBe(true);
    expect(rotatesRules(variant, card(2, MAX_RANK - 1))).toBe(false);
    expect(rotatesRules(settings({ variant: false }), card(2, MAX_RANK))).toBe(false);
  });

  it('rechnet alle elf Regeln mit Stapel 6 und Hand 4', () => {
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
      mod: 4,
    });
  });

  it('vergleicht Regeln samt Reihenfolge', () => {
    expect(sameRules(CLASSIC_RULES, ['plus', 'minus', 'copy', 'max'])).toBe(true);
    expect(sameRules(CLASSIC_RULES, rotateRules(CLASSIC_RULES, 'rechts'))).toBe(false);
    expect(sameRules(CLASSIC_RULES, CLASSIC_RULES.slice(0, 3))).toBe(false);
  });
});

describe('Erklärungen', () => {
  it('jede Regel erklärt ihr Beispiel in Worten', () => {
    for (const key of RULE_KEYS) {
      const text = explain(key, 6, 4);
      expect(text, key).toMatch(/\.$/);
      // das Ergebnis der Regel steht in der Erklärung
      expect(text, key).toContain(signed(RULES[key].calc(6, 4)));
    }
  });

  it('Modulo erklärt Rest, glatte Teilung und kleinere Handkarte', () => {
    expect(explain('mod', 4, 11)).toBe('Die 4 passt 2-mal in die 11 (2 × 4 = 8). Übrig bleiben 3.');
    expect(explain('mod', 4, 12)).toBe(
      'Die 4 passt 3-mal in die 12 (3 × 4 = 12). Es bleibt nichts übrig, also 0.',
    );
    expect(explain('mod', 8, 3)).toBe(
      'Die 8 passt kein einziges Mal in die 3 – also bleibt die 3 ganz übrig.',
    );
  });
});

describe('Regelpakete', () => {
  it('liefern vier gültige Regeln und erkennen sich selbst wieder', () => {
    for (const pack of RULE_PACKS) {
      const rules = pack.rules(seededRng(1));
      expect(rules, pack.id).toHaveLength(SUIT_INDICES.length);
      expect(rules.every(isRuleKey), pack.id).toBe(true);
      if (pack.matches) expect(pack.matches(rules), pack.id).toBe(true);
    }
  });

  it('haben eindeutige ids, und nur Klassisch passt auf die klassischen Regeln', () => {
    expect(new Set(RULE_PACKS.map((pack) => pack.id)).size).toBe(RULE_PACKS.length);
    expect(RULE_PACKS.filter((pack) => pack.matches?.(CLASSIC_RULES)).map((pack) => pack.id)).toEqual([
      'classic',
    ]);
  });
});

describe('Kombinationen', () => {
  const piles = examplePiles();
  const hand = exampleHand();

  it('findet die Kombination aus dem Beispiel', () => {
    const proof = [card(1, 7), card(2, 13), card(3, 8)];
    expect(sumOfValues(proof, piles, CLASSIC_RULES)).toBe(TARGET);
    const ids = (cards: { id: number }[]) => cards.map((c) => c.id).sort((a, b) => a - b);
    expect(findCombos(hand, piles, CLASSIC_RULES).map(ids)).toContainEqual(ids(proof));
  });

  it('behält nur die Kombinationen mit den meisten Karten', () => {
    const single = [card(0, 13)];
    const pair = [card(0, 6), card(1, 7)];
    const otherPair = [card(2, 6), card(3, 7)];
    expect(largestCombos([single, pair, otherPair])).toEqual([pair, otherPair]);
    expect(largestCombos([])).toEqual([]);
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
