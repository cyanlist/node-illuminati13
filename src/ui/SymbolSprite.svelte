<script lang="ts">
import { SUIT_INDICES, SUITS } from '../core/cards';
import { EYE } from './eye';
import { SUIT_SHAPES } from './suit-shapes';

/** Farbsymbole und Logo – einmal eingebunden, überall per <use href="#…"> verwendet. */
</script>

<svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
  <defs>
    {#each SUIT_INDICES as suit (suit)}
      <symbol id="s-{SUITS[suit].key}" viewBox="0 0 24 24">
        {#each SUIT_SHAPES[suit] as d (d)}<path {d} />{/each}
      </symbol>
    {/each}
    <symbol id="eye" viewBox={EYE.viewBox}>
      {#each [EYE.pyramid, EYE.eye] as line (line.d)}
        <path d={line.d} fill="none" stroke="currentColor" stroke-width={line.stroke} stroke-linejoin="round" />
      {/each}
      <circle cx={EYE.pupil.cx} cy={EYE.pupil.cy} r={EYE.pupil.r} fill="currentColor" />
      <path d={EYE.rays.d} stroke="currentColor" stroke-width={EYE.rays.stroke} stroke-linecap="round" />
    </symbol>
  </defs>
</svg>
