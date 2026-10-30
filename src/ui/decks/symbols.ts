/**
 * Designs mit eigenen Farbsymbolen. Wer hier fehlt, nutzt die üblichen Symbole (SuitIcon).
 * Steht in einer eigenen Datei, damit SuitSymbol nicht alle Designs laden muss.
 */
import type { Component } from 'svelte';
import type { SuitIndex } from '../../core/cards';
import type { Deck } from '../deck.svelte';
import OccultSymbol from './OccultSymbol.svelte';

export const DECK_SYMBOLS: Partial<Record<Deck, Component<{ suit: SuitIndex; size: string }>>> = {
  occult: OccultSymbol,
};
