import type { Card, Rng, SuitIndex } from '../src/core/cards';
import { DEFAULT_SETTINGS, type Settings } from '../src/core/settings';

/** Reproduzierbare Zufallsquelle (mulberry32). */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Karte aus Farbe und Zahl, mit derselben id wie im echten Deck. */
export const card = (suit: SuitIndex, rank: number): Card => ({ id: suit * 13 + rank - 1, suit, rank });

export const settings = (overrides: Partial<Settings> = {}): Settings => ({
  ...DEFAULT_SETTINGS,
  ...overrides,
});
