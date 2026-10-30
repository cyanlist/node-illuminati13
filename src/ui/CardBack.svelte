<script lang="ts">
import type { HTMLAttributes } from 'svelte/elements';
import { deckInfo, useDeck } from './deck.svelte';
import { DECK_COMPONENTS } from './decks';

/** Verdeckte Karte; wie sie aussieht, bestimmt das gewählte Kartendesign. Die Größe kommt über --cw. */
let props: HTMLAttributes<HTMLDivElement> = $props();

const deckOf = useDeck();
const deck = $derived(deckInfo(deckOf()));
const Back = $derived(DECK_COMPONENTS[deck.id]);
</script>

<div class="back" style:border-radius={deck.radius} aria-hidden="true" {...props}>
  <Back />
</div>

<style>
  .back {
    position: relative;
    flex: none;
    width: var(--cw);
    aspect-ratio: 5 / 7;
  }
</style>
