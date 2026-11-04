<script lang="ts">
import { HINT_CHOICES } from '../../core/game';
import type { HintLevel, Settings } from '../../core/settings';
import CheckOption from '../../ui/CheckOption.svelte';
import ChoiceGroup, { type Choice } from '../../ui/ChoiceGroup.svelte';
import Panel from './Panel.svelte';

/** Wie viel der Tipp verrät und ob er einen Punkt kostet. */
let { draft = $bindable(), plain = false }: { draft: Settings; plain?: boolean } = $props();

const levels: Choice<HintLevel>[] = HINT_CHOICES;
</script>

<Panel title="Tipps" {plain}>
  <ChoiceGroup name="hints" options={levels} bind:value={draft.hints} />
  {#if draft.hints !== 'off'}
    <div class="cost">
      <CheckOption
        title="Ein Tipp kostet einen Punkt"
        description="Bezahlt wird einmal pro Zug. Ohne Punkte gibt es keinen Tipp."
        bind:checked={draft.hintCost}
      />
    </div>
  {/if}
</Panel>

<style>
  .cost {
    margin-top: 14px;
  }
</style>
