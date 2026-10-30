<script lang="ts">
import { invite, online, restart } from '../../state/online.svelte';

/** An zwei Geräten: Hinweis, wenn die Verbindung abgerissen ist – mit dem Weg zurück an den Tisch. */
const peer = $derived(online.peerName || 'dem anderen Gerät');

/** Nach einem Abbruch neu beginnen; läuft der Aufbau schon, nur das Fenster wieder zeigen. */
function reconnect(): void {
  if (online.status === 'lost' || online.status === 'failed') {
    const host = online.role === 'host';
    restart();
    if (host) void invite(online.myName);
  }
  online.sheetOpen = true;
}
</script>

{#if !online.connected}
  <div class="banner" role="status">
    <span>
      Die Verbindung zu {peer} ist unterbrochen. Verbindet euch neu – der Spielstand bleibt erhalten.
    </span>
    <button type="button" class="btn btn--small btn--primary" onclick={reconnect}>Neu verbinden</button>
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
