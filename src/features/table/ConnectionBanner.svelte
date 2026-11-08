<script lang="ts">
import { online, reconnect } from '../../state/online.svelte';

/**
 * An zwei Geräten: Hinweis, wenn die Verbindung abgerissen ist oder das andere Gerät nicht mehr antwortet – mit dem
 * Weg zurück an den Tisch. Im Raum geht es oft von selbst weiter, sobald das andere Gerät wieder da ist. Eine nur
 * wackelige Verbindung zeigt allein der Punkt am Avatar.
 */
const peer = $derived(online.peerName || 'dem anderen Gerät');
const silent = $derived(online.connected && online.signal === 'gone');

/** Läuft der Aufbau schon, nur das Fenster wieder zeigen; sonst neu verbinden. */
function resume(): void {
  if (silent || online.status === 'lost' || online.status === 'failed' || online.status === 'idle') reconnect();
  else online.sheetOpen = true;
}
</script>

{#if !online.connected || silent}
  <div class="banner" role="status">
    <span>
      {#if silent}
        {online.peerName || 'Das andere Gerät'} antwortet gerade nicht – vielleicht ist dort der Bildschirm aus. Sobald
        das Gerät wieder da ist, geht es weiter.
      {:else}
        Die Verbindung zu {peer} ist unterbrochen. Der Spielstand bleibt erhalten
        {#if online.method === 'room' && online.roomCode}– tritt das andere Gerät Raum {online.roomCode} wieder bei, geht
          es weiter{/if}.
      {/if}
    </span>
    <button type="button" class="btn btn--small btn--primary" onclick={resume}>Neu verbinden</button>
  </div>
{/if}

<style>
  /* schwebt oben über dem Tisch (über dem Platz des anderen Geräts), damit beim Erscheinen nichts nachrückt */
  .banner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: var(--z-overlay);
    box-shadow: var(--shadow-panel);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 14px;
    /* deckend, weil darunter der Platz gegenüber liegt */
    background: color-mix(in srgb, var(--danger) 12%, var(--surface));
    border: 1.5px solid color-mix(in srgb, var(--danger) 40%, transparent);
    border-radius: 12px;
    font-weight: 700;
  }
</style>
