<script lang="ts">
import { table } from '../../state/table.svelte';

/** Kleiner Knopf, der das Protokoll als Fenster öffnet – nur dort, wo es nicht neben dem Tisch steht. */
</script>

<button type="button" class="btn btn--ghost icon" aria-label="Protokoll" title="Protokoll" onclick={() => (table.logOpen = true)}>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r="1.2" />
    <circle cx="4.5" cy="12" r="1.2" />
    <circle cx="4.5" cy="18" r="1.2" />
  </svg>
</button>

<style>
  .icon {
    display: inline-grid;
    place-items: center;
    padding: 8px 10px;
  }

  @media (min-width: 980px) {
    .icon {
      display: none;
    }
  }

  svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }

  circle {
    fill: currentColor;
    stroke: none;
  }
</style>
