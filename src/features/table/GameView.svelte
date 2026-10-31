<script lang="ts">
import type { GameState } from '../../core/game';
import { hintButton } from '../../state/buttons';
import Actions from './Actions.svelte';
import { table } from '../../state/table.svelte';
import Board from './Board.svelte';
import ConnectionBanner from './ConnectionBanner.svelte';
import GameLog from './GameLog.svelte';
import GameStatus from './GameStatus.svelte';
import PlayerSeat from './PlayerSeat.svelte';
import ProofStage from './ProofStage.svelte';
import TopBar from './TopBar.svelte';

/**
 * Der Spieltisch mit festen Plätzen: oben Spieler*in 2 bzw. der Computer, in der Mitte die Stapel,
 * unten Spieler*in 1 mit den Knöpfen; daneben das Protokoll. An zwei Geräten sitzt jede*r unten.
 */
let { game }: { game: GameState } = $props();

const bottom = $derived(table.bottom);

/*
 * Wie viel Höhe am Tisch nicht für Karten da ist (auf dem Handy gemessen): Ränder, Beschriftungen, die eigene
 * Kopfzeile und der Ablegen-Knopf mit Rückmeldung – plus der Platz gegenüber und der Tipp, wenn es sie gibt.
 */
const CHROME = { base: 284, topSeat: 111, hint: 43 };
const chrome = $derived(
  CHROME.base + (game.players.length > 1 ? CHROME.topSeat : 0) + (hintButton().hidden ? 0 : CHROME.hint),
);
</script>

<div class="game">
  <TopBar />
  <GameStatus {game} />
  {#if game.settings.mode === 'online'}<ConnectionBanner />{/if}
  <main class="table">
    <div class="play" style:--chrome="{chrome}px">
      {#if game.players.length > 1}<PlayerSeat {game} index={1 - bottom} position="top" />{/if}
      <div class="board-area">
        <Board />
        <ProofStage {game} />
      </div>
      <PlayerSeat {game} index={bottom} position="bottom" />
      <Actions {game} />
    </div>
    <GameLog {game} />
  </main>
</div>

<style>
  .game {
    max-width: 1180px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .table {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;
  }

  @media (min-width: 980px) {
    .table {
      grid-template-columns: minmax(0, 1fr) 290px;
    }
  }

  /* die Beweis-Bühne legt sich über das Board */
  .board-area {
    position: relative;
  }

  .play {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    /* Kartenbreite auf Board und Stapeln; --fit gibt es nur auf schmalen Bildschirmen (unten) */
    --cw: min(clamp(58px, 16vw, 96px), var(--fit, 96px));
  }

  /*
   * Schmale Bildschirme: Der Tisch füllt genau die Bildschirmhöhe – dvh rechnet die ein- und ausfahrende
   * Adressleiste mit ein. Was nach Leiste, Plätzen und Knöpfen übrig bleibt (100cqh minus --chrome), teilen sich
   * die Karten auf dem Board und in der Hand: je 1,4 Kartenbreiten hoch. Im Querformat reicht die Höhe dafür
   * nicht – dort bleiben die Karten groß und der Tisch scrollt wie bisher.
   */
  @media (max-width: 979px) and (min-height: 560px) {
    :global(body:has(.game)) {
      height: 100vh;
      height: 100dvh;
      padding-block: max(10px, env(safe-area-inset-top, 0px)) max(10px, env(safe-area-inset-bottom, 0px));
    }

    :global(#app:has(.game)) {
      height: 100%;
    }

    .game {
      height: 100%;
      gap: 10px;
    }

    .table {
      flex: 1;
      min-height: 0;
      container-type: size;
    }

    .play {
      --fit: max(44px, (100cqh - var(--chrome)) / 2.8);
      gap: 10px;
    }

    /* das Board steht mittig im Platz, der übrig bleibt */
    .board-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }
</style>
