<script lang="ts">
import type { Card } from '../../core/cards';
import Logo from '../Logo.svelte';
import CardFace from './CardFace.svelte';

/**
 * Design „Pinnwand“: vergilbte Notizzettel mit Handschrift-Zahl und Pinnnadel in der Farbe der Farbe;
 * die Rückseite ist Kork mit eingebranntem Auge. Den roten Faden zieht die Beweis-Bühne.
 */
let { card }: { card?: Card } = $props();
</script>

{#if card}
  <div class="front">
    <span class="pin" aria-hidden="true"></span>
    <CardFace {card} />
  </div>
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
    /* auf hellem Papier braucht es dunklere Farbtöne, auch im dunklen Design */
    --rank-size: 0.5;
    color: color-mix(in srgb, var(--suit) 52%, #2a1d0c);
    background: linear-gradient(170deg, #fbf3d6, #efe0b4);
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.28),
      inset 0 -6px 10px rgba(120, 90, 30, 0.12);
    font-family: var(--font-title);
  }

  .pin {
    position: absolute;
    top: calc(var(--cw) * -0.05);
    left: 50%;
    z-index: 1;
    width: calc(var(--cw) * 0.2);
    aspect-ratio: 1;
    transform: translateX(-50%);
    border-radius: 50%;
    background: radial-gradient(
      circle at 35% 32%,
      rgba(255, 255, 255, 0.75) 0 12%,
      var(--suit) 30%,
      color-mix(in srgb, var(--suit) 55%, #000) 100%
    );
    box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.4);
  }

  /* Kork mit feinen Poren */
  .back {
    display: grid;
    place-items: center;
    color: rgba(70, 40, 12, 0.55);
    background:
      radial-gradient(rgba(60, 30, 5, 0.22) 1px, transparent 1.6px) 0 0 / 6px 6px,
      radial-gradient(rgba(255, 235, 200, 0.18) 1px, transparent 1.6px) 3px 3px / 7px 7px,
      #b98a55;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  }
</style>
