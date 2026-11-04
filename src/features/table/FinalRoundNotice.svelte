<script lang="ts">
import { fade, scale } from 'svelte/transition';
import { type GameState, lastTurnPlayers, playerAt, rulesetFor } from '../../core/game';
import { FINAL_NOTICE_MS } from '../../state/flow';
import { table } from '../../state/table.svelte';

/**
 * Ankündigung über dem Board, sobald die letzte Runde beginnt: warum (Ziel erreicht oder Nachziehstapel leer) und
 * wer noch einen letzten Zug hat. Sie verschwindet nach ein paar Sekunden, beim Antippen oder sobald jemand ablegt.
 * Wer den Tisch mitten in der letzten Runde (wieder) öffnet, bekommt sie nicht noch einmal.
 */
let { game }: { game: GameState } = $props();

interface Notice {
  reason: string;
  turns: string;
}

let notice = $state<Notice | null>(null);
/** War beim letzten Blick schon letzte Runde? null: noch nicht nachgesehen */
let seen: boolean | null = null;

$effect(() => {
  const active = game.finalTurnsLeft !== null && !game.over;
  if (seen === null || !active || seen) {
    seen = active;
    return;
  }
  seen = true;
  notice = describe(game);
});

// nach einer Weile oder sobald wieder Karten fliegen, ist die Ankündigung vorbei
$effect(() => {
  if (!notice) return;
  if (table.anim) {
    notice = null;
    return;
  }
  const timer = setTimeout(() => (notice = null), FINAL_NOTICE_MS);
  return () => clearTimeout(timer);
});

function describe(state: GameState): Notice {
  const { ending, draw } = rulesetFor(state.settings);
  const started = [...state.log].reverse().find((entry) => entry.kind === 'goal' || entry.kind === 'final');
  let reason: string;
  if (started?.kind === 'goal') {
    const player = playerAt(state, started.player);
    reason = `${player.you ? 'Du hast' : `${player.name} hat`} ${ending.goal} Punkte erreicht.`;
  } else {
    reason =
      draw.id === 'reshuffle'
        ? 'Der Nachziehstapel ist leer – es wird nicht mehr nachgemischt.'
        : 'Der Nachziehstapel ist leer.';
  }
  const left = lastTurnPlayers(state);
  const turns =
    left.length > 1 && left.length >= state.players.length
      ? 'Jede*r hat noch einen letzten Zug.'
      : left
          .map((index) => playerAt(state, index))
          .map((player) => `${player.you ? 'Du hast' : `${player.name} hat`} noch einen letzten Zug.`)
          .join(' ');
  return { reason, turns };
}
</script>

{#if notice}
  <button
    type="button"
    class="final-notice"
    aria-live="assertive"
    onclick={() => (notice = null)}
    in:fade={{ duration: 160 }}
    out:fade={{ duration: 220 }}
  >
    <span class="notice-card" in:scale={{ start: 0.85, duration: 260 }}>
      <span class="title">Letzte Runde!</span>
      <span class="text">{notice.reason}</span>
      <span class="text strong">{notice.turns}</span>
    </span>
  </button>
{/if}

<style>
  .final-notice {
    position: absolute;
    inset: 0;
    z-index: var(--z-overlay);
    display: grid;
    place-items: center;
    padding: 10px;
    border: 0;
    border-radius: var(--radius-panel);
    background: color-mix(in srgb, var(--bg) 72%, transparent);
    backdrop-filter: blur(2px);
    font: inherit;
    color: var(--text);
    cursor: pointer;
  }

  .notice-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    max-width: 340px;
    padding: 14px 22px 16px;
    background: var(--surface);
    border: 2px solid var(--danger);
    border-radius: var(--radius-panel);
    box-shadow:
      0 0 0 6px color-mix(in srgb, var(--danger) 18%, transparent),
      0 10px 24px var(--shadow);
    text-align: center;
  }

  .title {
    font-family: var(--font-title);
    font-weight: 700;
    font-size: clamp(26px, 6vw, 34px);
    line-height: 1.1;
    color: var(--danger);
  }

  .text {
    font-size: 15px;
  }

  .strong {
    font-weight: 700;
  }
</style>
