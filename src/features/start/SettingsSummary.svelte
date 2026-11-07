<script lang="ts">
import type { TransitionConfig } from 'svelte/transition';
import type { Settings } from '../../core/settings';
import Panel from './Panel.svelte';
import { SECTIONS, type SectionId } from './sections';

/**
 * Was man selten ändert, steht hier nur als Kurzfassung – jede Zeile öffnet ihr Fenster zum Anpassen.
 * So sieht man auf einen Blick, womit man gleich spielt.
 *
 * Ohne `onopen` nur zum Ansehen: Als Gast an zwei Geräten zeigt sie live, was die Gastgeber*in einstellt. Ändert
 * sich eine Zeile, leuchtet sie kurz auf, damit man es mitbekommt.
 */
interface Props {
  draft: Settings;
  onopen?: (section: SectionId) => void;
  /** Ein Satz über den Zeilen, z. B. wer einstellt */
  note?: string;
}
let { draft, onopen, note }: Props = $props();

/** Kurzes Aufleuchten einer geänderten Zeile */
function flash(_node: Element): TransitionConfig {
  return {
    duration: 1400,
    css: (t) => `background: color-mix(in srgb, var(--marker) ${Math.round((1 - t) * 16)}%, transparent);`,
  };
}
</script>

<Panel title="Dieses Spiel">
  {#if note}<p class="note">{note}</p>{/if}
  <ul>
    {#each SECTIONS as section (section.id)}
      {@const summary = section.summary(draft)}
      <li>
        {#if onopen}
          <button type="button" class="row" aria-haspopup="dialog" onclick={() => onopen(section.id)}>
            <b>{section.label}</b>
            <span>{summary}</span>
            <svg viewBox="0 0 8 14" aria-hidden="true"><path d="M1 1l6 6-6 6" /></svg>
          </button>
        {:else}
          {#key summary}
            <div class="row" in:flash>
              <b>{section.label}</b>
              <span>{summary}</span>
            </div>
          {/key}
        {/if}
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

  .note {
    margin: 0 0 4px;
    color: var(--muted);
    font-size: 14px;
  }

  .row {
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
    border-radius: 6px;
  }

  button.row {
    cursor: pointer;
  }

  button.row:hover span {
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
