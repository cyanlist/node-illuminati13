<script lang="ts">
import { type Card as CardData, SUITS, type SuitIndex } from '../../core/cards';
import { RULES, type RuleKey } from '../../core/rules';
import Card from '../../ui/Card.svelte';
import { cardCount } from '../../ui/format';
import SuitIcon from '../../ui/SuitIcon.svelte';

/** Ein Ablagestapel: oben die Regel, darunter die oberste Karte (oder ein leerer Rahmen). */
interface Props {
  suit: SuitIndex;
  cards: CardData[];
  ruleKey: RuleKey | undefined;
  /** Wie oft sich die Regeln verschoben haben – bei jeder Änderung wackelt die Beschriftung kurz */
  rotations: number;
}
let { suit, cards, ruleKey, rotations }: Props = $props();

const top = $derived(cards.at(-1));
const rule = $derived(ruleKey ? RULES[ruleKey] : null);
</script>

<div class="pile suit-{suit}">
  {#key rotations}
    <div class="rule" class:shifted={rotations > 0}>
      <span class="long">{rule?.label}</span><span class="short">{rule?.short}</span>
    </div>
  {/key}

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

  .rule {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2.4em;
    font-size: clamp(12px, 1.6vw, 14px);
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    color: var(--muted);
    overflow-wrap: break-word;
  }

  .short {
    display: none;
  }

  @media (max-width: 620px) {
    .long {
      display: none;
    }

    .short {
      display: inline;
    }
  }

  .shifted {
    animation: shift 1.4s ease-out;
  }

  @keyframes shift {
    0% {
      color: var(--text);
      transform: translateX(-12px);
    }
    40% {
      color: var(--text);
      transform: translateX(3px);
    }
    100% {
      transform: none;
    }
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
