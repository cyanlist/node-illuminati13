<script lang="ts">
import { SUIT_INDICES, SUITS } from '../../core/cards';
import { cancelOrder, chooseTop, confirmOrder } from '../../state/actions';
import { table } from '../../state/table.svelte';
import Card from '../../ui/Card.svelte';
import { ruleLabel } from '../../ui/format';
import Sheet from '../../ui/Sheet.svelte';
import SuitSymbol from '../../ui/SuitSymbol.svelte';

/**
 * Mehrere Karten derselben Farbe: Welche landet oben und bestimmt die nächsten wahren Werte? Das Fenster liegt
 * über dem Board – deshalb steht bei jeder Farbe ihre Regel dabei, damit man nicht raten muss.
 */
const groups = $derived(
  SUIT_INDICES.map((suit) => ({ suit, cards: table.selectedCards.filter((card) => card.suit === suit) })).filter(
    (group) => group.cards.length > 1,
  ),
);
</script>

<Sheet title="Welche Karte liegt oben?" onclose={cancelOrder}>
  <p>Du legst mehrere Karten derselben Farbe ab. Die oberste bestimmt die nächsten wahren Werte dieser Farbe.</p>

  {#each groups as { suit, cards } (suit)}
    <div class="row suit-{suit}">
      <span class="label">
        <span class="name"><SuitSymbol {suit} size="15px" /> {SUITS[suit].name}</span>
        <span class="rule">{ruleLabel(table.rules[suit])}</span>
      </span>
      <div class="cards" style:--n={cards.length}>
        {#each cards as card (card.id)}
          {@const on = table.topPick?.[suit] === card.id}
          <button
            type="button"
            class="pick"
            class:on
            aria-pressed={on}
            aria-label="{SUITS[suit].name} {card.rank} oben"
            onclick={() => chooseTop(suit, card.id)}
          >
            <Card {card} />
          </button>
        {/each}
      </div>
    </div>
  {/each}

  {#snippet actions()}
    <button type="button" class="btn btn--ghost" onclick={cancelOrder}>Zurück</button>
    <button type="button" class="btn btn--primary btn--win" onclick={confirmOrder}>Ablegen und nachziehen</button>
  {/snippet}
</Sheet>

<style>
  /* links Farbe und Regel, rechts die Karten – auf dem Handy die Farbe darüber, damit die Karten die ganze Breite haben */
  .row {
    display: grid;
    grid-template-columns: 8.5em minmax(0, 1fr);
    align-items: center;
    gap: 8px 10px;
    margin-top: 14px;
  }

  @media (max-width: 520px) {
    .row {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  /* Farbe und darunter ihre Regel – so wie über dem Stapel auf dem Board */
  .label {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  /*
   * Die Karten einer Farbe bleiben in einer Reihe: Bei vielen werden sie schmaler statt umzubrechen.
   * Je Karte gehen 10px für den Rand der Auswahl ab, dazwischen 8px Abstand.
   */
  .cards {
    container-type: inline-size;
    display: flex;
    gap: 8px;
    --cw: min(56px, (100cqw - (var(--n) - 1) * 8px) / var(--n) - 10px);
  }

  .name {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-weight: 700;
    color: var(--suit);
  }

  .rule {
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
  }

  .pick {
    padding: 5px;
    border: 0;
    border-radius: 14px;
    background: none;
    cursor: pointer;
  }

  .on {
    box-shadow: 0 0 0 3px var(--marker);
  }
</style>
