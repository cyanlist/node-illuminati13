<script lang="ts">
import type { Snippet } from 'svelte';

/**
 * Einstellungen, die nur gelten, wenn etwas anderes eingeschaltet ist (z. B. das Punkteziel einer Variante).
 * Sie bleiben immer sichtbar und sind nur ausgegraut, solange sie nicht gelten – so rückt beim Einschalten nichts
 * nach, und man sieht vorher schon, was dazukommt. Ein `fieldset` sperrt dabei alle Felder darin auf einmal.
 */
let { enabled, children }: { enabled: boolean; children: Snippet } = $props();
</script>

<fieldset disabled={!enabled}>{@render children()}</fieldset>

<style>
  fieldset {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
    transition: opacity 0.2s;
  }

  fieldset:disabled {
    opacity: 0.5;
  }

  fieldset:disabled :global(*) {
    cursor: default;
  }
</style>
