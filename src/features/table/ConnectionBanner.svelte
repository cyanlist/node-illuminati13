<script lang="ts">
import { online, reconnect } from '../../state/online.svelte';

/**
 * An zwei Geräten: Hinweis, wenn die Verbindung abgerissen ist – mit dem Weg zurück an den Tisch.
 * Im Raum geht es oft von selbst weiter, sobald das andere Gerät wieder da ist.
 */
const peer = $derived(online.peerName || 'dem anderen Gerät');

/** Läuft der Aufbau schon, nur das Fenster wieder zeigen; sonst neu verbinden. */
function resume(): void {
  if (online.status === 'lost' || online.status === 'failed' || online.status === 'idle') reconnect();
  else online.sheetOpen = true;
}
</script>

{#if !online.connected}
  <div class="banner" role="status">
    <span>
      Die Verbindung zu {peer} ist unterbrochen. Der Spielstand bleibt erhalten
      {#if online.method === 'room' && online.roomCode}– tritt das andere Gerät Raum {online.roomCode} wieder bei, geht es
        weiter{/if}.
    </span>
    <button type="button" class="btn btn--small btn--primary" onclick={resume}>Neu verbinden</button>
  </div>
{/if}

<style>
  .banner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 14px;
    background: color-mix(in srgb, var(--herz) 12%, var(--surface));
    border: 1.5px solid color-mix(in srgb, var(--herz) 40%, transparent);
    border-radius: 12px;
    font-weight: 700;
  }
</style>
