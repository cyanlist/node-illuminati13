<script lang="ts">
import { onDestroy, tick } from 'svelte';
import { extractCode } from '../../net/link';
import { CameraError, cameraAllowed, scanQr } from '../../net/qr';

/**
 * Den Code der Gegenseite einlesen: mit der Kamera scannen oder – kam er per Messenger – einfügen.
 * Ein ganzer Einladungs-Link wird ebenfalls angenommen.
 */
let { oncode }: { oncode: (code: string) => void } = $props();

let video: HTMLVideoElement | undefined = $state();
let scanning = $state(false);
let pasted = $state('');
let error = $state('');
let stopCamera: (() => void) | null = null;
const camera = cameraAllowed();

async function startCamera(): Promise<void> {
  error = '';
  scanning = true;
  await tick(); // das Video-Element erscheint erst nach dem Umschalten
  if (!video) return;
  try {
    stopCamera = await scanQr(video, (text) => {
      scanning = false;
      stopCamera = null;
      submit(text);
    });
  } catch (cause) {
    scanning = false;
    error = cause instanceof CameraError ? cause.message : 'Die Kamera ließ sich nicht starten.';
  }
}

function stop(): void {
  stopCamera?.();
  stopCamera = null;
  scanning = false;
}

function submit(text: string): void {
  const code = extractCode(text);
  if (code) oncode(code);
}

function onsubmit(event: SubmitEvent): void {
  event.preventDefault();
  submit(pasted);
}

onDestroy(stop);
</script>

<div class="input">
  {#if scanning}
    <!-- svelte-ignore a11y_media_has_caption (Kamerabild, kein Ton) -->
    <video bind:this={video} muted playsinline></video>
    <button type="button" class="btn btn--small" onclick={stop}>Kamera schließen</button>
  {:else if camera}
    <button type="button" class="btn btn--primary" onclick={startCamera}>Kamera öffnen und scannen</button>
  {/if}
  {#if error}<p class="error">{error}</p>{/if}

  <form {onsubmit}>
    <label for="code-paste">
      {camera ? '… oder Code bzw. Link einfügen' : 'Die Kamera ist hier nicht verfügbar – füge den Code bzw. Link ein:'}
    </label>
    <div class="row">
      <input id="code-paste" type="text" autocomplete="off" spellcheck="false" placeholder="I13~…" bind:value={pasted} />
      <button type="submit" class="btn" disabled={!pasted.trim()}>Übernehmen</button>
    </div>
  </form>
</div>

<style>
  .input {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  video {
    width: min(280px, 75vw);
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 12px;
    background: #000;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    margin-top: 6px;
  }

  label {
    font-size: 13px;
    color: var(--muted);
    text-align: center;
  }

  .row {
    display: flex;
    gap: 8px;
  }

  .row input {
    flex: 1;
    min-width: 0;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 13px;
  }

  .error {
    margin: 0;
    color: var(--herz);
    text-align: center;
  }
</style>
