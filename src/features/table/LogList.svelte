<script lang="ts">
import type { GameState } from '../../core/game';
import { table } from '../../state/table.svelte';
import { isSystemEntry } from '../../ui/format';
import LogText from './LogText.svelte';

/** Alle Züge als Liste, das Neueste oben – neben dem Tisch und im Protokoll-Fenster. */
let { game }: { game: GameState } = $props();

const newestFirst = $derived([...table.log].reverse());
</script>

<ol>
  {#each newestFirst as entry, i (newestFirst.length - i)}
    <li class:system={isSystemEntry(entry)}><LogText {game} {entry} /></li>
  {/each}
</ol>

<style>
  ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    padding-block: 7px;
    border-top: 1px solid var(--line);
    font-size: 14px;
  }

  li:first-child {
    border-top: 0;
  }

  .system {
    color: var(--muted);
    font-style: italic;
  }
</style>
