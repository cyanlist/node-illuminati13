<script lang="ts">
import { normalizeSettings, resolveRuleMode, settingsForEditing } from '../../core/settings';
import { resume, startGame } from '../../state/flow';
import { online } from '../../state/online.svelte';
import { table } from '../../state/table.svelte';
import { loadSettings, saveSettings } from '../../storage';
import Hero from './Hero.svelte';
import HintsPanel from './HintsPanel.svelte';
import OptionsPanel from './OptionsPanel.svelte';
import PlayersPanel from './PlayersPanel.svelte';
import RulesPanel from './RulesPanel.svelte';
import SettingsSheet from './SettingsSheet.svelte';
import SettingsSummary from './SettingsSummary.svelte';
import type { Section } from './settings-summary';

/**
 * Startseite: links der Titel, rechts das nächste Spiel. Sichtbar ist nur, wer spielt; Regeln, Tipps und Extras
 * stehen als Kurzfassung da und öffnen sich bei Bedarf in einem Fenster.
 */
let draft = $state(settingsForEditing(loadSettings()));
let section = $state<Section | null>(null);

const running = $derived(table.game !== null && table.phase !== 'over');
const onlineMode = $derived(draft.mode === 'online');
/** Als Gast stellt das andere Gerät das Spiel ein – hier gibt es nichts weiter zu wählen. */
const guest = $derived(onlineMode && online.role === 'guest' && online.connected);
const startLabel = $derived.by(() => {
  if (guest) return `Warte auf ${online.peerName || 'das andere Gerät'} …`;
  if (onlineMode && !online.connected) return 'Verbinden …';
  return 'Spiel starten';
});

function onsubmit(event: SubmitEvent): void {
  event.preventDefault();
  const settings = resolveRuleMode(normalizeSettings($state.snapshot(draft)));
  saveSettings(settings);
  if (onlineMode && !online.connected) {
    online.myName = settings.names[0].trim();
    online.sheetOpen = true;
    return;
  }
  startGame(settings);
}
</script>

<div class="start">
  <Hero />
  <form {onsubmit}>
    <PlayersPanel bind:draft />
    {#if !guest}<SettingsSummary {draft} onopen={(open) => (section = open)} />{/if}
    <div class="actions">
      <button type="button" class="btn btn--ghost" onclick={() => (table.rulesOpen = true)}>Regeln lesen</button>
      {#if running}<button type="button" class="btn" onclick={resume}>Weiterspielen</button>{/if}
      <button type="submit" class="btn btn--primary btn--large" disabled={guest}>{startLabel}</button>
    </div>
  </form>
</div>

{#if section === 'rules'}
  <SettingsSheet title="Regeln der Stapel" onclose={() => (section = null)}><RulesPanel bind:draft plain /></SettingsSheet>
{:else if section === 'hints'}
  <SettingsSheet title="Tipps" onclose={() => (section = null)}><HintsPanel bind:draft plain /></SettingsSheet>
{:else if section === 'extras'}
  <SettingsSheet title="Extras" onclose={() => (section = null)}><OptionsPanel bind:draft plain /></SettingsSheet>
{/if}

<style>
  .start {
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 20px 40px;
  }

  @media (min-width: 920px) {
    .start {
      grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
      align-items: start;
      padding-top: 24px;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-end;
  }
</style>
