import { defineRule } from './rule';

/** Aus der Anleitung (Karo): die Handkarte übernimmt den Wert der Stapelkarte. */
export const copy = defineRule({
  label: 'Hand kopiert Stapel',
  short: '= Stapel',
  direct: true,
  calc: (stack) => stack,
  show: (stack) => `${stack}`,
  explain: (stack) =>
    `Deine Karte zählt genau so viel wie die Stapelkarte: ${stack}. Deine eigene Zahl spielt keine Rolle.`,
});
