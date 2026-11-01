<script lang="ts">
import { goHome } from '../../state/flow';
import { sheets } from '../../state/sheets.svelte';
import Logo from '../../ui/Logo.svelte';
import Wordmark from '../../ui/Wordmark.svelte';
import SettingsButton from '../settings/SettingsButton.svelte';
import LogButton from './LogButton.svelte';
</script>

<!-- auf dem Handy alles in einer Zeile: nur das Logo, kleinere Knöpfe und das Protokoll als Knopf -->
<header>
  <div class="brand">
    <Logo size="var(--logo, 40px)" />
    <h1 class="wide-only"><Wordmark /></h1>
  </div>
  <nav>
    <SettingsButton />
    <LogButton />
    <button type="button" class="btn btn--ghost" onclick={() => (sheets.rulesOpen = true)}>Regeln</button>
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
    font-size: clamp(26px, 4.5vw, 36px);
    line-height: 1;
  }

  nav {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  @media (max-width: 620px) {
    .brand {
      --logo: 34px;
    }

    nav {
      --icon-btn-pad: 4px 8px;
      gap: 6px;
    }

    nav .btn {
      padding: 6px 12px;
      font-size: 14px;
    }
  }
</style>
