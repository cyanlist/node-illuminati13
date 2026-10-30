<script lang="ts">
import type { HTMLAttributes } from 'svelte/elements';
import { type Card, SUITS } from '../core/cards';
import { deckInfo, useDeck } from './deck.svelte';
import { DECK_COMPONENTS } from './decks';
import { num } from './format';

/**
 * Eine Spielkarte. Wie sie aussieht, zeichnet das gewählte Kartendesign (ui/decks/); hier geht es um Größe,
 * Auswahl und den wahren Wert. Mit `onclick` wird sie zum auswählbaren Knopf (Hand), sonst ist sie ein Bild
 * (Stapel, Fenster). Die Größe kommt von außen über die CSS-Variable --cw.
 */
interface Props extends HTMLAttributes<HTMLElement> {
  card: Card;
  /** Wahrer Wert im Kreis an der Ecke */
  value?: number | null;
  selected?: boolean;
  hinted?: boolean;
  disabled?: boolean;
  onclick?: () => void;
}
let { card, value = null, selected = false, hinted = false, disabled = false, onclick, ...rest }: Props = $props();

const deckOf = useDeck();
const deck = $derived(deckInfo(deckOf()));
const Face = $derived(DECK_COMPONENTS[deck.id]);
/** Schräglage für Notizzettel – immer gleich für dieselbe Karte */
const tilt = $derived(deck.tilt ? `${(((card.id * 37) % 7) - 3) * 0.7}deg` : undefined);

const label = $derived(`${SUITS[card.suit].name} ${card.rank}${value !== null ? `, wahrer Wert ${num(value)}` : ''}`);
</script>

{#snippet content()}
  <Face {card} />
  {#if value !== null}
    <span class="value" aria-hidden="true">{num(value)}</span>
  {/if}
{/snippet}

{#if onclick}
  <button
    type="button"
    class="card suit-{card.suit}"
    style:border-radius={deck.radius}
    style:rotate={tilt}
    class:selected
    class:hinted
    aria-pressed={selected}
    aria-label={label}
    {disabled}
    {onclick}
    {...rest}
  >
    {@render content()}
  </button>
{:else}
  <div
    class="card suit-{card.suit}"
    style:border-radius={deck.radius}
    style:rotate={tilt}
    class:selected
    class:hinted
    role="img"
    aria-label={label}
    {...rest}
  >
    {@render content()}
  </div>
{/if}

<style>
  .card {
    position: relative;
    display: block;
    width: var(--cw);
    aspect-ratio: 5 / 7;
    padding: 0;
    margin: 0;
    color: inherit;
    background: none;
    border: 0;
    font-family: var(--font-body);
    transition:
      transform 0.15s,
      box-shadow 0.15s;
  }

  /* wahrer Wert im Kreis an der Ecke */
  .value {
    position: absolute;
    top: -10px;
    right: -10px;
    z-index: 2;
    display: grid;
    place-items: center;
    min-width: 28px;
    height: 28px;
    padding: 0 6px;
    background: var(--text);
    color: var(--surface);
    border-radius: 999px;
    font-weight: 700;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
    box-shadow: 0 0 0 2px var(--bg);
  }

  button {
    cursor: pointer;
  }

  button:hover:not(:disabled) {
    transform: translateY(-4px);
  }

  button:disabled {
    cursor: default;
  }

  .selected {
    transform: translateY(-12px);
    box-shadow:
      0 0 0 3px var(--marker),
      0 10px 18px var(--shadow);
  }

  button.selected:hover:not(:disabled) {
    transform: translateY(-14px);
  }

  .hinted {
    animation: hint 1s ease-in-out 3;
  }

  @keyframes hint {
    50% {
      box-shadow:
        0 0 0 6px var(--marker),
        0 10px 18px var(--shadow);
    }
  }
</style>
