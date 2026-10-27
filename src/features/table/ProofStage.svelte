<script lang="ts">
import { fade } from 'svelte/transition';
import { type GameState, playerAt } from '../../core/game';
import { skipProof } from '../../state/move-animation';
import { table } from '../../state/table.svelte';
import Card from '../../ui/Card.svelte';
import { formulaText, num, pts } from '../../ui/format';
import Subject from '../../ui/Subject.svelte';

/**
 * Beweis-Bühne über dem Board: Die Karten eines Beweises liegen offen für alle in einer Reihe,
 * darunter erscheint nacheinander erst der Rechenweg, dann der wahre Wert. Die Summe zählt mit,
 * bis „= 13“ aufleuchtet. Antippen überspringt die Pausen.
 */
let { game }: { game: GameState } = $props();

const proof = $derived(table.anim?.proof ?? null);
const player = $derived(table.anim ? playerAt(game, table.anim.player) : null);
const sum = $derived(proof ? proof.parts.slice(0, proof.revealed).reduce((total, part) => total + part.value, 0) : 0);

function onkeydown(event: KeyboardEvent): void {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  skipProof();
}
</script>

{#if proof && player}
  <div
    class="stage"
    class:clearing={proof.clearing}
    role="button"
    tabindex="0"
    aria-label="Beweis – antippen zum Überspringen"
    onclick={skipProof}
    {onkeydown}
    transition:fade={{ duration: 200 }}
  >
    <p class="title">
      <Subject {player} third="beweist die 13" second="beweist die 13" />
      {#if !proof.skipped}<span class="skip">· antippen zum Überspringen</span>{/if}
    </p>

    <div class="row">
      {#each proof.parts as part, i (part.card.id)}
        {#if i > 0}<span class="plus" class:on={i < proof.revealed}>+</span>{/if}
        <div class="part">
          <div
            class="spot"
            class:hidden={!proof.arrived.includes(part.card.id) || proof.left.includes(part.card.id)}
            data-stage-slot={part.card.id}
          >
            <Card card={part.card} />
          </div>
          <div class="calc">
            {#if i < proof.revealed}
              <b class="value">{num(part.value)}</b>
            {:else if i === proof.revealing}
              <span class="formula">{formulaText(part)}</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <p class="sum" class:solved={proof.solved}>
      {#if proof.revealed > 0}= {num(sum)}{/if}
      {#if proof.solved}<span class="points">+{pts(proof.parts.length)}</span>{/if}
    </p>
  </div>
{/if}

<style>
  .stage {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    background: color-mix(in srgb, var(--bg) 85%, transparent);
    backdrop-filter: blur(2px);
    border-radius: 16px;
    cursor: pointer;
    transition:
      background-color 0.3s,
      backdrop-filter 0.3s;
  }

  /* beim Ablegen wird die Bühne durchsichtig, damit man die Karten auf den Stapeln landen sieht */
  .clearing {
    background: transparent;
    backdrop-filter: none;
    pointer-events: none;
  }

  .clearing .title,
  .clearing .calc,
  .clearing .plus,
  .clearing .sum {
    opacity: 0;
    transition: opacity 0.25s;
  }

  .title {
    margin: 0;
    font-size: 14px;
  }

  .skip {
    color: var(--muted);
    font-size: 12px;
  }

  .row {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    --cw: clamp(40px, 9vw, 72px);
  }

  .part {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .hidden {
    visibility: hidden;
  }

  .plus {
    display: flex;
    align-items: center;
    height: calc(var(--cw) * 1.4);
    padding: 0 2px;
    font-weight: 700;
    color: var(--muted);
    opacity: 0.2;
    transition: opacity 0.2s;
  }

  .plus.on {
    opacity: 1;
  }

  .calc {
    display: grid;
    place-items: center;
    min-height: 28px;
  }

  .value {
    display: grid;
    place-items: center;
    min-width: 30px;
    height: 28px;
    padding: 0 8px;
    border-radius: 999px;
    background: var(--text);
    color: var(--surface);
    font-variant-numeric: tabular-nums;
  }

  .formula {
    font-size: 13px;
    color: var(--muted);
    white-space: nowrap;
  }

  /*
   * Werte und Punkte ploppen nur über die Größe auf, ohne Einblenden: Steht die Animation einmal still
   * (z. B. bei verdecktem Fenster), bleiben sie trotzdem lesbar.
   */
  .value,
  .formula,
  .points {
    animation: pop 0.22s ease-out;
  }

  @keyframes pop {
    from {
      transform: scale(0.5);
    }
  }

  .sum {
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-height: 1.3em;
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .solved {
    color: var(--ok);
  }

  .points {
    font-size: 15px;
  }
</style>
