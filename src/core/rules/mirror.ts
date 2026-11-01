import { MAX_RANK } from '../cards';
import { defineRule } from './rule';

/** Zusatzregel: die Handkarte gespiegelt an der höchsten Karte (13) – die Stapelkarte zählt nicht. */
export const mirror = defineRule({
  label: '13 − Hand',
  short: '13 − H',
  calc: (_stack, hand) => MAX_RANK - hand,
  show: (_stack, hand) => `${MAX_RANK} − ${hand}`,
  explain: (_stack, hand, value) =>
    `Deine Zahl wird an der ${MAX_RANK} gespiegelt: ${MAX_RANK} weniger ${hand} sind ${value}. Der Stapel spielt keine Rolle.`,
});
