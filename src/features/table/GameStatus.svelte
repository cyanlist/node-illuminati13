<script lang="ts">
import { type GameState, rulesetFor, turnsTaken } from '../../core/game';
import { table } from '../../state/table.svelte';
import { turnCount } from '../../ui/format';

/**
 * Hinweise zum Spiel oben am Tisch: letzte Runde, Punkteziel (allein mit Zahl der Züge, mit Nachmischen auch wie oft
 * schon gemischt wurde), Regel-Modus und offene Karten. Die Weltordnung zeigt das Board selbst (WorldOrder.svelte).
 * Ohne Hinweise bleibt die Leiste weg.
 */
let { game }: { game: GameState } = $props();

const turnsLeft = $derived(table.phase === 'over' ? null : game.finalTurnsLeft);
const ruleMode = $derived(game.settings.ruleMode);
const openHands = $derived(game.settings.openHands && game.players.length > 1);
const ruleset = $derived(rulesetFor(game.settings));
const goal = $derived(ruleset.ending.goal);
const reshuffles = $derived(ruleset.draw.id === 'reshuffle' ? game.reshuffles : 0);
const solo = $derived(game.players.length === 1);
/** Allein mit Punkteziel: die bisherigen Züge – genau die werden am Ende gewertet */
const turns = $derived(turnsTaken(game, 0));
const visible = $derived(
  turnsLeft !== null || goal !== null || ruleMode !== 'classic' || openHands,
);
</script>

{#if visible}
  <section class="status" aria-label="Hinweise zum Spiel">
    {#if turnsLeft !== null}
      <span class="tag warn">Letzte Runde · noch {turnCount(turnsLeft)}</span>
    {/if}
    {#if goal !== null}
      <span class="tag">
        Bis {goal}{solo ? ` · ${turnCount(turns)}` : ' Punkte'}{reshuffles > 0 ? ` · ${reshuffles}× gemischt` : ''}
      </span>
    {/if}
    {#if ruleMode === 'custom'}<span class="tag">Eigene Regeln</span>{/if}
    {#if ruleMode === 'random'}<span class="tag">Ausgeloste Regeln</span>{/if}
    {#if openHands}<span class="tag">Offene Karten</span>{/if}
  </section>
{/if}

<style>
  .status {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    padding: 2px 10px;
    border: 1.5px solid var(--line);
    border-radius: 999px;
    background: var(--surface);
    color: var(--muted);
    font-weight: 700;
    font-size: 13px;
    white-space: nowrap;
  }

  .warn {
    color: var(--text);
    border-color: var(--text);
  }
</style>
