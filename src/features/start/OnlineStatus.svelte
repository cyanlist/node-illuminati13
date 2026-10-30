<script lang="ts">
import { disconnect, online } from '../../state/online.svelte';

/** Auf der Startseite, wenn das Gegenüber an einem 2. Gerät sitzt: verbunden oder nicht – und der Weg dahin. */
let { name }: { name: string } = $props();

function open(): void {
  online.myName = name.trim();
  online.sheetOpen = true;
}
</script>

<div class="status">
  {#if online.connected}
    <p>
      <b class="ok">✓ Verbunden mit {online.peerName || 'dem anderen Gerät'}.</b>
      {online.role === 'host'
        ? 'Stell das Spiel ein und starte es – das andere Gerät setzt sich mit an den Tisch.'
        : `${online.peerName || 'Das andere Gerät'} stellt das Spiel ein und startet es.`}
    </p>
    <button type="button" class="btn btn--small btn--ghost" onclick={disconnect}>Trennen</button>
  {:else}
    <small>
      Ihr spielt auf zwei Geräten, z. B. zwei Handys. Sie verbinden sich direkt miteinander – per QR-Code oder einem
      Code, den du per Messenger schickst. Kein Server, keine Anmeldung.
    </small>
    <button type="button" class="btn" onclick={open}>
      {online.status === 'idle' ? 'Verbinden …' : 'Verbindung fortsetzen …'}
    </button>
  {/if}
</div>

<style>
  .status {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-top: 8px;
  }

  p {
    margin: 0;
  }

  .ok {
    color: var(--ok);
  }

  small {
    color: var(--muted);
  }
</style>
