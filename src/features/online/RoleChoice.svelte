<script lang="ts">
import { createRoom, online } from '../../state/online.svelte';

/** Erster Schritt: Lädt dieses Gerät ein (öffnet einen Raum) oder tritt es bei? */
function chooseGuest(): void {
  online.role = 'guest';
  online.method = 'room';
  online.error = '';
}
</script>

<p>Zwei Geräte verbinden sich direkt miteinander. Ein Gerät lädt ein, das andere tritt bei – egal wo ihr seid.</p>
<div class="choices">
  <button type="button" class="choice" onclick={() => createRoom(online.myName)}>
    <b>Einladen</b><span>Dieses Gerät öffnet einen Raum und zeigt einen kurzen Code.</span>
  </button>
  <button type="button" class="choice" onclick={chooseGuest}>
    <b>Beitreten</b><span>Das andere Gerät zeigt schon einen Raum-Code – oder du hast ihn geschickt bekommen.</span>
  </button>
</div>

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
</style>
