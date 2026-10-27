<script lang="ts">
import type { Snippet } from 'svelte';

/** Ein Einstellungsbereich der Startseite mit Überschrift. */
let { title, children }: { title: string; children: Snippet } = $props();
</script>

<fieldset>
  <legend>{title}</legend>
  {@render children()}
</fieldset>

<style>
  fieldset {
    min-width: 0;
    margin: 0;
    padding: 16px 18px;
    border: 0;
    background: var(--surface);
    border-radius: 16px;
    box-shadow: 0 1px 3px var(--shadow);
  }

  /* float holt die Legende in den Kasten statt auf dessen Rand */
  legend {
    float: left;
    width: 100%;
    padding: 0;
    margin: 0 0 10px;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
  }

  legend + :global(*) {
    clear: both;
  }
</style>
