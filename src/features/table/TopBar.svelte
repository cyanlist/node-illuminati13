<script lang="ts">
import Logo from '../../ui/Logo.svelte';
import Wordmark from '../../ui/Wordmark.svelte';
import GameMenu from './GameMenu.svelte';
import LogButton from './LogButton.svelte';
</script>

<!--
  Rechts nur zwei Knöpfe: das Protokoll (nur wo es nicht neben dem Tisch steht) und das Zahnrad mit Regeln,
  Einstellungen und Startseite. Auf dem Handy steht vom Titel nur das Logo da.
-->
<header>
  <div class="brand">
    <Logo size="var(--logo, 40px)" />
    <h1 class="wide-only"><Wordmark /></h1>
  </div>
  <nav>
    <LogButton />
    <GameMenu />
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
  }
</style>
