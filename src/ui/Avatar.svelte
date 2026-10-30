<script lang="ts">
import { hueFor, initials } from './avatar';
import Logo from './Logo.svelte';

/**
 * Rundes Profilbild: Initialen auf einer Farbe aus dem Namen. Der Computer zeigt das Auge in der Pyramide.
 * `image` ist für später gedacht, wenn Accounts ein echtes Profilbild mitbringen.
 */
interface Props {
  name: string;
  cpu?: boolean;
  image?: string | null;
  size?: string;
}
let { name, cpu = false, image = null, size = '40px' }: Props = $props();
</script>

<span class="avatar" class:cpu style:--size={size} style:--hue={hueFor(name)} aria-hidden="true">
  {#if image}
    <img src={image} alt="" />
  {:else if cpu}
    <Logo size="62%" />
  {:else}
    {initials(name)}
  {/if}
</span>

<style>
  .avatar {
    display: inline-grid;
    place-items: center;
    flex: none;
    width: var(--size);
    height: var(--size);
    overflow: hidden;
    border-radius: 50%;
    background: hsl(var(--hue) 45% 40%);
    color: #fff;
    font-weight: 700;
    font-size: calc(var(--size) * 0.4);
    letter-spacing: 0.02em;
    user-select: none;
  }

  .cpu {
    background: var(--accent);
    color: var(--on-accent);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
