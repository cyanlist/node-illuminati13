<script lang="ts">
import { table } from '../../state/table.svelte';
import Card from '../../ui/Card.svelte';
import CardBack from '../../ui/CardBack.svelte';

/**
 * Die Hand einer Person, die gerade nicht dran ist: klein und verdeckt – oder klein und offen,
 * wenn mit offenen Karten gespielt wird.
 */
interface Props {
  index: number;
  open: boolean;
}
let { index, open }: Props = $props();
</script>

<div class="cards" class:open>
  <!-- data-opponent-slot: Start- bzw. Zielpunkt, wenn diese Karte abgelegt oder nachgezogen wird -->
  {#each table.hand(index) as card, slot (card.id)}
    {@const style = table.arriving(card.id) ? 'visibility: hidden' : undefined}
    {#if open}
      <Card {card} data-opponent-slot="{index}-{slot}" {style} />
    {:else}
      <CardBack data-opponent-slot="{index}-{slot}" {style} />
    {/if}
  {/each}
</div>

<style>
  .cards {
    display: flex;
    gap: 4px;
    min-height: calc(var(--cw) * 1.4);
    --cw: clamp(28px, 6.5vw, 38px);
  }

  /* offene Karten etwas größer, damit Zahl und Farbe lesbar sind */
  .open {
    gap: 6px;
    --cw: clamp(40px, 9vw, 58px);
  }
</style>
