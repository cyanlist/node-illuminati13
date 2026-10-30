<script lang="ts">
import type { Settings } from '../../core/settings';
import Panel from './Panel.svelte';
import { extrasSummary, hintsSummary, rulesSummary, type Section } from './settings-summary';

/**
 * Was man selten ändert, steht hier nur als Kurzfassung – jede Zeile öffnet ihr Fenster zum Anpassen.
 * So sieht man auf einen Blick, womit man gleich spielt.
 */
interface Props {
  draft: Settings;
  onopen: (section: Section) => void;
}
let { draft, onopen }: Props = $props();

const rows: { section: Section; label: string; summary: (draft: Settings) => string }[] = [
  { section: 'rules', label: 'Regeln', summary: rulesSummary },
  { section: 'hints', label: 'Tipps', summary: hintsSummary },
  { section: 'extras', label: 'Extras', summary: extrasSummary },
];
</script>

<Panel title="Dieses Spiel">
  <ul>
    {#each rows as row (row.section)}
      <li>
        <button type="button" aria-haspopup="dialog" onclick={() => onopen(row.section)}>
          <b>{row.label}</b>
          <span>{row.summary(draft)}</span>
          <svg viewBox="0 0 8 14" aria-hidden="true"><path d="M1 1l6 6-6 6" /></svg>
        </button>
      </li>
    {/each}
  </ul>
</Panel>

<style>
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li + li {
    border-top: 1px solid var(--line);
  }

  button {
    display: grid;
    grid-template-columns: 5.5em minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 2px;
    font: inherit;
    text-align: left;
    color: var(--text);
    background: none;
    border: 0;
    cursor: pointer;
  }

  button:hover span {
    color: var(--text);
  }

  span {
    color: var(--muted);
    overflow-wrap: anywhere;
  }

  svg {
    width: 8px;
    height: 14px;
    fill: none;
    stroke: var(--muted);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
