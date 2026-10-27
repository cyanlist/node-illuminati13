/**
 * Karten im Flug: Jeder Flug wird von `FlyingCards.svelte` gezeichnet und meldet sich zurück,
 * sobald die Karte auf ihrem Stapel gelandet ist.
 */
import type { Card } from '../core/cards';

/** Dauer eines Flugs in Millisekunden */
export const FLIGHT_MS = 400;
/** Pause statt Flug, wenn nicht animiert wird – das Ablegen bleibt trotzdem nachvollziehbar */
const STILL_MS = 250;

export interface Flight {
  id: number;
  card: Card;
  /** Startpunkt (Hand oder verdeckte Karte); ohne Startpunkt blendet die Karte über dem Stapel ein */
  from: DOMRect | null;
  to: DOMRect;
}

class FlightState {
  list = $state<Flight[]>([]);
}

export const flights = new FlightState();

const waiting = new Map<number, () => void>();
let nextId = 1;

const prefersReducedMotion = (): boolean =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** Lässt eine Karte von `from` auf ihren Stapel `to` fliegen; das Promise erfüllt sich bei der Landung. */
export function flyCard(card: Card, from: DOMRect | null, to: DOMRect | null): Promise<void> {
  return new Promise((resolve) => {
    if (!to || prefersReducedMotion()) {
      setTimeout(resolve, STILL_MS);
      return;
    }
    const id = nextId++;
    waiting.set(id, resolve);
    flights.list.push({ id, card, from, to });
  });
}

/** Wird von der fliegenden Karte aufgerufen, wenn sie angekommen ist. */
export function landFlight(id: number): void {
  flights.list = flights.list.filter((flight) => flight.id !== id);
  waiting.get(id)?.();
  waiting.delete(id);
}
