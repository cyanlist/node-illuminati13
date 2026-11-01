<script lang="ts">
import { sheets } from '../../state/sheets.svelte';
import IconButton from '../../ui/IconButton.svelte';

/** Kleiner Knopf mit Reglern, der den Einstellungsbereich öffnet – auf der Startseite und am Tisch. */
</script>

<IconButton label="Einstellungen" onclick={() => (sheets.settingsOpen = true)}>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2.2" />
    <circle cx="9" cy="17" r="2.2" />
  </svg>
</IconButton>
