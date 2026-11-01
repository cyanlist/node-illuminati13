<script lang="ts">
import { disconnect, join, joinRoom, online, reconnect } from '../../state/online.svelte';
import Sheet from '../../ui/Sheet.svelte';
import GuestJoin from './GuestJoin.svelte';
import HostCodeExchange from './HostCodeExchange.svelte';
import HostRoom from './HostRoom.svelte';
import RoleChoice from './RoleChoice.svelte';

/**
 * Zwei Geräte verbinden. Üblicher Weg: Ein Gerät öffnet einen Raum und zeigt einen kurzen Raum-Code, das andere
 * gibt ihn ein. Ausweichweg ohne fremde Dienste: zwei Codes austauschen (QR-Code oder Text).
 * Das Fenster wählt nur den passenden Schritt; was darin passiert, steht in der jeweiligen Komponente.
 */
const host = $derived(online.role === 'host');
const peer = $derived(online.peerName || 'Das andere Gerät');

const title = $derived.by(() => {
  if (online.connected) return `Verbunden mit ${online.peerName || 'dem anderen Gerät'}`;
  if (online.status === 'failed') return 'Verbindung fehlgeschlagen';
  if (online.role === 'host') return 'Einladen';
  if (online.role === 'guest') return 'Beitreten';
  return 'Mit einem 2. Gerät spielen';
});

// über einen Einladungs-Link geöffnet: gleich beitreten
$effect(() => {
  const linked = online.linkInvite;
  if (!linked) return;
  online.linkInvite = null;
  if (linked.type === 'room') joinRoom(linked.room, online.myName);
  else void join(linked.code, online.myName);
});

/** Schließt das Fenster; eine halb aufgebaute Verbindung bleibt bestehen und lässt sich wieder öffnen. */
function close(): void {
  online.sheetOpen = false;
}

function cancel(): void {
  if (!online.connected) disconnect();
  close();
}
</script>

<Sheet {title} onclose={close}>
  {#if online.connected}
    <p>
      {host
        ? 'Stell jetzt das Spiel ein und tippe auf „Spiel starten“ – das andere Gerät setzt sich automatisch mit an den Tisch.'
        : `${peer} stellt das Spiel ein und startet es. Du landest dann automatisch am Tisch.`}
    </p>
  {:else if online.status === 'failed'}
    <p class="error">{online.error}</p>
  {:else if online.role === null}
    <RoleChoice />
  {:else if host && online.method === 'room'}
    <HostRoom />
  {:else if host}
    <HostCodeExchange />
  {:else}
    <GuestJoin />
  {/if}

  {#if online.error && online.status !== 'failed'}<p class="error">{online.error}</p>{/if}

  {#snippet actions()}
    {#if online.connected}
      <button type="button" class="btn btn--primary" onclick={close}>Weiter</button>
    {:else if online.status === 'failed'}
      <button type="button" class="btn btn--ghost" onclick={cancel}>Abbrechen</button>
      <button type="button" class="btn btn--primary" onclick={reconnect}>Nochmal versuchen</button>
    {:else}
      <button type="button" class="btn btn--ghost" onclick={cancel}>Abbrechen</button>
    {/if}
  {/snippet}
</Sheet>

<style>
  .error {
    color: var(--danger);
    font-weight: 700;
  }
</style>
