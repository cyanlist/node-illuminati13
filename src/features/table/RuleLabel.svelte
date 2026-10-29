<script lang="ts">
import type { SuitIndex } from '../../core/cards';
import { RULES, type RuleKey } from '../../core/rules';
import RuleExample from './RuleExample.svelte';

/**
 * Die Regel über einer Spalte des Boards – sie bleibt stehen, auch wenn die Stapel weiterrücken.
 * Mit der Maus darüber oder per Antippen erscheint ein Rechenbeispiel, in dem man Handkarten wählen kann.
 */
interface Props {
  ruleKey: RuleKey | undefined;
  /** Farbe des Stapels, der gerade unter der Regel liegt */
  suit: SuitIndex;
}
let { ruleKey, suit }: Props = $props();

const rule = $derived(ruleKey ? RULES[ruleKey] : null);
let open = $state(false);
let root: HTMLElement | undefined = $state();

// Maus: Beispiel beim Darüberfahren; Finger und Stift: Antippen öffnet und schließt es
function onpointerenter(event: PointerEvent) {
  if (event.pointerType === 'mouse') open = true;
}

function onpointerleave(event: PointerEvent) {
  if (event.pointerType === 'mouse') open = false;
}

function onclick(event: MouseEvent) {
  // die Maus hat es schon beim Darüberfahren geöffnet; Tastatur und Finger schalten um
  if ((event as PointerEvent).pointerType === 'mouse') return;
  open = !open;
}

function closeOutside(event: Event) {
  if (open && root && !root.contains(event.target as Node)) open = false;
}

// schließt erst, wenn der Fokus das Beispiel ganz verlässt – nicht beim Wählen einer Karte darin
function onfocusout(event: FocusEvent) {
  if (!root?.contains(event.relatedTarget as Node | null)) open = false;
}

function onkeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open = false;
}
</script>

<svelte:window onpointerdown={closeOutside} {onkeydown} />

<div class="wrap" role="group" bind:this={root} {onpointerenter} {onpointerleave} {onfocusout}>
  <button type="button" class="rule" aria-expanded={open} {onclick}>
    <span class="long">{rule?.label}</span><span class="short">{rule?.short}</span>
  </button>

  {#if open && ruleKey}
    <div class="popover" role="group" aria-label="Rechenbeispiel">
      <RuleExample {ruleKey} {suit} />
    </div>
  {/if}
</div>

<style>
  .rule {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 2.4em;
    padding: 0;
    margin: 0;
    background: none;
    border: 0;
    border-radius: 6px;
    font: inherit;
    font-size: clamp(12px, 1.6vw, 14px);
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    color: var(--muted);
    overflow-wrap: break-word;
    cursor: help;
  }

  .rule:hover,
  .rule[aria-expanded='true'] {
    color: var(--text);
  }

  .short {
    display: none;
  }

  @media (max-width: 620px) {
    .long {
      display: none;
    }

    .short {
      display: inline;
    }
  }

  /*
   * Legt sich über die Stapel darunter. Ausgerichtet wird es am ganzen Board (das nächste positionierte
   * Element): möglichst mittig unter der eigenen Spalte (--column), aber nie über den Rand hinaus.
   */
  .popover {
    --w: min(310px, 100% - 16px);
    --col: calc((100% - 2 * var(--board-pad) - 4 * var(--board-gap)) / 5);
    --center: calc(var(--board-pad) + var(--column) * (var(--col) + var(--board-gap)) + var(--col) / 2);
    position: absolute;
    left: clamp(8px, var(--center) - var(--w) / 2, 100% - var(--w) - 8px);
    z-index: 5;
    width: var(--w);
    margin-top: 6px;
    padding: 12px 14px;
    background: var(--surface);
    border: 1.5px solid var(--line);
    border-radius: 12px;
    box-shadow: 0 6px 18px var(--shadow);
  }

  /* unsichtbare Brücke über den Abstand, damit die Maus auf dem Weg ins Beispiel nicht „hinausfällt“ */
  .popover::before {
    content: '';
    position: absolute;
    inset: -8px 0 auto;
    height: 8px;
  }
</style>
