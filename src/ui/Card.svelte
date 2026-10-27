<script lang="ts">
import type { HTMLAttributes } from 'svelte/elements';
import { type Card, SUITS } from '../core/cards';
import { num } from './format';
import SuitIcon from './SuitIcon.svelte';

/**
 * Eine Spielkarte: Zahl groß in der Mitte, klein in den Ecken, getönt im Farbton ihrer Farbe.
 * Mit `onclick` wird sie zum auswählbaren Knopf (Hand), sonst ist sie ein Bild (Stapel, Fenster).
 * Die Größe kommt von außen über die CSS-Variable --cw.
 */
interface Props extends HTMLAttributes<HTMLElement> {
  card: Card;
  /** Wahrer Wert im Kreis an der Ecke */
  value?: number | null;
  selected?: boolean;
  hinted?: boolean;
  dealt?: boolean;
  disabled?: boolean;
  onclick?: () => void;
}
let { card, value = null, selected = false, hinted = false, dealt = false, disabled = false, onclick, ...rest }: Props =
  $props();

const label = $derived(`${SUITS[card.suit].name} ${card.rank}${value !== null ? `, wahrer Wert ${num(value)}` : ''}`);
const cornerIcon = 'calc(var(--cw) * 0.12)';
</script>

{#snippet face()}
  <span class="corner top">{card.rank}<SuitIcon suit={card.suit} size={cornerIcon} /></span>
  <span class="rank">{card.rank}</span>
  <span class="pip"><SuitIcon suit={card.suit} size="100%" /></span>
  <span class="corner bottom">{card.rank}<SuitIcon suit={card.suit} size={cornerIcon} /></span>
  {#if value !== null}
    <span class="value" aria-hidden="true">{num(value)}</span>
  {/if}
{/snippet}

{#if onclick}
  <button
    type="button"
    class="card suit-{card.suit}"
    class:selected
    class:hinted
    class:dealt
    aria-pressed={selected}
    aria-label={label}
    {disabled}
    {onclick}
    {...rest}
  >
    {@render face()}
  </button>
{:else}
  <div class="card suit-{card.suit}" class:selected class:hinted class:dealt role="img" aria-label={label} {...rest}>
    {@render face()}
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
    color: var(--suit);
    background: color-mix(in srgb, var(--suit) 9%, var(--surface));
    border: 2px solid var(--suit);
    border-radius: 10px;
    font-family: var(--font-body);
    box-shadow: 0 1px 2px var(--shadow);
    transition:
      transform 0.15s,
      box-shadow 0.15s;
  }

  .corner {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    font-weight: 700;
    font-size: calc(var(--cw) * 0.17);
    line-height: 1;
  }

  .top {
    top: 6%;
    left: 9%;
  }

  .bottom {
    bottom: 6%;
    right: 9%;
    transform: rotate(180deg);
  }

  .rank {
    position: absolute;
    left: 50%;
    top: 45%;
    transform: translate(-50%, -50%);
    font-size: calc(var(--cw) * 0.44);
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .pip {
    position: absolute;
    left: 50%;
    top: 74%;
    width: 20%;
    height: 20%;
    transform: translate(-50%, -50%);
  }

  /* wahrer Wert im Kreis an der Ecke */
  .value {
    position: absolute;
    top: -10px;
    right: -10px;
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

  .dealt {
    animation: deal 0.4s ease-out;
  }

  @keyframes deal {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
  }
</style>
