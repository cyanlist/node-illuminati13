<script lang="ts">
import { type GameState, leadStory, ranking, rulesetFor, scoreHistory } from '../../core/game';
import { goHome, playAgain } from '../../state/flow';
import { table } from '../../state/table.svelte';
import { inTurns, pts, turnCount } from '../../ui/format';
import { type ShareOutcome, shareOrCopy } from '../../ui/share';
import Sheet from '../../ui/Sheet.svelte';
import ResultDuel from './results/ResultDuel.svelte';
import ScoreChart from './results/ScoreChart.svelte';
import { shareText } from './results/share-text';
import SoloBest from './results/SoloBest.svelte';
import { storyLine } from './results/story';

/**
 * Ergebnis am Spielende: zu zweit ein Duell der beiden Plätze, allein Punkte und der Vergleich mit dem Bestwert.
 * Darunter der Verlauf über alle Züge. Teilen gibt das Ergebnis samt Stapelregeln und Varianten als Text weiter.
 * Allein mit Punkteziel (z. B. „Bis 13“) zählen die Züge bis zum Ziel; dort ist der Bestwert die kleinste Zahl.
 */
let { game }: { game: GameState } = $props();

const result = $derived(ranking(game));
const solo = $derived(game.players.length === 1);
const winner = $derived(result.order[0]);
const winnerIndex = $derived(winner ? game.players.indexOf(winner) : -1);
const ending = $derived(rulesetFor(game.settings).ending);
const goal = $derived(ending.goal);
/** Allein: Punkte oder mit Punkteziel die Züge; null, wenn das Ziel nicht erreicht wurde */
const score = $derived(ending.soloScore(game));
const history = $derived(scoreHistory(game));

const title = $derived.by(() => {
  if (!winner) return '';
  if (solo && goal !== null) return score !== null ? `${goal} Punkte ${inTurns(score)}` : pts(winner.points);
  if (solo) return pts(winner.points);
  if (result.tie) return 'Gleichstand';
  return winner.you ? 'Du gewinnst!' : `${winner.name} gewinnt!`;
});

const subtitle = $derived.by(() => {
  if (!winner) return '';
  if (solo && goal !== null) {
    const best = table.soloBest;
    const record = best === 0 ? '' : ` Dein Bestwert: ${goal} Punkte ${inTurns(best)}.`;
    if (score === null) return `Der Stapel war leer, bevor du ${goal} Punkte hattest.${record}`;
    if (best === 0) return `Du hast die 13 ${winner.combos}-mal gefunden.`;
    return ending.beatsBest(score, best) ? `Neuer Bestwert! Bisher waren es ${turnCount(best)}.` : record.trim();
  }
  if (solo) {
    const best = table.soloBest;
    const found = `Du hast die 13 ${winner.combos}-mal gefunden.`;
    if (best === 0) return found;
    return ending.beatsBest(winner.points, best) ? `${found} Neuer Bestwert! Bisher waren es ${best}.` : `${found} Dein Bestwert: ${best}.`;
  }
  if (result.tie) return 'Gleich viele Punkte und gleich viele 13er. Die Wahrheit bleibt geteilt.';
  return result.decidedByCombos
    ? 'Punktgleich, aber mit mehr gefundenen 13er-Kombinationen.'
    : 'Die Wahrheit wurde am klarsten bewiesen.';
});

/** Allein: heute neben dem bisherigen Bestwert – erst ab dem zweiten Spiel und nur, wenn es etwas zu vergleichen gibt */
const comparison = $derived.by(() => {
  const best = table.soloBest;
  if (!solo || !winner || best === 0) return null;
  if (goal === null) return { today: winner.points, best, unit: 'Punkte', fewerIsBetter: false };
  return score === null ? null : { today: score, best, unit: 'Züge', fewerIsBetter: true };
});

const caption = $derived(
  solo || !winner
    ? 'Punkte nach jedem Zug'
    : storyLine(leadStory(history, winnerIndex), winner, winnerIndex, result.tie),
);

let shared = $state<ShareOutcome | null>(null);
const SHARE_LABELS: Partial<Record<ShareOutcome, string>> = { copied: 'Kopiert ✓', failed: 'Kopieren ging nicht' };

$effect(() => {
  if (!shared) return;
  const timer = setTimeout(() => (shared = null), 2500);
  return () => clearTimeout(timer);
});

async function share(): Promise<void> {
  shared = await shareOrCopy('Illuminati 13', shareText(game));
}
</script>

<Sheet {title}>
  <p>{subtitle}</p>

  {#if !solo}<ResultDuel players={result.order} tie={result.tie} />{/if}
  {#if comparison}<SoloBest {...comparison} />{/if}
  <ScoreChart {history} players={game.players} highlight={result.tie ? null : winnerIndex} {goal} {caption} />

  {#snippet actions()}
    <button type="button" class="btn btn--ghost" onclick={share}>
      {(shared && SHARE_LABELS[shared]) || 'Ergebnis teilen'}
    </button>
    <button type="button" class="btn" onclick={goHome}>Startseite</button>
    <button type="button" class="btn btn--primary" onclick={playAgain}>Nochmal spielen</button>
  {/snippet}
</Sheet>
