<script lang="ts">
import { appInstall, install } from '../../state/app-install.svelte';
import { installSteps, platformOf } from './install-hint';

/**
 * Als App aufs Handy: Wo der Browser einen eigenen Dialog anbietet, öffnet ihn ein Knopf – sonst steht da, wo man
 * tippen muss. Erscheint nur, wo sich installieren lässt (siehe app-install.svelte.ts).
 */
const steps = installSteps(platformOf(navigator.userAgent, navigator.maxTouchPoints));
</script>

<p class="lead">
  Leg das Spiel auf deinen Startbildschirm: mit eigenem Symbol, ohne Adressleiste – und gegen den Computer auch ohne
  Netz.
</p>
{#if appInstall.installed}
  <p class="done" role="status">Installiert – du findest Illuminati 13 jetzt bei deinen Apps.</p>
{:else if appInstall.prompt}
  <button type="button" class="btn" onclick={install}>Als App installieren</button>
{:else}
  <p class="muted steps">{steps}</p>
{/if}

<style>
  p {
    margin: 0;
  }

  .lead {
    margin-bottom: 12px;
  }

  .steps {
    font-size: 14px;
  }

  .done {
    color: var(--ok);
    font-weight: 700;
  }
</style>
