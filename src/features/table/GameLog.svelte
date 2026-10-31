<script lang="ts">
import type { GameState } from '../../core/game';
import LogList from './LogList.svelte';

/**
 * Protokoll aller Züge neben dem Tisch. Auf schmalen Bildschirmen ist dafür kein Platz – dort öffnet
 * der Protokoll-Knopf oben es als Fenster.
 */
let { game }: { game: GameState } = $props();
</script>

<aside aria-label="Protokoll">
  <h2>Protokoll</h2>
  <LogList {game} />
</aside>

<style>
  aside {
    display: none;
  }

  @media (min-width: 980px) {
    aside {
      display: block;
      position: sticky;
      top: max(12px, env(safe-area-inset-top, 0px));
      align-self: start;
      width: 100%;
      min-width: 0;
      max-height: calc(100vh - 28px);
      overflow: auto;
      padding: 12px 14px;
      background: var(--surface);
      border-radius: 14px;
      box-shadow: 0 1px 3px var(--shadow);
    }
  }

  h2 {
    margin: 0 0 4px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
  }
</style>
