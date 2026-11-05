<script lang="ts">
import { goHome } from '../../state/flow';
import { sheets } from '../../state/sheets.svelte';
import Menu, { type MenuItem } from '../../ui/Menu.svelte';

/**
 * Das Zahnrad am Tisch: Regeln, Einstellungen und der Weg zur Startseite. Die Startseite steht abgesetzt
 * am Ende, damit man sie nicht aus Versehen trifft – das Spiel läuft dort aber weiter („Weiterspielen“).
 */
const ICONS = {
  /** aufgeschlagenes Buch */
  rules: 'M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v13',
  /** Regler – wie der Einstellungs-Knopf auf der Startseite */
  settings: 'M4 7h9M17 7h3M4 17h3M11 17h9M17.2 7a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 1 1 4.4 0M11.2 17a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 1 1 4.4 0',
  /** Haus */
  home: 'M4 11 12 4l8 7M6 9.5V20h4.5v-5.5h3V20H18V9.5',
};

const items: MenuItem[] = [
  { label: 'Regeln', icon: ICONS.rules, onselect: () => (sheets.rulesOpen = true) },
  { label: 'Einstellungen', icon: ICONS.settings, onselect: () => (sheets.settingsOpen = true) },
  { label: 'Zur Startseite', icon: ICONS.home, onselect: goHome, apart: true },
];
</script>

<Menu label="Menü" {items}>
  {#snippet icon()}
    <svg viewBox="0 0 24 24" aria-hidden="true" class="gear">
      <path
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  {/snippet}
</Menu>

<style>
  .gear {
    stroke-linejoin: round;
  }
</style>
