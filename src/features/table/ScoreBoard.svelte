<script lang="ts">
import type { GameState } from '../../core/game';
import { table } from '../../state/table.svelte';
import CardBack from '../../ui/CardBack.svelte';
import ScoreCard from './ScoreCard.svelte';

let { game }: { game: GameState } = $props();

const over = $derived(table.phase === 'over');
const turnsLeft = $derived(game.finalTurnsLeft);
</script>

<section class="scores" aria-label="Punkte">
  {#each game.players as player, i (i)}
    <ScoreCard
      name={player.name}
      points={table.points(i)}
      combos={table.combos(i)}
      active={i === game.current && !over && game.players.length > 1}
    />
  {/each}

  <div class="meta">
    {#if turnsLeft !== null && !over}
      <span class="tag warn">Letzte Runde · noch {turnsLeft} {turnsLeft === 1 ? 'Zug' : 'Züge'}</span>
    {/if}
    {#if game.settings.ruleMode === 'custom'}<span class="tag">Eigene Regeln</span>{/if}
    {#if game.settings.ruleMode === 'random'}<span class="tag">Ausgeloste Regeln</span>{/if}
    {#if game.settings.variant}<span class="tag">Weltordnung {table.rotations}× verschoben</span>{/if}
    <div class="deck">
      <CardBack />
      <b>{table.deckCount}</b>
      <small>Karten im<br />Nachziehstapel</small>
    </div>
  </div>
</section>

<style>
  .scores {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: stretch;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    margin-left: auto;
  }

  .tag {
    padding: 2px 10px;
    border: 1.5px solid var(--line);
    border-radius: 999px;
    background: var(--surface);
    color: var(--muted);
    font-weight: 700;
    font-size: 13px;
    white-space: nowrap;
  }

  .warn {
    color: var(--text);
    border-color: var(--text);
  }

  .deck {
    display: flex;
    align-items: center;
    gap: 8px;
    --cw: 28px;
  }

  .deck b {
    font-size: 24px;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .deck small {
    color: var(--muted);
    line-height: 1.2;
  }
</style>
