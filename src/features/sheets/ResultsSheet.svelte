<script lang="ts">
import type { GameState } from '../../core/game';
import { goHome, playAgain } from '../../state/flow';
import { table } from '../../state/table.svelte';
import { type ShareOutcome, shareImage } from '../../ui/share';
import Sheet from '../../ui/Sheet.svelte';
import ResultDuel from './results/ResultDuel.svelte';
import { resultImage } from './results/result-image';
import { shareCaption, summarize } from './results/result-summary';
import ScoreChart from './results/ScoreChart.svelte';
import SoloBest from './results/SoloBest.svelte';

/**
 * Ergebnis am Spielende: zu zweit ein Duell der beiden Plätze, allein Punkte und der Vergleich mit dem Bestwert.
 * Darunter der Verlauf über alle Züge. „Ergebnis teilen“ schickt ein Bild davon (result-image.ts) samt
 * Stapelregeln, Varianten und Link – was darauf steht, rechnet result-summary.ts für Fenster und Bild gleich aus.
 */
let { game }: { game: GameState } = $props();

const summary = $derived(summarize(game, table.soloBest));

/** Das Bild entsteht gleich beim Öffnen – Telefone erlauben das Teilen nur direkt nach dem Tippen */
let image = $state<Blob | null>(null);
$effect(() => {
  let current = true;
  image = null;
  resultImage(game, summary)
    .then((blob) => {
      if (current) image = blob;
    })
    .catch(() => {
      // ohne Bild bleibt der Knopf aus
    });
  return () => {
    current = false;
  };
});

let shared = $state<ShareOutcome | null>(null);
const SHARE_LABELS: Partial<Record<ShareOutcome, string>> = {
  copied: 'Bild kopiert ✓',
  saved: 'Bild gespeichert ✓',
  failed: 'Teilen ging nicht',
};

$effect(() => {
  if (!shared) return;
  const timer = setTimeout(() => (shared = null), 2500);
  return () => clearTimeout(timer);
});

async function share(): Promise<void> {
  if (!image) return;
  shared = await shareImage(image, 'illuminati13-ergebnis.png', shareCaption(game));
}
</script>

<Sheet title={summary.title}>
  <p>{summary.subtitle}</p>

  {#if !summary.solo}<ResultDuel players={summary.order} tie={summary.tie} />{/if}
  {#if summary.comparison}<SoloBest {...summary.comparison} />{/if}
  <ScoreChart
    history={summary.history}
    players={game.players}
    highlight={summary.tie ? null : summary.winnerIndex}
    goal={summary.goal}
    caption={summary.caption}
  />

  {#snippet actions()}
    <button type="button" class="btn btn--ghost" disabled={!image} onclick={share}>
      {(shared && SHARE_LABELS[shared]) || 'Ergebnis teilen'}
    </button>
    <button type="button" class="btn" onclick={goHome}>Startseite</button>
    <button type="button" class="btn btn--primary" onclick={playAgain}>Nochmal spielen</button>
  {/snippet}
</Sheet>
