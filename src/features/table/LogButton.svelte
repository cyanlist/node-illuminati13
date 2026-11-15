<script lang="ts">
import { sheets, toggleLog } from '../../state/sheets.svelte';
import IconButton from '../../ui/IconButton.svelte';

/**
 * Kleiner Knopf für das Protokoll: auf breiten Bildschirmen klappt er die Seitenleiste auf und zu, sonst öffnet er
 * das Protokoll als Fenster.
 */
</script>

<IconButton label="Protokoll" aria-pressed={sheets.logPanel} onclick={toggleLog}>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r="1.2" />
    <circle cx="4.5" cy="12" r="1.2" />
    <circle cx="4.5" cy="18" r="1.2" />
  </svg>
</IconButton>

<style>
  circle {
    fill: currentColor;
    stroke: none;
  }
</style>
