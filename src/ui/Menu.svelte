<script lang="ts" module>
/** Ein Eintrag im Menü: Beschriftung, Symbol als SVG-Pfad (viewBox 0 0 24 24) und was beim Wählen passiert. */
export interface MenuItem {
  label: string;
  icon: string;
  onselect: () => void;
  /** Mit Abstand und Linie von den Einträgen darüber abgesetzt – für etwas, das man nicht aus Versehen wählen soll */
  apart?: boolean;
}
</script>

<script lang="ts">
import type { Snippet } from 'svelte';
import { tick } from 'svelte';
import { scale } from 'svelte/transition';
import IconButton from './IconButton.svelte';

/**
 * Knopf mit Symbol, der ein kleines Menü aufklappt. Es schließt sich beim Wählen, mit Escape, mit Tab und beim
 * Tippen daneben; mit den Pfeiltasten wandert man durch die Einträge.
 */
interface Props {
  label: string;
  items: MenuItem[];
  /** Symbol des Knopfs: ein SVG mit viewBox 0 0 24 24 */
  icon: Snippet;
}
let { label, items, icon }: Props = $props();

let open = $state(false);
let root = $state<HTMLElement>();
let list = $state<HTMLElement>();
const id = $props.id();

const entries = (): HTMLButtonElement[] => [...(list?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [])];

async function show(): Promise<void> {
  open = true;
  await tick();
  entries()[0]?.focus();
}

function hide(returnFocus = true): void {
  open = false;
  if (returnFocus) root?.querySelector<HTMLButtonElement>('button')?.focus();
}

function choose(item: MenuItem): void {
  hide(false);
  item.onselect();
}

function onkeydown(event: KeyboardEvent): void {
  const all = entries();
  const at = all.indexOf(document.activeElement as HTMLButtonElement);
  // vom letzten Eintrag geht es oben weiter, vom ersten unten
  const wrapped = (index: number): number => (index + all.length) % all.length;
  const move = (to: number) => {
    event.preventDefault();
    all[wrapped(to)]?.focus();
  };
  if (event.key === 'ArrowDown') move(at + 1);
  else if (event.key === 'ArrowUp') move(at - 1);
  else if (event.key === 'Home') move(0);
  else if (event.key === 'End') move(all.length - 1);
  else if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    hide();
  } else if (event.key === 'Tab') hide(false);
}

// daneben tippen schließt das Menü
function onpointerdown(event: PointerEvent): void {
  if (open && !root?.contains(event.target as Node)) hide(false);
}
</script>

<svelte:window {onpointerdown} />

<div class="menu" bind:this={root}>
  <IconButton
    {label}
    onclick={() => (open ? hide() : show())}
    aria-haspopup="menu"
    aria-expanded={open}
    aria-controls={id}
  >
    {@render icon()}
  </IconButton>

  {#if open}
    <div
      class="list"
      role="menu"
      tabindex="-1"
      {id}
      aria-label={label}
      bind:this={list}
      {onkeydown}
      transition:scale={{ start: 0.95, duration: 120 }}
    >
      {#each items as item (item.label)}
        <button type="button" role="menuitem" class:apart={item.apart} onclick={() => choose(item)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={item.icon} /></svg>
          {item.label}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .menu {
    position: relative;
  }

  .list {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: var(--z-menu);
    display: flex;
    flex-direction: column;
    min-width: 210px;
    padding: 6px;
    background: var(--surface);
    border: 1.5px solid var(--line);
    border-radius: 12px;
    box-shadow: 0 10px 24px var(--shadow);
    transform-origin: top right;
  }

  [role='menuitem'] {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    font: inherit;
    font-weight: 700;
    text-align: left;
    color: var(--text);
    background: none;
    border: 0;
    border-radius: 8px;
    cursor: pointer;
  }

  [role='menuitem']:hover,
  [role='menuitem']:focus-visible {
    background: var(--surface-2);
    outline: none;
  }

  .apart {
    margin-top: 6px;
    position: relative;
  }

  /* die Linie liegt im Abstand darüber und gehört nicht zur Fläche des Eintrags */
  .apart::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 8px;
    right: 8px;
    border-top: 1px solid var(--line);
  }

  svg {
    flex: none;
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    color: var(--muted);
  }
</style>
