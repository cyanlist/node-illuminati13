<script lang="ts">
import type { HTMLAttributes } from 'svelte/elements';
import Logo from './Logo.svelte';

/** Verdeckte Karte mit dem Auge. Die Größe kommt über die CSS-Variable --cw. */
let props: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class="back" aria-hidden="true" {...props}>
  <Logo size="60%" />
</div>

<style>
  .back {
    display: grid;
    place-items: center;
    flex: none;
    width: var(--cw);
    aspect-ratio: 5 / 7;
    color: var(--muted);
    background: var(--surface-2);
    border: 1.5px solid var(--line);
    border-radius: 6px;
  }
</style>
