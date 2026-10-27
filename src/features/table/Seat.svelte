<script lang="ts">
import type { Snippet } from 'svelte';

/**
 * Ein Platz am Tisch: eine ruhige Fläche wie das Board, in der Kopfzeile links Name und Status,
 * rechts Punkte und 13er. Darunter liegen die Karten dieser Person.
 */
interface Props {
  name: string;
  points: number;
  combos: number;
  /** Diese Person ist am Zug – der Platz bekommt einen Rahmen */
  active: boolean;
  /** Der Computer überlegt gerade */
  thinking?: boolean;
  /** Beschriftung für Screenreader, z. B. „Gegenüber“ */
  label: string;
  children: Snippet;
}
let { name, points, combos, active, thinking = false, label, children }: Props = $props();
</script>

<section class="seat" class:active aria-label={label}>
  <header>
    <span class="name">
      {name}
      {#if thinking}
        <span class="status thinking">überlegt<span>.</span><span>.</span><span>.</span></span>
      {:else if active}
        <span class="status">am Zug</span>
      {/if}
    </span>
    <span class="score"><b>{points}</b> {points === 1 ? 'Punkt' : 'Punkte'} · {combos}× die 13</span>
  </header>
  {@render children()}
</section>

<style>
  .seat {
    padding: 10px clamp(12px, 2.4vw, 22px) 14px;
    background: var(--surface);
    border-radius: 16px;
    box-shadow: 0 1px 3px var(--shadow);
    transition: box-shadow 0.2s;
  }

  /* Rahmen nach innen, damit sich beim Zugwechsel nichts verschiebt */
  .active {
    box-shadow:
      inset 0 0 0 2px var(--accent),
      0 1px 3px var(--shadow);
  }

  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 2px 12px;
    margin-bottom: 8px;
  }

  .name {
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    font-weight: 700;
  }

  .status {
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .thinking {
    font-size: 13px;
    font-weight: 400;
    font-style: italic;
    text-transform: none;
    letter-spacing: 0;
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

  .score {
    color: var(--muted);
    font-size: 13px;
    white-space: nowrap;
  }

  .score b {
    color: var(--text);
    font-size: 20px;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
</style>
