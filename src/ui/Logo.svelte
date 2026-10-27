<script lang="ts">
/** Das Auge in der Pyramide. */
let { size = '40px' }: { size?: string } = $props();
</script>

<svg style:width={size} style:height={size} viewBox="0 0 48 44" aria-hidden="true"><use href="#eye" /></svg>

<style>
  svg {
    display: block;
    flex: none;
    color: inherit;
  }
</style>
