<script lang="ts">
import { type GameMode, normalizeSettings, resolveRuleMode, type Settings, settingsForEditing } from '../../core/settings';
import { resume, startGame } from '../../state/flow';
import { startLesson } from '../../state/lesson.svelte';
import { online } from '../../state/online.svelte';
import { shareSettings } from '../../state/online-flow';
import { sheets } from '../../state/sheets.svelte';
import { startScreen } from '../../state/start-screen.svelte';
import { table } from '../../state/table.svelte';
import { hasSavedSettings, loadSettings, saveSettings } from '../../storage';
import SettingsButton from '../settings/SettingsButton.svelte';
import Hero from './Hero.svelte';
import ModeChoice from './ModeChoice.svelte';
import ModeIcon from './ModeIcon.svelte';
import { modeOption } from './modes';
import PlayersPanel from './PlayersPanel.svelte';
import { SECTIONS, type SectionId } from './sections';
import SettingsSheet from './SettingsSheet.svelte';
import SettingsSummary from './SettingsSummary.svelte';
import { startButton } from './start-button';

/**
 * Startseite in zwei Ebenen: links der Titel, rechts erst die Frage, wie man spielen will (ModeChoice) – ein Tipp auf
 * eine Kachel spielt gleich los. Erst „Anpassen“ zeigt das Einrichten: wer spielt, die Kurzfassung von Varianten,
 * Regeln, Tipps und Extras (jede öffnet ihr Fenster) und „Spiel starten“. Solange zwei Geräte verbunden sind oder
 * sich suchen, bleibt das Einrichten offen.
 */
const saved = loadSettings();
let draft = $state(settingsForEditing(saved));
/** Die zuletzt gestartete Spielart – null, solange auf diesem Gerät noch nicht gespielt wurde */
let lastMode = $state<GameMode | null>(hasSavedSettings() ? saved.mode : null);
let openSection = $state<SectionId | null>(null);
const section = $derived(SECTIONS.find((s) => s.id === openSection));

const running = $derived(table.game !== null && table.phase !== 'over');
const onlineMode = $derived(draft.mode === 'online');
/** Als Gast stellt das andere Gerät das Spiel ein – hier sieht man nur mit, was es einstellt. */
const guest = $derived(onlineMode && online.role === 'guest' && online.connected);
const setup = $derived(startScreen.step === 'setup' || online.active);
const start = $derived(
  startButton(onlineMode, {
    role: online.role,
    connected: online.connected,
    pending: online.presence === 'pending',
    silent: online.connected && online.signal === 'gone',
    peerName: online.peerName,
  }),
);

// Einladungs-Link (auch während die App schon läuft): Die Verbindung gehört zu „zwei Geräte“
$effect(() => {
  if (online.active && draft.mode !== 'online') draft.mode = 'online';
});

// Gastgeber*in an zwei Geräten: Der Gast sieht jede Änderung mit – kurz gesammelt, damit nicht jeder Tastendruck
// beim Namen eine Nachricht wird. Läuft auch beim (Wieder-)Verbinden, dann bekommt der Gast den aktuellen Stand.
$effect(() => {
  if (!onlineMode || online.role !== 'host' || !online.connected) return;
  const settings = $state.snapshot(draft);
  const timer = setTimeout(() => shareSettings(settings), 250);
  return () => clearTimeout(timer);
});

/** Spielt mit diesen Einstellungen los und merkt sie sich für das nächste Mal. */
function play(settings: Settings): void {
  const resolved = resolveRuleMode(normalizeSettings($state.snapshot(settings)));
  saveSettings(resolved);
  lastMode = resolved.mode;
  // nach dem Spiel geht es auf der ersten Ebene weiter
  startScreen.step = 'modes';
  startGame(resolved);
}

/** Kachel: gleich losspielen, mit den letzten Einstellungen. */
function quickStart(mode: GameMode): void {
  draft.mode = mode;
  play(draft);
}

function adjust(mode: GameMode): void {
  draft.mode = mode;
  startScreen.step = 'setup';
  window.scrollTo(0, 0);
}

function back(): void {
  startScreen.step = 'modes';
  window.scrollTo(0, 0);
}

function onsubmit(event: SubmitEvent): void {
  event.preventDefault();
  if (!start.disabled) play(draft);
}
</script>

<div class="start">
  <div class="corner"><SettingsButton /></div>
  <Hero />
  {#if !setup}
    <div class="column">
      <ModeChoice {draft} last={lastMode} onplay={quickStart} onadjust={adjust} />
      <div class="actions">
        <button type="button" class="btn btn--ghost" onclick={startLesson}>Spiel lernen</button>
        <button type="button" class="btn btn--ghost" onclick={() => (sheets.rulesOpen = true)}>Regeln lesen</button>
        {#if running}<button type="button" class="btn btn--primary" onclick={resume}>Weiterspielen</button>{/if}
      </div>
    </div>
  {:else}
    <form class="column" {onsubmit}>
      <div class="heading">
        <!-- solange zwei Geräte verbunden sind oder sich suchen, führt „Trennen“ zurück – nicht dieser Pfeil -->
        {#if !online.active}
          <button type="button" class="btn btn--ghost back" aria-label="Zurück zur Wahl der Spielart" onclick={back}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
        {/if}
        <ModeIcon mode={draft.mode} name={draft.names[0]} size="34px" />
        <h2>{modeOption(draft.mode).title}</h2>
      </div>
      <PlayersPanel bind:draft />
      {#if !guest}
        <SettingsSummary {draft} onopen={(id) => (openSection = id)} />
      {:else}
        <!-- als Gast nur zum Ansehen; bis die Einstellungen der Gastgeber*in ankommen, stehen die eigenen da –
             so verschwindet die Kurzfassung beim Verbinden nicht kurz -->
        <SettingsSummary draft={online.hostSettings ?? draft} note="{online.peerName || 'Das andere Gerät'} stellt ein" />
      {/if}
      <div class="actions">
        <button type="submit" class="btn btn--primary btn--large" disabled={start.disabled}>{start.label}</button>
      </div>
      {#if start.reason}<p class="reason" aria-live="polite">{start.reason}</p>{/if}
    </form>
  {/if}
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

  .column {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  .heading {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  h2 {
    margin: 0;
    font-size: 22px;
  }

  .back {
    display: inline-grid;
    place-items: center;
    padding: 6px 8px;
  }

  .back svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
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
