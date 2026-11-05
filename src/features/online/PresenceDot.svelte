<script lang="ts">
import type { Presence } from '../../state/online.svelte';

/**
 * Punkt für den Stand der Verbindung zum anderen Gerät: grün verbunden, gelb wackelig, rot weg, grau pulsierend
 * im Aufbau. Steht am Avatar des Gegenübers – auf der Startseite und am Tisch. Für Screenreader steht der Stand
 * als Text dabei.
 */
interface Props {
  presence: Presence;
  size?: string;
}
let { presence, size = '12px' }: Props = $props();

const LABELS: Record<Presence, string> = {
  pending: 'Verbindung wird aufgebaut',
  ok: 'verbunden',
  unstable: 'Verbindung wackelt',
  lost: 'nicht verbunden',
};
</script>

<span class="dot {presence}" style:--size={size} title={LABELS[presence]}>
  <span class="sr-only">{LABELS[presence]}</span>
</span>

<style>
  .dot {
    display: inline-block;
    flex: none;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: var(--muted);
    box-shadow: 0 0 0 2px var(--surface);
  }

  .ok {
    background: var(--ok);
  }

  .unstable {
    background: var(--warn);
    animation: blink 1.4s ease-in-out infinite;
  }

  .lost {
    background: var(--danger);
  }

  .pending {
    animation: blink 1.4s ease-in-out infinite;
  }

  @keyframes blink {
    50% {
      opacity: 0.35;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .dot {
      animation: none;
    }
  }
</style>
