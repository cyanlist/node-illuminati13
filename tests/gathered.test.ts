import { describe, expect, it } from 'vitest';
import { chooseCpuMove } from '../src/core/ai';
import { applyMove, finishTurn, newGame } from '../src/core/game';
import { gatheredCards } from '../src/state/gathered';
import { seededRng, settings } from './helpers';

describe('Nachmischen: was eingesammelt wird', () => {
  it('sind genau die gemischten Karten – je Stapel alles unter der obersten', () => {
    let checked = 0;
    for (let seed = 1; seed <= 6; seed++) {
      const rng = seededRng(seed);
      const game = newGame(settings({ truth: true, truthGoal: 100 }), rng);
      for (let turn = 0; turn < 400 && !game.over; turn++) {
        const before = game.piles.map((pile) => [...pile]);
        const result = applyMove(game, chooseCpuMove(game, rng));
        if (result.reshuffled > 0) {
          const gathered = gatheredCards(before, result.steps, game.piles);
          expect(gathered.flat()).toHaveLength(result.reshuffled);
          // auf jedem Stapel bleibt höchstens die oberste Karte liegen
          for (const pile of game.piles) expect(pile.length).toBeLessThanOrEqual(1);
          // nichts geht verloren: Eingesammeltes und Liegengebliebenes ergeben alles, was dort lag
          const placed = result.steps.map((step) => step.card.id);
          const all = [...before.flat().map((card) => card.id), ...placed].sort();
          const now = [...gathered.flat(), ...game.piles.flat()].map((card) => card.id).sort();
          expect(now).toEqual(all);
          checked++;
        }
        finishTurn(game);
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});
