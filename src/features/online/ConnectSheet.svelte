<script lang="ts">
import { inviteLink } from '../../net/link';
import { acceptAnswer, disconnect, invite, join, online, restart } from '../../state/online.svelte';
import Sheet from '../../ui/Sheet.svelte';
import CodeInput from './CodeInput.svelte';
import CodeShare from './CodeShare.svelte';

/**
 * Zwei Geräte verbinden: Ein Gerät lädt ein und zeigt einen Code, das andere scannt ihn und zeigt
 * seinerseits einen Antwort-Code, den das erste einliest. Danach sind beide direkt verbunden.
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
  const code = online.linkCode;
  if (!code) return;
  online.linkCode = '';
  void join(code, online.myName);
});

/** Schließt das Fenster; eine halb aufgebaute Verbindung bleibt bestehen und lässt sich wieder öffnen. */
function close(): void {
  online.sheetOpen = false;
}

function cancel(): void {
  if (!online.connected) disconnect();
  close();
}

function retry(): void {
  const wasHost = online.role === 'host';
  restart();
  if (wasHost) void invite(online.myName);
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
    <p>
      Zwei Geräte verbinden sich direkt miteinander, ganz ohne Server. Ein Gerät lädt ein, das andere tritt bei –
      am einfachsten am selben Tisch und im selben WLAN.
    </p>
    <div class="choices">
      <button type="button" class="choice" onclick={() => invite(online.myName)}>
        <b>Einladen</b><span>Dieses Gerät zeigt einen Code zum Scannen.</span>
      </button>
      <button type="button" class="choice" onclick={() => (online.role = 'guest')}>
        <b>Beitreten</b><span>Das andere Gerät zeigt schon einen Code – oder du hast ihn geschickt bekommen.</span>
      </button>
    </div>
  {:else if host}
    {#if online.status === 'preparing'}
      <p class="muted">Einladung wird erstellt …</p>
    {:else}
      <ol class="steps">
        <li>
          <p><b>Zeig dem anderen Gerät diesen Code.</b> Dort „2. Gerät“ → „Beitreten“ wählen und scannen – oder schick ihn per Messenger.</p>
          <CodeShare
            code={online.code}
            link={inviteLink(online.code)}
            message="Spiel Illuminati 13 mit mir! Öffne den Link oder füge den Code unter „2. Gerät → Beitreten“ ein."
          />
        </li>
        <li>
          <p><b>Lies dann den Antwort-Code ein</b>, den das andere Gerät daraufhin zeigt.</p>
          {#if online.status === 'connecting'}
            <p class="muted">Verbinde …</p>
          {:else}
            <CodeInput oncode={acceptAnswer} />
          {/if}
        </li>
      </ol>
    {/if}
  {:else if online.status === 'idle'}
    <p><b>Scanne den Code des einladenden Geräts</b> – oder füge ihn ein, wenn er per Messenger kam.</p>
    <CodeInput oncode={(code) => join(code, online.myName)} />
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
      <button type="button" class="btn btn--primary" onclick={retry}>Nochmal versuchen</button>
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
