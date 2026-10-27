<script lang="ts">
import type { Settings } from '../../core/settings';
import Panel from './Panel.svelte';

/** Wahre Werte anzeigen und die Variante „Wenn die Weltordnung sich verschiebt“. */
let { draft = $bindable() }: { draft: Settings } = $props();
</script>

<Panel title="Optionen">
  <label class="check">
    <input type="checkbox" bind:checked={draft.showValues} />
    <b>Wahre Werte anzeigen</b>
    <small>Ausgeschaltet rechnest du selbst im Kopf, wie am echten Tisch.</small>
  </label>

  <label class="check">
    <input type="checkbox" bind:checked={draft.variant} />
    <b>Variante „Wenn die Weltordnung sich verschiebt“</b>
    <small>Landet eine 13 auf einem Stapel, wandern alle vier Regeln eine Position weiter.</small>
  </label>

  {#if draft.variant}
    <label class="field">
      Richtung der Verschiebung
      <select bind:value={draft.dir}>
        <option value="rechts">nach rechts (Herz → Pik → Karo → Kreuz → Herz)</option>
        <option value="links">nach links (Herz → Kreuz → Karo → Pik → Herz)</option>
      </select>
    </label>
  {/if}
</Panel>

<style>
  .check {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2px 10px;
    margin-block: 4px 12px;
    cursor: pointer;
  }

  .check input {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: var(--accent);
  }

  .check small {
    grid-column: 2;
    color: var(--muted);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-weight: 700;
  }
</style>
