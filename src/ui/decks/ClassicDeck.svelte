<script lang="ts">
import type { Card } from '../../core/cards';
import Logo from '../Logo.svelte';
import CardFace from './CardFace.svelte';

/** Design „Klassisch“: ruhig getönt im Farbton der Farbe; die Rückseite schlicht mit dem Auge. */
let { card }: { card?: Card } = $props();
</script>

{#if card}
  <div class="front"><CardFace {card} /></div>
{:else}
  <div class="back"><Logo size="60%" /></div>
{/if}

<style>
  .front,
  .back {
    position: absolute;
    inset: 0;
    border-radius: inherit;
  }

  .front {
    color: var(--suit);
    background: color-mix(in srgb, var(--suit) 9%, var(--surface));
    border: 2px solid var(--suit);
    box-shadow: 0 1px 2px var(--shadow);
  }

  .back {
    display: grid;
    place-items: center;
    color: var(--muted);
    background: var(--surface-2);
    border: 1.5px solid var(--line);
  }
</style>
