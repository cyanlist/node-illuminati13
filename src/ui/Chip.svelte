<script lang="ts">
import { type Card, SUITS } from '../core/cards';
import SuitSymbol from './SuitSymbol.svelte';

/** Kleine Karte im Fließtext, z. B. im Protokoll. */
let { card }: { card: Card } = $props();
</script>

<span class="chip suit-{card.suit}" title="{SUITS[card.suit].name} {card.rank}">
  <SuitSymbol suit={card.suit} size="0.8em" />{card.rank}
</span>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 0 5px;
    line-height: 1.35;
    font-weight: 700;
    white-space: nowrap;
    vertical-align: baseline;
    color: var(--suit);
    background: color-mix(in srgb, var(--suit) 9%, var(--surface));
    border: 1.5px solid currentColor;
    border-radius: 6px;
  }
</style>
