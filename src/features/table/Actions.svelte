<script lang="ts">
import { currentPlayer, type GameState } from '../../core/game';
import { playSelection, showHint } from '../../state/actions';
import { goHome } from '../../state/flow';
import { sheets } from '../../state/sheets.svelte';
import { table } from '../../state/table.svelte';
import { hintButton, mainButton } from './buttons';

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
    <button type="button" class="btn btn--primary" onclick={() => (sheets.resultsHidden = false)}>Ergebnis ansehen</button>
    <button type="button" class="btn btn--ghost" onclick={goHome}>Andere Einstellungen</button>
  {:else if table.canPlay}
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
  /* Ablegen genau in der Mitte, der Tipp rechts daneben – ändert der Tipp seine Beschriftung, bleibt Ablegen stehen */
  .actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: 10px;
  }

  /* breit genug für die längsten Beschriftungen („… ist am Zug …“, „13 beweisen · +4 Punkte“) – sonst wanderte
     der Tipp bei jedem Wechsel mit */
  .actions > :global(.btn--primary) {
    grid-column: 2;
    min-width: 300px;
  }

  .actions > :global(.btn--ghost) {
    justify-self: start;
  }

  /* Handy: Ablegen über die ganze Breite, der Tipp klein darunter */
  @media (max-width: 620px) {
    .actions {
      grid-template-columns: minmax(0, 1fr);
      gap: 8px;
    }

    .actions > :global(.btn--primary) {
      grid-column: 1;
      min-width: 0;
    }

    .actions > :global(.btn--ghost) {
      justify-self: center;
      padding: 6px 14px;
      font-size: 14px;
    }
  }

  /* Platz für zwei Zeilen, auch wenn gerade nichts dasteht – sonst rückt der Tisch hoch, sobald ein Tipp
     auf dem Handy umbricht (die Höhe ist in GameView unter CHROME eingerechnet) */
  .message {
    margin: 0;
    min-height: 2.9em;
    line-height: 1.45;
    text-align: center;
    color: var(--muted);
    font-weight: 700;
  }
</style>
