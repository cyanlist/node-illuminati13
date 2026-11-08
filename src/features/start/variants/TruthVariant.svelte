<script lang="ts">
import { type Settings, TRUTH_GOALS, type TruthGoal } from '../../../core/settings';
import CheckOption from '../../../ui/CheckOption.svelte';
import DependentOptions from '../../../ui/DependentOptions.svelte';

/**
 * Variante „Die wahre Wahrheit erkennen“: Statt das ganze Deck zu spielen, geht es um ein Punkteziel – leere
 * Nachziehstapel werden aus den Ablagestapeln nachgemischt. Die Ziele sind Zahlen mit Geschichte; ein kurzer
 * Zusatz in der Auswahl verrät, welche.
 */
let { draft = $bindable() }: { draft: Settings } = $props();

const description = $derived(
  draft.mode === 'solo'
    ? 'Wie viele Züge brauchst du für das Punkteziel? Ist der Nachziehstapel leer, wird aus den Ablagestapeln nachgemischt.'
    : 'Wer zuerst das Punkteziel erreicht, beendet das Spiel – die Runde wird noch zu Ende gespielt. Ist der Nachziehstapel leer, wird aus den Ablagestapeln nachgemischt.',
);
const GOAL_NAMES: Record<TruthGoal, string> = {
  13: 'kurz',
  23: 'das 23-Rätsel',
  33: 'der 33. Grad',
  52: 'ein ganzes Deck',
  100: 'lang',
};
</script>

<CheckOption title="Die wahre Wahrheit erkennen" {description} bind:checked={draft.truth} />

<DependentOptions enabled={draft.truth}>
  <label class="field">
    Punkteziel
    <select bind:value={draft.truthGoal}>
      {#each TRUTH_GOALS as goal (goal)}
        <option value={goal}>{goal} Punkte ({GOAL_NAMES[goal]})</option>
      {/each}
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
