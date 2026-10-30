<script lang="ts">
import { type Card as CardData, SUITS, type SuitIndex } from '../../core/cards';
import Card from '../../ui/Card.svelte';
import CardSlot from '../../ui/CardSlot.svelte';
import { cardCount } from '../../ui/format';

/**
 * Ein Ablagestapel: die oberste Karte, darunter lugt die vorige hervor – oder ein leerer Platz im Stil des
 * Kartendesigns. Darunter steht die Farbe; die Regel steht im Board darüber.
 */
interface Props {
  suit: SuitIndex;
  cards: CardData[];
}
let { suit, cards }: Props = $props();

const top = $derived(cards.at(-1));
const below = $derived(cards.at(-2));
</script>

<div class="pile suit-{suit}">
  <div class="stack" data-pile={suit}>
    {#if below}<div class="under"><Card card={below} /></div>{/if}
    {#if top}
      <div class="top"><Card card={top} /></div>
    {:else}
      <CardSlot {suit} />
    {/if}
  </div>

  <!-- <div class="count"><b>{SUITS[suit].name}</b> · {cards.length === 0 ? 'leer' : cardCount(cards.length)}</div> -->
   <div class="count"><b>{SUITS[suit].name}</b></div>
</div>

<style>
  .pile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .stack {
    position: relative;
    width: var(--cw);
    max-width: 100%;
    aspect-ratio: 5 / 7;
  }

  .top {
    position: absolute;
    inset: 0;
  }

  /* angedeutete Karten darunter */
  /* die vorige Karte, leicht verdreht unter der obersten */
  .under {
    position: absolute;
    inset: 0;
    transform: translate(3px, 3px) rotate(2.5deg);
  }

  .count {
    font-size: 12px;
    color: var(--muted);
    text-align: center;
  }

  .count b {
    color: var(--suit);
  }
</style>
