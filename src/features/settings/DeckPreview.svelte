<script lang="ts">
import type { Card as CardData } from '../../core/cards';
import Card from '../../ui/Card.svelte';
import CardBack from '../../ui/CardBack.svelte';
import { type Deck, showDeck } from '../../ui/deck.svelte';

/** Drei Beispielkarten und eine Rückseite in einem bestimmten Design – unabhängig vom gewählten. */
let { deck }: { deck: Deck } = $props();

// svelte-ignore state_referenced_locally (eine Vorschau zeigt immer dasselbe Design)
showDeck(deck);

const samples: CardData[] = [
  { id: 200, suit: 0, rank: 5 },
  { id: 201, suit: 1, rank: 2 },
  { id: 202, suit: 2, rank: 13 },
];
</script>

<div class="preview" aria-hidden="true">
  {#each samples as card (card.id)}<Card {card} />{/each}
  <CardBack />
</div>

<style>
  .preview {
    display: flex;
    gap: 8px;
    padding: 8px 4px 4px;
    --cw: 46px;
  }
</style>
