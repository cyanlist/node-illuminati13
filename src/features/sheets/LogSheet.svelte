<script lang="ts">
import type { GameState } from '../../core/game';
import { sheets } from '../../state/sheets.svelte';
import Sheet from '../../ui/Sheet.svelte';
import LogList from '../table/LogList.svelte';

/** Das Protokoll als Fenster – auf schmalen Bildschirmen; auf breiten klappt es als Seitenleiste auf (GameLog). */
let { game }: { game: GameState } = $props();

const close = (): void => {
  sheets.logOpen = false;
};
</script>

<Sheet title="Protokoll" onclose={close}>
  <LogList {game} />

  {#snippet actions()}
    <button type="button" class="btn btn--primary" onclick={close}>Zurück zum Tisch</button>
  {/snippet}
</Sheet>
