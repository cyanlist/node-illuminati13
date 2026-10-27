<script lang="ts">
import { currentPlayer, type GameState } from '../../core/game';
import { playSelection, showHint } from '../../state/actions';
import { goHome } from '../../state/flow';
import { mainButton } from '../../state/main-button';
import { table } from '../../state/table.svelte';

/** Tipp und der eine Ablegen-Knopf; darunter eine kurze Rückmeldung. */
let { game }: { game: GameState } = $props();

const main = $derived(mainButton());
const waitingLabel = $derived(
  table.anim ? 'Wird abgelegt …' : table.phase === 'cpu' ? `${currentPlayer(game).name} ist am Zug …` : 'Ablegen',
);
</script>

<div class="actions">
  {#if table.phase === 'over' && !table.anim}
    <button type="button" class="btn btn--ghost" onclick={goHome}>Andere Einstellungen</button>
    <button type="button" class="btn btn--primary" onclick={() => (table.resultsHidden = false)}>Ergebnis ansehen</button>
  {:else if table.phase === 'play' && !table.anim}
    <button type="button" class="btn btn--ghost" onclick={showHint}>Tipp</button>
    <button type="button" class="btn btn--primary" class:btn--win={main.win} disabled={main.disabled} onclick={playSelection}>
      {main.label}
    </button>
  {:else}
    <button type="button" class="btn btn--ghost" disabled>Tipp</button>
    <button type="button" class="btn btn--primary" disabled>{waitingLabel}</button>
  {/if}
</div>
<p class="message" aria-live="polite">{table.message}</p>

<style>
  .actions {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .actions :global(.btn--primary) {
    min-width: min(260px, 100%);
  }

  .message {
    margin: 0;
    min-height: 1.45em;
    text-align: center;
    color: var(--muted);
    font-weight: 700;
  }
</style>
