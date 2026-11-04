<script lang="ts">
import type { Settings } from '../../core/settings';
import Panel from './Panel.svelte';
import TruthVariant from './variants/TruthVariant.svelte';
import WorldOrderVariant from './variants/WorldOrderVariant.svelte';

/**
 * Alle Varianten an einem Ort – alles, was den Spielablauf verändert. Jede Variante ist ein eigener Block in
 * variants/ mit einem Schalter (und ggf. ihren Einstellungen darunter); eine neue Variante bekommt dort ihre Datei und
 * hier ihren Platz (Kurzfassung: sections.ts). Ohne Variante wird das ganze Deck gespielt.
 */
let { draft = $bindable(), plain = false }: { draft: Settings; plain?: boolean } = $props();
</script>

<Panel title="Varianten" {plain}>
  <div class="variants">
    <section><TruthVariant bind:draft /></section>
    <section><WorldOrderVariant bind:draft /></section>
  </div>
</Panel>

<style>
  .variants {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  section + section {
    padding-top: 12px;
    border-top: 1px solid var(--line);
  }
</style>
