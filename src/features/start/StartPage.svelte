<script lang="ts">
import { normalizeSettings, resolveRuleMode, settingsForEditing } from '../../core/settings';
import { resume, startGame } from '../../state/flow';
import { startLesson } from '../../state/lesson.svelte';
import { online } from '../../state/online.svelte';
import { shareSettings } from '../../state/online-flow';
import { sheets } from '../../state/sheets.svelte';
import { table } from '../../state/table.svelte';
import { loadSettings, saveSettings } from '../../storage';
import SettingsButton from '../settings/SettingsButton.svelte';
import Hero from './Hero.svelte';
import PlayersPanel from './PlayersPanel.svelte';
import { SECTIONS, type SectionId } from './sections';
import SettingsSheet from './SettingsSheet.svelte';
import SettingsSummary from './SettingsSummary.svelte';
import { startButton } from './start-button';

/**
 * Startseite: links der Titel, rechts das nächste Spiel. Sichtbar ist nur, wer spielt; Varianten, Regeln, Tipps und Extras
 * stehen als Kurzfassung da und öffnen sich bei Bedarf in einem Fenster.
 */
let draft = $state(settingsForEditing(loadSettings()));
let openSection = $state<SectionId | null>(null);
const section = $derived(SECTIONS.find((s) => s.id === openSection));

const running = $derived(table.game !== null && table.phase !== 'over');
const onlineMode = $derived(draft.mode === 'online');
/** Als Gast stellt das andere Gerät das Spiel ein – hier sieht man nur mit, was es einstellt. */
const guest = $derived(onlineMode && online.role === 'guest' && online.connected);
const start = $derived(
  startButton(onlineMode, {
    role: online.role,
    connected: online.connected,
    pending: online.presence === 'pending',
    silent: online.connected && online.signal === 'gone',
    peerName: online.peerName,
  }),
);

// Gastgeber*in an zwei Geräten: Der Gast sieht jede Änderung mit – kurz gesammelt, damit nicht jeder Tastendruck
// beim Namen eine Nachricht wird. Läuft auch beim (Wieder-)Verbinden, dann bekommt der Gast den aktuellen Stand.
$effect(() => {
  if (!onlineMode || online.role !== 'host' || !online.connected) return;
  const settings = $state.snapshot(draft);
  const timer = setTimeout(() => shareSettings(settings), 250);
  return () => clearTimeout(timer);
});

function onsubmit(event: SubmitEvent): void {
  event.preventDefault();
  if (start.disabled) return;
  const settings = resolveRuleMode(normalizeSettings($state.snapshot(draft)));
  saveSettings(settings);
  startGame(settings);
}
</script>

<div class="start">
  <div class="corner"><SettingsButton /></div>
  <Hero />
  <form {onsubmit}>
    <PlayersPanel bind:draft />
    {#if !guest}
      <SettingsSummary {draft} onopen={(id) => (openSection = id)} />
    {:else}
      <!-- als Gast nur zum Ansehen; bis die Einstellungen der Gastgeber*in ankommen, stehen die eigenen da –
           so verschwindet die Kurzfassung beim Verbinden nicht kurz -->
      <SettingsSummary draft={online.hostSettings ?? draft} note="{online.peerName || 'Das andere Gerät'} stellt ein" />
    {/if}
    <div class="actions">
      <button type="button" class="btn btn--ghost" onclick={startLesson}>Spiel lernen</button>
      <button type="button" class="btn btn--ghost" onclick={() => (sheets.rulesOpen = true)}>Regeln lesen</button>
      {#if running}<button type="button" class="btn" onclick={resume}>Weiterspielen</button>{/if}
      <button type="submit" class="btn btn--primary btn--large" disabled={start.disabled}>{start.label}</button>
    </div>
    {#if start.reason}<p class="reason" aria-live="polite">{start.reason}</p>{/if}
  </form>
</div>

{#if section}
  <SettingsSheet title={section.title} onclose={() => (openSection = null)}>
    <section.panel bind:draft plain />
  </SettingsSheet>
{/if}

<style>
  .start {
    position: relative;
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

  /* Einstellungen oben rechts, über allem anderen */
  .corner {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
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

  /* warum es noch nicht losgehen kann – direkt unter dem Knopf */
  .reason {
    margin: -6px 0 0;
    text-align: right;
    color: var(--muted);
    font-size: 14px;
  }
</style>
