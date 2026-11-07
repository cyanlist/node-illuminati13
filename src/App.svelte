<script lang="ts">
import Sheets from './features/sheets/Sheets.svelte';
import StartPage from './features/start/StartPage.svelte';
import FlyingCards from './features/table/FlyingCards.svelte';
import GameView from './features/table/GameView.svelte';
import { online } from './state/online.svelte';
import { table } from './state/table.svelte';
import { keepScreenOn } from './ui/keep-awake';
import SymbolSprite from './ui/SymbolSprite.svelte';

// an zwei Geräten bleibt der Bildschirm an, solange die Verbindung steht oder entsteht
$effect(() => {
  if (online.active) return keepScreenOn();
});
</script>

<SymbolSprite />

{#if table.shownGame}
  <GameView game={table.shownGame} />
{:else}
  <StartPage />
{/if}

<Sheets />
<FlyingCards />
