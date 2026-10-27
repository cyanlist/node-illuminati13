import { type Card, pickRandom, type Rng, SUIT_INDICES, type SuitIndex } from './cards';
import { findCombos } from './combos';
import { currentPlayer, type GameState, type Move } from './game';
import { rotateRules } from './rules';
import type { CpuLevel } from './settings';

/**
 * Wie der Computer spielt. Er übersieht Kombinationen wie ein Mensch: Eine 13 aus einer Karte bemerkt er
 * mit `spotSingle`, jede weitere Karte macht sie um den Faktor `perExtraCard` schwerer zu entdecken.
 */
interface CpuProfile {
  spotSingle: number;
  perExtraCard: number;
  /** Legt von den bemerkten Kombinationen die größte – sonst irgendeine */
  prefersLargest: boolean;
  /** Wirft überlegt ab – sonst eine zufällige Karte */
  smartDiscard: boolean;
}

export const CPU_PROFILES: Record<CpuLevel, CpuProfile> = {
  // 1 Karte 75 %, 2 Karten 34 %, 3 Karten 15 %, 4 Karten 7 %
  easy: { spotSingle: 0.75, perExtraCard: 0.45, prefersLargest: false, smartDiscard: false },
  // 1 Karte 95 %, 2 Karten 67 %, 3 Karten 47 %, 4 Karten 33 %
  medium: { spotSingle: 0.95, perExtraCard: 0.7, prefersLargest: true, smartDiscard: true },
  // sieht alles und legt immer die größte 13
  hard: { spotSingle: 1, perExtraCard: 1, prefersLargest: true, smartDiscard: true },
};

/** Wahrscheinlichkeit, dass der Computer eine 13 aus `size` Karten bemerkt. */
export const spotChance = (profile: CpuProfile, size: number): number =>
  profile.spotSingle * profile.perExtraCard ** (size - 1);

/**
 * Zug des Computers: eine der 13er-Kombinationen, die er bemerkt. Bemerkt er keine, wirft er eine Karte ab –
 * je nach Stärke zufällig oder die, nach der seine Resthand am ehesten selbst eine 13 bilden könnte.
 */
export function chooseCpuMove(state: GameState, rng: Rng = Math.random): Move {
  const profile = CPU_PROFILES[state.settings.cpuLevel];
  const { hand } = currentPlayer(state);

  const noticed = findCombos(hand, state.piles, state.rules).filter(
    (combo) => rng() < spotChance(profile, combo.length),
  );
  if (noticed.length > 0) {
    const size = Math.max(...noticed.map((combo) => combo.length));
    const choices = profile.prefersLargest ? noticed.filter((combo) => combo.length === size) : noticed;
    return proofMove(pickRandom(choices, rng), rng);
  }

  const card = profile.smartDiscard ? bestDiscard(state, hand, rng) : pickRandom(hand, rng);
  return { type: 'discard', cardId: card.id };
}

/** Beweis mit zufällig gewählter oberster Karte je Farbe. */
function proofMove(combo: Card[], rng: Rng): Move {
  const topPick: Partial<Record<SuitIndex, number>> = {};
  for (const suit of SUIT_INDICES) {
    const sameSuit = combo.filter((card) => card.suit === suit);
    if (sameSuit.length > 0) topPick[suit] = pickRandom(sameSuit, rng).id;
  }
  return { type: 'proof', cardIds: combo.map((card) => card.id), topPick };
}

/** Die Karte, nach deren Abwurf die Resthand am besten dasteht (bei Gleichstand zufällig). */
function bestDiscard(state: GameState, hand: readonly Card[], rng: Rng): Card {
  let bestScore = -1;
  let candidates: Card[] = [];
  for (const card of hand) {
    const score = discardScore(state, hand, card);
    if (score > bestScore) {
      bestScore = score;
      candidates = [card];
    } else if (score === bestScore) candidates.push(card);
  }
  return pickRandom(candidates, rng);
}

/** Wie gut die Resthand nach dem Abwerfen dieser Karte dasteht: Größe der besten 13, dann deren Anzahl. */
function discardScore(state: GameState, hand: readonly Card[], card: Card): number {
  const piles = state.piles.map((pile) => [...pile]);
  piles[card.suit]?.push(card);
  const rules =
    state.settings.variant && card.rank === 13 ? rotateRules(state.rules, state.settings.dir) : state.rules;
  const combos = findCombos(
    hand.filter((c) => c.id !== card.id),
    piles,
    rules,
  );
  if (combos.length === 0) return 0;
  return Math.max(...combos.map((combo) => combo.length)) * 10 + Math.min(combos.length, 9);
}
