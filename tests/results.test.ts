import { describe, expect, it } from 'vitest';
import { leadStory, newGame, type Player, rulesAtStart, scoreHistory } from '../src/core/game';
import { rotateRules } from '../src/core/rules';
import { PUBLIC_URL, shareText } from '../src/features/sheets/results/share-text';
import { storyLine } from '../src/features/sheets/results/story';
import { playOut, seededRng, settings } from './helpers';

const player = (name: string, you = false): Player => ({
  name,
  cpu: false,
  you,
  hand: [],
  points: 0,
  combos: 0,
});

describe('Verlauf', () => {
  it('endet bei den Punkten, die alle am Schluss haben – auch mit bezahlten Tipps', () => {
    const game = newGame(settings({ hints: 'exists', hintCost: true }), seededRng(3));
    playOut(game, seededRng(4));
    // einen bezahlten Tipp ins Protokoll schreiben, so wie takeHint es tut
    game.log.splice(3, 0, { kind: 'hint', player: 0, cost: 1 });
    (game.players[0] as Player).points -= 1;
    const history = scoreHistory(game);
    expect(history[0]).toEqual([0, 0]);
    expect(history.at(-1)).toEqual(game.players.map((p) => p.points));
    const moves = game.log.filter(
      (e) => e.kind === 'proof' || e.kind === 'discard' || e.kind === 'skip',
    ).length;
    expect(history).toHaveLength(moves + 1);
  });

  it('erzählt Führungswechsel, Aufholjagd und Vorsprung von Anfang an', () => {
    const anna = player('Anna');
    const you = player('Ben', true);
    // Ben führt, Anna holt auf und gewinnt
    const comeback = [
      [0, 0],
      [0, 4],
      [0, 8],
      [5, 8],
      [10, 8],
      [12, 9],
    ];
    expect(leadStory(comeback, 0)).toEqual({ changes: 1, firstLeader: 1, deficit: 8 });
    expect(storyLine(leadStory(comeback, 0), anna, 0, false)).toBe(
      'Aufholjagd: Anna lag zwischendurch 8 Punkte zurück.',
    );

    const seesaw = [
      [0, 0],
      [2, 0],
      [2, 3],
      [5, 3],
      [5, 6],
      [8, 6],
    ];
    expect(storyLine(leadStory(seesaw, 0), anna, 0, false)).toBe('Die Führung wechselte 4-mal.');

    const ahead = [
      [0, 0],
      [0, 2],
      [1, 2],
      [1, 4],
    ];
    expect(storyLine(leadStory(ahead, 1), you, 1, false)).toBe('Du lagst von Anfang an vorn.');

    expect(
      storyLine(
        leadStory(
          [
            [0, 0],
            [3, 3],
          ],
          0,
        ),
        anna,
        0,
        true,
      ),
    ).toBe('Kopf an Kopf bis zum Schluss.');
  });
});

describe('Ergebnis teilen', () => {
  it('nennt den Stand, die Stapelregeln vom Spielbeginn, die Varianten und den Link', () => {
    const game = newGame(
      settings({ variant: true, dir: 'rechts', truth: true, truthGoal: 50 }),
      seededRng(5),
    );
    const start = [...game.rules];
    // zwei Verschiebungen der Weltordnung im Lauf des Spiels
    game.rules = rotateRules(rotateRules(game.rules, 'rechts'), 'rechts');
    game.rotations = 2;
    expect(rulesAtStart(game)).toEqual(start);

    const [a, b] = game.players as [Player, Player];
    a.name = 'Anna';
    a.points = 24;
    a.combos = 7;
    b.name = 'Ben';
    b.points = 19;
    b.combos = 6;
    const lines = shareText(game).split('\n');
    expect(lines[0]).toBe('Illuminati 13');
    expect(lines[1]).toBe('Anna 24 : 19 Ben (13er: 7 : 6)');
    expect(lines[2]).toMatch(/^Stapel: Herz .+ · Pik .+ · Karo .+ · Kreuz .+$/);
    expect(lines[3]).toBe('Varianten: Wahre Wahrheit – bis 50 Punkte · Weltordnung nach rechts');
    expect(lines.at(-1)).toBe(`Selbst spielen: ${PUBLIC_URL}`);
  });

  it('lässt die Zeile mit den Varianten weg, wenn keine gespielt wurden', () => {
    const game = newGame(settings({ mode: 'solo' }), seededRng(6));
    (game.players[0] as Player).points = 31;
    (game.players[0] as Player).combos = 9;
    const text = shareText(game);
    expect(text).toContain('Allein: 31 Punkte (9× die 13)');
    expect(text).toContain('Stapel: Herz S + H · Pik S − H · Karo = Stapel · Kreuz max(S, H)');
    expect(text).not.toContain('Varianten');
  });
});
