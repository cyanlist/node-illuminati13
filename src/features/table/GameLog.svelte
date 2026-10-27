<script lang="ts">
import type { GameState } from '../../core/game';
import { table } from '../../state/table.svelte';
import { isSystemEntry } from '../../ui/format';
import LogText from './LogText.svelte';

/** Protokoll aller Züge, das Neueste oben. */
let { game }: { game: GameState } = $props();

const newestFirst = $derived([...table.log].reverse());
</script>

<aside aria-label="Protokoll">
  <h2>Protokoll</h2>
  <ol>
    {#each newestFirst as entry, i (newestFirst.length - i)}
      <li class:system={isSystemEntry(entry)}><LogText {game} {entry} /></li>
    {/each}
  </ol>
</aside>

<style>
  aside {
    align-self: start;
    width: 100%;
    min-width: 0;
    max-height: 360px;
    overflow: auto;
    padding: 12px 14px;
    background: var(--surface);
    border-radius: 14px;
    box-shadow: 0 1px 3px var(--shadow);
  }

  @media (min-width: 980px) {
    aside {
      position: sticky;
      top: max(12px, env(safe-area-inset-top, 0px));
      max-height: calc(100vh - 28px);
    }
  }

  h2 {
    margin: 0 0 4px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
  }

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
