import { defineRule } from './rule';

/** Aus der Anleitung (Kreuz): die größere der beiden Karten. */
export const max = defineRule({
  label: 'Maximum(Stapel, Hand)',
  short: 'max(S, H)',
  calc: (stack, hand) => Math.max(stack, hand),
  show: (stack, hand) => `max(${stack}, ${hand})`,
});
