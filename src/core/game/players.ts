import type { Card } from '../cards';
import type { Settings } from '../settings';
import type { GameState, Player } from './types';

export function createPlayer(settings: Settings, index: number, hand: Card[]): Player {
  const cpu = settings.mode === 'cpu' && index === 1;
  return {
    name: playerName(settings, index, cpu),
    cpu,
    // an zwei Geräten setzt jedes Gerät „du“ für sich selbst (markYou)
    you: !cpu && settings.mode !== 'hotseat' && (settings.mode !== 'online' || index === 0),
    hand,
    points: 0,
    combos: 0,
  };
}

function playerName(settings: Settings, index: number, cpu: boolean): string {
  if (cpu) return 'Computer';
  if (settings.mode === 'hotseat' || settings.mode === 'online')
    return settings.names[index]?.trim() || `Spieler*in ${index + 1}`;
  return settings.names[0].trim() || 'Du';
}

/** An zwei Geräten: Jedes Gerät spricht die eigene Person mit „Du“ an. */
export function markYou(state: GameState, me: number): void {
  state.players.forEach((player, index) => {
    player.you = index === me;
  });
}

export function playerAt(state: GameState, index: number): Player {
  const player = state.players[index];
  if (!player) throw new Error(`Es gibt keine Person mit der Nummer ${index}.`);
  return player;
}

export const currentPlayer = (state: GameState): Player => playerAt(state, state.current);
