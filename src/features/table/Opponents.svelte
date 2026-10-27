<script lang="ts">
import type { GameState } from '../../core/game';
import { table } from '../../state/table.svelte';
import Card from '../../ui/Card.svelte';
import CardBack from '../../ui/CardBack.svelte';
import Seat from './Seat.svelte';

/**
 * Der Platz des Gegenübers mit seinen Karten – verdeckt, oder offen, wenn mit offenen Karten gespielt wird.
 * Allein gespielt gibt es ihn nicht.
 */
let { game }: { game: GameState } = $props();

const others = $derived(
  game.players.map((player, index) => ({ player, index })).filter(({ index }) => index !== table.handOwner),
);
const thinking = $derived(table.phase === 'cpu' && !table.anim);
const open = $derived(game.settings.openHands);
</script>

{#each others as { player, index } (index)}
  <Seat
    label="Gegenüber"
    name={player.name}
    points={table.points(index)}
    combos={table.combos(index)}
    active={index === game.current && table.phase !== 'over'}
    thinking={player.cpu && thinking}
  >
    <div class="cards" class:open>
      <!-- data-opponent-slot: Start- bzw. Zielpunkt, wenn diese Karte abgelegt oder nachgezogen wird -->
      {#each table.hand(index) as card, slot (card.id)}
        {@const style = table.arriving(card.id) ? 'visibility: hidden' : undefined}
        {#if open}
          <Card {card} data-opponent-slot="{index}-{slot}" {style} />
        {:else}
          <CardBack data-opponent-slot="{index}-{slot}" {style} />
        {/if}
      {/each}
    </div>
  </Seat>
{/each}

<style>
  .cards {
    display: flex;
    gap: 4px;
    min-height: calc(var(--cw) * 1.4);
    --cw: clamp(28px, 6.5vw, 38px);
  }

  /* offene Karten etwas größer, damit Zahl und Farbe lesbar sind */
  .open {
    gap: 6px;
    --cw: clamp(40px, 9vw, 58px);
  }
</style>
