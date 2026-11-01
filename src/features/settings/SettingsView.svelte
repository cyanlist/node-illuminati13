<script lang="ts">
import { sheets } from '../../state/sheets.svelte';
import { saveTheme } from '../../storage';
import { applyTheme, type Theme, themeChoice } from '../../ui/theme.svelte';
import Segmented from '../../ui/Segmented.svelte';
import LookPanel from './LookPanel.svelte';

/**
 * Eigener Bereich für Einstellungen, die zum Gerät gehören statt zum Spiel: Kartendesign und Farbschema.
 * Liegt als ganze Seite über Startseite bzw. Tisch, damit dort nichts verloren geht.
 */
const themes: { value: Theme; label: string }[] = [
  { value: 'auto', label: 'Automatisch' },
  { value: 'light', label: 'Hell' },
  { value: 'dark', label: 'Dunkel' },
];

function close(): void {
  sheets.settingsOpen = false;
}

function onkeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') close();
}
</script>

<svelte:window {onkeydown} />

<div class="overlay">
  <div class="page" role="dialog" aria-modal="true" aria-labelledby="settings-title">
    <header>
      <div>
        <h2 id="settings-title">Einstellungen</h2>
        <p class="muted">Gilt nur auf diesem Gerät – an zwei Geräten hat jede*r ihre eigenen.</p>
      </div>
      <button type="button" class="btn btn--primary" onclick={close}>Fertig</button>
    </header>

    <section class="surface">
      <h3 class="eyebrow">Kartendesign</h3>
      <LookPanel />
    </section>

    <section class="surface">
      <h3 class="eyebrow">Farbschema</h3>
      <Segmented
        name="theme"
        label="Farbschema"
        options={themes}
        bind:value={
          () => themeChoice.current,
          (theme) => {
            applyTheme(theme);
            saveTheme(theme);
          }
        }
      />
      <p class="muted hint">„Automatisch“ folgt der Einstellung deines Geräts.</p>
    </section>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: var(--z-page);
    overflow: auto;
    background: var(--bg);
    padding: max(16px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px))
      max(24px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));
  }

  .page {
    max-width: 880px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  header {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 8px 0 10px;
    background: var(--bg);
  }

  h2 {
    margin: 0;
    font-family: var(--font-title);
    font-size: clamp(30px, 6vw, 40px);
    line-height: 1.1;
  }

  header p {
    margin: 4px 0 0;
  }

  section {
    padding: 16px 18px;
  }

  h3 {
    margin-bottom: 12px;
  }

  .hint {
    margin: 10px 0 0;
    font-size: 13px;
  }
</style>
