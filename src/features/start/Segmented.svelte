<script lang="ts" generics="T extends string">
/** Schlanke Umschaltung aus wenigen Möglichkeiten nebeneinander – technisch eine Radio-Gruppe. */
interface Props {
  name: string;
  /** Beschriftung für Screenreader */
  label: string;
  options: { value: T; label: string }[];
  value: T;
}
let { name, label, options, value = $bindable() }: Props = $props();
</script>

<div class="segmented" role="radiogroup" aria-label={label}>
  {#each options as option (option.value)}
    <label class:on={value === option.value}>
      <input type="radio" {name} value={option.value} bind:group={value} />
      {option.label}
    </label>
  {/each}
</div>

<style>
  .segmented {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px;
    background: var(--surface-2);
    border: 1.5px solid var(--line);
    border-radius: 12px;
  }

  label {
    position: relative;
    padding: 6px 14px;
    border-radius: 8px;
    font-weight: 700;
    color: var(--muted);
    cursor: pointer;
  }

  label:hover {
    color: var(--text);
  }

  .on {
    background: var(--accent);
    color: var(--on-accent);
  }

  .on:hover {
    color: var(--on-accent);
  }

  label:focus-within {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }

  /* Die Beschriftung ist der Knopf; das Radio bleibt für Tastatur und Screenreader */
  input {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
  }
</style>
