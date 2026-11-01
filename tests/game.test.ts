import { describe, expect, it } from 'vitest';
import { chooseCpuMove } from '../src/core/ai';
import {
  applyMove,
  beatsBest,
  finishTurn,
  type GameState,
  HAND_SIZE,
  markYou,
  newGame,
  ranking,
  soloScore,
  turnsTaken,
} from '../src/core/game';
import { CLASSIC_RULES } from '../src/core/rules';
import { normalizeSettings, resolveRuleMode, settingsForEditing } from '../src/core/settings';
import { card, seededRng, settings } from './helpers';

/** Ein Spiel mit festgelegter Hand und festgelegten Stapeln, wie im Beispiel der Anleitung. */
function exampleGame(overrides = {}): GameState {
  const game = newGame(settings({ mode: 'solo', ...overrides }), seededRng(7));
  game.piles = [[card(0, 4)], [card(1, 2)], [card(2, 10)], [card(3, 6)]];
  const fixed = [card(0, 5), card(1, 7), card(3, 3), card(3, 8), card(2, 13)];
  const fixedIds = new Set([...fixed, ...game.piles.flat()].map((c) => c.id));
  game.deck = game.deck.concat(game.players[0]?.hand ?? []).filter((c) => !fixedIds.has(c.id));
  if (game.players[0]) game.players[0].hand = fixed;
  return game;
}

const cardsInPlay = (game: GameState): number =>
  game.deck.length + game.piles.flat().length + game.players.reduce((n, p) => n + p.hand.length, 0);

describe('neues Spiel', () => {
  it('teilt fünf Karten pro Person aus', () => {
    const game = newGame(settings(), seededRng(1));
    expect(game.players.map((p) => p.hand.length)).toEqual([HAND_SIZE, HAND_SIZE]);
    expect(cardsInPlay(game)).toBe(52);
    expect(game.players[1]).toMatchObject({ name: 'Computer', cpu: true });
  });

  it('nimmt eigene Regeln und lost zufällige aus', () => {
    const custom = newGame(settings({ ruleMode: 'custom', customRules: ['mirror', 'min', 'plain', 'mean'] }));
    expect(custom.rules).toEqual(['mirror', 'min', 'plain', 'mean']);
    const random = newGame(settings({ ruleMode: 'random' }), seededRng(3));
    expect(new Set(random.rules).size).toBe(4);
  });
});

describe('Züge', () => {
  it('Beweis: Punkte, Ablage in gewählter Reihenfolge, Nachziehen', () => {
    const game = exampleGame();
    // ♠7 (−5) + ♦13 (10) + ♣8 (8) = 13
    const cardIds = [card(1, 7), card(2, 13), card(3, 8)].map((c) => c.id);
    const result = applyMove(game, { type: 'proof', cardIds });
    const [player] = game.players;
    expect(player?.points).toBe(3);
    expect(player?.combos).toBe(1);
    expect(player?.hand.length).toBe(HAND_SIZE);
    expect(result.drawn.length).toBe(3);
    // Rechenweg für die Beweis-Bühne, in der gewählten Reihenfolge
    expect(result.parts.map((part) => [part.formula, part.value])).toEqual([
      ['2 − 7', -5],
      ['10', 10],
      ['max(6, 8)', 8],
    ]);
    expect(game.piles.map((pile) => pile.at(-1)?.rank)).toEqual([4, 7, 13, 8]);
    expect(game.log.at(-1)).toMatchObject({ kind: 'proof', points: 3 });
  });

  it('Beweis mit zwei Karten einer Farbe legt die gewählte nach oben', () => {
    const game = exampleGame();
    game.piles[3] = [card(3, 1)];
    const [player] = game.players;
    if (player) player.hand = [card(3, 5), card(3, 8), card(0, 1), card(0, 2), card(1, 1)];
    // ♣5 (max 5) + ♣8 (max 8) = 13; ♣5 soll oben liegen
    const five = card(3, 5).id;
    applyMove(game, { type: 'proof', cardIds: [five, card(3, 8).id], topPick: { 3: five } });
    expect(game.piles[3]?.map((c) => c.rank)).toEqual([1, 8, 5]);
  });

  it('lehnt einen Beweis ab, der nicht 13 ergibt', () => {
    const game = exampleGame();
    // ♥5 allein ist 9
    expect(() => applyMove(game, { type: 'proof', cardIds: [card(0, 5).id] })).toThrow(/nicht 13/);
    expect(game.players[0]?.hand.length).toBe(HAND_SIZE);
  });

  it('lehnt Karten ab, die nicht auf der Hand sind', () => {
    const game = exampleGame();
    expect(() => applyMove(game, { type: 'discard', cardId: card(0, 1).id })).toThrow(/nicht auf der Hand/);
  });

  it('Abwurf: eine Karte auf ihren Stapel, eine nachziehen', () => {
    const game = exampleGame();
    const deckBefore = game.deck.length;
    const result = applyMove(game, { type: 'discard', cardId: card(0, 5).id });
    expect(result.parts).toEqual([]);
    expect(game.piles[0]?.at(-1)?.rank).toBe(5);
    expect(game.players[0]?.hand.length).toBe(HAND_SIZE);
    expect(game.deck.length).toBe(deckBefore - 1);
  });

  it('Variante: eine 13 auf dem Stapel lässt die Stapel weiterrücken', () => {
    const game = exampleGame({ variant: true, dir: 'rechts' });
    const result = applyMove(game, { type: 'discard', cardId: card(2, 13).id });
    expect(game.rules).toEqual(['minus', 'copy', 'max', 'plus']);
    expect(game.rotations).toBe(1);
    expect(result.steps[0]?.rotated).toBe(true);
    expect(game.log.at(-1)).toMatchObject({ kind: 'rotation', count: 1 });
  });
});

describe('Zwei Geräte', () => {
  it('beide Geräte behalten über ein ganzes Spiel denselben Stand, wenn sie nur die Züge austauschen', () => {
    const rng = seededRng(11);
    const host = newGame(settings({ mode: 'online', names: ['Anna', 'Ben'], variant: true }), rng);
    const guest: GameState = JSON.parse(JSON.stringify(host));
    markYou(host, 0);
    markYou(guest, 1);
    while (!host.over) {
      const move = chooseCpuMove(host, rng);
      applyMove(host, move);
      applyMove(guest, JSON.parse(JSON.stringify(move)));
      finishTurn(host);
      finishTurn(guest);
    }
    expect(guest.over).toBe(true);
    // bis auf „du“ (jedes Gerät meint sich selbst) ist alles gleich
    markYou(guest, 0);
    expect(guest).toEqual(host);
  });

  it('jedes Gerät spricht nur die eigene Person mit „Du“ an und nennt die andere beim Namen', () => {
    const game = newGame(settings({ mode: 'online', names: ['Anna', ''] }), seededRng(1));
    expect(game.players.map((p) => p.name)).toEqual(['Anna', 'Spieler*in 2']);
    markYou(game, 1);
    expect(game.players.map((p) => p.you)).toEqual([false, true]);
    expect(game.players.every((p) => !p.cpu)).toBe(true);
  });
});

describe('Rundenablauf', () => {
  it('nach leerem Nachziehstapel hat jede*r noch einen Zug', () => {
    const game = newGame(settings({ mode: 'hotseat' }), seededRng(2));
    game.deck = [];
    finishTurn(game);
    expect(game.finalTurnsLeft).toBe(2);
    expect(game.over).toBe(false);
    finishTurn(game);
    finishTurn(game);
    expect(game.over).toBe(true);
    expect(game.log.at(-1)).toEqual({ kind: 'end' });
  });

  it('wer keine Karten mehr hat, setzt aus', () => {
    const game = newGame(settings({ mode: 'hotseat' }), seededRng(2));
    game.current = 0;
    if (game.players[1]) game.players[1].hand = [];
    finishTurn(game);
    expect(game.current).toBe(0);
    expect(game.log.at(-1)).toEqual({ kind: 'skip', player: 1 });
  });

  it('in der letzten Runde zählt auch ein ausgesetzter Zug', () => {
    const game = newGame(settings({ mode: 'hotseat' }), seededRng(2));
    game.current = 0;
    game.finalTurnsLeft = 2;
    if (game.players[1]) game.players[1].hand = [];
    finishTurn(game);
    expect(game.over).toBe(true);
  });

  it('bei Punktgleichstand entscheiden die 13er', () => {
    const game = newGame(settings({ mode: 'hotseat' }));
    const [a, b] = game.players;
    if (!a || !b) throw new Error('zwei Personen erwartet');
    Object.assign(a, { points: 10, combos: 3 });
    Object.assign(b, { points: 10, combos: 4 });
    expect(ranking(game)).toMatchObject({ order: [b, a], tie: false, decidedByCombos: true });
    b.combos = 3;
    expect(ranking(game).tie).toBe(true);
  });

  it.each([false, true])('ganze Partie Computer gegen Computer (Variante: %s)', (variant) => {
    const rng = seededRng(variant ? 11 : 5);
    const game = newGame(settings({ mode: 'hotseat', variant, ruleMode: 'random' }), rng);
    for (let turn = 0; turn < 200 && !game.over; turn++) {
      applyMove(game, chooseCpuMove(game, rng));
      finishTurn(game);
      expect(cardsInPlay(game)).toBe(52);
    }
    expect(game.over).toBe(true);
    expect(game.deck.length).toBe(0);
  });
});

describe('Bis 13', () => {
  /** Zu zweit; Person `scorer` hat gerade ihren Zug beendet und dabei `points` Punkte erreicht. */
  function goalGame(scorer: number, points = 13): GameState {
    const game = newGame(settings({ mode: 'hotseat', ending: 'thirteen' }), seededRng(2));
    game.log = [{ kind: 'intro' }, { kind: 'begins', player: 0 }];
    game.current = scorer;
    const player = game.players[scorer];
    if (player) player.points = points;
    return game;
  }

  it('erreicht die beginnende Person die 13, hat die andere noch einen Zug', () => {
    const game = goalGame(0);
    finishTurn(game);
    expect(game.over).toBe(false);
    expect(game.finalTurnsLeft).toBe(1);
    expect(game.current).toBe(1);
    expect(game.log.at(-1)).toEqual({ kind: 'goal', player: 0, turnsLeft: 1 });
    finishTurn(game);
    expect(game.over).toBe(true);
  });

  it('erreicht die zweite Person die 13, ist die Runde komplett und das Spiel vorbei', () => {
    const game = goalGame(1);
    finishTurn(game);
    expect(game.over).toBe(true);
    expect(game.log.slice(-2)).toEqual([{ kind: 'goal', player: 1, turnsLeft: 0 }, { kind: 'end' }]);
  });

  it('unter 13 Punkten und ohne „Bis 13“ geht es weiter', () => {
    const below = goalGame(1, 12);
    finishTurn(below);
    expect(below.over).toBe(false);
    const fullDeck = goalGame(1);
    fullDeck.settings.ending = 'deck';
    finishTurn(fullDeck);
    expect(fullDeck.over).toBe(false);
    expect(fullDeck.finalTurnsLeft).toBe(null);
  });

  it('läuft schon die letzte Runde nach leerem Stapel, bleibt es bei der kürzeren', () => {
    const game = goalGame(0);
    game.finalTurnsLeft = 1;
    finishTurn(game);
    expect(game.over).toBe(true);
  });

  it('allein endet das Spiel mit der 13 sofort; gewertet werden die Züge', () => {
    const game = newGame(settings({ mode: 'solo', ending: 'thirteen' }), seededRng(4));
    const rng = seededRng(9);
    while (!game.over) {
      applyMove(game, chooseCpuMove(game, rng));
      finishTurn(game);
    }
    const [player] = game.players;
    const reached = game.log.find((entry) => entry.kind === 'goal');
    if (reached) expect(player?.points).toBeGreaterThanOrEqual(13);
    else expect(game.deck.length).toBe(0);
    expect(turnsTaken(game, 0)).toBe(
      game.log.filter((e) => e.kind === 'proof' || e.kind === 'discard').length,
    );
  });

  it('Bestwert allein: Punkte im ganzen Spiel, bei „Bis 13“ die wenigsten Züge', () => {
    const deck = newGame(settings({ mode: 'solo' }), seededRng(4));
    if (deck.players[0]) deck.players[0].points = 20;
    expect(soloScore(deck)).toBe(20);
    expect(beatsBest(deck, 20, 18)).toBe(true);

    const short = newGame(settings({ mode: 'solo', ending: 'thirteen' }), seededRng(4));
    expect(soloScore(short)).toBe(null);
    short.log.push(
      { kind: 'discard', player: 0, card: card(0, 1) },
      { kind: 'goal', player: 0, turnsLeft: 0 },
    );
    expect(soloScore(short)).toBe(1);
    expect(beatsBest(short, 9, 0)).toBe(true);
    expect(beatsBest(short, 9, 8)).toBe(false);
    expect(beatsBest(short, 7, 8)).toBe(true);
  });

  it('ganze Partie Computer gegen Computer endet vor dem leeren Stapel', () => {
    const rng = seededRng(5);
    const game = newGame(settings({ mode: 'hotseat', ending: 'thirteen' }), rng);
    for (let turn = 0; turn < 200 && !game.over; turn++) {
      applyMove(game, chooseCpuMove(game, rng));
      finishTurn(game);
    }
    expect(game.over).toBe(true);
    expect(game.deck.length).toBeGreaterThan(0);
    expect(Math.max(...game.players.map((p) => p.points))).toBeGreaterThanOrEqual(13);
    // beide hatten gleich viele Züge
    expect(turnsTaken(game, 0)).toBe(turnsTaken(game, 1));
  });
});

describe('Einstellungen', () => {
  it('repariert kaputte oder veraltete Daten', () => {
    expect(normalizeSettings({ mode: 'netz', customRules: ['plus'], showValues: 'ja' })).toEqual(
      settings({ customRules: [...CLASSIC_RULES] }),
    );
    expect(normalizeSettings(null)).toEqual(settings());
  });

  it('macht aus einem früher gespeicherten Namen „Du“ ein leeres Feld', () => {
    expect(normalizeSettings({ names: ['Du', 'Bea'] }).names).toEqual(['', 'Bea']);
    expect(normalizeSettings({ names: ['Anna', ''] }).names).toEqual(['Anna', '']);
  });

  it('leitet den Regel-Modus beim Spielstart aus den Feldern ab', () => {
    expect(resolveRuleMode(settings({ ruleMode: 'custom', customRules: [...CLASSIC_RULES] })).ruleMode).toBe(
      'classic',
    );
    expect(
      resolveRuleMode(settings({ ruleMode: 'classic', customRules: ['min', 'minus', 'copy', 'max'] }))
        .ruleMode,
    ).toBe('custom');
    expect(resolveRuleMode(settings({ ruleMode: 'random' })).ruleMode).toBe('random');
  });

  it('zeigt im klassischen Modus die klassischen Regeln zum Bearbeiten', () => {
    const stored = settings({ ruleMode: 'classic', customRules: ['mirror', 'min', 'plain', 'mean'] });
    expect(settingsForEditing(stored).customRules).toEqual([...CLASSIC_RULES]);
  });
});
