<script lang="ts">
import type { Settings } from '../../core/settings';
import Segmented from '../../ui/Segmented.svelte';
import PeerSeat from '../online/PeerSeat.svelte';
import { CPU_LEVEL_OPTIONS } from './modes';
import Panel from './Panel.svelte';

/**
 * Wer spielt – nur, was zur gewählten Spielart gehört (gewählt wird sie auf der ersten Ebene der Startseite):
 * dein Name und dazu die Stärke des Computers, der Name von Spieler*in 2 oder die Verbindung zum 2. Gerät.
 */
let { draft = $bindable() }: { draft: Settings } = $props();

const together = $derived(draft.mode === 'hotseat');
const level = $derived(CPU_LEVEL_OPTIONS.find((option) => option.value === draft.cpuLevel));
</script>

<Panel title="Wer spielt?">
  <div class="seats">
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

    {#if draft.mode === 'cpu'}
      <div class="field">
        <span>Stärke des Computers</span>
        <Segmented name="cpu-level" label="Stärke des Computers" options={CPU_LEVEL_OPTIONS} bind:value={draft.cpuLevel} />
        <small>{level?.description}</small>
      </div>
    {:else if together}
      <label class="field">
        Spieler*in 2
        <input type="text" maxlength="20" autocomplete="off" placeholder="Spieler*in 2" bind:value={draft.names[1]} />
        <small>Abwechselnd an einem Gerät, die Karten bleiben bis zur Übergabe verdeckt.</small>
      </label>
    {:else if draft.mode === 'online'}
      <div class="field">
        <span>Gegenüber</span>
        <PeerSeat name={draft.names[0]} />
      </div>
    {:else}
      <small>Allein: Wie viele Punkte schaffst du mit einem Deck?</small>
    {/if}
  </div>
</Panel>

<style>
  .seats {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-weight: 700;
    min-width: 0;
  }

  small {
    color: var(--muted);
    font-weight: 400;
  }
</style>
