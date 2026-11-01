<script lang="ts">
import { beatsBest, type GameState, GOAL_POINTS, goalOf, ranking, soloScore } from '../../core/game';
import { goHome, playAgain } from '../../state/flow';
import { sheets } from '../../state/sheets.svelte';
import { table } from '../../state/table.svelte';
import { inTurns, pts, turnCount } from '../../ui/format';
import Sheet from '../../ui/Sheet.svelte';

/**
 * Ergebnis am Spielende: Siegerin oder Sieger, Gleichstand oder – allein – Punkte und Bestwert.
 * Allein bei „Bis 13“ zählen die Züge bis zum Ziel; dort ist der Bestwert die kleinste Zahl.
 */
let { game }: { game: GameState } = $props();

const result = $derived(ranking(game));
const solo = $derived(game.players.length === 1);
const winner = $derived(result.order[0]);
const goal = $derived(goalOf(game) !== null);
/** Allein: Punkte oder bei „Bis 13“ die Züge; null, wenn das Ziel nicht erreicht wurde */
const score = $derived(soloScore(game));

const title = $derived.by(() => {
  if (!winner) return '';
  if (solo && goal) return score !== null ? `${GOAL_POINTS} Punkte ${inTurns(score)}` : pts(winner.points);
  if (solo) return pts(winner.points);
  if (result.tie) return 'Gleichstand';
  return winner.you ? 'Du gewinnst!' : `${winner.name} gewinnt!`;
});

const subtitle = $derived.by(() => {
  if (!winner) return '';
  if (solo && goal) {
    const best = table.soloBest;
    const record = best === 0 ? '' : ` Dein Bestwert: ${GOAL_POINTS} Punkte ${inTurns(best)}.`;
    if (score === null) return `Der Stapel war leer, bevor du ${GOAL_POINTS} Punkte hattest.${record}`;
    if (best === 0) return `Du hast die 13 ${winner.combos}-mal gefunden.`;
    return beatsBest(game, score, best) ? `Neuer Bestwert! Bisher waren es ${turnCount(best)}.` : record.trim();
  }
  if (solo) {
    const best = table.soloBest;
    const found = `Du hast die 13 ${winner.combos}-mal gefunden.`;
    if (best === 0) return found;
    return winner.points > best ? `${found} Neuer Bestwert! Bisher waren es ${best}.` : `${found} Dein Bestwert: ${best}.`;
  }
  if (result.tie) return 'Gleich viele Punkte und gleich viele 13er. Die Wahrheit bleibt geteilt.';
  return result.decidedByCombos
    ? 'Punktgleich, aber mit mehr gefundenen 13er-Kombinationen.'
    : 'Die Wahrheit wurde am klarsten bewiesen.';
});
</script>

<Sheet {title}>
  <p>{subtitle}</p>

  {#if !solo}
    <table>
      <thead>
        <tr><th>Name</th><th>Punkte</th><th>13er</th></tr>
      </thead>
      <tbody>
        {#each result.order as player, i (player.name)}
          <tr class:winner={i === 0 && !result.tie}>
            <td>{player.name}</td>
            <td class="num">{player.points}</td>
            <td class="num">{player.combos}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  {#snippet actions()}
    <button type="button" class="btn btn--ghost" onclick={() => (sheets.resultsHidden = true)}>Tisch ansehen</button>
    <button type="button" class="btn" onclick={goHome}>Startseite</button>
    <button type="button" class="btn btn--primary" onclick={playAgain}>Nochmal spielen</button>
  {/snippet}
</Sheet>

<style>
  table {
    width: 100%;
    margin: 12px 0;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 7px 10px;
    text-align: left;
    border-bottom: 1px solid var(--line);
  }

  .num {
    text-align: right;
    font-size: 18px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .winner td:first-child {
    font-weight: 700;
  }
</style>
