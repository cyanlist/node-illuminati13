<script lang="ts">
import { type GameState, ranking } from '../../core/game';
import { goHome, playAgain } from '../../state/flow';
import { table } from '../../state/table.svelte';
import { pts } from '../../ui/format';
import Sheet from '../../ui/Sheet.svelte';

/** Ergebnis am Spielende: Siegerin oder Sieger, Gleichstand oder – allein – Punkte und Bestwert. */
let { game }: { game: GameState } = $props();

const result = $derived(ranking(game));
const solo = $derived(game.players.length === 1);
const winner = $derived(result.order[0]);

const title = $derived.by(() => {
  if (!winner) return '';
  if (solo) return pts(winner.points);
  if (result.tie) return 'Gleichstand';
  return winner.you ? 'Du gewinnst!' : `${winner.name} gewinnt!`;
});

const subtitle = $derived.by(() => {
  if (!winner) return '';
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
    <button type="button" class="btn btn--ghost" onclick={() => (table.resultsHidden = true)}>Tisch ansehen</button>
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
