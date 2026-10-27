<script lang="ts">
import { type GameState, playerAt } from '../../core/game';
import { toggleCard } from '../../state/actions';
import { table } from '../../state/table.svelte';
import CardBack from '../../ui/CardBack.svelte';
import HandCard from './HandCard.svelte';

/** Die Handkarten unten. Zu zweit liegen sie bis zum Aufdecken verdeckt. */
let { game }: { game: GameState } = $props();

const owner = $derived(playerAt(game, table.handOwner));
const cards = $derived(table.hand(table.handOwner));
const interactive = $derived(
  table.phase === 'play' && table.handOwner === game.current && !owner.cpu && !table.anim,
);
</script>

<section class="hand" aria-label="Deine Handkarten">
  {#if table.phase === 'handoff'}
    {#each cards as card (card.id)}<CardBack />{/each}
  {:else if cards.length === 0}
    <p class="muted">Keine Handkarten mehr.</p>
  {:else}
    {#each cards as card (card.id)}
      <HandCard
        {card}
        piles={table.piles}
        rules={table.rules}
        showValues={game.settings.showValues}
        selected={table.selected.includes(card.id)}
        hinted={table.hint.includes(card.id)}
        dealt={table.dealt.includes(card.id)}
        disabled={!interactive}
        onclick={() => toggleCard(card.id)}
      />
    {/each}
  {/if}
</section>

<style>
  .hand {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: clamp(5px, 1.6vw, 16px);
    min-height: 80px;
    padding-top: 16px;
  }
</style>
