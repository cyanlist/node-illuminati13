<script lang="ts">
import type { GameState } from '../../core/game';
import Actions from './Actions.svelte';
import Board from './Board.svelte';
import GameLog from './GameLog.svelte';
import GameStatus from './GameStatus.svelte';
import PlayerSeat from './PlayerSeat.svelte';
import ProofStage from './ProofStage.svelte';
import TopBar from './TopBar.svelte';

/**
 * Der Spieltisch mit festen Plätzen: oben Spieler*in 2 bzw. der Computer, in der Mitte die Stapel,
 * unten Spieler*in 1 mit den Knöpfen; daneben das Protokoll.
 */
let { game }: { game: GameState } = $props();
</script>

<div class="game">
  <TopBar />
  <GameStatus {game} />
  <main class="table">
    <div class="play">
      {#if game.players.length > 1}<PlayerSeat {game} index={1} />{/if}
      <div class="board-area">
        <Board />
        <ProofStage {game} />
      </div>
      <PlayerSeat {game} index={0} />
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
  }
</style>
