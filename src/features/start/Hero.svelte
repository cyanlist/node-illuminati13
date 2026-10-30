<script lang="ts">
import type { Card as CardData } from '../../core/cards';
import Card from '../../ui/Card.svelte';
import Logo from '../../ui/Logo.svelte';

/** Vier Karten als Fächer – frei nach dem Zitat aus der Anleitung. */
const fan: { card: CardData; rotate: string; lift: string }[] = [
  { card: { id: 100, suit: 0, rank: 5 }, rotate: '-9deg', lift: '10px' },
  { card: { id: 101, suit: 1, rank: 2 }, rotate: '-3deg', lift: '0px' },
  { card: { id: 102, suit: 2, rank: 13 }, rotate: '3deg', lift: '-4px' },
  { card: { id: 103, suit: 3, rank: 8 }, rotate: '9deg', lift: '6px' },
];
</script>

<section class="hero">
  <Logo size="60px" />
  <h1>Illuminati <span>13</span></h1>
  <p class="lead">
    Ihr seid Verschwörungstheoretiker*innen auf der Suche nach dem ultimativen Beweis: der Zahl 13. Verrechnet eure Karten
    mit den Stapeln und bildet immer wieder die 13.
    <span class="more">Je mehr Karten ein Beweis braucht, desto mehr Punkte gibt es.</span>
  </p>
  <div class="fan" aria-hidden="true">
    {#each fan as { card, rotate, lift } (card.id)}
      <div class="slot" style:--rotate={rotate} style:--lift={lift}><Card {card} /></div>
    {/each}
  </div>
  <p class="quote">„Wenn du 5 addierst, aber von der 2 das Herz abziehst – was bekommst du? Natürlich 13!“</p>
</section>

<style>
  .hero {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  @media (min-width: 920px) {
    .hero {
      position: sticky;
      top: max(24px, env(safe-area-inset-top, 0px));
    }
  }

  h1 {
    margin: 0;
    font-family: var(--font-title);
    font-weight: 700;
    font-size: clamp(46px, 9vw, 76px);
    line-height: 1;
  }

  h1 span {
    color: var(--herz);
  }

  .lead {
    margin: 0;
    max-width: 30em;
    font-size: 17px;
    text-wrap: pretty;
  }

  .fan {
    display: flex;
    padding: 22px 0 14px 4px;
    --cw: clamp(62px, 13vw, 96px);
  }

  .slot {
    transform: rotate(var(--rotate)) translateY(var(--lift));
    filter: drop-shadow(0 6px 10px var(--shadow));
  }

  .slot + .slot {
    margin-left: calc(var(--cw) * -0.26);
  }

  /*
   * Auf dem Handy: Logo und Titel nebeneinander, darunter nur der Kurztext – Fächer und Zitat entfallen,
   * damit „Wer spielt?“ und „Spiel starten“ ohne langes Scrollen in Sicht kommen.
   */
  @media (max-width: 919px) {
    .hero {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: 10px 14px;
    }

    /* rechts bleibt Platz für den Einstellungs-Knopf der Startseite */
    h1 {
      padding-right: 50px;
      font-size: clamp(32px, 9vw, 56px);
    }

    .lead {
      grid-column: 1 / -1;
      font-size: 15px;
    }

    .fan,
    .quote,
    .more {
      display: none;
    }
  }

  .quote {
    margin: 0;
    max-width: 30em;
    color: var(--muted);
    font-style: italic;
    border-left: 3px solid var(--line);
    padding-left: 12px;
  }
</style>
