import { createDeck, type Rng, shuffle } from '../cards';
import { CLASSIC_RULES, type RuleKey, randomRules } from '../rules';
import type { Settings } from '../settings';
import { createPlayer } from './players';
import { type GameState, HAND_SIZE } from './types';

/** Mischt, teilt aus und legt fest, wer beginnt und welche Regeln gelten. */
export function newGame(settings: Settings, rng: Rng = Math.random): GameState {
  const deck = shuffle(createDeck(), rng);
  const count = settings.mode === 'solo' ? 1 : 2;
  const players = Array.from({ length: count }, (_, i) =>
    createPlayer(settings, i, deck.splice(0, HAND_SIZE)),
  );
  const rules = startingRules(settings, rng);

  const state: GameState = {
    settings: { ...settings, names: [...settings.names], customRules: [...settings.customRules] },
    deck,
    piles: [[], [], [], []],
    rules,
    rotations: 0,
    players,
    current: count > 1 ? Math.floor(rng() * count) : 0,
    finalTurnsLeft: null,
    over: false,
    log: [{ kind: 'intro' }],
    lastMove: null,
  };
  if (settings.ruleMode !== 'classic')
    state.log.push({ kind: 'rules', ruleMode: settings.ruleMode, rules: [...rules] });
  if (settings.variant) state.log.push({ kind: 'variant', dir: settings.dir });
  if (count > 1) state.log.push({ kind: 'begins', player: state.current });
  return state;
}

function startingRules(settings: Settings, rng: Rng): RuleKey[] {
  if (settings.ruleMode === 'custom') return [...settings.customRules];
  if (settings.ruleMode === 'random') return randomRules(rng);
  return [...CLASSIC_RULES];
}
