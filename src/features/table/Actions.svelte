<script lang="ts">
import { currentPlayer, type GameState } from '../../core/game';
import { playSelection, showHint } from '../../state/actions';
import { hintButton, mainButton } from '../../state/buttons';
import { goHome } from '../../state/flow';
import { table } from '../../state/table.svelte';

/**
 * Der eine Ablegen-Knopf und – falls eingeschaltet – der Tipp, darunter eine kurze Rückmeldung. Der Tipp steht
 * bewusst rechts daneben bzw. auf dem Handy darunter, damit man ihn nicht aus Versehen statt „Ablegen“ trifft.
 */
let { game }: { game: GameState } = $props();

const main = $derived(mainButton());
const hint = $derived(hintButton());
const waitingLabel = $derived(
  table.anim
    ? 'Wird abgelegt …'
    : table.phase === 'cpu' || table.phase === 'remote'
      ? `${currentPlayer(game).name} ist am Zug …`
      : 'Ablegen',
);
</script>

<div class="actions">
  {#if table.phase === 'over' && !table.anim}
    <button type="button" class="btn btn--primary" onclick={() => (table.resultsHidden = false)}>Ergebnis ansehen</button>
    <button type="button" class="btn btn--ghost" onclick={goHome}>Andere Einstellungen</button>
  {:else if table.phase === 'play' && !table.anim}
    <button type="button" class="btn btn--primary" class:btn--win={main.win} disabled={main.disabled} onclick={playSelection}>
      {main.label}
    </button>
    {#if !hint.hidden}
      <button type="button" class="btn btn--ghost" disabled={hint.disabled} title={hint.title} onclick={showHint}>
        {hint.label}
      </button>
    {/if}
  {:else}
    <button type="button" class="btn btn--primary" disabled>{waitingLabel}</button>
    {#if !hint.hidden}<button type="button" class="btn btn--ghost" disabled>Tipp</button>{/if}
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

  /* Handy: Ablegen über die ganze Breite, der Tipp klein darunter */
  @media (max-width: 620px) {
    .actions {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }

    .actions :global(.btn--ghost) {
      align-self: center;
      padding: 6px 14px;
      font-size: 14px;
    }
  }

  .message {
    margin: 0;
    min-height: 1.45em;
    text-align: center;
    color: var(--muted);
    font-weight: 700;
  }
</style>
