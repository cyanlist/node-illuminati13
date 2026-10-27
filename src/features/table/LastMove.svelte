<script lang="ts">
import { type GameState, playerAt } from '../../core/game';
import { table } from '../../state/table.svelte';
import Chip from '../../ui/Chip.svelte';
import Subject from '../../ui/Subject.svelte';
import LogText from './LogText.svelte';

/** Zeile über der Hand: während des Ablegens die gelandeten Karten, danach der Rechenweg des letzten Zugs. */
let { game }: { game: GameState } = $props();

const lastEntry = $derived(game.lastMove === null ? undefined : game.log[game.lastMove]);
</script>

<p aria-live="polite">
  {#if table.anim}
    <Subject player={playerAt(game, table.anim.player)} third="legt ab" second="legst ab" />{#if table.anim.landed.length > 0}:
      {#each table.anim.landed as card (card.id)}<Chip {card} />{' '}{/each}
    {:else}{' …'}{/if}
  {:else if lastEntry}
    <span class="muted">Zuletzt:</span> <LogText {game} entry={lastEntry} />
  {/if}
</p>

<style>
  p {
    margin: 0;
    min-height: 1.5em;
    text-align: center;
  }
</style>
