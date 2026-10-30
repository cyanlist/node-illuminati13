<script lang="ts">
import { offerLink, parseInvite, roomLink } from '../../net/link';
import {
  acceptAnswer,
  createRoom,
  disconnect,
  invite,
  join,
  joinRoom,
  online,
  reconnect,
} from '../../state/online.svelte';
import Sheet from '../../ui/Sheet.svelte';
import CodeInput from './CodeInput.svelte';
import CodeShare from './CodeShare.svelte';

/**
 * Zwei Geräte verbinden. Üblicher Weg: Ein Gerät öffnet einen Raum und zeigt einen kurzen Raum-Code, das andere
 * gibt ihn ein. Ausweichweg ohne fremde Dienste: zwei Codes austauschen (QR-Code oder Text).
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

/** Gast: Raum-Code, Link oder langer Code – je nachdem, was es ist. */
function enter(text: string): void {
  const entered = parseInvite(text);
  if (entered?.type === 'room') joinRoom(entered.room, online.myName);
  else if (entered?.type === 'code') void join(entered.code, online.myName);
  else online.error = 'Das sieht nicht nach einem Raum-Code aus. Er hat fünf Zeichen, z. B. K7M4X.';
}

/** Gastgeber*in beim Austausch zweier Codes: die Antwort des Gastes. */
function answer(text: string): void {
  const entered = parseInvite(text);
  if (entered?.type === 'code') void acceptAnswer(entered.code);
  else online.error = 'Das ist kein Antwort-Code. Er beginnt mit „I13~“.';
}

/** Schließt das Fenster; eine halb aufgebaute Verbindung bleibt bestehen und lässt sich wieder öffnen. */
function close(): void {
  online.sheetOpen = false;
}

function cancel(): void {
  if (!online.connected) disconnect();
  close();
}

function chooseGuest(): void {
  online.role = 'guest';
  online.method = 'room';
  online.error = '';
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
    <p>Zwei Geräte verbinden sich direkt miteinander. Ein Gerät lädt ein, das andere tritt bei – egal wo ihr seid.</p>
    <div class="choices">
      <button type="button" class="choice" onclick={() => createRoom(online.myName)}>
        <b>Einladen</b><span>Dieses Gerät öffnet einen Raum und zeigt einen kurzen Code.</span>
      </button>
      <button type="button" class="choice" onclick={chooseGuest}>
        <b>Beitreten</b><span>Das andere Gerät zeigt schon einen Raum-Code – oder du hast ihn geschickt bekommen.</span>
      </button>
    </div>
  {:else if host && online.method === 'room'}
    <p>Sag dem anderen Gerät diesen Raum-Code – oder schick ihn:</p>
    <p class="room-code" aria-label="Raum-Code {online.roomCode.split('').join(' ')}">{online.roomCode}</p>
    <p class="muted center">Dort „2. Gerät“ → „Beitreten“ wählen und den Code eingeben – oder den QR-Code scannen.</p>
    <CodeShare
      code={online.roomCode}
      link={roomLink(online.roomCode)}
      message={`Spiel Illuminati 13 mit mir! Raum-Code: ${online.roomCode}`}
    />
    <p class="muted center waiting">Warte auf das andere Gerät …</p>
    <details class="fallback">
      <summary>Klappt nicht?</summary>
      <p>
        Der Raum-Code braucht öffentliche Treffpunkte im Internet. Ohne sie geht es auch: Dann tauscht ihr zwei längere
        Codes aus, am einfachsten per QR-Code am selben Tisch.
      </p>
      <button type="button" class="btn btn--small" onclick={() => invite(online.myName)}>Per QR-Code verbinden</button>
    </details>
  {:else if host}
    {#if online.status === 'preparing'}
      <p class="muted">Einladung wird erstellt …</p>
    {:else}
      <ol class="steps">
        <li>
          <p><b>Zeig dem anderen Gerät diesen Code.</b> Dort „2. Gerät“ → „Beitreten“ wählen und scannen – oder schick ihn per Messenger.</p>
          <CodeShare
            code={online.code}
            link={offerLink(online.code)}
            message="Spiel Illuminati 13 mit mir! Öffne den Link oder füge den Code unter „2. Gerät → Beitreten“ ein."
          />
        </li>
        <li>
          <p><b>Lies dann den Antwort-Code ein</b>, den das andere Gerät daraufhin zeigt.</p>
          {#if online.status === 'connecting'}
            <p class="muted">Verbinde …</p>
          {:else}
            <CodeInput label="Antwort-Code" placeholder="I13~B~…" submitLabel="Übernehmen" oncode={answer} />
          {/if}
        </li>
      </ol>
    {/if}
  {:else if online.status === 'idle'}
    <CodeInput label="Raum-Code" placeholder="z. B. K7M4X" submitLabel="Beitreten" oncode={enter} />
  {:else if online.method === 'room'}
    <p class="muted center">Suche Raum {online.roomCode} …</p>
  {:else if online.status === 'preparing'}
    <p class="muted">Antwort wird erstellt …</p>
  {:else}
    <p><b>Zeig diesen Antwort-Code jetzt dem einladenden Gerät</b> – oder schick ihn zurück.</p>
    <CodeShare code={online.code} message="Mein Antwort-Code für Illuminati 13:" />
    <p class="muted center">Warte auf Verbindung …</p>
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
  .choices {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    margin-top: 14px;
  }

  .choice {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 14px 16px;
    font: inherit;
    text-align: left;
    color: var(--text);
    background: var(--surface-2);
    border: 1.5px solid var(--line);
    border-radius: 12px;
    cursor: pointer;
  }

  .choice:hover {
    border-color: var(--muted);
  }

  .choice b {
    font-size: 17px;
  }

  .choice span {
    color: var(--muted);
  }

  .room-code {
    margin: 10px 0;
    font-size: clamp(36px, 11vw, 52px);
    font-weight: 700;
    letter-spacing: 0.18em;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  .waiting {
    margin-top: 12px;
  }

  .fallback {
    margin-top: 14px;
    font-size: 14px;
    color: var(--muted);
  }

  .fallback summary {
    cursor: pointer;
  }

  .steps {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin: 12px 0 0;
    padding-left: 1.3em;
  }

  .error {
    color: var(--herz);
    font-weight: 700;
  }

  .center {
    text-align: center;
  }
</style>
