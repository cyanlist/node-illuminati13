import { mount } from 'svelte';
import App from './App.svelte';
import { inviteFromAddress } from './net/link';
import { online } from './state/online.svelte';
import './state/online-flow';
import { restoreSnapshot, takeSnapshot } from './state/snapshot.svelte';
import { loadDeck, loadSettings, loadTheme, saveSettings } from './storage';
import './styles/global.css';
import { deckChoice } from './ui/deck.svelte';
import { applyTheme } from './ui/theme.svelte';

/** Schnittstelle des Claude-Artifact-Viewers, über die der Spielstand eine neue Version übersteht. */
interface ArtifactHot {
  snapshot?(take: () => unknown): void;
  ready?(start: (data: unknown) => void): void;
  data?: unknown;
}

declare global {
  interface Window {
    claude?: { hot?: ArtifactHot };
  }
}

/** Über einen Einladungs-Link geöffnet: Startseite auf „2. Gerät“ und gleich beitreten. */
function acceptInviteLink(): void {
  const invite = inviteFromAddress();
  if (!invite) return;
  const settings = { ...loadSettings(), mode: 'online' as const };
  saveSettings(settings);
  online.myName = settings.names[0].trim();
  online.linkInvite = invite;
  online.sheetOpen = true;
}

function start(data?: unknown): void {
  deckChoice.current = loadDeck();
  applyTheme(loadTheme());
  restoreSnapshot(data);
  acceptInviteLink();
  // Link geöffnet, während die App in diesem Tab schon lief: Dann ändert sich nur die Adresse hinter dem #
  window.addEventListener('hashchange', acceptInviteLink);
  mount(App, { target: document.getElementById('app') as HTMLElement });
}

const hot = window.claude?.hot;
hot?.snapshot?.(takeSnapshot);
if (hot?.ready) hot.ready(start);
else start(hot?.data);
