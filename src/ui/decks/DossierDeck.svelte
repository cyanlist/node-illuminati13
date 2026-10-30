<script lang="ts">
import type { Card, SuitIndex } from '../../core/cards';
import CardFace from './CardFace.svelte';
import EmptySlot from './EmptySlot.svelte';

/**
 * Design „Geheimakte“: Aktendeckel-Karton mit Schreibmaschinen-Zahl, die Farbe als Reiter oben rechts und
 * ein roter Stempel „GEHEIM“; die Rückseite ist der geschlossene Aktendeckel mit „Streng geheim“.
 */
let { card, slot }: { card?: Card; slot?: SuitIndex } = $props();
</script>

{#if card}
  <div class="front">
    <span class="tab" aria-hidden="true"></span>
    <CardFace {card} pip={false} />
    <span class="stamp" aria-hidden="true">GEHEIM</span>
  </div>
{:else if slot !== undefined}
  <EmptySlot
    suit={slot}
    line="color-mix(in srgb, var(--suit) 40%, #c9a868)"
    fill="rgba(217, 189, 128, 0.1)"
    tab
  />
{:else}
  <div class="back"><span class="stamp big" aria-hidden="true">STRENG<br />GEHEIM</span></div>
{/if}

<style>
  .front,
  .back {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background:
      repeating-linear-gradient(90deg, rgba(120, 85, 30, 0.04) 0 2px, transparent 2px 5px),
      linear-gradient(165deg, #ecd7a4, #d9bd80);
    box-shadow:
      0 1px 2px var(--shadow),
      inset 0 0 0 1px rgba(110, 75, 25, 0.35);
    font-family: 'Courier New', Courier, monospace;
  }

  .front {
    color: color-mix(in srgb, var(--suit) 55%, #2b2014);
  }

  /* Reiter des Aktendeckels in der Farbe der Farbe */
  .tab {
    position: absolute;
    top: 0;
    right: 10%;
    width: 32%;
    height: 7%;
    border-radius: 0 0 3px 3px;
    background: var(--suit);
  }

  .stamp {
    position: absolute;
    left: 50%;
    top: 76%;
    padding: 1px 3px;
    transform: translate(-50%, -50%) rotate(-14deg);
    border: 1.5px solid #b3261e;
    border-radius: 2px;
    color: #b3261e;
    font-family: var(--font-body);
    font-size: calc(var(--cw) * 0.11);
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1.1;
    opacity: 0.8;
  }

  .back {
    display: grid;
    place-items: center;
  }

  .big {
    position: static;
    transform: rotate(-14deg);
    text-align: center;
    font-size: calc(var(--cw) * 0.13);
  }
</style>
