<script lang="ts">
import type { Snippet } from 'svelte';

/**
 * Ein Einstellungsbereich der Startseite mit Überschrift. `plain`: ohne eigenen Kasten, z. B. in einem Fenster,
 * das schon eine Überschrift hat – die Legende bleibt dann nur für Screenreader.
 */
let { title, plain = false, children }: { title: string; plain?: boolean; children: Snippet } = $props();
</script>

<fieldset class:plain>
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

  .plain {
    padding: 0;
    background: none;
    box-shadow: none;
  }

  .plain legend {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
</style>
