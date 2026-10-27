<script lang="ts">
import { type GameState, playerAt } from '../../core/game';
import { toggleCard } from '../../state/actions';
import { table } from '../../state/table.svelte';
import CardBack from '../../ui/CardBack.svelte';
import HandCard from './HandCard.svelte';
import Seat from './Seat.svelte';

/** Der eigene Platz mit den Handkarten. Zu zweit liegen sie bis zum Aufdecken verdeckt. */
let { game }: { game: GameState } = $props();

const owner = $derived(playerAt(game, table.handOwner));
const cards = $derived(table.hand(table.handOwner));
const interactive = $derived(
  table.phase === 'play' && table.handOwner === game.current && !owner.cpu && !table.anim,
);
</script>

<Seat
  label="Deine Handkarten"
  name={owner.name}
  points={table.points(table.handOwner)}
  combos={table.combos(table.handOwner)}
  active={table.handOwner === game.current && game.players.length > 1 && table.phase !== 'over'}
>
  <div class="hand">
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
          arriving={table.arriving(card.id)}
          disabled={!interactive}
          onclick={() => toggleCard(card.id)}
        />
      {/each}
    {/if}
  </div>
</Seat>

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
