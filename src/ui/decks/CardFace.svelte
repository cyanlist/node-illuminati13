<script lang="ts">
import type { Card } from '../../core/cards';
import SuitSymbol from '../SuitSymbol.svelte';

/**
 * Anordnung einer Vorderseite, die alle Designs teilen: Zahl groß in der Mitte, klein in den Ecken,
 * darunter das Symbol der Farbe (so, wie es das Design zeigt). Schrift und Farbe erbt sie vom Design; die
 * Zahlgröße kommt über --rank-size. `pip: false` lässt das große Symbol weg.
 */
interface Props {
  card: Card;
  pip?: boolean;
}
let { card, pip = true }: Props = $props();

const cornerIcon = 'calc(var(--cw) * 0.12)';
</script>

{#snippet icon(size: string)}
  <SuitSymbol suit={card.suit} {size} />
{/snippet}

<span class="corner top">{card.rank}{@render icon(cornerIcon)}</span>
<span class="rank">{card.rank}</span>
{#if pip}<span class="pip">{@render icon('100%')}</span>{/if}
<span class="corner bottom">{card.rank}{@render icon(cornerIcon)}</span>

<style>
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
    font-size: calc(var(--cw) * var(--rank-size, 0.44));
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .pip {
    position: absolute;
    left: 50%;
    top: 74%;
    display: grid;
    width: 20%;
    height: 20%;
    transform: translate(-50%, -50%);
  }
</style>
