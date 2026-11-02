/**
 * Kartendesigns: wie Vorder- und Rückseiten aussehen. Die Wahl gehört zum Gerät, nicht zum Spiel – an zwei
 * Geräten sieht jede Person ihr Lieblingsdesign. Eine Vorschau kann für ihren Bereich ein anderes Design
 * vorgeben (showDeck), damit man Designs nebeneinander vergleichen kann.
 */
import { getContext, setContext } from 'svelte';

export type Deck = 'classic' | 'pinboard' | 'dollar' | 'dossier' | 'cipher' | 'occult';

export interface DeckInfo {
  id: Deck;
  title: string;
  /** Eckenrundung der Karten */
  radius: string;
  /** Jede Karte hängt ein wenig schief (Notizzettel) */
  tilt?: boolean;
}

export const DECKS: DeckInfo[] = [
  { id: 'classic', title: 'Klassisch', radius: '8px' },
  { id: 'pinboard', title: 'Pinnwand', radius: '3px', tilt: true },
  { id: 'dollar', title: 'Dollarnote', radius: '6px' },
  { id: 'dossier', title: 'Geheimakte', radius: '4px' },
  { id: 'cipher', title: 'Entschlüsselt', radius: '6px' },
  { id: 'occult', title: 'Okkult', radius: '8px' },
];

export const deckInfo = (deck: Deck): DeckInfo =>
  DECKS.find((info) => info.id === deck) ?? (DECKS[0] as DeckInfo);

export const isDeck = (value: unknown): value is Deck => DECKS.some((deck) => deck.id === value);

class DeckChoice {
  /** Das Design dieses Geräts */
  current = $state<Deck>('classic');
}

export const deckChoice = new DeckChoice();

const KEY = Symbol('deck');

/** Für Karten: welches Design an dieser Stelle gilt – das der Vorschau oder das des Geräts. */
export function useDeck(): () => Deck {
  const fixed = getContext<Deck | undefined>(KEY);
  return () => fixed ?? deckChoice.current;
}

/** Für eine Vorschau: Alle Karten darin zeigen dieses Design. */
export function showDeck(deck: Deck): void {
  setContext(KEY, deck);
}
