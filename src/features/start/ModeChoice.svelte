<script lang="ts">
import type { GameMode, Settings } from '../../core/settings';
import ModeIcon from './ModeIcon.svelte';
import { MODE_OPTIONS } from './modes';

/**
 * Erste Ebene der Startseite: Wie willst du spielen? Vier Kacheln, sonst nichts. Ein Tipp auf eine Kachel spielt
 * gleich los – mit den Einstellungen vom letzten Mal; „Anpassen“ führt zum Einrichten. Die zuletzt gespielte
 * Kachel ist nur dezent umrandet. Zwei Geräte müssen sich erst verbinden und führen deshalb immer zum Einrichten.
 */
interface Props {
  draft: Settings;
  /** Die zuletzt gestartete Spielart – ihre Kachel ist markiert; null, solange auf diesem Gerät noch nicht gespielt wurde */
  last: GameMode | null;
  onplay: (mode: GameMode) => void;
  onadjust: (mode: GameMode) => void;
}
let { draft, last, onplay, onadjust }: Props = $props();
</script>

<section class="choice surface" aria-labelledby="choice-title">
  <h2 id="choice-title" class="eyebrow">Wie willst du spielen?</h2>
  <ul>
    {#each MODE_OPTIONS as option (option.mode)}
      {@const isLast = last === option.mode}
      <li class="tile" class:last={isLast}>
        <button
          type="button"
          class="play"
          onclick={() => (option.quickStart ? onplay(option.mode) : onadjust(option.mode))}
        >
          <ModeIcon mode={option.mode} name={draft.names[0]} size="36px" />
          <span class="text">
            <span class="title">{option.title}</span>
          </span>
          {#if !option.quickStart}
            <svg class="chevron" viewBox="0 0 8 14" aria-hidden="true"><path d="M1 1l6 6-6 6" /></svg>
          {/if}
        </button>
        {#if option.quickStart}
          <button
            type="button"
            class="btn btn--ghost btn--small adjust"
            title="{option.title}: anpassen"
            onclick={() => onadjust(option.mode)}
          >
            <!-- Regler wie beim Einstellungs-Knopf; auf dem Handy steht nur das Symbol da -->
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 7h9M17 7h3M4 17h3M11 17h9M17.2 7a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 1 1 4.4 0M11.2 17a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 1 1 4.4 0"
              />
            </svg>
            <span class="adjust-label">Anpassen</span>
          </button>
        {/if}
      </li>
    {/each}
  </ul>
</section>

<style>
  .choice {
    padding: 16px 18px;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 10px 0 0;
    padding: 0;
    list-style: none;
  }

  .tile {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 10px;
    border: 1.5px solid var(--line);
    border-radius: 14px;
    transition: border-color 0.2s;
  }

  .tile:hover {
    border-color: var(--muted);
  }

  .last {
    border-color: var(--accent);
  }

  /* die ganze Kachel ist der Knopf – nur „Anpassen“ rechts ist ein eigener */
  .play {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 4px 12px 10px;
    font: inherit;
    text-align: left;
    color: var(--text);
    background: none;
    border: 0;
    border-radius: 12px;
    cursor: pointer;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .title {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 8px;
    font-weight: 700;
    font-size: 17px;
  }



  .chevron {
    flex: none;
    width: 8px;
    height: 14px;
    margin: 0 4px 0 auto;
    fill: none;
    stroke: var(--muted);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .adjust {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .adjust svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }


  /* Handy: flacher, damit alle vier Kacheln und die Knöpfe darunter ohne viel Scrollen zu sehen sind */
  @media (max-width: 620px) {
    .choice {
      padding: 14px;
    }

    .tile {
      padding-right: 8px;
    }

    .play {
      gap: 10px;
      padding: 10px 2px 10px 8px;
    }

    .title {
      font-size: 16px;
    }


    /* nur das Regler-Symbol – der Text bekommt den Platz */
    .adjust {
      padding: 8px;
    }

    .adjust-label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
  }
</style>
