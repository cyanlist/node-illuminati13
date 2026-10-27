<script lang="ts">
import { SUIT_INDICES, SUITS } from '../../core/cards';
import { cancelOrder, chooseTop, confirmOrder } from '../../state/actions';
import { table } from '../../state/table.svelte';
import Card from '../../ui/Card.svelte';
import Sheet from '../../ui/Sheet.svelte';

/** Mehrere Karten derselben Farbe: Welche landet oben und bestimmt die nächsten wahren Werte? */
const groups = $derived(
  SUIT_INDICES.map((suit) => ({ suit, cards: table.selectedCards.filter((card) => card.suit === suit) })).filter(
    (group) => group.cards.length > 1,
  ),
);
</script>

<Sheet title="Welche Karte liegt oben?" onclose={cancelOrder}>
  <p>Du legst mehrere Karten derselben Farbe ab. Die oberste bestimmt die nächsten wahren Werte dieser Farbe.</p>

  {#each groups as { suit, cards } (suit)}
    <div class="row suit-{suit}">
      <span class="name">{SUITS[suit].name}</span>
      {#each cards as card (card.id)}
        {@const on = table.topPick?.[suit] === card.id}
        <button
          type="button"
          class="pick"
          class:on
          aria-pressed={on}
          aria-label="{SUITS[suit].name} {card.rank} oben"
          onclick={() => chooseTop(suit, card.id)}
        >
          <Card {card} />
        </button>
      {/each}
    </div>
  {/each}

  {#snippet actions()}
    <button type="button" class="btn btn--ghost" onclick={cancelOrder}>Zurück</button>
    <button type="button" class="btn btn--primary btn--win" onclick={confirmOrder}>Ablegen und nachziehen</button>
  {/snippet}
</Sheet>

<style>
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-top: 14px;
    --cw: 56px;
  }

  .name {
    min-width: 4.5em;
    font-weight: 700;
    color: var(--suit);
  }

  .pick {
    padding: 5px;
    border: 0;
    border-radius: 14px;
    background: none;
    cursor: pointer;
  }

  .on {
    box-shadow: 0 0 0 3px var(--marker);
  }
</style>
