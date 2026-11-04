<script lang="ts">
import { DIR_LABELS, ROTATION_DIRS } from '../../core/rules';
import type { Settings } from '../../core/settings';
import CheckOption from '../../ui/CheckOption.svelte';
import Panel from './Panel.svelte';

/** Wahre Werte anzeigen, offene Karten und die Variante „Wenn die Weltordnung sich verschiebt“. */
let { draft = $bindable(), plain = false }: { draft: Settings; plain?: boolean } = $props();
</script>

<Panel title="Extras" {plain}>
  <CheckOption
    title="Wahre Werte anzeigen"
    description="Ausgeschaltet rechnest du selbst im Kopf, wie am echten Tisch."
    bind:checked={draft.showValues}
  />
  {#if draft.mode !== 'solo'}
    <CheckOption
      title="Mit offenen Karten spielen"
      description="Die Karten des Gegenübers liegen offen – zum Lernen und Zuschauen. Zu zweit entfällt die Übergabe."
      bind:checked={draft.openHands}
    />
  {/if}
  <CheckOption
    title="Variante „Wenn die Weltordnung sich verschiebt“"
    description="Landet eine 13 auf einem Stapel, rücken alle vier Stapel eine Position weiter und gelten dann nach der Regel ihres neuen Platzes."
    bind:checked={draft.variant}
  />

  {#if draft.variant}
    <label class="field">
      Richtung, in die die Stapel rücken
      <select bind:value={draft.dir}>
        {#each ROTATION_DIRS as dir (dir)}<option value={dir}>{DIR_LABELS[dir]}</option>{/each}
      </select>
    </label>
  {/if}
</Panel>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-weight: 700;
  }
</style>
