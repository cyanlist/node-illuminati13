import { describe, expect, it } from 'vitest';
import { CPU_PROFILES, chooseCpuMove, spotChance } from '../src/core/ai';
import { findCombos, largestCombos } from '../src/core/combos';
import { currentPlayer, type GameState, newGame } from '../src/core/game';
import type { CpuLevel } from '../src/core/settings';
import { dealExample, seededRng, settings } from './helpers';

/** Computer am Zug mit der Hand aus dem Beispiel der Anleitung. */
function cpuGame(cpuLevel: CpuLevel): GameState {
  const game = newGame(settings({ mode: 'cpu', cpuLevel }), seededRng(4));
  game.current = 1;
  return dealExample(game);
}

/** Wie viele Karten die größte 13er-Kombination der Person am Zug hat. */
const largestSize = (game: GameState): number =>
  largestCombos(findCombos(currentPlayer(game).hand, game.piles, game.rules))[0]?.length ?? 0;

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
    const largest = largestSize(game);
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
      const size = largestSize(game);
      let largest = 0;
      for (let seed = 1; seed <= 300; seed++) {
        const move = chooseCpuMove(game, seededRng(seed));
        if (move.type === 'proof' && move.cardIds.length === size) largest++;
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
