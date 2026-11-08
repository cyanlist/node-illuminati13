<script lang="ts">
import type { Snippet } from 'svelte';
import type { ReshuffleAnimation } from '../../state/move-animation';
import CardBack from '../../ui/CardBack.svelte';
import { cardCount } from '../../ui/format';

/**
 * Der Nachziehstapel rechts neben den Ablagestapeln: verdeckte Karte und wie viele noch übrig sind.
 * Darunter ist Platz für einen Zusatz (`children`), z. B. den Zähler der Weltordnung.
 *
 * Beim Nachmischen (`reshuffle`): Während die Karten eintreffen, wächst die Zahl; dann mischt der Stapel kurz
 * sichtbar durch – zwei Hälften, die ineinanderrutschen. Antippen überspringt das (`onskip`).
 */
interface Props {
  count: number;
  reshuffle?: ReshuffleAnimation | null;
  onskip?: () => void;
  children?: Snippet;
}
let { count, reshuffle = null, onskip, children }: Props = $props();

const shuffling = $derived(reshuffle?.phase === 'shuffling');
const busy = $derived(!!reshuffle && reshuffle.phase !== 'done' && !reshuffle.skipped);
</script>

<div class="draw">
  <div class="label">Nachziehen</div>

  <div class="stack" class:empty={count === 0} class:shuffling data-draw-pile>
    {#if count > 1}<div class="under"></div>{/if}
    {#if count > 0}
      {#if shuffling}<div class="half"><CardBack style="width: 100%" /></div>{/if}
      <div class="top"><CardBack style="width: 100%" /></div>
    {/if}
    {#if busy}<button type="button" class="skip" aria-label="Mischen überspringen" onclick={onskip}></button>{/if}
  </div>

  <!-- in der schmalen Spalte auf dem Handy nur die Zahl, damit die Zeile nicht umbricht -->
  <div class="count">
    {#if count === 0}leer{:else}<span class="wide-only">{cardCount(count)}</span><span class="phone-only" aria-hidden="true">{count}</span>{/if}
  </div>
  {@render children?.()}
</div>

<style>
  .draw {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding-left: var(--board-gap);
    border-left: 1.5px dashed var(--line);
  }

  .label {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2.4em;
    font-size: clamp(12px, 1.6vw, 14px);
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    color: var(--muted);
  }

  .stack {
    position: relative;
    width: var(--cw);
    max-width: 100%;
    aspect-ratio: 5 / 7;
  }

  .empty {
    border: 2px dashed var(--line);
    border-radius: 10px;
  }

  .top,
  .half {
    position: absolute;
    inset: 0;
  }

  /* Mischen: zwei Hälften gehen auseinander und rutschen wieder ineinander */
  .shuffling .top {
    animation: riffle-right 0.75s ease-in-out;
  }

  .shuffling .half {
    animation: riffle-left 0.75s ease-in-out;
  }

  @keyframes riffle-left {
    35% {
      transform: translate(-42%, -6%) rotate(-10deg);
    }
    70% {
      transform: translate(-12%, 0) rotate(-3deg);
    }
  }

  @keyframes riffle-right {
    35% {
      transform: translate(42%, -6%) rotate(10deg);
    }
    70% {
      transform: translate(12%, 0) rotate(3deg);
    }
  }

  /* angedeutete Karten darunter */
  .under {
    position: absolute;
    inset: 0;
    border: 1.5px solid var(--line);
    border-radius: 6px;
    background: var(--surface-2);
    transform: translate(3px, 3px) rotate(2.5deg);
  }

  .skip {
    position: absolute;
    inset: -8px;
    z-index: 1;
    padding: 0;
    background: none;
    border: 0;
    cursor: pointer;
  }

  .count {
    font-size: 12px;
    color: var(--muted);
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
</style>
