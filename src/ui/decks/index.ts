/**
 * Alle Kartendesigns. Neues Design: eigene Datei in diesem Ordner – mit `card` die Vorderseite, mit `slot` ein
 * leerer Stapelplatz dieser Farbe, ohne beides die Rückseite –, hier eintragen und in DECKS (deck.svelte.ts)
 * beschreiben. Eigene Farbsymbole kommen nach symbols.ts.
 */
import type { Component } from 'svelte';
import type { Card, SuitIndex } from '../../core/cards';
import type { Deck } from '../deck.svelte';
import CipherDeck from './CipherDeck.svelte';
import ClassicDeck from './ClassicDeck.svelte';
import DollarDeck from './DollarDeck.svelte';
import DossierDeck from './DossierDeck.svelte';
import OccultDeck from './OccultDeck.svelte';
import PinboardDeck from './PinboardDeck.svelte';

export interface DeckProps {
  card?: Card;
  slot?: SuitIndex;
}

export const DECK_COMPONENTS: Record<Deck, Component<DeckProps>> = {
  classic: ClassicDeck,
  pinboard: PinboardDeck,
  dollar: DollarDeck,
  dossier: DossierDeck,
  cipher: CipherDeck,
  occult: OccultDeck,
};
