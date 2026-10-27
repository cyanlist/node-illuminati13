import { defineRule } from './rule';

/** Zusatzregel: Handkarte minus Stapelkarte – das Gegenstück zu „Stapel − Hand“. */
export const handMinusStack = defineRule({
  label: 'Hand − Stapel',
  short: 'H − S',
  calc: (stack, hand) => hand - stack,
  show: (stack, hand) => `${hand} − ${stack}`,
});
