<script lang="ts">
import { parseInvite } from '../../net/link';
import { join, joinRoom, online } from '../../state/online.svelte';
import CodeInput from './CodeInput.svelte';
import CodeShare from './CodeShare.svelte';

/**
 * Gast: Raum-Code (oder Link, oder langen Code) eingeben und den Raum suchen – beim Austausch zweier Codes
 * danach den eigenen Antwort-Code zeigen.
 */
function enter(text: string): void {
  const entered = parseInvite(text);
  if (entered?.type === 'room') joinRoom(entered.room, online.myName);
  else if (entered?.type === 'code') void join(entered.code, online.myName);
  else online.error = 'Das sieht nicht nach einem Raum-Code aus. Er hat fünf Zeichen, z. B. K7M4X.';
}
</script>

{#if online.status === 'idle'}
  <CodeInput label="Raum-Code" placeholder="z. B. K7M4X" submitLabel="Beitreten" oncode={enter} />
{:else if online.method === 'room'}
  <p class="muted note">Suche Raum {online.roomCode} …</p>
{:else if online.status === 'preparing'}
  <p class="muted">Antwort wird erstellt …</p>
{:else}
  <p><b>Zeig diesen Antwort-Code jetzt dem einladenden Gerät</b> – oder schick ihn zurück.</p>
  <CodeShare code={online.code} message="Mein Antwort-Code für Illuminati 13:" />
  <p class="muted note">Warte auf Verbindung …</p>
{/if}

<style>
  .note {
    text-align: center;
  }
</style>
