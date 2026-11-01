<script lang="ts">
import { roomLink } from '../../net/link';
import { invite, online } from '../../state/online.svelte';
import CodeShare from './CodeShare.svelte';

/** Gastgeber*in mit Raum: den kurzen Raum-Code zeigen und teilen – und der Ausweichweg ohne Relays. */
</script>

<p>Sag dem anderen Gerät diesen Raum-Code – oder schick ihn:</p>
<p class="room-code" aria-label="Raum-Code {online.roomCode.split('').join(' ')}">{online.roomCode}</p>
<p class="muted note">Dort „2. Gerät“ → „Beitreten“ wählen und den Code eingeben – oder den QR-Code scannen.</p>
<CodeShare
  code={online.roomCode}
  link={roomLink(online.roomCode)}
  message={`Spiel Illuminati 13 mit mir! Raum-Code: ${online.roomCode}`}
/>
<p class="muted note waiting">Warte auf das andere Gerät …</p>
<details class="fallback">
  <summary>Klappt nicht?</summary>
  <p>
    Der Raum-Code braucht öffentliche Treffpunkte im Internet. Ohne sie geht es auch: Dann tauscht ihr zwei längere
    Codes aus, am einfachsten per QR-Code am selben Tisch.
  </p>
  <button type="button" class="btn btn--small" onclick={() => invite(online.myName)}>Per QR-Code verbinden</button>
</details>

<style>
  .room-code {
    margin: 10px 0;
    font-size: clamp(36px, 11vw, 52px);
    font-weight: 700;
    letter-spacing: 0.18em;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  .note {
    text-align: center;
  }

  .waiting {
    margin-top: 12px;
  }

  .fallback {
    margin-top: 14px;
    font-size: 14px;
    color: var(--muted);
  }

  .fallback summary {
    cursor: pointer;
  }
</style>
