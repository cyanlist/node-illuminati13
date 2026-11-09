import { type Card, createDeck, type Rng, SUIT_INDICES, shuffle } from '../cards';
import { seedFrom } from '../random';
import { CLASSIC_RULES, type RuleKey, randomRules } from '../rules';
import type { Settings } from '../settings';
import { createPlayer } from './players';
import { rulesetFor } from './ruleset';
import { type GameState, HAND_SIZE } from './types';

/** Mischt, teilt aus und legt fest, wer beginnt und welche Regeln gelten. */
export function newGame(settings: Settings, rng: Rng = Math.random): GameState {
  const deck = shuffle(createDeck(), rng);
  const count = playerCount(settings);
  const players = Array.from({ length: count }, (_, i) => createPlayer(settings, i, dealHand(deck)));
  const rules = startingRules(settings, rng);
  const current = whoBegins(count, rng);

  const state: GameState = {
    settings: { ...settings, names: [...settings.names], customRules: [...settings.customRules] },
    deck,
    piles: SUIT_INDICES.map(() => []),
    rules,
    rotations: 0,
    reshuffles: 0,
    // zuletzt gezogen, damit Mischen, Austeilen und Beginn wie bisher vom selben Zufall abhängen
    rngState: seedFrom(rng),
    players,
    current,
    finalTurnsLeft: null,
    over: false,
    log: [{ kind: 'intro' }],
    lastMove: null,
  };
  if (settings.ruleMode !== 'classic')
    state.log.push({ kind: 'rules', ruleMode: settings.ruleMode, rules: [...rules] });
  const { announcement } = rulesetFor(settings).placement;
  if (announcement) state.log.push(announcement);
  if (count > 1) state.log.push({ kind: 'begins', player: state.current });
  return state;
}

/** Allein eine Person, sonst zwei. */
const playerCount = (settings: Settings): number => (settings.mode === 'solo' ? 1 : 2);

/** Fünf Karten vom gemischten Deck für eine Hand. */
const dealHand = (deck: Card[]): Card[] => deck.splice(0, HAND_SIZE);

/** Zu zweit beginnt eine zufällige Person. */
const whoBegins = (count: number, rng: Rng): number => (count > 1 ? Math.floor(rng() * count) : 0);

function startingRules(settings: Settings, rng: Rng): RuleKey[] {
  if (settings.ruleMode === 'custom') return [...settings.customRules];
  if (settings.ruleMode === 'random') return randomRules(rng);
  return [...CLASSIC_RULES];
}
