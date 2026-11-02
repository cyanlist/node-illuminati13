<script lang="ts">
import type { HintLevel, Settings } from '../../core/settings';
import CheckOption from '../../ui/CheckOption.svelte';
import ChoiceGroup, { type Choice } from '../../ui/ChoiceGroup.svelte';
import { HINT_TITLES } from '../../ui/labels';
import Panel from './Panel.svelte';

/** Wie viel der Tipp verrät und ob er einen Punkt kostet. */
let { draft = $bindable(), plain = false }: { draft: Settings; plain?: boolean } = $props();

const levels: Choice<HintLevel>[] = [
  { value: 'off', title: HINT_TITLES.off, description: 'Kein Tipp-Knopf – du findest jede 13 selbst.' },
  { value: 'exists', title: HINT_TITLES.exists, description: 'Verrät nur, ob es gerade eine 13 gibt.' },
  { value: 'nudge', title: HINT_TITLES.nudge, description: 'Verrät, ob es eine 13 gibt und aus wie vielen Karten.' },
  { value: 'full', title: HINT_TITLES.full, description: 'Markiert die Karten einer 13 – zum Lernen der Regeln.' },
];
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
