<script lang="ts">
import type { SuitIndex } from '../../core/cards';
import SuitSymbol from '../SuitSymbol.svelte';

/**
 * Leerer Stapelplatz, den jedes Design in seinen Farben zeichnet: gestrichelter Rahmen mit dem Farbsymbol,
 * auf Wunsch mit Pinnnadel (Pinnwand) oder Reiter (Geheimakte).
 */
interface Props {
  suit: SuitIndex;
  /** Farbe von Rahmen und Symbol */
  line: string;
  fill: string;
  pin?: boolean;
  tab?: boolean;
  glow?: boolean;
}
let { suit, line, fill, pin = false, tab = false, glow = false }: Props = $props();
</script>

<div class="slot" class:glow style:--line={line} style:--fill={fill}>
  {#if pin}<span class="pin"></span>{/if}
  {#if tab}<span class="tab"></span>{/if}
  <SuitSymbol {suit} size="40%" />
</div>

<style>
  .slot {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--line);
    background: var(--fill);
    border: 2px dashed var(--line);
    border-radius: inherit;
    opacity: 0.85;
  }

  .glow {
    filter: drop-shadow(0 0 4px var(--line));
  }

  .pin {
    position: absolute;
    top: calc(var(--cw) * -0.05);
    left: 50%;
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

  .tab {
    position: absolute;
    top: -2px;
    right: 10%;
    width: 32%;
    height: 7%;
    border-radius: 0 0 3px 3px;
    background: var(--suit);
  }
</style>
