<script lang="ts">
import Sheets from './features/sheets/Sheets.svelte';
import StartPage from './features/start/StartPage.svelte';
import FlyingCards from './features/table/FlyingCards.svelte';
import GameView from './features/table/GameView.svelte';
import { table } from './state/table.svelte';
import SymbolSprite from './ui/SymbolSprite.svelte';
</script>

<SymbolSprite />

{#if table.view === 'game' && table.game}
  <GameView game={table.game} />
{:else}
  <StartPage />
{/if}

<Sheets />
<FlyingCards />
