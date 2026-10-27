/** Die vier Farben in der Reihenfolge des Spielplans. Der Index ist zugleich die Nummer des Stapels. */
export const SUITS = [
  { key: 'herz', name: 'Herz' },
  { key: 'pik', name: 'Pik' },
  { key: 'karo', name: 'Karo' },
  { key: 'kreuz', name: 'Kreuz' },
] as const;

export type SuitIndex = 0 | 1 | 2 | 3;
export const SUIT_INDICES: readonly SuitIndex[] = [0, 1, 2, 3];

/** Eine Karte: Farbe und Zahl von 1 bis 13. `id` ist innerhalb eines Decks eindeutig. */
export interface Card {
  id: number;
  suit: SuitIndex;
  rank: number;
}

/** Zufallsquelle mit Werten in [0, 1) – austauschbar, damit Tests reproduzierbar sind. */
export type Rng = () => number;

/** 52 Karten: jede Farbe von 1 bis 13. */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUIT_INDICES) {
    for (let rank = 1; rank <= 13; rank++) deck.push({ id: deck.length, suit, rank });
  }
  return deck;
}

/** Mischt die Liste an Ort und Stelle (Fisher-Yates) und gibt sie zurück. */
export function shuffle<T>(items: T[], rng: Rng = Math.random): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j] as T, items[i] as T];
  }
  return items;
}

export function pickRandom<T>(items: readonly T[], rng: Rng = Math.random): T {
  const item = items[Math.floor(rng() * items.length)];
  if (item === undefined) throw new Error('pickRandom: Die Liste ist leer.');
  return item;
}
