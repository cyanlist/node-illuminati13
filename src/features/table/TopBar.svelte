<script lang="ts">
import { goHome } from '../../state/flow';
import { table } from '../../state/table.svelte';
import Logo from '../../ui/Logo.svelte';
import SettingsButton from '../settings/SettingsButton.svelte';
</script>

<header>
  <div class="brand">
    <Logo size="40px" />
    <h1>Illuminati <span>13</span></h1>
  </div>
  <nav>
    <SettingsButton />
    <button type="button" class="btn btn--ghost" onclick={() => (table.rulesOpen = true)}>Regeln</button>
    <button type="button" class="btn" onclick={goHome}>Startseite</button>
  </nav>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  h1 {
    margin: 0;
    font-family: var(--font-title);
    font-weight: 700;
    font-size: clamp(26px, 4.5vw, 36px);
    line-height: 1;
  }

  h1 span {
    color: var(--herz);
  }

  nav {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
</style>
