<script lang="ts">
import type { GameState } from '../../core/game';
import { table } from '../../state/table.svelte';
import Sheet from '../../ui/Sheet.svelte';
import LogList from '../table/LogList.svelte';

/** Das Protokoll als Fenster – auf schmalen Bildschirmen, wo es nicht neben dem Tisch steht. */
let { game }: { game: GameState } = $props();

const close = (): void => {
  table.logOpen = false;
};
</script>

<Sheet title="Protokoll" onclose={close}>
  <LogList {game} />

  {#snippet actions()}
    <button type="button" class="btn btn--primary" onclick={close}>Zurück zum Tisch</button>
  {/snippet}
</Sheet>
