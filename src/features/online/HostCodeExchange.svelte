<script lang="ts">
import { offerLink, parseInvite } from '../../net/link';
import { acceptAnswer, online } from '../../state/online.svelte';
import CodeInput from './CodeInput.svelte';
import CodeShare from './CodeShare.svelte';

/** Gastgeber*in ohne Relays: erst den eigenen Code zeigen, dann den Antwort-Code des Gastes einlesen. */
function answer(text: string): void {
  const entered = parseInvite(text);
  if (entered?.type === 'code') void acceptAnswer(entered.code);
  else online.error = 'Das ist kein Antwort-Code. Er beginnt mit „I13~“.';
}
</script>

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

<style>
  .steps {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin: 12px 0 0;
    padding-left: 1.3em;
  }
</style>
