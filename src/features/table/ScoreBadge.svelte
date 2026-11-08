<script lang="ts">
import { pointWord } from '../../ui/format';

/**
 * Die Punkte einer Person als farbiges Feld (Farbe aus --player des Platzes). Bei „Bis 13“ steht das Ziel
 * daneben („7 / 13“), und ist es erreicht, leuchtet das Feld in der vollen Farbe. Neue Punkte springen kurz an.
 */
let { points, goal = null }: { points: number; goal?: number | null } = $props();
</script>

<span
  class="score"
  class:reached={goal !== null && points >= goal}
  aria-label={goal !== null ? `${points} von ${goal} Punkten` : `${points} ${pointWord(points)}`}
>
  {#key points}<b class="points">{points}</b>{/key}
  {#if goal !== null}
    <span class="unit">/ {goal}</span>
  {:else}
    <!-- „Punkt“ und „Punkte“ teilen sich den Platz des längeren Worts – beim ersten Punkt rückt so nichts daneben -->
    <span class="unit word">
      <span>{pointWord(points)}</span>
      <span class="spacer" aria-hidden="true">Punkte</span>
    </span>
  {/if}
</span>

<style>
  .score {
    display: inline-flex;
    align-items: baseline;
    gap: 5px;
    flex: none;
    padding: 3px 10px 4px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--player) 18%, transparent);
  }

  .points {
    display: inline-block;
    color: var(--player);
    font-size: 22px;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    animation: pop 0.45s ease-out;
  }

  .unit {
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
  }

  .word {
    display: inline-grid;
  }

  .word > * {
    grid-area: 1 / 1;
  }

  .spacer {
    visibility: hidden;
  }

  /* „Bis 13“: Ziel erreicht – das Feld leuchtet in der vollen Farbe */
  .reached {
    background: var(--player);
  }

  .reached .points,
  .reached .unit {
    color: var(--surface);
  }

  /* neue Punkte: die Zahl springt kurz an (nur Größe – bleibt sichtbar, auch wenn nichts animiert wird) */
  @keyframes pop {
    0% {
      transform: scale(1);
    }
    35% {
      transform: scale(1.35);
    }
    100% {
      transform: scale(1);
    }
  }
</style>
