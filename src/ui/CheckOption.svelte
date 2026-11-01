<script lang="ts">
/** Ein Ankreuzfeld mit fett gesetztem Titel und kurzer Erklärung darunter. */
interface Props {
  title: string;
  description: string;
  checked: boolean;
}
let { title, description, checked = $bindable() }: Props = $props();
</script>

<label>
  <input type="checkbox" bind:checked />
  <b>{title}</b>
  <small>{description}</small>
</label>

<style>
  label {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2px 10px;
    margin-block: 4px 12px;
    cursor: pointer;
  }

  input {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: var(--accent);
  }

  small {
    grid-column: 2;
    color: var(--muted);
  }
</style>
