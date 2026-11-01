<script lang="ts">
import type { Snippet } from 'svelte';

/**
 * Ein Einstellungsbereich der Startseite mit Überschrift. `plain`: ohne eigenen Kasten, z. B. in einem Fenster,
 * das schon eine Überschrift hat – die Legende bleibt dann nur für Screenreader.
 */
let { title, plain = false, children }: { title: string; plain?: boolean; children: Snippet } = $props();
</script>

<fieldset class="surface" class:plain>
  <legend class="eyebrow" class:sr-only={plain}>{title}</legend>
  {@render children()}
</fieldset>

<style>
  fieldset {
    min-width: 0;
    margin: 0;
    padding: 16px 18px;
    border: 0;
  }

  /* float holt die Legende in den Kasten statt auf dessen Rand */
  legend {
    float: left;
    width: 100%;
    padding: 0;
    margin-bottom: 10px;
  }

  legend + :global(*) {
    clear: both;
  }

  .plain {
    padding: 0;
    background: none;
    box-shadow: none;
  }
</style>
