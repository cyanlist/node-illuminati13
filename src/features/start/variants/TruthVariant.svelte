<script lang="ts">
import { type Settings, TRUTH_GOALS } from '../../../core/settings';
import CheckOption from '../../../ui/CheckOption.svelte';

/**
 * Variante „Die wahre Wahrheit erkennen“: Statt das ganze Deck zu spielen, geht es um ein Punkteziel – leere
 * Nachziehstapel werden aus den Ablagestapeln nachgemischt. 13 ist das kurze Spiel, 100 ein langer Abend.
 */
let { draft = $bindable() }: { draft: Settings } = $props();

const description = $derived(
  draft.mode === 'solo'
    ? 'Wie viele Züge brauchst du für das Punkteziel? Ist der Nachziehstapel leer, wird aus den Ablagestapeln nachgemischt.'
    : 'Wer zuerst das Punkteziel erreicht, beendet das Spiel – die Runde wird noch zu Ende gespielt. Ist der Nachziehstapel leer, wird aus den Ablagestapeln nachgemischt.',
);
const GOAL_NAMES: Partial<Record<number, string>> = { 13: 'kurz', 100: 'lang' };
</script>

<CheckOption title="Die wahre Wahrheit erkennen" {description} bind:checked={draft.truth} />

{#if draft.truth}
  <label class="field">
    Punkteziel
    <select bind:value={draft.truthGoal}>
      {#each TRUTH_GOALS as goal (goal)}
        <option value={goal}>{goal} Punkte{GOAL_NAMES[goal] ? ` (${GOAL_NAMES[goal]})` : ''}</option>
      {/each}
    </select>
  </label>
{/if}

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-weight: 700;
  }
</style>
