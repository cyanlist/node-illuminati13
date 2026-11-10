/**
 * Zustand am Tisch: das laufende Spiel und was nur die Anzeige betrifft – Auswahl, Tipp, Rückmeldung und
 * die laufende Ablege-Animation. Geändert wird er im Spielablauf (flow.ts), durch die Person am Gerät
 * (actions.ts) und beim Abspielen eines Zugs (move-animation.ts).
 */
import { type Card, SUIT_INDICES, type SuitIndex } from '../core/cards';
import { currentPlayer, type GameState, type LogEntry } from '../core/game';
import { pileColumn, type RuleKey } from '../core/rules';
import { isOnline } from '../core/settings';
import type { MoveAnimation } from './move-animation';

export type View = 'start' | 'game';

/** Worauf die Oberfläche gerade wartet. */
export type Phase =
  | 'play' // die Person am Gerät wählt Karten
  | 'cpu' // der Computer überlegt
  | 'remote' // an zwei Geräten: das andere Gerät ist am Zug
  | 'handoff' // zu zweit: Gerät weitergeben, Karten noch verdeckt
  | 'order' // Fenster: welche Karte einer Farbe oben liegt
  | 'over';

class TableState {
  view = $state<View>('start');
  game = $state<GameState | null>(null);
  /** Welche Person an diesem Gerät sitzt – nur an zwei Geräten nicht immer 0 */
  me = $state(0);
  phase = $state<Phase>('play');
  /** ids der markierten Handkarten */
  selected = $state<number[]>([]);
  /** Tipp (volle Hilfe): hervorgehobene Karten */
  hinted = $state<number[]>([]);
  /** Tipp in diesem Zug: ids der gefundenen 13 ([] = keine); null = noch kein Tipp geholt */
  hintCombo = $state<number[] | null>(null);
  /** Kurze Rückmeldung unter dem Knopf */
  message = $state('');
  /** Zählt Versuche, Karten abzulegen, die keine 13 ergeben – der Ablegen-Knopf schüttelt dann kurz den Kopf */
  rejected = $state(0);
  /** Gewählte oberste Karte je Farbe, solange das Reihenfolge-Fenster offen ist */
  topPick = $state<Partial<Record<SuitIndex, number>> | null>(null);
  anim = $state<MoveAnimation | null>(null);
  /** Die Lernrunde erklärt gerade etwas: Karten, Knöpfe und der Computer warten auf „Weiter“ */
  paused = $state(false);
  /** Bisheriger Bestwert im Solo-Spiel (Punkte, bei „Bis 13“ Züge), für das Ergebnisfenster */
  soloBest = $state(0);

  /** Neuer Zug: Auswahl, Tipp, Rückmeldung und Reihenfolge-Wahl beginnen von vorn. */
  resetTurn(): void {
    this.selected = [];
    this.hinted = [];
    this.hintCombo = null;
    this.message = '';
    this.topPick = null;
  }

  /* ---------- abgeleitete Ansichten ---------- */

  /** Das Spiel, solange der Tisch zu sehen ist – auf der Startseite null. */
  get shownGame(): GameState | null {
    return this.view === 'game' ? this.game : null;
  }

  /** Die Person am Gerät darf Karten wählen: Sie ist am Zug, es fliegt gerade nichts und keine Erklärung wartet. */
  get canPlay(): boolean {
    return this.game !== null && this.phase === 'play' && !this.anim && !this.paused;
  }

  /**
   * Wessen Karten gerade als ganze Hand gezeigt werden – offen, mit wahren Werten und auswählbar.
   * Gegen den Computer und allein immer die eigene, an zwei Geräten die der Person an diesem Gerät;
   * zu zweit an einem Gerät die der Person am Zug, während der Übergabe niemandes (-1).
   */
  get viewer(): number {
    const game = this.game;
    if (!game) return -1;
    if (isOnline(game.settings)) return this.me;
    if (game.settings.mode !== 'hotseat') return 0;
    return this.phase === 'handoff' ? -1 : game.current;
  }

  /**
   * Wer unten sitzt. Die Plätze bleiben fest: zu zweit an einem Gerät Spieler*in 1 unten, 2 oben;
   * an zwei Geräten jeweils die eigene Person unten.
   */
  get bottom(): number {
    return this.game && isOnline(this.game.settings) ? this.me : 0;
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
    // beim Nachmischen liegen die eingesammelten Karten noch unter der obersten, bis sie abheben
    return anim
      ? game.piles.map((pile, suit) =>
          [...(anim.gathering[suit] ?? []), ...pile].filter((card) => !anim.pending.includes(card.id)),
        )
      : game.piles;
  }

  get rules(): RuleKey[] {
    return this.anim?.rules ?? this.game?.rules ?? [];
  }

  get rotations(): number {
    return this.anim?.rotations ?? this.game?.rotations ?? 0;
  }

  /** Die Farben in der Reihenfolge, in der ihre Stapel gerade auf dem Board liegen (Spalte 0 zuerst). */
  get columns(): SuitIndex[] {
    const dir = this.game?.settings.dir ?? 'rechts';
    const at = (suit: SuitIndex) => pileColumn(suit, this.rotations, dir, SUIT_INDICES.length);
    return [...SUIT_INDICES].sort((a, b) => at(a) - at(b));
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
