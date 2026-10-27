/**
 * Zustand der Oberfläche: das laufende Spiel und alles, was nur die Anzeige betrifft
 * (Auswahl, Fenster, laufende Ablege-Animation). Geändert wird er über flow.ts und actions.ts.
 */
import type { Card, SuitIndex } from '../core/cards';
import { currentPlayer, type GameState, type LogEntry, type ProofPart } from '../core/game';
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
 * Laufende Animation eines Zugs. Der Zug ist im Spielzustand schon ausgeführt; die Anzeige zeigt
 * so lange den Stand davor, bis jede Karte einzeln abgelegt und jede neue Karte nachgezogen ist.
 */
export interface MoveAnimation {
  id: number;
  player: number;
  /** ids der Karten, die noch nicht auf ihrem Stapel gelandet sind */
  pending: number[];
  rules: RuleKey[];
  rotations: number;
  points: number[];
  combos: number[];
  deck: number;
  logLength: number;
  /** Hand der Person am Zug vor dem Zug */
  handBefore: Card[];
  /** ids der Karten, die die Hand schon verlassen haben (in der Luft oder gelandet) */
  launched: number[];
  /** Nachgezogene Karten in der Reihenfolge, in der sie in die Hand kommen */
  drawn: Card[];
  /** ids der nachgezogenen Karten, die schon ihren Platz in der Hand haben (evtl. noch im Anflug) */
  incoming: number[];
  /** ids der nachgezogenen Karten, die angekommen und sichtbar sind */
  arrived: number[];
  /** Bei einem Beweis: die Bühne, auf der die Karten vorgezeigt werden */
  proof: ProofStage | null;
}

/**
 * Beweis-Bühne über dem Board: Die Karten werden allen gezeigt, ihre wahren Werte nacheinander
 * enthüllt und die 13 aufgelöst – erst danach fliegen sie auf ihre Stapel.
 */
export interface ProofStage {
  /** Die Karten mit Rechenweg in der Reihenfolge, in der sie gewählt wurden */
  parts: ProofPart[];
  /** ids der Karten, die schon auf der Bühne liegen */
  arrived: number[];
  /** ids der Karten, die die Bühne Richtung Stapel verlassen haben */
  left: number[];
  /** Karte, deren Rechenweg gerade zu sehen ist (-1: keine) */
  revealing: number;
  /** Wie viele wahre Werte schon enthüllt sind */
  revealed: number;
  /** „= 13 · +n Punkte“ ist aufgelöst */
  solved: boolean;
  /** Die Bühne wird durchsichtig, die Karten fliegen auf ihre Stapel */
  clearing: boolean;
  /** Angetippt: alles Weitere ohne Pausen */
  skipped: boolean;
}

class TableState {
  view = $state<View>('start');
  game = $state<GameState | null>(null);
  phase = $state<Phase>('play');
  /** ids der markierten Handkarten */
  selected = $state<number[]>([]);
  /** Tipp (volle Hilfe): hervorgehobene Karten */
  hint = $state<number[]>([]);
  /** Tipp in diesem Zug: ids der gefundenen 13 ([] = keine); null = noch kein Tipp geholt */
  hintTaken = $state<number[] | null>(null);
  /** Kurze Rückmeldung unter dem Knopf */
  message = $state('');
  /** Gewählte oberste Karte je Farbe, solange das Reihenfolge-Fenster offen ist */
  topPick = $state<Partial<Record<SuitIndex, number>> | null>(null);
  rulesOpen = $state(false);
  /** Ergebnisfenster weggeklickt, um den Tisch anzusehen */
  resultsHidden = $state(false);
  anim = $state<MoveAnimation | null>(null);
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

  /**
   * Handkarten einer Person. Während sie am Zug ist, bleibt jede gespielte Karte liegen, bis sie abhebt,
   * und jede neue Karte taucht erst auf, wenn sie vom Nachziehstapel losfliegt.
   */
  hand(index: number): Card[] {
    const player = this.game?.players[index];
    if (!player) return [];
    const anim = this.anim;
    if (!anim || anim.player !== index) return player.hand;
    const kept = anim.handBefore.filter((card) => !anim.launched.includes(card.id));
    const incoming = anim.drawn.filter((card) => anim.incoming.includes(card.id));
    return [...kept, ...incoming];
  }

  /** Die Karte hat schon ihren Platz in der Hand, ist aber noch im Anflug – der Platz bleibt leer. */
  arriving(cardId: number): boolean {
    const anim = this.anim;
    return !!anim && anim.incoming.includes(cardId) && !anim.arrived.includes(cardId);
  }
}

export const table = new TableState();

export function requireGame(): GameState {
  if (!table.game) throw new Error('Es läuft kein Spiel.');
  return table.game;
}
