<script lang="ts">
import type { Snippet } from 'svelte';
import Sheet from '../../ui/Sheet.svelte';

/** Fenster für einen Einstellungsbereich der Startseite; Änderungen gelten sofort, „Fertig“ schließt nur. */
interface Props {
  title: string;
  onclose: () => void;
  children: Snippet;
}
let { title, onclose, children }: Props = $props();
</script>

<Sheet {title} {onclose}>
  {@render children()}
  {#snippet actions()}
    <button type="button" class="btn btn--primary" onclick={onclose}>Fertig</button>
  {/snippet}
</Sheet>
