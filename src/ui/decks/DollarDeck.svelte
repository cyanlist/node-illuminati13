<script lang="ts">
import type { Card, SuitIndex } from '../../core/cards';
import Logo from '../Logo.svelte';
import CardFace from './CardFace.svelte';
import EmptySlot from './EmptySlot.svelte';

/**
 * Design „Dollarnote“: Gravurpapier mit Ringmuster und doppeltem Rahmen; die Rückseite zeigt das Auge in der
 * Pyramide vor grünem Strahlenkranz – wie auf dem Siegel der Ein-Dollar-Note, das voller 13en steckt.
 */
let { card, slot }: { card?: Card; slot?: SuitIndex } = $props();
</script>

{#if card}
  <div class="front"><CardFace {card} /></div>
{:else if slot !== undefined}
  <EmptySlot suit={slot} line="color-mix(in srgb, var(--suit) 45%, #5f9a7b)" fill="rgba(47, 93, 70, 0.14)" />
{:else}
  <div class="back"><Logo size="60%" /></div>
{/if}

<style>
  .front,
  .back {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border: 2px solid #2f5d46;
  }

  .front {
    --ink: color-mix(in srgb, var(--suit) 60%, #1f3b2c);
    color: var(--ink);
    background:
      repeating-radial-gradient(circle at 50% 45%, transparent 0 3px, rgba(47, 93, 70, 0.08) 3px 4px),
      linear-gradient(160deg, #eef2e3, #dbe4cc);
    box-shadow:
      inset 0 0 0 3px #eef2e3,
      inset 0 0 0 4.5px var(--ink),
      0 1px 2px var(--shadow);
    font-family: Georgia, 'Times New Roman', serif;
    letter-spacing: -0.02em;
  }

  .back {
    display: grid;
    place-items: center;
    color: #eef2e3;
    background:
      radial-gradient(circle at 50% 50%, #2f5d46 0 28%, transparent 29%),
      repeating-conic-gradient(from 0deg at 50% 50%, #2f5d46 0 6deg, #3d7458 6deg 12deg);
    box-shadow: inset 0 0 0 3px #dbe4cc;
  }
</style>
