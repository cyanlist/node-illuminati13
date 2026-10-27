<script lang="ts">
import { SUIT_INDICES } from '../../core/cards';
import { table } from '../../state/table.svelte';
import Pile from './Pile.svelte';
</script>

<section class="board" aria-label="Vier Ablagestapel">
  {#each SUIT_INDICES as suit (suit)}
    <Pile {suit} cards={table.piles[suit] ?? []} ruleKey={table.rules[suit]} rotations={table.rotations} />
  {/each}
</section>

<style>
  .board {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(6px, 2vw, 18px);
    padding: clamp(12px, 2.4vw, 22px);
    background: var(--surface);
    border-radius: 16px;
    box-shadow: 0 1px 3px var(--shadow);
  }
</style>
