<script lang="ts">
import type { Card } from '../../core/cards';
import Logo from '../Logo.svelte';
import CardFace from './CardFace.svelte';

/**
 * Design „Entschlüsselt“: dunkles Terminal mit leuchtenden Schreibmaschinen-Zahlen und feinen Bildzeilen;
 * auf der Beweis-Bühne rattern die Ziffern kurz, bevor der wahre Wert einrastet (ProofStage).
 */
let { card }: { card?: Card } = $props();

/** Leuchtfarben je Farbe – eigens für den schwarzen Grund, im hellen wie im dunklen Design gleich */
const NEON = ['#ff6b81', '#b99cff', '#ffb44d', '#4dffa0'];
</script>

{#if card}
  <div class="front" style:--neon={NEON[card.suit]}><CardFace {card} /></div>
{:else}
  <div class="back"><Logo size="58%" /></div>
{/if}

<style>
  .front,
  .back {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background:
      repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 3px),
      radial-gradient(circle at 50% 40%, #0f2418, #050b07);
    box-shadow: 0 1px 2px var(--shadow);
    font-family: ui-monospace, 'Cascadia Mono', Consolas, 'Courier New', monospace;
  }

  .front {
    color: var(--neon);
    border: 1.5px solid color-mix(in srgb, var(--neon) 55%, transparent);
    text-shadow: 0 0 6px color-mix(in srgb, var(--neon) 70%, transparent);
  }

  .back {
    display: grid;
    place-items: center;
    color: #4dffa0;
    border: 1.5px solid rgba(77, 255, 160, 0.45);
    filter: drop-shadow(0 0 3px rgba(77, 255, 160, 0.5));
  }
</style>
