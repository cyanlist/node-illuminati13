import { describe, expect, it } from 'vitest';
import { hueFor, initials } from '../src/ui/avatar';

describe('Avatar', () => {
  it('bildet Initialen aus einem oder zwei Wörtern', () => {
    expect(initials('Anna')).toBe('A');
    expect(initials('anna berg')).toBe('AB');
    expect(initials('Spieler*in 2')).toBe('S2');
    expect(initials('  ')).toBe('?');
  });

  it('gibt demselben Namen immer dieselbe Farbe', () => {
    expect(hueFor('Anna')).toBe(hueFor(' anna '));
    expect(hueFor('Anna')).not.toBe(hueFor('Ben'));
    for (const name of ['Anna', 'Ben', 'Computer', 'Spieler*in 1']) {
      expect(hueFor(name)).toBeGreaterThanOrEqual(0);
      expect(hueFor(name)).toBeLessThan(360);
    }
  });
});
