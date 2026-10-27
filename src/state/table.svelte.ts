/**
 * Zustand der Oberfläche: das laufende Spiel und alles, was nur die Anzeige betrifft
 * (Auswahl, Fenster, laufende Ablege-Animation). Geändert wird er über flow.ts und actions.ts.
 */
import type { Card, SuitIndex } from '../core/cards';
import { currentPlayer, type GameState, type LogEntry } from '../core/game';
import type { RuleKey } from '../core/rules';

export type View = 'start' | 'game';

/** Worauf die Oberfläche gerade wartet. */
export type Phase =
  | 'play' // die Person am Gerät wählt Karten
  | 'cpu' // der Computer überlegt
  | 'handoff' // zu zweit: Gerät weitergeben, Karten noch verdeckt
  | 'order' // Fenster: welche Karte einer Farbe oben liegt
  | 'over';

/**
 * Laufende Ablege-Animation. Der Zug ist im Spielzustand schon ausgeführt; die Anzeige zeigt
 * so lange den Stand davor, bis jede Karte einzeln auf ihrem Stapel gelandet ist.
 */
export interface MoveAnimation {
  id: number;
  player: number;
  /** ids der Karten, die noch nicht gelandet sind */
  pending: number[];
  landed: Card[];
  rules: RuleKey[];
  rotations: number;
  points: number[];
  combos: number[];
  deck: number;
  logLength: number;
  /** Hand der Person am Zug vor dem Zug – nachgezogene Karten erscheinen erst nach der Animation */
  handBefore: Card[];
  /** ids der Karten, die die Hand schon verlassen haben (in der Luft oder gelandet) */
  launched: number[];
}

class TableState {
  view = $state<View>('start');
  game = $state<GameState | null>(null);
  phase = $state<Phase>('play');
  /** ids der markierten Handkarten */
  selected = $state<number[]>([]);
  /** Tipp: hervorgehobene Karten */
  hint = $state<number[]>([]);
  /** Kurze Rückmeldung unter dem Knopf */
  message = $state('');
  /** Gewählte oberste Karte je Farbe, solange das Reihenfolge-Fenster offen ist */
  topPick = $state<Partial<Record<SuitIndex, number>> | null>(null);
  rulesOpen = $state(false);
  /** Ergebnisfenster weggeklickt, um den Tisch anzusehen */
  resultsHidden = $state(false);
  anim = $state<MoveAnimation | null>(null);
  /** Frisch nachgezogene Karten, die einmal eingeblendet werden */
  dealt = $state<number[]>([]);
  /** Bisheriger Bestwert im Solo-Spiel, für das Ergebnisfenster */
  soloBest = $state(0);

  /* ---------- abgeleitete Ansichten ---------- */

  /** Wessen Hand unten liegt: zu zweit die der Person am Zug, sonst die eigene. */
  get handOwner(): number {
    return this.game?.settings.mode === 'hotseat' ? this.game.current : 0;
  }

  get selectedCards(): Card[] {
    if (!this.game) return [];
    const { hand } = currentPlayer(this.game);
    return this.selected.flatMap((id) => hand.filter((card) => card.id === id));
  }

  // Während einer Animation zeigt der Tisch den Stand vor dem Zug plus die schon gelandeten Karten.

  get piles(): Card[][] {
    const { game, anim } = this;
    if (!game) return [];
    return anim
      ? game.piles.map((pile) => pile.filter((card) => !anim.pending.includes(card.id)))
      : game.piles;
  }

  get rules(): RuleKey[] {
    return this.anim?.rules ?? this.game?.rules ?? [];
  }

  get rotations(): number {
    return this.anim?.rotations ?? this.game?.rotations ?? 0;
  }

  get deckCount(): number {
    return this.anim?.deck ?? this.game?.deck.length ?? 0;
  }

  get log(): LogEntry[] {
    const log = this.game?.log ?? [];
    return this.anim ? log.slice(0, this.anim.logLength) : log;
  }

  points(index: number): number {
    return this.anim?.points[index] ?? this.game?.players[index]?.points ?? 0;
  }

  combos(index: number): number {
    return this.anim?.combos[index] ?? this.game?.players[index]?.combos ?? 0;
  }

  /** Handkarten einer Person. Während sie ablegt, bleibt jede Karte liegen, bis sie selbst abhebt. */
  hand(index: number): Card[] {
    const player = this.game?.players[index];
    if (!player) return [];
    const anim = this.anim;
    if (!anim || anim.player !== index) return player.hand;
    return anim.handBefore.filter((card) => !anim.launched.includes(card.id));
  }
}

export const table = new TableState();

export function requireGame(): GameState {
  if (!table.game) throw new Error('Es läuft kein Spiel.');
  return table.game;
}
