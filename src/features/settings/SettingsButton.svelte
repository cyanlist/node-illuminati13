<script lang="ts">
import { table } from '../../state/table.svelte';

/** Kleiner Knopf mit Reglern, der den Einstellungsbereich öffnet – auf der Startseite und am Tisch. */
</script>

<button type="button" class="btn btn--ghost icon" aria-label="Einstellungen" title="Einstellungen" onclick={() => (table.settingsOpen = true)}>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2.2" />
    <circle cx="9" cy="17" r="2.2" />
  </svg>
</button>

<style>
  .icon {
    display: inline-grid;
    place-items: center;
    padding: 8px 10px;
  }

  svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }
</style>
