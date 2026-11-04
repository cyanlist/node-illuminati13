/**
 * Zufall, dessen Zustand im Spielstand liegt (mulberry32). Muss mitten im Spiel gemischt werden, ziehen beide Geräte
 * daraus dieselben Zahlen – sie wenden ja dieselben Züge auf denselben Stand an.
 */
import type { Rng } from './cards';

/** Startwert für einen neuen Spielstand. */
export const seedFrom = (rng: Rng): number => Math.floor(rng() * 2 ** 32) >>> 0;

/** Zufallsquelle, die beim Ziehen `holder.rngState` weiterdreht. */
export function stateRng(holder: { rngState: number }): Rng {
  return () => {
    holder.rngState = (holder.rngState + 0x6d2b79f5) >>> 0;
    let t = holder.rngState;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
