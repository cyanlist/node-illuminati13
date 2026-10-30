<script lang="ts">
import type { Card, SuitIndex } from '../../core/cards';
import Logo from '../Logo.svelte';
import CardFace from './CardFace.svelte';
import EmptySlot from './EmptySlot.svelte';

/**
 * Design „Okkult“: nachtviolette Karten mit goldenem Doppelrahmen, die Farben als alchemistische Zeichen;
 * die Rückseite zeigt das goldene Auge zwischen Sternen.
 */
let { card, slot }: { card?: Card; slot?: SuitIndex } = $props();

/** Juwelentöne je Farbe – hell genug für den dunklen Grund */
const JEWEL = ['#ff8a9a', '#c6b2ff', '#ffc46b', '#7fe0b0'] as const;
</script>

{#if card}
  <div class="front" style:--jewel={JEWEL[card.suit]}>
    <CardFace {card} />
  </div>
{:else if slot !== undefined}
  <EmptySlot suit={slot} line={JEWEL[slot]} fill="rgba(51, 37, 90, 0.45)" />
{:else}
  <div class="back"><Logo size="56%" /></div>
{/if}

<style>
  .front,
  .back {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border: 1.5px solid #c9a54a;
    box-shadow:
      inset 0 0 0 2.5px #1b1230,
      inset 0 0 0 3.5px rgba(201, 165, 74, 0.6),
      0 1px 2px var(--shadow);
  }

  .front {
    color: var(--jewel);
    background: radial-gradient(circle at 50% 42%, #33255a, #140d24);
    font-family: Georgia, 'Times New Roman', serif;
  }

  /* goldene Sterne auf Nachtviolett */
  .back {
    display: grid;
    place-items: center;
    color: #d8b75a;
    background:
      radial-gradient(rgba(216, 183, 90, 0.55) 0.8px, transparent 1.4px) 0 0 / 9px 11px,
      radial-gradient(rgba(216, 183, 90, 0.3) 0.6px, transparent 1.2px) 4px 6px / 13px 9px,
      radial-gradient(circle at 50% 50%, #33255a, #140d24);
  }
</style>
