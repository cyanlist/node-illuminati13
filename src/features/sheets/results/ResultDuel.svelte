<script lang="ts">
import type { Player } from '../../../core/game';
import { hueFor } from '../../../ui/avatar';
import Avatar from '../../../ui/Avatar.svelte';
import Logo from '../../../ui/Logo.svelte';
import { pointWord } from '../../../ui/format';

/**
 * Das Ergebnis zu zweit als Duell statt als Tabelle: beide Plätze nebeneinander in ihren Farben – wie am Tisch –,
 * mit großer Punktzahl und wie oft die 13 gefunden wurde. Wer gewinnt, steht links mit der Marke „erleuchtet“ und
 * vollem Farbring; das Gegenüber tritt etwas zurück. Bei Gleichstand sind beide erleuchtet.
 */
interface Props {
  /** In der Reihenfolge der Wertung – wer gewinnt, zuerst */
  players: Player[];
  tie: boolean;
}
let { players, tie }: Props = $props();
</script>

<div class="duel">
  {#each players as player, i (i)}
    {#if i > 0}<span class="versus" aria-hidden="true">gegen</span>{/if}
    <div class="side" class:won={i === 0 || tie} class:cpu={player.cpu} style:--hue={hueFor(player.name)}>
      <span class="mark"><Logo size="14px" /> erleuchtet</span>
      <span class="ring"><Avatar name={player.name} cpu={player.cpu} size="52px" /></span>
      <b class="name">{player.name}</b>
      <span class="points">{player.points}</span>
      <span class="detail">{pointWord(player.points)} · 13 × {player.combos}</span>
    </div>
  {/each}
</div>

<style>
  .duel {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    margin: 16px 0 6px;
  }

  .versus {
    color: var(--muted);
    font-size: 13px;
  }

  .side {
    --player: hsl(var(--hue) var(--player-s) var(--player-l));
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 0;
    opacity: 0.72;
  }

  .cpu {
    --player: var(--accent);
  }

  .won {
    opacity: 1;
  }

  /* die Marke steht über jedem Platz, sichtbar nur bei Gewinner*innen – so stehen beide Plätze gleich hoch */
  .mark {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    visibility: hidden;
    color: var(--player);
    font-size: 12px;
    font-weight: 700;
  }

  .won .mark {
    visibility: visible;
  }

  .ring {
    display: inline-grid;
    border-radius: 50%;
    box-shadow:
      0 0 0 3px var(--surface),
      0 0 0 4px color-mix(in srgb, var(--player) 45%, transparent);
  }

  .won .ring {
    box-shadow:
      0 0 0 3px var(--surface),
      0 0 0 6px var(--player);
  }

  .name {
    max-width: 100%;
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .points {
    color: var(--player);
    font-size: 34px;
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .detail {
    color: var(--muted);
    font-size: 13px;
  }
</style>
