<script lang="ts">
import type { SuitIndex } from '../core/cards';
import { deckInfo, useDeck } from './deck.svelte';
import { DECK_COMPONENTS } from './decks';

/** Leerer Platz für eine Karte einer Farbe (z. B. ein leerer Stapel) im Stil des gewählten Kartendesigns. */
let { suit }: { suit: SuitIndex } = $props();

const deckOf = useDeck();
const deck = $derived(deckInfo(deckOf()));
const Deck = $derived(DECK_COMPONENTS[deck.id]);
</script>

<div class="place suit-{suit}" style:border-radius={deck.radius}>
  <Deck slot={suit} />
</div>

<style>
  .place {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
