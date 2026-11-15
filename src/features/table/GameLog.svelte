<script lang="ts">
import { fly } from 'svelte/transition';
import type { GameState } from '../../core/game';
import { setLogPanel, sheets } from '../../state/sheets.svelte';
import LogList from './LogList.svelte';

/**
 * Das Protokoll als Seitenleiste auf breiten Bildschirmen: Der Protokoll-Knopf oben schiebt es von rechts über den
 * Tisch – ohne Abdunkeln, das Spiel bleibt sichtbar und bedienbar, und nichts rückt. Auf schmalen Bildschirmen öffnet
 * der Knopf stattdessen ein Fenster (LogSheet).
 */
let { game }: { game: GameState } = $props();

function onkeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && sheets.logPanel) setLogPanel(false);
}
</script>

<svelte:window {onkeydown} />

{#if sheets.logPanel}
  <aside class="surface" aria-label="Protokoll" transition:fly={{ x: 32, duration: 220 }}>
    <div class="head">
      <h2 class="eyebrow">Protokoll</h2>
      <button type="button" class="close btn btn--ghost" aria-label="Protokoll schließen" onclick={() => setLogPanel(false)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
    <div class="list"><LogList {game} /></div>
  </aside>
{/if}

<style>
  aside {
    display: none;
  }

  /* liegt rechts über dem Tisch, so hoch wie er; nur die Liste scrollt */
  @media (min-width: 980px) {
    aside {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 6;
      display: flex;
      flex-direction: column;
      width: 320px;
      padding: 12px 6px 12px 14px;
      box-shadow: 0 12px 32px var(--shadow), 0 0 0 1px var(--line);
    }
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 6px;
  }

  h2 {
    margin: 0;
  }

  .close {
    display: inline-grid;
    place-items: center;
    padding: 4px 6px;
  }

  .close svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
  }

  .list {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding-right: 8px;
  }
</style>
