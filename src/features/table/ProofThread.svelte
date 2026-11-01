<script lang="ts">
import { tick } from 'svelte';

/**
 * Design „Pinnwand“: Ein roter Faden verbindet die Pinnnadeln der Karten, die gerade auf der Beweis-Bühne
 * liegen. Gemessen wird an ihren Plätzen ([data-stage-slot]) innerhalb von `container`.
 */
interface Props {
  container: HTMLElement | undefined;
  /** ids der Karten auf der Bühne, in der Reihenfolge des Beweises */
  ids: number[];
}
let { container, ids }: Props = $props();

/** So weit hängt der Faden zwischen zwei Nadeln durch (px) */
const SAG = 14;

/** SVG-Pfad des Fadens; leer, solange es nichts zu verbinden gibt */
let path = $state('');

$effect(() => {
  const el = container;
  const current = ids;
  // erst messen, wenn die gelandeten Karten sichtbar geworden sind
  void tick().then(() => {
    path = el ? threadPath(el, current) : '';
  });
});

/** Von Nadel zu Nadel, jeweils leicht durchhängend. */
function threadPath(el: HTMLElement, cardIds: number[]): string {
  const origin = el.getBoundingClientRect();
  const pins = cardIds.flatMap((id) => {
    const rect = el.querySelector(`[data-stage-slot="${id}"]`)?.getBoundingClientRect();
    return rect ? [{ x: rect.left - origin.left + rect.width / 2, y: rect.top - origin.top + rect.width * 0.05 }] : [];
  });
  const [first, ...rest] = pins;
  if (!first || rest.length === 0) return '';
  let d = `M${first.x} ${first.y}`;
  let previous = first;
  for (const pin of rest) {
    const midX = (previous.x + pin.x) / 2;
    const lowY = Math.max(previous.y, pin.y) + SAG;
    d += ` Q${midX} ${lowY} ${pin.x} ${pin.y}`;
    previous = pin;
  }
  return d;
}
</script>

{#if path}
  <svg class="thread" aria-hidden="true">
    {#key path}<path d={path} pathLength="1" />{/key}
  </svg>
{/if}

<style>
  /* der Faden liegt über den Karten, von Nadel zu Nadel */
  .thread {
    position: absolute;
    inset: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }

  /* Rot wie ein Wollfaden – unabhängig vom Farbschema */
  path {
    fill: none;
    stroke: #c4232f;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-dasharray: 1;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35));
    animation: draw 0.35s ease-out both;
  }

  @keyframes draw {
    from {
      stroke-dashoffset: 1;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
</style>
