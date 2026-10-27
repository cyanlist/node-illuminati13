<script lang="ts" module>
export interface Choice<V> {
  value: V;
  title: string;
  description: string;
}
</script>

<script lang="ts" generics="T extends string">
/** Auswahl als Kärtchen: jede Option mit Titel und kurzer Beschreibung, technisch eine Radio-Gruppe. */
interface Props {
  name: string;
  options: Choice<T>[];
  value: T;
}
let { name, options, value = $bindable() }: Props = $props();
</script>

<div class="choices">
  {#each options as option (option.value)}
    <label>
      <input type="radio" {name} value={option.value} bind:group={value} />
      <b>{option.title}</b>
      <small>{option.description}</small>
    </label>
  {/each}
</div>

<style>
  .choices {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
  }

  label {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 12px;
    border: 1.5px solid var(--line);
    border-radius: 12px;
    background: var(--surface-2);
    cursor: pointer;
  }

  label:has(input:checked) {
    border-color: var(--accent);
    box-shadow: inset 0 0 0 1px var(--accent);
  }

  label:focus-within {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }

  /* Das Kärtchen ist der Auswahlknopf; das Radio bleibt für Tastatur und Screenreader */
  input {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    pointer-events: none;
  }

  b {
    line-height: 1.25;
  }

  small {
    color: var(--muted);
  }
</style>
