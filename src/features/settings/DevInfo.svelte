<script lang="ts">
import { BUILD, versionText } from '../../build';
import { online } from '../../state/online.svelte';
import { table } from '../../state/table.svelte';
import CheckOption from '../../ui/CheckOption.svelte';
import { deckChoice, deckInfo } from '../../ui/deck.svelte';
import { themeChoice } from '../../ui/theme.svelte';
import { devReport } from './dev-report';

/**
 * Für Tester*innen: Version, Gerät und die Einstellungen des laufenden Spiels als Text zum Kopieren – wer einen
 * Fehler meldet, fügt ihn einfach dazu. Wahlweise mit dem ganzen Spielstand, um eine Situation nachzustellen.
 */
let withState = $state(false);
let copied = $state<'' | 'ok' | 'failed'>('');
let field = $state<HTMLTextAreaElement>();

const text = $derived(
  devReport({
    game: table.game,
    role: online.role,
    withState,
    device: {
      origin: location.origin,
      userAgent: navigator.userAgent,
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      theme: themeChoice.current,
      deck: deckInfo(deckChoice.current).title,
    },
  }),
);

$effect(() => {
  if (!copied) return;
  const timer = setTimeout(() => (copied = ''), 2500);
  return () => clearTimeout(timer);
});

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    copied = 'ok';
    return;
  } catch {
    // eingebettet (Artefakt) ist die Zwischenablage oft gesperrt – dann der alte Weg über das Textfeld
  }
  field?.select();
  copied = document.execCommand('copy') ? 'ok' : 'failed';
}

const date = new Date(BUILD.date).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
</script>

<p class="version">Version {versionText()} <span class="muted">· gebaut {date}</span></p>
<p class="muted hint">
  Etwas sieht falsch aus? Kopiere diese Angaben und schick sie mit deiner Beschreibung – dann lässt sich nachvollziehen,
  welche Fassung und welche Einstellungen du hattest.
</p>

<textarea bind:this={field} readonly rows="9" aria-label="Entwicklerinfo" value={text}></textarea>

<div class="row">
  {#if table.game}
    <CheckOption
      title="Spielstand anhängen"
      description="Der ganze Tisch als Daten – damit lässt sich die Situation genau nachstellen."
      bind:checked={withState}
    />
  {/if}
  <div class="copy">
    <button type="button" class="btn" onclick={copy}>Kopieren</button>
    <span class="feedback" aria-live="polite">
      {#if copied === 'ok'}Kopiert ✓{:else if copied === 'failed'}Bitte den Text markieren und selbst kopieren.{/if}
    </span>
  </div>
</div>

<style>
  .version {
    margin: 0;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .hint {
    margin: 4px 0 12px;
    font-size: 13px;
  }

  textarea {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 10px 12px;
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.5;
    color: var(--text);
    background: var(--surface-2);
    border: 1.5px solid var(--line);
    border-radius: 10px;
    resize: vertical;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px 16px;
    margin-top: 12px;
  }

  .copy {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
  }

  .feedback {
    font-size: 13px;
    font-weight: 700;
    color: var(--muted);
  }
</style>
