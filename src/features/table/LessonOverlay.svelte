<script lang="ts">
import type { GameState } from '../../core/game';
import { goHome } from '../../state/flow';
import { coach, nextPage, playOn, type Target } from '../../state/lesson.svelte';
import { type BubbleAnchor, placeBubble, type Rect, scrimPath, unionOf } from '../../ui/bubble-position';
import Chip from '../../ui/Chip.svelte';

/**
 * Die Lernrunde über dem Tisch: eine schwebende Sprechblase an der Stelle, um die es gerade geht, und – bei
 * Erklärungen – ein Grauschleier, der nur diese Stelle (und die Knöpfe oben rechts) freilässt. Beides liegt
 * als eigene Ebene über dem Tisch und verschiebt nichts. Wo die Bereiche gerade sind, misst die Ebene in jedem Bild
 * nach – so folgt sie auch fliegenden Karten, wandernden Stapeln und dem Bildlauf.
 */
let { game }: { game: GameState } = $props();

const view = $derived(coach(game));

/** Woran die Bereiche im Tisch zu erkennen sind (data-tour, data-pile und data-suit an den Komponenten) */
const SELECTORS: Record<string, string> = {
  rules: '[data-tour="rule"]',
  hand: '[data-tour="hand"]',
  piles: '[data-pile]',
  hint: '[data-tour="hint"]',
  opponent: '[data-tour="opponent"]',
  you: '[data-tour="you"]',
  board: '[data-tour="board"]',
  actions: '[data-tour="actions"]',
  // Protokoll und Zahnrad bleiben immer erreichbar – darüber verlässt man die Lernrunde
  menu: '.game > header nav',
};

/** Eine Farbe: ihre Spalte (Regel und Stapel) – und als `suit-…` auch ihre Handkarten. */
function selectorFor(target: Target | 'menu'): string {
  const [kind, suit] = target.split('-');
  const column = `[data-tour="rule"][data-suit="${suit}"], [data-pile="${suit}"]`;
  if (kind === 'column') return column;
  if (kind === 'suit') return `${column}, [data-tour="hand"] [data-suit="${suit}"]`;
  return SELECTORS[target] ?? '';
}

/** So viel Luft bleibt um einen freien Bereich – Platz für den pulsierenden Rahmen */
const HOLE_PADDING = 10;

function rectsOf(target: Target | 'menu'): Rect[] {
  return [...document.querySelectorAll(selectorFor(target))].map((element) => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  });
}

const padded = ({ x, y, width, height }: Rect): Rect => ({
  x: x - HOLE_PADDING,
  y: y - HOLE_PADDING,
  width: width + 2 * HOLE_PADDING,
  height: height + 2 * HOLE_PADDING,
});

let holes = $state<Rect[]>([]);
let anchorRect = $state<Rect | null>(null);
let viewport = $state({ width: 0, height: 0 });
let bubbleSize = $state({ width: 0, height: 0 });

$effect(() => {
  const free = view.free;
  const target = view.place.kind === 'center' ? null : view.place.target;
  let frame = 0;
  let last = '';
  const measure = (): void => {
    const nextHoles = [...free, 'menu' as const].flatMap(rectsOf).map(padded);
    const nextAnchor = target ? unionOf(rectsOf(target)) : null;
    const nextViewport = { width: window.innerWidth, height: window.innerHeight };
    const key = JSON.stringify([nextHoles, nextAnchor, nextViewport]);
    if (key !== last) {
      last = key;
      holes = nextHoles;
      anchorRect = nextAnchor;
      viewport = nextViewport;
    }
    frame = requestAnimationFrame(measure);
  };
  measure();
  return () => cancelAnimationFrame(frame);
});

const anchor = $derived.by((): BubbleAnchor => {
  const place = view.place;
  if (place.kind === 'center' || !anchorRect) return { kind: 'center' };
  return place.kind === 'over' ? { kind: 'over', rect: anchorRect } : { kind: 'beside', rect: anchorRect, prefer: place.prefer };
});
const position = $derived(placeBubble(bubbleSize, viewport, anchor));
/** Erst wenn die Blase einmal gemessen ist, gleitet sie – sonst flöge sie beim Erscheinen aus der Ecke heran */
const measured = $derived(bubbleSize.height > 0 && viewport.width > 0);
let placed = $state(false);
$effect(() => {
  if (measured && !placed) requestAnimationFrame(() => (placed = true));
});

// der pulsierende Rahmen um das, worum es geht (Stil unten)
$effect(() => {
  const root = document.documentElement;
  if (view.focus) root.dataset.coach = view.focus;
  else delete root.dataset.coach;
  return () => {
    delete root.dataset.coach;
  };
});
</script>

<svg class="scrim dim-{view.dim}" width={viewport.width} height={viewport.height} aria-hidden="true">
  <path d={scrimPath(viewport, holes)} fill-rule="evenodd" />
</svg>

<section
  class="bubble"
  class:placed
  class:measured
  style:transform="translate({position.left}px, {position.top}px)"
  bind:offsetWidth={bubbleSize.width}
  bind:offsetHeight={bubbleSize.height}
  aria-label="Lernrunde"
>
  <div class="head">
    <p class="step">Lernrunde{view.action === 'end' ? '' : ` · Zug ${view.step} von ${view.steps}`}</p>
  </div>
  <p class="line" aria-live="polite">
    {#each view.line as part, i (i)}{#if typeof part === 'string'}{part}{:else}<Chip card={part} />{/if}{/each}
  </p>
  {#if view.action}
    <div class="buttons">
      {#if view.action === 'end'}
        <button type="button" class="btn btn--ghost btn--small" onclick={goHome}>Startseite</button>
        <button type="button" class="btn btn--primary btn--small" onclick={playOn}>Weiterspielen</button>
      {:else}
        <button type="button" class="btn btn--primary btn--small" onclick={nextPage}>Weiter</button>
      {/if}
    </div>
  {/if}
  {#if position.arrow}
    <span class="arrow arrow-{position.arrow.edge}" style:left="{position.arrow.x}px" aria-hidden="true"></span>
  {/if}
</section>

<style>
  /* Der Grauschleier: bei Erklärungen kräftig und nur die Aussparungen lassen Klicks durch, beim eigenen Zug leicht
     und ganz durchlässig, beim Zusehen gar nicht */
  .scrim {
    position: fixed;
    inset: 0;
    z-index: var(--z-scrim);
    pointer-events: none;
  }

  path {
    fill: #0b0e14;
    fill-opacity: 0;
    transition: fill-opacity 0.3s ease;
  }

  .dim-light path {
    fill-opacity: 0.22;
  }

  .dim-strong path {
    fill-opacity: 0.58;
    pointer-events: auto;
  }

  .bubble {
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--z-bubble);
    width: min(400px, calc(100vw - 24px));
    padding: 12px 16px 14px;
    background: var(--surface);
    border: 1.5px solid var(--focus);
    border-radius: 14px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
    visibility: hidden;
  }

  .measured {
    visibility: visible;
  }

  /* von Stelle zu Stelle gleiten statt springen */
  .placed {
    transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .step {
    margin: 0 0 4px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .line {
    margin: 0;
    font-size: 16px;
    line-height: 1.45;
    text-wrap: pretty;
  }

  .line :global(.chip) {
    line-height: 1.1;
    vertical-align: middle;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 10px;
  }

  /* der Pfeil: eine gedrehte Ecke in der Farbe der Blase */
  .arrow {
    position: absolute;
    width: 14px;
    height: 14px;
    margin-left: -7px;
    background: var(--surface);
    border: 1.5px solid var(--focus);
    rotate: 45deg;
  }

  .arrow-bottom {
    bottom: -8.5px;
    border-top: 0;
    border-left: 0;
  }

  .arrow-top {
    top: -8.5px;
    border-bottom: 0;
    border-right: 0;
  }

  @media (max-width: 620px) {
    .line {
      font-size: 15px;
    }
  }

  /* Worauf der Satz zeigt: ein ruhig pulsierender Rahmen, der nichts verschiebt */
  :global(:is(
      html[data-coach='rules'] [data-tour='rule'],
      html[data-coach='hand'] [data-tour='hand'],
      html[data-coach='piles'] [data-pile],
      html[data-coach='hint'] [data-tour='hint'],
      html[data-coach='opponent'] [data-tour='opponent'],
      html[data-coach='suit-0'] :is([data-tour='rule'][data-suit='0'], [data-pile='0']),
      html[data-coach='suit-1'] :is([data-tour='rule'][data-suit='1'], [data-pile='1']),
      html[data-coach='suit-2'] :is([data-tour='rule'][data-suit='2'], [data-pile='2']),
      html[data-coach='suit-3'] :is([data-tour='rule'][data-suit='3'], [data-pile='3'])
    )) {
    outline: 3px solid var(--focus);
    outline-offset: 4px;
    border-radius: 12px;
    animation: coach-pulse 1.6s ease-in-out infinite;
  }

  @keyframes -global-coach-pulse {
    50% {
      outline-color: color-mix(in srgb, var(--focus) 25%, transparent);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .placed {
      transition: none;
    }

    :global([data-coach] [data-tour]),
    :global([data-coach] [data-pile]) {
      animation: none;
    }
  }
</style>
