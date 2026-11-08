<script lang="ts">
import type { Player } from '../../../core/game';
import { hueFor } from '../../../ui/avatar';

/**
 * Der Verlauf als kleine Linie: Punkte nach jedem Zug, je Person in ihrer Farbe – man sieht, ob es knapp war oder
 * eine Aufholjagd. Mit Punkteziel zeigt eine gestrichelte Linie, wo das Ziel lag. Darüber ein Satz dazu.
 */
interface Props {
  /** Punkte aller Personen nach jedem Zug (scoreHistory) */
  history: number[][];
  /** In der Reihenfolge der Plätze, passend zu `history` */
  players: Player[];
  /** Diese Linie etwas kräftiger (wer gewinnt); null bei Gleichstand */
  highlight: number | null;
  goal: number | null;
  caption: string;
}
let { history, players, highlight, goal, caption }: Props = $props();

const WIDTH = 300;
const HEIGHT = 72;
/** Rand oben und unten, damit dicke Linien nicht abgeschnitten werden */
const PAD = 3;

const top = $derived(Math.max(1, goal ?? 0, ...history.flat()));
const x = (i: number): number => (history.length > 1 ? (i / (history.length - 1)) * WIDTH : 0);
const y = (points: number): number => HEIGHT - PAD - (points / top) * (HEIGHT - 2 * PAD);
const line = (player: number): string =>
  history.map((points, i) => `${x(i).toFixed(1)},${y(points[player] ?? 0).toFixed(1)}`).join(' ');
const color = (player: Player): string =>
  player.cpu ? 'var(--accent)' : `hsl(${hueFor(player.name)} var(--player-s) var(--player-l))`;
</script>

<figure>
  <figcaption><span class="label">Verlauf</span> · {caption}</figcaption>
  <svg viewBox="0 0 {WIDTH} {HEIGHT}" preserveAspectRatio="none" role="img" aria-label="Punkte nach jedem Zug">
    <line class="base" x1="0" y1={HEIGHT - PAD} x2={WIDTH} y2={HEIGHT - PAD} />
    {#if goal !== null}<line class="goal" x1="0" y1={y(goal)} x2={WIDTH} y2={y(goal)} />{/if}
    {#each players as player, i (i)}
      <polyline points={line(i)} stroke={color(player)} class:strong={i === highlight} />
    {/each}
  </svg>
</figure>

<style>
  figure {
    margin: 12px 0 0;
    padding-top: 10px;
    border-top: 1px solid var(--line);
  }

  figcaption {
    margin-bottom: 6px;
    color: var(--muted);
    font-size: 13px;
  }

  .label {
    font-weight: 700;
  }

  svg {
    display: block;
    width: 100%;
    height: 72px;
    overflow: visible;
  }

  line,
  polyline {
    vector-effect: non-scaling-stroke;
    fill: none;
  }

  .base {
    stroke: var(--line);
    stroke-width: 1;
  }

  .goal {
    stroke: var(--muted);
    stroke-width: 1;
    stroke-dasharray: 4 4;
  }

  polyline {
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .strong {
    stroke-width: 3;
  }
</style>
