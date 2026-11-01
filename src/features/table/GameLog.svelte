<script lang="ts">
import type { GameState } from '../../core/game';
import LogList from './LogList.svelte';

/**
 * Protokoll aller Züge neben dem Tisch. Auf schmalen Bildschirmen ist dafür kein Platz – dort öffnet
 * der Protokoll-Knopf oben es als Fenster.
 */
let { game }: { game: GameState } = $props();
</script>

<aside class="surface" aria-label="Protokoll">
  <h2 class="eyebrow">Protokoll</h2>
  <LogList {game} />
</aside>

<style>
  aside {
    display: none;
  }

  /*
   * Neben dem Tisch: nie höher als der Tisch selbst. Mit height: 0 zählt das Protokoll nicht mit, wenn die
   * Zeile ihre Höhe bekommt; min-height: 100% zieht es dann genau auf die Höhe des Tisches. Der Rest scrollt.
   */
  @media (min-width: 980px) {
    aside {
      display: block;
      width: 100%;
      min-width: 0;
      height: 0;
      min-height: 100%;
      overflow: auto;
      padding: 12px 14px;
    }
  }
</style>
