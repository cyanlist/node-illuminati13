<script lang="ts">
import { currentPlayer, type GameState } from '../../core/game';
import { revealHand } from '../../state/actions';
import Sheet from '../../ui/Sheet.svelte';
import LogText from '../table/LogText.svelte';

/** Zu zweit an einem Gerät: Übergabe, ohne dass die nächste Person die Karten der vorigen sieht. */
let { game }: { game: GameState } = $props();

const name = $derived(currentPlayer(game).name);
const lastEntry = $derived(game.lastMove === null ? undefined : game.log[game.lastMove]);
</script>

<Sheet title="{name} ist an der Reihe">
  {#if lastEntry}
    <p class="muted">Der Rechenweg aus dem letzten Zug:</p>
    <p><LogText {game} entry={lastEntry} /></p>
  {/if}
  <p>Gib das Gerät an {name} weiter. Die Karten bleiben verdeckt, bis du auf „Karten aufdecken“ tippst.</p>

  {#snippet actions()}
    <button type="button" class="btn btn--primary" onclick={revealHand}>Karten aufdecken</button>
  {/snippet}
</Sheet>
