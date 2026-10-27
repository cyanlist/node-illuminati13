<script lang="ts">
import { normalizeSettings, resolveRuleMode, settingsForEditing } from '../../core/settings';
import { resume, startGame } from '../../state/flow';
import { table } from '../../state/table.svelte';
import { loadSettings, saveSettings } from '../../storage';
import Hero from './Hero.svelte';
import HintsPanel from './HintsPanel.svelte';
import OptionsPanel from './OptionsPanel.svelte';
import PlayersPanel from './PlayersPanel.svelte';
import RulesPanel from './RulesPanel.svelte';

/** Startseite: links der Titel, rechts die Einstellungen für das nächste Spiel. */
let draft = $state(settingsForEditing(loadSettings()));

const running = $derived(table.game !== null && table.phase !== 'over');

function onsubmit(event: SubmitEvent): void {
  event.preventDefault();
  const settings = resolveRuleMode(normalizeSettings($state.snapshot(draft)));
  saveSettings(settings);
  startGame(settings);
}
</script>

<div class="start">
  <Hero />
  <form {onsubmit}>
    <PlayersPanel bind:draft />
    <RulesPanel bind:draft />
    <HintsPanel bind:draft />
    <OptionsPanel bind:draft />
    <div class="actions">
      <button type="button" class="btn btn--ghost" onclick={() => (table.rulesOpen = true)}>Regeln lesen</button>
      {#if running}<button type="button" class="btn" onclick={resume}>Weiterspielen</button>{/if}
      <button type="submit" class="btn btn--primary btn--large">Spiel starten</button>
    </div>
  </form>
</div>

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
