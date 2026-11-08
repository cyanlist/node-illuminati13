import { describe, expect, it } from 'vitest';
import { type RULE_KEYS, RULES } from '../src/core/rules';
import { RULE_EXAMPLE } from '../src/ui/format';

describe('Rechenbeispiel der Regeln', () => {
  it('kommt ohne die Zahl des Stapels aus – jede Zahl gibt es pro Farbe nur einmal', () => {
    expect(RULE_EXAMPLE.hand).not.toContain(RULE_EXAMPLE.stack);
    expect(new Set(RULE_EXAMPLE.hand).size).toBe(RULE_EXAMPLE.hand.length);
  });

  it('zeigt trotzdem die Sonderfälle: negative Werte, Abrunden und den Rest 0', () => {
    const values = (key: (typeof RULE_KEYS)[number]) =>
      RULE_EXAMPLE.hand.map((hand) => RULES[key].calc(RULE_EXAMPLE.stack, hand));
    expect(values('minus').some((v) => v < 0)).toBe(true);
    expect(values('rminus').some((v) => v < 0)).toBe(true);
    expect(RULE_EXAMPLE.hand.some((hand) => (RULE_EXAMPLE.stack + hand) % 2 === 1)).toBe(true);
    expect(values('mod')).toContain(0);
  });
});
