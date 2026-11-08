<script lang="ts">
import {
  chooseGuest,
  createRoom,
  disconnect,
  online,
  openConnect,
  type Presence,
  reconnect,
} from '../../state/online.svelte';
import Avatar from '../../ui/Avatar.svelte';
import PresenceDot from './PresenceDot.svelte';

/**
 * Der Platz des Gegenübers, wenn es an einem 2. Gerät sitzt – wie in der Lobby anderer Spiele: Statt eines Satzes
 * zeigt der Platz, wie weit die Verbindung ist. Leer mit „Einladen“ und „Beitreten“, dann der offene Raum mit
 * seinem Code, schließlich Avatar und Name des Gegenübers mit einem Punkt für den Stand der Verbindung.
 * Code eingeben, teilen und der QR-Ausweichweg bleiben im Verbindungsfenster.
 *
 * Der Platz ist in jedem Zustand gleich hoch – eine Zeile Titel (mit dem Raum-Code darin), eine Zeile Stand,
 * zwei Zeilen Erklärung und eine Reihe Knöpfe –, damit beim Verbinden nichts darunter nachrückt. Längere
 * Erklärungen kürzt er nach zwei Zeilen ab; ganz stehen sie im Verbindungsfenster.
 */
let { name }: { name: string } = $props();

interface Action {
  label: string;
  run: () => void;
  primary?: boolean;
}

interface View {
  title: string;
  /** Raum-Code, groß unter dem Titel */
  code?: string;
  /** Stand in einem Wort oder kurzen Satz, in der Farbe des Punkts */
  state?: string;
  note?: string;
  /** Avatar des Gegenübers statt des leeren Platzes */
  avatar?: boolean;
  actions: Action[];
}

const invite: Action = {
  label: 'Einladen',
  primary: true,
  run: () => {
    openConnect(name);
    createRoom(online.myName);
  },
};
const join: Action = {
  label: 'Beitreten',
  run: () => {
    openConnect(name);
    chooseGuest();
  },
};
const show = (label: string, primary = false): Action => ({ label, primary, run: () => (online.sheetOpen = true) });
const cancel: Action = { label: 'Abbrechen', run: disconnect };
const leave: Action = { label: 'Trennen', run: disconnect };
const retry = (label: string): Action => ({ label, primary: true, run: reconnect });

const presence = $derived<Presence | null>(online.presence);

const view = $derived.by((): View => {
  const { status, role, method, roomCode, signal } = online;
  const peer = online.peerName || 'Das andere Gerät';

  if (status === 'connected') {
    if (signal === 'slow')
      return { title: peer, avatar: true, state: 'Verbindung wackelt …', note: 'Kommt gleich wieder etwas an, ist alles gut.', actions: [leave] };
    if (signal === 'gone')
      return {
        title: peer,
        avatar: true,
        state: 'Antwortet nicht',
        note: 'Bildschirm aus? Sobald das Gerät zurück ist, geht es weiter.',
        actions: [retry('Neu verbinden'), leave],
      };
    return {
      title: peer,
      avatar: true,
      state: 'Verbunden',
      note: role === 'host' ? 'Stell das Spiel ein und starte es für euch beide.' : `${peer} stellt das Spiel ein und startet es.`,
      actions: [leave],
    };
  }
  if (status === 'lost')
    return {
      title: peer,
      avatar: online.peerName !== '',
      state: 'Verbindung unterbrochen',
      note:
        method === 'room' && roomCode ? `Tritt das andere Gerät Raum ${roomCode} wieder bei, geht es weiter.` : undefined,
      actions: [retry('Neu verbinden'), leave],
    };
  if (status === 'failed')
    return { title: 'Keine Verbindung', state: 'Fehlgeschlagen', note: online.error, actions: [retry('Nochmal versuchen'), cancel] };
  if (role === null)
    return {
      title: 'Noch niemand verbunden',
      note: 'Ein Gerät lädt ein, das andere tritt bei – ohne Anmeldung.',
      actions: [invite, join],
    };
  if (role === 'host' && status !== 'connecting') {
    if (method === 'room')
      return {
        title: 'Raum-Code',
        code: roomCode,
        state: 'Warte auf das andere Gerät …',
        note: 'Dort „2. Gerät“ → „Beitreten“ wählen und den Code eingeben.',
        actions: [show('Code teilen'), cancel],
      };
    return { title: 'Einladung per Code', state: 'Warte auf den Antwort-Code …', actions: [show('Fortsetzen', true), cancel] };
  }
  if (role === 'guest' && status === 'idle')
    return { title: 'Beitreten', note: 'Gib den Raum-Code des anderen Geräts ein.', actions: [show('Code eingeben', true), cancel] };
  if (role === 'guest' && method === 'room')
    return { title: 'Raum-Code', code: roomCode, state: 'Suche den Raum …', actions: [cancel] };
  if (role === 'guest' && status === 'waiting')
    return { title: 'Antwort-Code', state: 'Zeig ihn dem einladenden Gerät', actions: [show('Anzeigen', true), cancel] };
  return { title: 'Verbinde …', state: 'Die Geräte suchen sich', actions: [show('Anzeigen'), cancel] };
});
</script>

<div class="peer {presence ?? 'empty'}">
  <div class="slot">
    {#if view.avatar}
      <Avatar name={online.peerName || '?'} size="48px" />
    {:else}
      <span class="empty-seat" class:searching={presence === 'pending'} aria-hidden="true">?</span>
    {/if}
    {#if presence}<span class="dot"><PresenceDot {presence} /></span>{/if}
  </div>

  <!-- jede Zeile ist immer da, auch leer – so bleibt der Platz in jedem Zustand gleich hoch -->
  <div class="info" aria-live="polite">
    <b class="title">
      <span class="label">{view.title}</span>
      {#if view.code}<span class="code" aria-label="Raum-Code {view.code.split('').join(' ')}">{view.code}</span>{/if}
    </b>
    <span class="state">{view.state ?? ''}</span>
    <small class="note" title={view.note}>{view.note ?? ''}</small>
  </div>

  <div class="actions">
    {#each view.actions as action (action.label)}
      <button
        type="button"
        class="btn btn--small"
        class:btn--primary={action.primary}
        class:btn--ghost={!action.primary}
        onclick={action.run}
      >
        {action.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .peer {
    --tone: var(--muted);
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    /* die Knöpfe über die ganze Breite, damit zwei nebeneinander passen und nie umbrechen */
    grid-template-areas:
      "slot info"
      "actions actions";
    align-items: center;
    column-gap: 14px;
    row-gap: 10px;
    padding: 12px 14px;
    background: var(--surface-2);
    border: 1.5px solid var(--line);
    border-radius: 12px;
  }

  .ok {
    --tone: var(--ok);
    border-color: color-mix(in srgb, var(--ok) 45%, var(--line));
  }

  .unstable {
    --tone: var(--warn);
  }

  .lost {
    --tone: var(--danger);
    border-color: color-mix(in srgb, var(--danger) 45%, var(--line));
  }

  .slot {
    grid-area: slot;
    position: relative;
    align-self: start;
  }

  /* noch niemand da: ein leerer, gestrichelter Platz – pulsiert, solange gesucht wird */
  .empty-seat {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border: 2px dashed var(--line);
    border-radius: 50%;
    color: var(--muted);
    font-weight: 700;
    font-size: 20px;
  }

  .searching {
    border-color: var(--muted);
    animation: breathe 1.6s ease-in-out infinite;
  }

  @keyframes breathe {
    50% {
      opacity: 0.45;
    }
  }

  .dot {
    position: absolute;
    right: -1px;
    bottom: -1px;
    display: flex;
  }

  .info {
    grid-area: info;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  /* Titel und Raum-Code in einer Zeile, so hoch wie der Code */
  .title {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 30px;
    min-width: 0;
    font-size: 16px;
  }

  .label,
  .state {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .code {
    flex: none;
    font-size: 24px;
    letter-spacing: 0.14em;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  .state {
    min-height: 1.45em;
    line-height: 1.45;
    color: var(--tone);
    font-weight: 700;
    font-size: 14px;
  }

  /* immer Platz für genau zwei Zeilen; was länger ist, endet mit „…“ */
  .note {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    min-height: 2.8em;
    line-height: 1.4;
    color: var(--muted);
  }

  .actions {
    grid-area: actions;
    display: flex;
    gap: 8px;
  }

  .actions .btn {
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .searching {
      animation: none;
    }
  }
</style>
