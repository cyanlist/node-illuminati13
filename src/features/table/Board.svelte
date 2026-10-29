<script lang="ts">
import { cubicInOut } from 'svelte/easing';
import { flip } from 'svelte/animate';
import { table } from '../../state/table.svelte';
import DrawPile from './DrawPile.svelte';
import Pile from './Pile.svelte';
import RuleLabel from './RuleLabel.svelte';

/**
 * Oben stehen die Regeln fest in ihren Spalten, darunter liegen die Stapel. In der Variante
 * „Wenn die Weltordnung sich verschiebt“ rücken die Stapel weiter und gleiten in ihre neue Spalte.
 */
</script>

<section class="board" aria-label="Vier Ablagestapel und Nachziehstapel">
  {#each table.columns as suit, column (column)}
    <div class="rule" style:grid-column={column + 1}><RuleLabel ruleKey={table.rules[suit]} /></div>
  {/each}
  {#each table.columns as suit (suit)}
    <div class="slot" animate:flip={{ duration: 700, easing: cubicInOut }}>
      <Pile {suit} cards={table.piles[suit] ?? []} />
    </div>
  {/each}
  <div class="draw"><DrawPile count={table.deckCount} /></div>
</section>

<style>
  .board {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    column-gap: clamp(6px, 2vw, 18px);
    row-gap: 8px;
    padding: clamp(12px, 2.4vw, 22px);
    background: var(--surface);
    border-radius: 16px;
    box-shadow: 0 1px 3px var(--shadow);
  }

  .rule {
    grid-row: 1;
    min-width: 0;
  }

  .slot {
    grid-row: 2;
    min-width: 0;
  }

  .draw {
    grid-column: 5;
    grid-row: 1 / span 2;
    min-width: 0;
  }
</style>
