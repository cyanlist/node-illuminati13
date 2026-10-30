<script lang="ts">
import { onDestroy, tick } from 'svelte';
import { CameraError, cameraAllowed, scanQr } from '../../net/qr';

/**
 * Einen Code der Gegenseite eingeben: eintippen bzw. einfügen – oder den QR-Code mit der Kamera scannen.
 * Was es genau ist (Raum-Code, Link, langer Code), entscheidet das Verbindungsfenster.
 */
interface Props {
  label: string;
  placeholder: string;
  submitLabel: string;
  oncode: (text: string) => void;
}
let { label, placeholder, submitLabel, oncode }: Props = $props();

let video: HTMLVideoElement | undefined = $state();
let scanning = $state(false);
let typed = $state('');
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
      oncode(text.trim());
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

function onsubmit(event: SubmitEvent): void {
  event.preventDefault();
  if (typed.trim()) oncode(typed.trim());
}

onDestroy(stop);
</script>

<div class="input">
  <form {onsubmit}>
    <label for="code-input">{label}</label>
    <div class="row">
      <input id="code-input" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" {placeholder} bind:value={typed} />
      <button type="submit" class="btn btn--primary" disabled={!typed.trim()}>{submitLabel}</button>
    </div>
  </form>

  {#if scanning}
    <!-- svelte-ignore a11y_media_has_caption (Kamerabild, kein Ton) -->
    <video bind:this={video} muted playsinline></video>
    <button type="button" class="btn btn--small" onclick={stop}>Kamera schließen</button>
  {:else if camera}
    <button type="button" class="btn btn--small btn--ghost" onclick={startCamera}>… oder QR-Code scannen</button>
  {/if}
  {#if error}<p class="error">{error}</p>{/if}
</div>

<style>
  .input {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }

  label {
    font-weight: 700;
  }

  .row {
    display: flex;
    gap: 8px;
  }

  .row input {
    flex: 1;
    min-width: 0;
    font-size: 17px;
    letter-spacing: 0.06em;
  }

  video {
    width: min(280px, 75vw);
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 12px;
    background: #000;
  }

  .error {
    margin: 0;
    color: var(--herz);
    text-align: center;
  }
</style>
