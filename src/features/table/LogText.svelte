<script lang="ts">
import { SUIT_INDICES, SUITS } from '../../core/cards';
import { type GameState, type LogEntry, playerAt, ranking } from '../../core/game';
import Chip from '../../ui/Chip.svelte';
import { calcText, pts, ruleLabel } from '../../ui/format';
import Subject from '../../ui/Subject.svelte';

/** Ein Protokolleintrag als Satz. */
interface Props {
  game: GameState;
  entry: LogEntry;
}
let { game, entry }: Props = $props();

const winner = $derived(entry.kind === 'end' && game.players.length > 1 ? ranking(game) : null);
</script>

{#if entry.kind === 'intro'}
  Das Deck ist gemischt, die vier Stapel sind leer. Solange ein Stapel leer ist, zählt jede Karte ihrer Farbe einfach
  ihre Zahl.
{:else if entry.kind === 'rules'}
  {entry.ruleMode === 'random' ? 'Ausgeloste' : 'Eigene'} Regeln:
  {#each SUIT_INDICES as suit, i (suit)}{#if i > 0}{' · '}{/if}<span class="suit-text suit-{suit}">{SUITS[suit].name}</span>
    {ruleLabel(entry.rules[suit])}{/each}
{:else if entry.kind === 'variant'}
  Variante aktiv: Jede 13, die auf einem Stapel landet, lässt alle Stapel eine Position nach {entry.dir} weiterrücken.
{:else if entry.kind === 'begins'}
  <Subject player={playerAt(game, entry.player)} third="beginnt." second="beginnst." />
{:else if entry.kind === 'proof'}
  <Subject player={playerAt(game, entry.player)} third="beweist die 13:" second="beweist die 13:" />
  {#each entry.parts as part, i (part.card.id)}{#if i > 0}{' + '}{/if}<Chip card={part.card} />
    <span class="muted">({calcText(part)})</span>{/each}
  = 13 · <b>+{pts(entry.points)}</b>
{:else if entry.kind === 'discard'}
  <Subject player={playerAt(game, entry.player)} third="findet noch keine 13 und wirft" second="findest noch keine 13 und wirfst" />
  <Chip card={entry.card} /> auf den {SUITS[entry.card.suit].name}-Stapel ab.
{:else if entry.kind === 'rotation'}
  Eine 13 liegt oben – die Weltordnung verschiebt sich{entry.count > 1 ? ` (${entry.count}×)` : ''}! Alle Stapel rücken
  nach {entry.dir} weiter, die Regeln bleiben stehen.
{:else if entry.kind === 'skip'}
  <Subject
    player={playerAt(game, entry.player)}
    third="hat keine Karten mehr und setzt aus."
    second="hast keine Karten mehr und setzt aus."
  />
{:else if entry.kind === 'hint'}
  <Subject player={playerAt(game, entry.player)} third="holt sich einen Tipp" second="holst dir einen Tipp" />
  (−{pts(entry.cost)}).
{:else if entry.kind === 'final'}
  {entry.players > 1
    ? 'Der Nachziehstapel ist leer. Jetzt hat jede*r noch einen letzten Zug.'
    : 'Der Nachziehstapel ist leer. Du hast noch einen letzten Zug.'}
{:else if entry.kind === 'end'}
  {#if !winner}
    Spielende: {pts(playerAt(game, 0).points)}.
  {:else if winner.tie || !winner.order[0]}
    Spielende. Gleichstand!
  {:else}
    Spielende.
    <Subject
      player={winner.order[0]}
      third="hat die Wahrheit am klarsten bewiesen."
      second="hast die Wahrheit am klarsten bewiesen."
    />
  {/if}
{/if}
