import { describe, expect, it } from 'vitest';
import { CPU_PROFILES, chooseCpuMove, spotChance } from '../src/core/ai';
import { findCombos } from '../src/core/combos';
import { type GameState, newGame } from '../src/core/game';
import type { CpuLevel } from '../src/core/settings';
import { card, seededRng, settings } from './helpers';

/** Computer am Zug mit der Hand aus dem Beispiel der Anleitung: es gibt 13er-Kombinationen aus 1 bis 3 Karten. */
function cpuGame(cpuLevel: CpuLevel): GameState {
  const game = newGame(settings({ mode: 'cpu', cpuLevel }), seededRng(4));
  game.current = 1;
  game.piles = [[card(0, 4)], [card(1, 2)], [card(2, 10)], [card(3, 6)]];
  const cpu = game.players[1];
  if (cpu) cpu.hand = [card(0, 5), card(1, 7), card(3, 3), card(3, 8), card(2, 13)];
  return game;
}

/** Zufallsquelle mit festem Wert: 0 → bemerkt alles, 0.999 → bemerkt nichts. */
const always = (value: number) => () => value;

describe('Computer-Stärke', () => {
  it('nimmt Kombinationen mit mehr Karten seltener wahr', () => {
    for (const profile of Object.values(CPU_PROFILES)) {
      expect(spotChance(profile, 1)).toBeGreaterThanOrEqual(spotChance(profile, 3));
    }
    expect(spotChance(CPU_PROFILES.easy, 3)).toBeLessThan(spotChance(CPU_PROFILES.medium, 3));
    expect(spotChance(CPU_PROFILES.hard, 4)).toBe(1);
  });

  it('schwer legt immer die größte Kombination', () => {
    const game = cpuGame('hard');
    const largest = Math.max(
      ...findCombos(game.players[1]?.hand ?? [], game.piles, game.rules).map((c) => c.length),
    );
    for (let seed = 1; seed <= 20; seed++) {
      const move = chooseCpuMove(game, seededRng(seed));
      expect(move.type === 'proof' && move.cardIds.length).toBe(largest);
    }
  });

  it('wer nichts bemerkt, wirft ab', () => {
    const move = chooseCpuMove(cpuGame('easy'), always(0.999));
    expect(move.type).toBe('discard');
  });

  it('mittel und leicht übersehen über viele Züge öfter die größte Kombination als schwer', () => {
    const largestShare = (level: CpuLevel): number => {
      const game = cpuGame(level);
      let largest = 0;
      for (let seed = 1; seed <= 300; seed++) {
        const move = chooseCpuMove(game, seededRng(seed));
        if (move.type === 'proof' && move.cardIds.length === 3) largest++;
      }
      return largest / 300;
    };
    const easy = largestShare('easy');
    const medium = largestShare('medium');
    expect(largestShare('hard')).toBe(1);
    expect(medium).toBeLessThan(0.9);
    expect(easy).toBeLessThan(medium);
  });
});
