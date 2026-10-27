<script lang="ts">
import type { GameState } from '../../core/game';
import { table } from '../../state/table.svelte';
import CardBack from '../../ui/CardBack.svelte';

/** Das Gegenüber mit seinen verdeckten Karten. Allein gespielt bleibt der Bereich leer. */
let { game }: { game: GameState } = $props();

const others = $derived(
  game.players.map((player, index) => ({ player, index })).filter(({ index }) => index !== table.handOwner),
);
const thinking = $derived(table.phase === 'cpu' && !table.anim);
</script>

{#if others.length > 0}
  <section aria-label="Gegenüber">
    {#each others as { player, index } (index)}
      <div class="opponent">
        <span class="name">
          {player.name}
          {#if player.cpu && thinking}
            <span class="thinking">überlegt<span>.</span><span>.</span><span>.</span></span>
          {/if}
        </span>
        <div class="cards">
          <!-- data-opponent-slot: Start- bzw. Zielpunkt, wenn diese Karte abgelegt oder nachgezogen wird -->
          {#each table.hand(index) as card, slot (card.id)}
            <CardBack
              data-opponent-slot="{index}-{slot}"
              style={table.arriving(card.id) ? 'visibility: hidden' : undefined}
            />
          {/each}
        </div>
      </div>
    {/each}
  </section>
{/if}

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .opponent {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .name {
    font-weight: 700;
    min-width: 0;
  }

  .cards {
    display: flex;
    gap: 4px;
    --cw: clamp(28px, 6.5vw, 38px);
  }

  .thinking {
    color: var(--muted);
    font-weight: 400;
    font-style: italic;
  }

  .thinking span {
    animation: blink 1.2s infinite;
  }

  .thinking span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .thinking span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 0.2;
    }
    50% {
      opacity: 1;
    }
  }
</style>
