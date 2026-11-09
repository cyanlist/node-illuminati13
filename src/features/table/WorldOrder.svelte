<script lang="ts">
import { rulesetFor } from '../../core/game';
import { cardsToPlace, judgeSelection } from '../../state/selection';
import { table } from '../../state/table.svelte';

/**
 * Variante „Wenn die Weltordnung sich verschiebt“: unter dem Nachziehstapel, wie oft sich die Weltordnung schon
 * verschoben hat – der Pfeil zeigt die Richtung (↻ nach rechts, ↺ nach links). Rücken die Stapel weiter, springt
 * die Zahl kurz an. Liegt in der Auswahl eine 13, die beim Ablegen auf einem Stapel landen würde, leuchtet sie auf –
 * nur mit sichtbaren wahren Werten, sonst würde es verraten, ob die Auswahl gültig ist.
 */
const right = $derived(table.game?.settings.dir !== 'links');

const armed = $derived.by(() => {
  const game = table.game;
  if (!game?.settings.showValues || !table.canPlay) return false;
  const { placement } = rulesetFor(game.settings);
  return cardsToPlace(judgeSelection()).some((card) => placement.triggers(game, card));
});
</script>

<p class="world-order" class:armed title="Weltordnung {table.rotations}× verschoben, {right ? 'nach rechts' : 'nach links'}">
  <span aria-hidden="true">{right ? '↻' : '↺'} {#key table.rotations}<b>{table.rotations}</b>{/key}×</span>
  <span class="sr-only">Weltordnung {table.rotations}-mal verschoben, Richtung {right ? 'rechts' : 'links'}</span>
</p>

<style>
  .world-order {
    margin: -4px 0 0;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--muted);
    text-align: center;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    transition: color 0.3s;
  }

  /* neue Verschiebung: die Zahl springt kurz an */
  b {
    display: inline-block;
    animation: pop 0.45s ease-out;
  }

  /* eine 13 in der Auswahl würde die Weltordnung verschieben */
  .armed {
    color: var(--accent);
    animation: glow 1.4s ease-in-out infinite;
  }

  @keyframes glow {
    50% {
      color: var(--muted);
    }
  }

  @keyframes pop {
    35% {
      scale: 1.35;
    }
  }
</style>
