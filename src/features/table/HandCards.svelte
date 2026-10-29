<script lang="ts">
import { type GameState, playerAt } from '../../core/game';
import { toggleCard } from '../../state/actions';
import { table } from '../../state/table.svelte';
import HandCard from './HandCard.svelte';

/** Die ganze Hand einer Person: groß, offen, mit wahren Werten – auswählbar, solange sie am Zug ist. */
interface Props {
  game: GameState;
  index: number;
}
let { game, index }: Props = $props();

const cards = $derived(table.hand(index));
const interactive = $derived(
  table.phase === 'play' && index === game.current && !playerAt(game, index).cpu && !table.anim,
);
</script>

<div class="hand">
  {#if cards.length === 0}
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
        arriving={table.arriving(card.id)}
        disabled={!interactive}
        onclick={() => toggleCard(card.id)}
      />
    {/each}
  {/if}
</div>

<style>
  .hand {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: clamp(5px, 1.6vw, 16px);
    min-height: 80px;
    /* Platz für den Wert-Kreis und angehobene Karten */
    padding-top: 16px;
    /* etwas kleiner als auf dem Board, damit fünf Karten auch auf dem Handy in eine Reihe passen */
    --cw: clamp(54px, 15vw, 96px);
  }
</style>
