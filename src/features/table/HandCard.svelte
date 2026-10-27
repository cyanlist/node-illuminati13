<script lang="ts">
import type { Card as CardData } from '../../core/cards';
import type { RuleKey } from '../../core/rules';
import { type Piles, trueValue } from '../../core/values';
import Card from '../../ui/Card.svelte';
import { formulaText } from '../../ui/format';

/** Eine Handkarte mit ihrem wahren Wert an der Ecke und dem Rechenweg darunter. */
interface Props {
  card: CardData;
  piles: Piles;
  rules: RuleKey[];
  showValues: boolean;
  selected: boolean;
  hinted: boolean;
  /** Neue Karte im Anflug – ihr Platz bleibt bis zur Landung leer */
  arriving: boolean;
  disabled: boolean;
  onclick: () => void;
}
let { card, piles, rules, showValues, selected, hinted, arriving, disabled, onclick }: Props = $props();

const value = $derived(trueValue(card, piles, rules));
</script>

<div class="slot" class:arriving>
  <Card
    {card}
    value={showValues ? value.value : null}
    {selected}
    {hinted}
    {disabled}
    {onclick}
    data-hand-card={card.id}
  />
  <span class="formula">{showValues ? formulaText(value) : ' '}</span>
</div>

<style>
  .slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .arriving {
    visibility: hidden;
  }

  .formula {
    font-size: clamp(11px, 1.5vw, 13px);
    color: var(--muted);
    white-space: nowrap;
  }
</style>
