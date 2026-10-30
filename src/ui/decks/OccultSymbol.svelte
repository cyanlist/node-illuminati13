<script lang="ts">
import type { SuitIndex } from '../../core/cards';

/**
 * Alchemistische Zeichen statt der Farbsymbole: Sonne (Herz), Mond (Pik), Feuer (Karo), Wasser (Kreuz).
 * Die Farbe der Karte bleibt erhalten, damit man die Stapel weiter zuordnen kann.
 */
let { suit, size }: { suit: SuitIndex; size: string } = $props();
</script>

<svg viewBox="0 0 24 24" style:width={size} style:height={size} aria-hidden="true">
  {#if suit === 0}
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="2.2" class="filled" />
  {:else if suit === 1}
    <path d="M15 4A8.5 8.5 0 1 0 15 20A13 13 0 0 1 15 4Z" class="filled" />
  {:else if suit === 2}
    <path d="M12 3.5 20.5 19.5H3.5Z" />
  {:else}
    <path d="M3.5 4.5H20.5L12 20.5Z" />
  {/if}
</svg>

<style>
  svg {
    display: block;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linejoin: round;
  }

  .filled {
    fill: currentColor;
    stroke: none;
  }
</style>
