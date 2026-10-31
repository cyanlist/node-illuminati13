<script lang="ts">
import { online } from '../../state/online.svelte';
import { table } from '../../state/table.svelte';
import ConnectSheet from '../online/ConnectSheet.svelte';
import SettingsView from '../settings/SettingsView.svelte';
import HandoffSheet from './HandoffSheet.svelte';
import LogSheet from './LogSheet.svelte';
import OrderSheet from './OrderSheet.svelte';
import ResultsSheet from './ResultsSheet.svelte';
import RulesSheet from './RulesSheet.svelte';

/** Welches Fenster gerade offen ist: Regeln und Protokoll auf Wunsch, die anderen verlangt der Spielablauf. */
const game = $derived(table.view === 'game' ? table.game : null);
</script>

{#if table.settingsOpen}
  <SettingsView />
{:else if online.sheetOpen}
  <ConnectSheet />
{:else if table.rulesOpen}
  <RulesSheet />
{:else if game && table.logOpen}
  <LogSheet {game} />
{:else if game && table.phase === 'order'}
  <OrderSheet />
{:else if game && table.phase === 'handoff'}
  <HandoffSheet {game} />
{:else if game && table.phase === 'over' && !table.resultsHidden}
  <ResultsSheet {game} />
{/if}
