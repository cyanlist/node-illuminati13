<script lang="ts">
import type { SuitIndex } from '../core/cards';
import { useDeck } from './deck.svelte';
import { DECK_SYMBOLS } from './decks/symbols';
import SuitIcon from './SuitIcon.svelte';

/**
 * Das Symbol einer Farbe, wie es das gewählte Kartendesign zeigt – meist das übliche, bei „Okkult“ z. B. die
 * Sonne statt des Herzens. Überall nutzen, wo eine Farbe als Symbol erscheint (Karten, Stapel, Protokoll, Regeln).
 */
let { suit, size }: { suit: SuitIndex; size: string } = $props();

const deckOf = useDeck();
const Symbol = $derived(DECK_SYMBOLS[deckOf()] ?? SuitIcon);
</script>

<Symbol {suit} {size} />
