<script lang="ts">
import type { Snippet } from 'svelte';

/**
 * Ein Einstellungsbereich der Startseite mit Überschrift. `plain`: ohne eigenen Kasten, z. B. in einem Fenster,
 * das schon eine Überschrift hat – die Legende bleibt dann nur für Screenreader. `aside`: ein kurzer Zusatz rechts
 * in der Überschriftenzeile (z. B. wer einstellt) – er braucht keine eigene Zeile, damit nichts darunter rückt.
 */
interface Props {
  title: string;
  plain?: boolean;
  aside?: string;
  children: Snippet;
}
let { title, plain = false, aside, children }: Props = $props();
</script>

<fieldset class="surface" class:plain>
  <legend class="eyebrow" class:sr-only={plain}>
    <span class="head">
      <span>{title}</span>
      {#if aside}<span class="aside">{aside}</span>{/if}
    </span>
  </legend>
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

  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }

  .aside {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-transform: none;
    letter-spacing: normal;
    font-weight: 400;
  }

  .plain {
    padding: 0;
    background: none;
    box-shadow: none;
  }
</style>
