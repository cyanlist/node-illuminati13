<script lang="ts">
import type { Snippet } from 'svelte';
import { hueFor } from '../../ui/avatar';
import Avatar from '../../ui/Avatar.svelte';
import ScoreBadge from './ScoreBadge.svelte';
import Thinking from './Thinking.svelte';

/**
 * Ein Platz am Tisch wie ein kleines Profil in einer Zeile: Avatar mit Ring in der Farbe der Person, Name,
 * gleich daneben die Punkte und wie oft die 13 gefunden wurde. Wer am Zug ist, bekommt einen leuchtenden
 * Rahmen in seiner Farbe. Darunter liegen die Karten dieser Person – kompakt (`compact`) rücken kleine
 * Karten neben den Avatar unter den Namen, damit der Platz wenig Höhe braucht.
 */
interface Props {
  name: string;
  cpu: boolean;
  points: number;
  /** Bei „Bis 13“ das Ziel – die Punkte stehen dann als „7 / 13“ da */
  goal?: number | null;
  combos: number;
  /** Diese Person ist am Zug */
  active: boolean;
  /** Der Computer bzw. das andere Gerät überlegt gerade */
  thinking?: boolean;
  /** Kleine Karten neben dem Avatar statt in einer eigenen Reihe */
  compact?: boolean;
  /** Beschriftung für Screenreader, z. B. „Platz oben“ */
  label: string;
  children: Snippet;
}
let { name, cpu, points, goal = null, combos, active, thinking = false, compact = false, label, children }: Props = $props();
</script>

<section class="seat" class:active class:cpu class:compact style:--hue={hueFor(name)} aria-label={label}>
  <Avatar {name} {cpu} size="44px" />
  <header>
    <span class="name">{name}</span>
    {#if active}<span class="sr-only">ist am Zug</span>{/if}
    <ScoreBadge {points} {goal} />
    <span class="combos" aria-label="{combos}-mal die 13" title="{combos}-mal die 13 gefunden">
      <span class="token">13</span><span class="times">×{combos}</span>
    </span>
    {#if thinking}<Thinking />{/if}
  </header>
  <div class="cards">{@render children()}</div>
</section>

<style>
  .seat {
    /* die Farbe dieser Person; der Computer bleibt neutral */
    --player: hsl(var(--hue) var(--player-s) var(--player-l));
    padding: 12px clamp(12px, 2.4vw, 22px) 14px;
    background:
      linear-gradient(100deg, color-mix(in srgb, var(--player) 14%, transparent), transparent 45%),
      var(--surface);
    border-radius: var(--radius-panel);
    box-shadow: var(--shadow-panel);
    transition: box-shadow 0.25s;
    /* Avatar links neben der Kopfzeile, die Karten darunter über die ganze Breite */
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas:
      "avatar head"
      "cards cards";
    align-items: center;
    column-gap: 14px;
    row-gap: 12px;
  }

  @media (max-width: 620px) {
    .seat {
      row-gap: 8px;
    }
  }

  /* kompakt: die kleinen Karten stehen unter dem Namen, der Avatar mittig daneben */
  .compact {
    grid-template-areas:
      "avatar head"
      "avatar cards";
    row-gap: 6px;
  }

  .cpu {
    --player: var(--accent);
  }

  /* am Zug: Rahmen und sanfter Schein in der eigenen Farbe – nach innen, damit sich nichts verschiebt */
  .active {
    box-shadow:
      inset 0 0 0 2px var(--player),
      0 0 0 4px color-mix(in srgb, var(--player) 22%, transparent),
      var(--shadow-panel);
  }

  header {
    grid-area: head;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .cards {
    grid-area: cards;
    min-width: 0;
  }

  /* Ring um den Avatar in der Spielerfarbe */
  .seat > :global(.avatar) {
    grid-area: avatar;
    box-shadow:
      0 0 0 3px var(--surface),
      0 0 0 5px var(--player);
  }

  .name {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 700;
    font-size: 17px;
  }

  /* wie oft die 13 gefunden wurde: eine Marke mit Zahl, nichts zum Abzählen */
  .combos {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    flex: none;
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .token {
    padding: 0 5px;
    border: 1.5px solid currentColor;
    border-radius: 6px;
    font-size: 11px;
    line-height: 1.4;
  }
</style>
