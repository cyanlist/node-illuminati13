<script lang="ts">
import type { GameMode, Settings } from '../../core/settings';
import ChoiceGroup, { type Choice } from './ChoiceGroup.svelte';
import Panel from './Panel.svelte';

/** Wer spielt: gegen den Computer, zu zweit oder allein – dazu die Namen. */
let { draft = $bindable() }: { draft: Settings } = $props();

const modes: Choice<GameMode>[] = [
  { value: 'cpu', title: 'Gegen den Computer', description: 'Du gegen eine Maschine, die auch an die 13 glaubt.' },
  {
    value: 'hotseat',
    title: 'Zu zweit',
    description: 'Abwechselnd an einem Gerät, die Karten bleiben bis zur Übergabe verdeckt.',
  },
  { value: 'solo', title: 'Allein', description: 'Wie viele Punkte schaffst du mit einem Deck?' },
];

const together = $derived(draft.mode === 'hotseat');
</script>

<Panel title="Wer spielt?">
  <ChoiceGroup name="mode" options={modes} bind:value={draft.mode} />
  <div class="names">
    <label>
      {together ? 'Name Spieler*in 1' : 'Dein Name'}
      <input type="text" maxlength="20" autocomplete="off" placeholder={together ? 'Spieler*in 1' : 'Du'} bind:value={draft.names[0]} />
    </label>
    {#if together}
      <label>
        Name Spieler*in 2
        <input type="text" maxlength="20" autocomplete="off" placeholder="Spieler*in 2" bind:value={draft.names[1]} />
      </label>
    {/if}
  </div>
</Panel>

<style>
  .names {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0 12px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 14px;
    font-weight: 700;
    min-width: 0;
  }
</style>
