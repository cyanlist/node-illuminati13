<script lang="ts">
import { sheets } from '../../state/sheets.svelte';
import IconButton from '../../ui/IconButton.svelte';

/** Kleiner Knopf, der das Protokoll als Fenster öffnet – nur dort, wo es nicht neben dem Tisch steht. */
</script>

<span class="narrow">
  <IconButton label="Protokoll" onclick={() => (sheets.logOpen = true)}>
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1.2" />
      <circle cx="4.5" cy="12" r="1.2" />
      <circle cx="4.5" cy="18" r="1.2" />
    </svg>
  </IconButton>
</span>

<style>
  .narrow {
    display: contents;
  }

  @media (min-width: 980px) {
    .narrow {
      display: none;
    }
  }

  circle {
    fill: currentColor;
    stroke: none;
  }
</style>
