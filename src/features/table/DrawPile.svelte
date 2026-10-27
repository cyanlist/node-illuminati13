<script lang="ts">
import CardBack from '../../ui/CardBack.svelte';
import { cardCount } from '../../ui/format';

/** Der Nachziehstapel rechts neben den Ablagestapeln: verdeckte Karte und wie viele noch übrig sind. */
let { count }: { count: number } = $props();
</script>

<div class="draw">
  <div class="label">Nachziehen</div>

  <div class="stack" class:empty={count === 0} data-draw-pile>
    {#if count > 1}<div class="under"></div>{/if}
    {#if count > 0}
      <div class="top"><CardBack style="width: 100%" /></div>
    {/if}
  </div>

  <div class="count">{count === 0 ? 'leer' : cardCount(count)}</div>
</div>

<style>
  .draw {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding-left: clamp(6px, 2vw, 18px);
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

  .top {
    position: absolute;
    inset: 0;
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

  .count {
    font-size: 12px;
    color: var(--muted);
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
</style>
