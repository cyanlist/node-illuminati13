<script lang="ts">
import type { Ending, Settings } from '../../core/settings';
import ChoiceGroup, { type Choice } from '../../ui/ChoiceGroup.svelte';
import Panel from './Panel.svelte';

/** Wie lange gespielt wird: das ganze Deck oder kurz, bis jemand 13 Punkte hat. */
let { draft = $bindable(), plain = false }: { draft: Settings; plain?: boolean } = $props();

const solo = $derived(draft.mode === 'solo');
const endings: Choice<Ending>[] = $derived([
  {
    value: 'deck',
    title: 'Ganzes Deck',
    description: 'Gespielt wird, bis der Nachziehstapel leer ist. Die meisten Punkte gewinnen.',
  },
  {
    value: 'thirteen',
    title: 'Bis 13',
    description: solo
      ? 'Wie viele Züge brauchst du für 13 Punkte? Je weniger, desto besser.'
      : 'Wer zuerst 13 Punkte hat, beendet das Spiel – die Runde wird noch zu Ende gespielt.',
  },
]);
</script>

<Panel title="Länge" {plain}>
  <ChoiceGroup name="ending" options={endings} bind:value={draft.ending} />
</Panel>
