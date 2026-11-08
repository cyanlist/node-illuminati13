<script lang="ts">
/**
 * Allein: das heutige Ergebnis neben dem bisherigen Bestwert, als zwei Balken. Bei Punkten ist mehr besser, mit
 * Punkteziel zählen die Züge bis zum Ziel – dort ist weniger besser; der bessere Balken leuchtet.
 */
interface Props {
  today: number;
  best: number;
  /** „Punkte“ oder „Züge“ */
  unit: string;
  /** true: weniger ist besser (Züge bis zum Ziel) */
  fewerIsBetter: boolean;
}
let { today, best, unit, fewerIsBetter }: Props = $props();

const top = $derived(Math.max(today, best, 1));
const todayWins = $derived(fewerIsBetter ? today < best : today > best);
const rows = $derived([
  { label: 'Heute', value: today, better: todayWins },
  { label: 'Bestwert', value: best, better: !todayWins && today !== best },
]);
</script>

<div class="bars" role="img" aria-label="Heute {today} {unit}, Bestwert {best} {unit}">
  {#each rows as row (row.label)}
    <span class="label">{row.label}</span>
    <span class="track"><span class="bar" class:better={row.better} style:width="{(row.value / top) * 100}%"></span></span>
    <span class="value">{row.value} {unit}</span>
  {/each}
  {#if fewerIsBetter}<small class="hint">Weniger Züge sind besser.</small>{/if}
</div>

<style>
  .bars {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 6px 10px;
    margin: 14px 0 0;
    font-size: 14px;
  }

  .label {
    color: var(--muted);
    font-weight: 700;
  }

  .track {
    height: 10px;
    border-radius: 999px;
    background: var(--surface-2);
  }

  .bar {
    display: block;
    height: 100%;
    min-width: 4px;
    border-radius: inherit;
    background: color-mix(in srgb, var(--accent) 40%, transparent);
  }

  .better {
    background: var(--ok);
  }

  .value {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .hint {
    grid-column: 1 / -1;
    color: var(--muted);
  }
</style>
