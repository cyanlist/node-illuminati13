<script lang="ts">
import type { Snippet } from 'svelte';

/**
 * Fenster über dem Tisch. Mit `onclose` lässt es sich per Escape oder Klick daneben schließen;
 * ohne verlangt der Spielablauf eine Entscheidung im Fenster.
 */
interface Props {
  title: string;
  onclose?: () => void;
  children: Snippet;
  actions: Snippet;
}
let { title, onclose, children, actions }: Props = $props();

let dialog: HTMLDivElement;

// den Hauptknopf fokussieren, damit Enter und Tastatur sofort funktionieren
$effect(() => {
  const primary = dialog.querySelector<HTMLElement>('.btn--primary') ?? dialog.querySelector<HTMLElement>('button');
  primary?.focus({ preventScroll: true });
});

function onkeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') onclose?.();
}

function onclick(event: MouseEvent): void {
  if (event.target === event.currentTarget) onclose?.();
}
</script>

<svelte:window {onkeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (Escape schließt über window) -->
<div class="overlay" {onclick}>
  <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" bind:this={dialog}>
    <h2 id="sheet-title">{title}</h2>
    {@render children()}
    <div class="actions">{@render actions()}</div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: grid;
    place-items: center;
    overflow: auto;
    background: var(--scrim);
    padding: max(16px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px))
      max(16px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));
  }

  .sheet {
    width: 100%;
    max-width: 580px;
    padding: clamp(18px, 4vw, 26px);
    background: var(--surface);
    border-radius: 16px;
    box-shadow: 0 20px 50px var(--shadow);
  }

  h2 {
    margin: 0 0 8px;
    font-size: clamp(22px, 4vw, 27px);
    line-height: 1.15;
    text-wrap: balance;
  }

  .sheet :global(h3) {
    margin: 18px 0 4px;
    font-size: 16px;
  }

  .sheet :global(p),
  .sheet :global(ul) {
    margin: 6px 0;
  }

  .sheet :global(ul) {
    padding-left: 1.3em;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 18px;
  }
</style>
