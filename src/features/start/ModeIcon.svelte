<script lang="ts">
import type { GameMode } from '../../core/settings';
import Avatar from '../../ui/Avatar.svelte';

/**
 * Das Bild einer Spielart aus den Avataren des Spiels: der Computer mit dem Auge, allein ein Avatar, zu zweit zwei
 * überlappende – an zwei Geräten stehen sie auseinander, verbunden durch eine gestrichelte Linie.
 */
interface Props {
  mode: GameMode;
  /** Name für die Initialen der eigenen Person */
  name: string;
  size?: string;
}
let { mode, name, size = '40px' }: Props = $props();

const you = $derived(name.trim() || 'Du');
</script>

<span class="icon {mode}" style:--size={size} aria-hidden="true">
  {#if mode === 'cpu'}
    <Avatar name="Computer" cpu {size} />
  {:else if mode === 'solo'}
    <Avatar name={you} {size} />
  {:else}
    <Avatar name={you} size="calc({size} * 0.8)" />
    {#if mode === 'online'}<span class="link"></span>{/if}
    <span class="second"><Avatar name="Gegenüber" size="calc({size} * 0.8)" /></span>
  {/if}
</span>

<style>
  .icon {
    display: inline-flex;
    align-items: center;
    flex: none;
    /* alle gleich breit, damit die Titel daneben untereinander stehen */
    width: calc(var(--size) * 1.45);
    justify-content: center;
  }

  /* zu zweit an einem Gerät: der zweite Avatar rückt halb über den ersten */
  .hotseat .second {
    margin-left: calc(var(--size) * -0.18);
    border-radius: 50%;
    box-shadow: 0 0 0 2px var(--surface);
  }

  .second {
    display: inline-flex;
  }

  .link {
    width: calc(var(--size) * 0.3);
    border-top: 2px dashed var(--muted);
  }
</style>
