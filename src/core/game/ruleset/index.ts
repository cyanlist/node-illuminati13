/**
 * Das Regelwerk eines Spiels: welche Bausteine gelten, abgeleitet aus den Einstellungen. Der übrige Code fragt nur
 * noch das Regelwerk – statt selbst zu prüfen, welche Länge, Variante oder Tipp-Stufe eingestellt ist.
 * Neue Variante: Baustein in ending/, draw/, placement/ oder hints.ts anlegen und hier zuordnen.
 */
import type { Settings } from '../../settings';
import { stopWhenEmpty } from './draw/stop-when-empty';
import { firstTo, GOAL_POINTS } from './ending/first-to';
import { fullDeck } from './ending/full-deck';
import { hintStyle } from './hints';
import { noEffect } from './placement/none';
import { worldOrder } from './placement/world-order';
import type { Ruleset } from './types';

/** Baut das Regelwerk – rein und schnell, darf beliebig oft aufgerufen werden. */
export function rulesetFor(settings: Settings): Ruleset {
  return {
    ending: settings.ending === 'thirteen' ? firstTo(GOAL_POINTS) : fullDeck,
    draw: stopWhenEmpty,
    placement: settings.variant ? worldOrder(settings.dir) : noEffect,
    hint: hintStyle(settings.hints),
  };
}

export { stopWhenEmpty } from './draw/stop-when-empty';
export { firstTo, GOAL_POINTS } from './ending/first-to';
export { fullDeck } from './ending/full-deck';
export { HINT_CHOICES, HINT_STYLES, HINTS_OFF, hintStyle, NO_THIRTEEN } from './hints';
export { noEffect } from './placement/none';
export { worldOrder } from './placement/world-order';
export type { DrawPolicy, Ending, HintReveal, HintStyle, PlacementEffect, Ruleset } from './types';
