import { mount } from 'svelte';
import App from './App.svelte';
import { restoreSnapshot, takeSnapshot } from './state/snapshot.svelte';
import './styles/global.css';

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

function start(data?: unknown): void {
  restoreSnapshot(data);
  mount(App, { target: document.getElementById('app') as HTMLElement });
}

const hot = window.claude?.hot;
hot?.snapshot?.(takeSnapshot);
if (hot?.ready) hot.ready(start);
else start(hot?.data);
