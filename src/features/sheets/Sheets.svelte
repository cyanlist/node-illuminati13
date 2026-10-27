<script lang="ts">
import { table } from '../../state/table.svelte';
import HandoffSheet from './HandoffSheet.svelte';
import OrderSheet from './OrderSheet.svelte';
import ResultsSheet from './ResultsSheet.svelte';
import RulesSheet from './RulesSheet.svelte';

/** Welches Fenster gerade offen ist: die Regeln auf Wunsch, die anderen verlangt der Spielablauf. */
const game = $derived(table.view === 'game' ? table.game : null);
</script>

{#if table.rulesOpen}
  <RulesSheet />
{:else if game && table.phase === 'order'}
  <OrderSheet />
{:else if game && table.phase === 'handoff'}
  <HandoffSheet {game} />
{:else if game && table.phase === 'over' && !table.resultsHidden}
  <ResultsSheet {game} />
{/if}
