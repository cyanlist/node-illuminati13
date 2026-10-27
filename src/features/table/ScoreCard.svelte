<script lang="ts">
interface Props {
  name: string;
  points: number;
  combos: number;
  /** Diese Person ist am Zug */
  active: boolean;
}
let { name, points, combos, active }: Props = $props();
</script>

<div class="score" class:active>
  <span class="name">
    {name}
    {#if active}<span class="turn">am Zug</span>{/if}
  </span>
  <span class="points">{points}</span>
  <span class="sub">{points === 1 ? 'Punkt' : 'Punkte'}<br />{combos}× die 13</span>
</div>

<style>
  .score {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 12px;
    align-items: center;
    min-width: 150px;
    padding: 8px 14px;
    background: var(--surface);
    border: 2px solid transparent;
    border-radius: 12px;
    box-shadow: 0 1px 3px var(--shadow);
  }

  .active {
    border-color: var(--accent);
  }

  .name {
    grid-column: 1 / -1;
    display: flex;
    gap: 6px;
    align-items: center;
    font-weight: 700;
  }

  .turn {
    color: var(--muted);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .points {
    font-size: 32px;
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .sub {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.25;
  }
</style>
