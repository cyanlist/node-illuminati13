<script lang="ts">
import { FLIGHT_MS, type Flight, flights, landFlight } from '../../state/flights.svelte';
import Card from '../../ui/Card.svelte';
import CardBack from '../../ui/CardBack.svelte';

/**
 * Karten im Flug: Jede liegt schon an ihrem Ziel (Stapel oder Platz in der Hand) und wird per
 * Web-Animation vom Startpunkt dorthin bewegt – mit leichtem Bogen und etwas Drehung.
 */
function fly(node: HTMLElement, flight: Flight) {
  const { from, to } = flight;
  const start = from ?? new DOMRect(to.left, to.top - 90, to.width, to.height);
  const dx = start.left + start.width / 2 - (to.left + to.width / 2);
  const dy = start.top + start.height / 2 - (to.top + to.height / 2);
  const scale = start.width / to.width;

  const animation = node.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${scale}) rotate(-6deg)`, opacity: from ? 1 : 0 },
      {
        transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 28}px) scale(${((scale + 1) / 2) * 1.08}) rotate(4deg)`,
        opacity: 1,
        offset: 0.6,
      },
      { transform: 'none', opacity: 1 },
    ],
    { duration: FLIGHT_MS, easing: 'cubic-bezier(.3, .7, .3, 1)' },
  );

  let landed = false;
  const land = (): void => {
    if (landed) return;
    landed = true;
    landFlight(flight.id);
  };
  animation.onfinish = land;
  // Zeichnet der Browser gerade nicht (Fenster verdeckt), endet die Animation nie von selbst –
  // dann gilt die Karte nach Ablauf der Flugzeit trotzdem als gelandet.
  const fallback = setTimeout(land, FLIGHT_MS + 250);

  return {
    destroy() {
      clearTimeout(fallback);
      animation.cancel();
    },
  };
}
</script>

{#each flights.list as flight (flight.id)}
  <div
    class="flying"
    style:left="{flight.to.left}px"
    style:top="{flight.to.top}px"
    style:width="{flight.to.width}px"
    style:--cw="{flight.to.width}px"
    use:fly={flight}
  >
    {#if flight.faceDown}
      <CardBack />
    {:else}
      <Card card={flight.card} />
    {/if}
  </div>
{/each}

<style>
  .flying {
    position: fixed;
    z-index: 30;
    pointer-events: none;
    transform-origin: center;
    filter: drop-shadow(0 14px 18px var(--shadow));
  }
</style>
