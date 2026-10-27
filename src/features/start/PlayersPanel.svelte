<script lang="ts">
import type { CpuLevel, GameMode, Settings } from '../../core/settings';
import Panel from './Panel.svelte';
import Segmented from './Segmented.svelte';

/**
 * Wer spielt: zwei Plätze. Du gibst deinen Namen ein, das Gegenüber ist der Computer (mit Stärke),
 * ein Mensch am selben Gerät – oder niemand, dann spielst du allein.
 */
let { draft = $bindable() }: { draft: Settings } = $props();

const opponents: { value: GameMode; label: string }[] = [
  { value: 'cpu', label: 'Computer' },
  { value: 'hotseat', label: 'Mensch' },
  { value: 'solo', label: 'Niemand' },
];

const levels: { value: CpuLevel; label: string; description: string }[] = [
  { value: 'easy', label: 'Leicht', description: 'Übersieht viele 13en, vor allem große, und wirft wahllos ab.' },
  { value: 'medium', label: 'Mittel', description: 'Findet kleine 13en meist, große nur manchmal.' },
  { value: 'hard', label: 'Schwer', description: 'Sieht jede 13 und legt immer die größte.' },
];

const together = $derived(draft.mode === 'hotseat');
const level = $derived(levels.find((option) => option.value === draft.cpuLevel));
</script>

<Panel title="Wer spielt?">
  <div class="seats">
    <div class="seat">
      <label class="field">
        {together ? 'Spieler*in 1' : 'Du'}
        <input
          type="text"
          maxlength="20"
          autocomplete="off"
          placeholder={together ? 'Spieler*in 1' : 'Du'}
          bind:value={draft.names[0]}
        />
      </label>
    </div>

    <div class="seat">
      <span class="field-label">Gegenüber</span>
      <Segmented name="opponent" label="Gegenüber" options={opponents} bind:value={draft.mode} />

      {#if draft.mode === 'cpu'}
        <div class="detail">
          <span class="field-label">Stärke</span>
          <Segmented name="cpu-level" label="Stärke des Computers" options={levels} bind:value={draft.cpuLevel} />
          <small>{level?.description}</small>
        </div>
      {:else if together}
        <label class="field detail">
          Spieler*in 2
          <input type="text" maxlength="20" autocomplete="off" placeholder="Spieler*in 2" bind:value={draft.names[1]} />
          <small>Abwechselnd an einem Gerät, die Karten bleiben bis zur Übergabe verdeckt.</small>
        </label>
      {:else}
        <small class="detail">Allein: Wie viele Punkte schaffst du mit einem Deck?</small>
      {/if}
    </div>
  </div>
</Panel>

<style>
  .seats {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .seat {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-weight: 700;
    min-width: 0;
  }

  .field-label {
    font-weight: 700;
  }

  .detail {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
  }

  small {
    color: var(--muted);
    font-weight: 400;
  }
</style>
