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
  dealt: boolean;
  disabled: boolean;
  onclick: () => void;
}
let { card, piles, rules, showValues, selected, hinted, dealt, disabled, onclick }: Props = $props();

const value = $derived(trueValue(card, piles, rules));
</script>

<div class="slot">
  <Card
    {card}
    value={showValues ? value.value : null}
    {selected}
    {hinted}
    {dealt}
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

  .formula {
    font-size: clamp(11px, 1.5vw, 13px);
    color: var(--muted);
    white-space: nowrap;
  }
</style>
