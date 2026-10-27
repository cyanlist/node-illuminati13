<script lang="ts">
import type { GameState } from '../../core/game';
import { table } from '../../state/table.svelte';

/**
 * Hinweise zum Spiel oben am Tisch: letzte Runde, Regel-Modus, offene Karten, Variante.
 * Ohne Hinweise bleibt die Leiste weg.
 */
let { game }: { game: GameState } = $props();

const turnsLeft = $derived(table.phase === 'over' ? null : game.finalTurnsLeft);
const ruleMode = $derived(game.settings.ruleMode);
const openHands = $derived(game.settings.openHands && game.players.length > 1);
const visible = $derived(turnsLeft !== null || ruleMode !== 'classic' || openHands || game.settings.variant);
</script>

{#if visible}
  <section class="status" aria-label="Hinweise zum Spiel">
    {#if turnsLeft !== null}
      <span class="tag warn">Letzte Runde · noch {turnsLeft} {turnsLeft === 1 ? 'Zug' : 'Züge'}</span>
    {/if}
    {#if ruleMode === 'custom'}<span class="tag">Eigene Regeln</span>{/if}
    {#if ruleMode === 'random'}<span class="tag">Ausgeloste Regeln</span>{/if}
    {#if openHands}<span class="tag">Offene Karten</span>{/if}
    {#if game.settings.variant}<span class="tag">Weltordnung {table.rotations}× verschoben</span>{/if}
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
