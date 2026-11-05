<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';

/**
 * Kleiner Knopf nur mit Symbol. Die Beschriftung steht für Screenreader und als Tooltip da; das Symbol ist ein
 * SVG mit viewBox 0 0 24 24 (`children`). Den Innenabstand kann die Umgebung über --icon-btn-pad verkleinern.
 * Weitere Attribute (z. B. aria-expanded bei einem Menü) gehen direkt an den Knopf.
 */
interface Props extends Omit<HTMLButtonAttributes, 'children' | 'onclick'> {
  label: string;
  onclick: () => void;
  children: Snippet;
}
let { label, onclick, children, ...rest }: Props = $props();
</script>

<button type="button" class="btn btn--ghost icon" aria-label={label} title={label} {onclick} {...rest}>
  {@render children()}
</button>

<style>
  .icon {
    display: inline-grid;
    place-items: center;
    padding: var(--icon-btn-pad, 8px 10px);
  }

  .icon :global(svg) {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }
</style>
