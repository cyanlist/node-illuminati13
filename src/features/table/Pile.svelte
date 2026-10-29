<script lang="ts">
import { type Card as CardData, SUITS, type SuitIndex } from '../../core/cards';
import Card from '../../ui/Card.svelte';
import { cardCount } from '../../ui/format';
import SuitIcon from '../../ui/SuitIcon.svelte';

/** Ein Ablagestapel: die oberste Karte (oder ein leerer Rahmen), darunter die Farbe. Die Regel steht im Board darüber. */
interface Props {
  suit: SuitIndex;
  cards: CardData[];
}
let { suit, cards }: Props = $props();

const top = $derived(cards.at(-1));
</script>

<div class="pile suit-{suit}">
  <div class="stack" class:empty={!top} data-pile={suit}>
    {#if cards.length > 1}<div class="under"></div>{/if}
    {#if top}
      <div class="top"><Card card={top} /></div>
    {:else}
      <SuitIcon {suit} size="40%" />
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

  .empty {
    display: grid;
    place-items: center;
    border: 2px dashed var(--suit);
    border-radius: 10px;
    background: color-mix(in srgb, var(--suit) 6%, transparent);
    opacity: 0.85;
  }

  .top {
    position: absolute;
    inset: 0;
  }

  /* angedeutete Karten darunter */
  .under {
    position: absolute;
    inset: 0;
    border: 2px solid var(--suit);
    border-radius: 10px;
    background: color-mix(in srgb, var(--suit) 10%, var(--surface));
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
