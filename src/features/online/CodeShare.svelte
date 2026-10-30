<script lang="ts">
import QrCode from './QrCode.svelte';

/**
 * Den eigenen Code weitergeben: als QR-Code zum Scannen am selben Tisch, oder zum Teilen bzw. Kopieren,
 * um ihn per Messenger zu schicken. Gibt es einen Link, steckt der im QR-Code – dann öffnet sogar die
 * normale Kamera-App das Spiel.
 */
interface Props {
  code: string;
  /** Einladungs-Link, falls die App unter einer eigenen Adresse läuft */
  link?: string | null;
  /** Begleittext beim Teilen */
  message: string;
}
let { code, link = null, message }: Props = $props();

let copied = $state(false);
let textarea: HTMLTextAreaElement | undefined = $state();
const shareable = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
const payload = $derived(link ?? code);

async function share(): Promise<void> {
  try {
    await navigator.share(link ? { text: message, url: link } : { text: `${message}\n\n${code}` });
  } catch {
    // abgebrochen oder nicht erlaubt – dann bleibt Kopieren
  }
}

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(payload);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  } catch {
    // ohne Zugriff auf die Zwischenablage: Code markieren, damit man ihn selbst kopieren kann
    textarea?.select();
  }
}
</script>

<div class="share">
  <QrCode text={payload} label="QR-Code zum Scannen" />

  <div class="buttons">
    {#if shareable}<button type="button" class="btn btn--small" onclick={share}>Teilen …</button>{/if}
    <button type="button" class="btn btn--small" onclick={copy}>
      {copied ? 'Kopiert ✓' : link ? 'Link kopieren' : 'Code kopieren'}
    </button>
  </div>

  <details>
    <summary>{link ? 'Link' : 'Code'} als Text</summary>
    <textarea readonly rows="3" bind:this={textarea} onfocus={(event) => event.currentTarget.select()}>{payload}</textarea>
  </details>
</div>

<style>
  .share {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  details {
    width: 100%;
    font-size: 13px;
    color: var(--muted);
    text-align: center;
  }

  summary {
    cursor: pointer;
  }

  textarea {
    width: 100%;
    margin-top: 6px;
    padding: 8px;
    font: 12px/1.4 ui-monospace, Consolas, monospace;
    color: var(--text);
    background: var(--surface-2);
    border: 1.5px solid var(--line);
    border-radius: 8px;
    word-break: break-all;
    resize: none;
  }
</style>
