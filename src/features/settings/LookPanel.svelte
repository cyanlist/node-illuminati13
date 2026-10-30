<script lang="ts">
import { saveDeck } from '../../storage';
import { DECKS, type Deck, deckChoice } from '../../ui/deck.svelte';
import DeckPreview from './DeckPreview.svelte';

/** Kartendesign wählen – gilt sofort und nur für dieses Gerät. */
function choose(deck: Deck): void {
  deckChoice.current = deck;
  saveDeck(deck);
}
</script>

<div class="decks" role="radiogroup" aria-label="Kartendesign">
  {#each DECKS as deck (deck.id)}
    <button
      type="button"
      class="deck"
      class:active={deckChoice.current === deck.id}
      role="radio"
      aria-checked={deckChoice.current === deck.id}
      onclick={() => choose(deck.id)}
    >
      <b>{deck.title}</b>
      <small>{deck.description}</small>
      <DeckPreview deck={deck.id} />
    </button>
  {/each}
</div>

<style>
  .decks {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 10px;
  }

  .deck {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 12px;
    font: inherit;
    text-align: left;
    color: inherit;
    background: var(--surface-2);
    border: 1.5px solid var(--line);
    border-radius: 12px;
    cursor: pointer;
  }

  .deck:hover {
    border-color: var(--muted);
  }

  .active {
    border-color: var(--accent);
    box-shadow: inset 0 0 0 1px var(--accent);
  }

  small {
    color: var(--muted);
  }
</style>
