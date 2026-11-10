<script lang="ts">
import type { GameState } from '../../core/game';
import { goHome } from '../../state/flow';
import { coach, nextPage, playOn } from '../../state/lesson.svelte';
import Chip from '../../ui/Chip.svelte';

/**
 * Die Erklärzeile der Lernrunde über dem Tisch: was gerade zu tun ist, vor manchen Zügen mit „Weiter“. Worauf ein
 * Satz zeigt, hebt der Tisch hervor (data-coach am Dokument, die Ziele tragen data-tour). Die Zeile behält ihre Höhe –
 * drei Zeilen Text sind immer reserviert, die Knöpfe stehen auch dann da, wenn sie gerade nichts zu tun haben.
 */
let { game }: { game: GameState } = $props();

const view = $derived(coach(game));

$effect(() => {
  const root = document.documentElement;
  if (view.focus) root.dataset.coach = view.focus;
  else delete root.dataset.coach;
  return () => {
    delete root.dataset.coach;
  };
});
</script>

<section class="coach surface" aria-label="Lernrunde">
  <!-- am Ende ohne Zähler – neben zwei Knöpfen wäre es auf dem Handy zu eng -->
  <p class="step">Lernrunde{view.action === 'end' ? '' : ` · Zug ${view.step} von ${view.steps}`}</p>
  <div class="buttons">
    {#if view.action === 'end'}
      <button type="button" class="btn btn--ghost btn--small" onclick={goHome}>Startseite</button>
      <button type="button" class="btn btn--primary btn--small" onclick={playOn}>Weiterspielen</button>
    {:else}
      <!-- auch ohne „Weiter“ da, nur unsichtbar – sonst spränge die Zeile -->
      <button
        type="button"
        class="btn btn--primary btn--small"
        class:idle={view.action !== 'next'}
        disabled={view.action !== 'next'}
        onclick={nextPage}
      >
        Weiter
      </button>
    {/if}
  </div>
  <p class="line" aria-live="polite">
    {#each view.line as part, i (i)}{#if typeof part === 'string'}{part}{:else}<Chip card={part} />{/if}{/each}
  </p>
</section>

<style>
  .coach {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'step buttons'
      'line buttons';
    align-items: center;
    gap: 2px 16px;
    padding: 12px 16px;
    border-left: 4px solid var(--focus);
  }

  .step {
    grid-area: step;
    margin: 0;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .line {
    grid-area: line;
    margin: 0;
    font-size: 16px;
    line-height: 1.45;
    /* genau drei Zeilen hoch – längere Sätze gibt es nicht (tests/lesson.test.ts); so verschieben auch die kleinen
       Karten im Satz nichts */
    height: calc(3 * 1.45em);
    text-wrap: pretty;
  }

  /* kleine Karten im Satz – flach genug, dass ihre Zeile nicht höher wird als die anderen */
  .line :global(.chip) {
    line-height: 1.1;
    vertical-align: middle;
  }

  .buttons {
    grid-area: buttons;
    display: flex;
    gap: 8px;
  }

  .idle {
    visibility: hidden;
  }

  /* breite Bildschirme: Jeder Satz passt in eine Zeile – zwei reichen zur Sicherheit */
  @media (min-width: 980px) {
    .line {
      height: calc(2 * 1.45em);
    }
  }

  /* Handy: die Knöpfe neben „Lernrunde“, der Satz darunter über die ganze Breite */
  @media (max-width: 620px) {
    .coach {
      grid-template-areas:
        'step buttons'
        'line line';
      gap: 6px 10px;
      padding: 10px 12px;
    }

    .line {
      font-size: 15px;
    }
  }

  /* Worauf der Satz zeigt: ein ruhig pulsierender Rahmen, der nichts verschiebt */
  :global(:is(
      html[data-coach='rules'] [data-tour='rule'],
      html[data-coach='hand'] [data-tour='hand'],
      html[data-coach='piles'] [data-pile],
      html[data-coach='hint'] [data-tour='hint'],
      html[data-coach='opponent'] [data-tour='opponent']
    )) {
    outline: 3px solid var(--focus);
    outline-offset: 4px;
    border-radius: 12px;
    animation: coach-pulse 1.6s ease-in-out infinite;
  }

  @keyframes -global-coach-pulse {
    50% {
      outline-color: color-mix(in srgb, var(--focus) 25%, transparent);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global([data-coach] [data-tour]),
    :global([data-coach] [data-pile]) {
      animation: none;
    }
  }
</style>
