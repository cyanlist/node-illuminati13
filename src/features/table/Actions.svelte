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

/*
 * Kopfschütteln: Ergibt die Auswahl keine 13, wackelt der Knopf kurz (dazu die Rückmeldung darunter). Jeder neue
 * Versuch startet die Bewegung von vorn – erst Klasse weg, im nächsten Bild wieder dran.
 */
let shaking = $state(false);
let seen = table.rejected;
$effect(() => {
  if (table.rejected === seen) return;
  seen = table.rejected;
  shaking = false;
  requestAnimationFrame(() => (shaking = true));
});
const waitingLabel = $derived(
  table.anim
    ? 'Wird abgelegt …'
    : table.phase === 'cpu' || table.phase === 'remote'
      ? `${currentPlayer(game).name} ist am Zug …`
      : 'Ablegen',
);
</script>

<div class="actions" data-tour="actions">
  {#if table.phase === 'over' && !table.anim}
    <button type="button" class="btn btn--primary" onclick={() => (sheets.resultsHidden = false)}>Ergebnis ansehen</button>
    <button type="button" class="btn btn--ghost" onclick={goHome}>Andere Einstellungen</button>
  {:else if table.canPlay}
    <button
      type="button"
      class="btn btn--primary"
      class:btn--win={main.win}
      class:shake={shaking}
      disabled={main.disabled}
      onclick={playSelection}
      onanimationend={() => (shaking = false)}
    >
      {main.label}
    </button>
    {#if !hint.hidden}
      <button
        type="button"
        class="btn btn--ghost"
        data-tour="hint"
        disabled={hint.disabled}
        title={hint.title}
        onclick={showHint}
      >
        {hint.label}
      </button>
    {/if}
  {:else}
    <button type="button" class="btn btn--primary" disabled>{waitingLabel}</button>
    {#if !hint.hidden}<button type="button" class="btn btn--ghost" data-tour="hint" disabled>Tipp</button>{/if}
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

  /* Kopfschütteln – wer „Bewegung reduzieren“ eingestellt hat, sieht nur die Rückmeldung */
  .shake {
    animation: shake 0.4s ease-out;
  }

  @keyframes shake {
    20% {
      transform: translateX(-7px);
    }
    40% {
      transform: translateX(6px);
    }
    60% {
      transform: translateX(-4px);
    }
    80% {
      transform: translateX(2px);
    }
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
