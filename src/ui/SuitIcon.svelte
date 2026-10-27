<script lang="ts">
import { SUITS, type SuitIndex } from '../core/cards';

interface Props {
  suit: SuitIndex;
  /** Breite und Höhe, z. B. „1em“ oder „calc(var(--cw) * 0.12)“ */
  size?: string;
}
let { suit, size = '1em' }: Props = $props();
</script>

<svg class="suit-{suit}" style:width={size} style:height={size} viewBox="0 0 24 24" aria-hidden="true">
  <use href="#s-{SUITS[suit].key}" />
</svg>

<style>
  svg {
    display: block;
    flex: none;
    fill: currentColor;
    color: var(--suit);
  }
</style>
