import { defineRule } from './rule';

/** Zusatzregel: die Handkarte gespiegelt an der 13 – die Stapelkarte zählt nicht. */
export const mirror = defineRule({
  label: '13 − Hand',
  short: '13 − H',
  calc: (_stack, hand) => 13 - hand,
  show: (_stack, hand) => `13 − ${hand}`,
  explain: (_stack, hand) =>
    `Deine Zahl wird an der 13 gespiegelt: 13 weniger ${hand} sind ${13 - hand}. Der Stapel spielt keine Rolle.`,
});
