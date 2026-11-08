<script lang="ts">
import { DIR_LABELS, ROTATION_DIRS } from '../../../core/rules';
import type { Settings } from '../../../core/settings';
import CheckOption from '../../../ui/CheckOption.svelte';
import DependentOptions from '../../../ui/DependentOptions.svelte';

/** Variante „Wenn die Weltordnung sich verschiebt“ – und in welche Richtung die Stapel dann rücken. */
let { draft = $bindable() }: { draft: Settings } = $props();
</script>

<CheckOption
  title="Wenn die Weltordnung sich verschiebt"
  description="Landet eine 13 auf einem Stapel, rücken alle vier Stapel eine Position weiter und gelten dann nach der Regel ihres neuen Platzes."
  bind:checked={draft.variant}
/>

<DependentOptions enabled={draft.variant}>
  <label class="field">
    Richtung, in die die Stapel rücken
    <select bind:value={draft.dir}>
      {#each ROTATION_DIRS as dir (dir)}<option value={dir}>{DIR_LABELS[dir]}</option>{/each}
    </select>
  </label>
</DependentOptions>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-weight: 700;
  }
</style>
