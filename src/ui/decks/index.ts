/**
 * Alle Kartendesigns. Neues Design: eigene Datei in diesem Ordner (Vorderseite mit `card`, Rückseite ohne),
 * hier eintragen und in DECKS (deck.svelte.ts) beschreiben.
 */
import type { Component } from 'svelte';
import type { Card } from '../../core/cards';
import type { Deck } from '../deck.svelte';
import CipherDeck from './CipherDeck.svelte';
import ClassicDeck from './ClassicDeck.svelte';
import DollarDeck from './DollarDeck.svelte';
import DossierDeck from './DossierDeck.svelte';
import OccultDeck from './OccultDeck.svelte';
import PinboardDeck from './PinboardDeck.svelte';

export const DECK_COMPONENTS: Record<Deck, Component<{ card?: Card }>> = {
  classic: ClassicDeck,
  pinboard: PinboardDeck,
  dollar: DollarDeck,
  dossier: DossierDeck,
  cipher: CipherDeck,
  occult: OccultDeck,
};
