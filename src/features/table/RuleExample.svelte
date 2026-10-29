<script lang="ts">
import type { Card as CardData, SuitIndex } from '../../core/cards';
import { RULES, type RuleKey } from '../../core/rules';
import { trueValue } from '../../core/values';
import Card from '../../ui/Card.svelte';
import { num, RULE_EXAMPLE } from '../../ui/format';

/**
 * Ein Rechenbeispiel zur Regel, so wie Spieler*in 1 den Tisch sieht: oben die Stapelkarte, darunter eine
 * ganze Hand mit ihren wahren Werten. Für die gewählte Handkarte stehen darunter groß die Rechnung und in
 * Worten, was dabei passiert. Die Zahlen sind feste Beispiele, damit nichts über die echte Hand verraten wird.
 */
interface Props {
  ruleKey: RuleKey;
  /** Farbe des Stapels, der gerade unter der Regel liegt */
  suit: SuitIndex;
}
let { ruleKey, suit }: Props = $props();

const rule = $derived(RULES[ruleKey]);
const stack = $derived<CardData>({ id: -1, suit, rank: RULE_EXAMPLE.stack });
const hand = $derived(RULE_EXAMPLE.hand.map((rank, i): CardData => ({ id: -2 - i, suit, rank })));
const values = $derived.by(() => {
  const piles: CardData[][] = [[], [], [], []];
  piles[suit] = [stack];
  const rules: RuleKey[] = [ruleKey, ruleKey, ruleKey, ruleKey];
  return hand.map((card) => trueValue(card, piles, rules));
});

// die 9 zeigt bei den meisten Regeln etwas Besonderes – mit ihr geht es los
let picked = $state(RULE_EXAMPLE.hand.indexOf(9));
const card = $derived(hand[picked] ?? hand[0]);
const value = $derived(values[picked] ?? values[0]);

function hover(index: number) {
  return (event: PointerEvent) => {
    if (event.pointerType === 'mouse') picked = index;
  };
}
</script>

<div class="example">
  <span class="caption">Stapel</span>
  <Card card={stack} />

  <span class="caption">Hand</span>
  <div class="hand">
    {#each hand as handCard, i (handCard.id)}
      <Card
        card={handCard}
        value={values[i]?.value ?? null}
        selected={i === picked}
        onclick={() => (picked = i)}
        onpointerenter={hover(i)}
      />
    {/each}
  </div>

  {#if card && value}
    <p class="calc">
      {#if !value.direct}{value.formula}{' '}{/if}<span class="result">= {num(value.value)}</span>
    </p>
    <p class="explain">{rule.explain(stack.rank, card.rank)}</p>
  {/if}
  <p class="hint">Wähle eine Handkarte, um ihre Rechnung zu sehen.</p>
</div>

<style>
  .example {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    --cw: 42px;
  }

  .caption {
    font-size: 10px;
    font-weight: 700;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  /* Platz nach oben für die angehobene Karte, nach rechts für die Kreise mit den Werten */
  .hand {
    display: flex;
    gap: 12px;
    padding: 12px 10px 0 0;
  }

  /* kleinere Kreise als an der echten Hand, damit sie die Nachbarkarte nicht verdecken */
  .hand :global(.value) {
    top: -8px;
    right: -9px;
    min-width: 22px;
    height: 22px;
    padding: 0 4px;
    font-size: 12px;
  }

  p {
    margin: 0;
    text-align: center;
  }

  .calc {
    margin-top: 10px;
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  /* wie der Kreis an der Handkarte */
  .result {
    display: inline-block;
    padding: 0 9px;
    background: var(--text);
    color: var(--surface);
    border-radius: 999px;
  }

  .explain {
    font-size: 14px;
    line-height: 1.4;
    color: var(--text);
  }

  .hint {
    margin-top: 2px;
    font-size: 12px;
    color: var(--muted);
  }
</style>
