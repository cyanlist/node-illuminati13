<script lang="ts">
import type { Settings } from '../../core/settings';
import CheckOption from '../../ui/CheckOption.svelte';
import DependentOptions from '../../ui/DependentOptions.svelte';
import Panel from './Panel.svelte';

/** Hilfen am Tisch: wahre Werte anzeigen und offene Karten. Was den Spielablauf verändert, steht unter Varianten. */
let { draft = $bindable(), plain = false }: { draft: Settings; plain?: boolean } = $props();
</script>

<Panel title="Extras" {plain}>
  <CheckOption
    title="Wahre Werte anzeigen"
    description="Ausgeschaltet rechnest du selbst im Kopf, wie am echten Tisch."
    bind:checked={draft.showValues}
  />
  <!-- allein gibt es kein Gegenüber -->
  <DependentOptions enabled={draft.mode !== 'solo'}>
    <CheckOption
      title="Mit offenen Karten spielen"
      description="Die Karten des Gegenübers liegen offen – zum Lernen und Zuschauen. Zu zweit entfällt die Übergabe."
      bind:checked={draft.openHands}
    />
  </DependentOptions>
</Panel>
