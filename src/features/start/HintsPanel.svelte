<script lang="ts">
import type { HintLevel, Settings } from '../../core/settings';
import CheckOption from './CheckOption.svelte';
import ChoiceGroup, { type Choice } from './ChoiceGroup.svelte';
import Panel from './Panel.svelte';

/** Wie viel der Tipp verrät und ob er einen Punkt kostet. */
let { draft = $bindable(), plain = false }: { draft: Settings; plain?: boolean } = $props();

const levels: Choice<HintLevel>[] = [
  { value: 'off', title: 'Aus', description: 'Kein Tipp-Knopf – du findest jede 13 selbst.' },
  { value: 'nudge', title: 'Andeutung', description: 'Verrät nur, ob es eine 13 gibt und aus wie vielen Karten.' },
  { value: 'full', title: 'Volle Hilfe', description: 'Markiert die Karten einer 13 – zum Lernen der Regeln.' },
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
