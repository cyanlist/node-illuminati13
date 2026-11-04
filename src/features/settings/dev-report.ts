/**
 * Entwicklerinfo zum Rauskopieren: welcher Build, welches Gerät und – falls es eins gibt – welches Spiel mit
 * welchen Einstellungen. Wer einen Fehler meldet, fügt den Text einfach dazu. Reine Funktion: Was der Browser
 * weiß, kommt als `DeviceInfo` herein.
 */
import { BUILD, type BuildInfo, versionText } from '../../build';
import { SUIT_INDICES, SUITS } from '../../core/cards';
import { type GameState, lastTurnPlayers, turnsTaken } from '../../core/game';
import type { CpuLevel, GameMode, Settings } from '../../core/settings';
import { ruleLabel } from '../../ui/format';
import { SECTIONS } from '../start/sections';

export interface DeviceInfo {
  /** Wo die Seite läuft, z. B. „https://cyanlist.github.io“ */
  origin: string;
  userAgent: string;
  /** Fenstergröße in CSS-Pixeln und Pixeldichte */
  viewport: { width: number; height: number; dpr: number };
  theme: string;
  deck: string;
}

export interface ReportOptions {
  device: DeviceInfo;
  /** Das Spiel, falls eins läuft oder gerade zu Ende ging */
  game: GameState | null;
  /** An zwei Geräten: Gastgeber*in oder Gast */
  role?: string | null;
  /** Den ganzen Spielstand als JSON anhängen – damit lässt sich eine Situation genau nachstellen */
  withState?: boolean;
  build?: BuildInfo;
}

const MODES: Record<GameMode, string> = {
  cpu: 'Gegen den Computer',
  hotseat: 'Zu zweit an einem Gerät',
  online: 'Zu zweit an zwei Geräten',
  solo: 'Allein',
};

const CPU: Record<CpuLevel, string> = { easy: 'leicht', medium: 'mittel', hard: 'schwer' };

/** Grobe Einordnung, wo die Seite läuft – die genaue Adresse steht trotzdem dabei. */
function place(origin: string): string {
  if (origin.includes('github.io')) return 'GitHub Pages';
  if (/claude|anthropic/.test(origin)) return 'Claude-Artefakt';
  if (/localhost|127\.0\.0\.1/.test(origin)) return 'lokal (Entwicklung)';
  if (origin.startsWith('file:') || origin === 'null') return 'Datei';
  return 'andere Adresse';
}

function modeText(settings: Settings, role: string | null | undefined): string {
  const mode = MODES[settings.mode];
  if (settings.mode === 'cpu') return `${mode} (Stärke: ${CPU[settings.cpuLevel]})`;
  if (settings.mode === 'online' && role) return `${mode} (${role === 'host' ? 'Gastgeber*in' : 'Gast'})`;
  return mode;
}

/** Was auf dem Tisch liegt: Zug, Nachziehstapel, oberste Karten, Verschiebungen, letzte Runde. */
function stateLines(game: GameState): string[] {
  const players = game.players.map(
    (player, index) =>
      `${player.name}${player.cpu && player.name !== 'Computer' ? ' (Computer)' : ''}: ${player.points} Punkte, ${player.combos}× die 13, ` +
      `${turnsTaken(game, index)} Züge, ${player.hand.length} Handkarten`,
  );
  const tops = SUIT_INDICES.map((suit) => {
    const top = game.piles[suit]?.at(-1);
    return `${SUITS[suit].name} ${top ? top.rank : 'leer'}`;
  });
  const status = game.over
    ? 'vorbei'
    : game.finalTurnsLeft !== null
      ? `letzte Runde, noch ${lastTurnPlayers(game).length} Zug/Züge`
      : 'läuft';
  return [
    `Status: ${status} · am Zug: ${game.players[game.current]?.name ?? '?'}`,
    ...players.map((line) => `  ${line}`),
    `Nachziehstapel: ${game.deck.length} Karten · oben auf den Stapeln: ${tops.join(', ')}`,
    `Weltordnung verschoben: ${game.rotations}× · nachgemischt: ${game.reshuffles}× · Protokoll: ${game.log.length} Einträge`,
  ];
}

export function devReport({
  device,
  game,
  role = null,
  withState = false,
  build = BUILD,
}: ReportOptions): string {
  const lines = [
    'Illuminati 13 – Entwicklerinfo',
    `Version: ${versionText(build)} (gebaut ${build.date})`,
    `Läuft auf: ${place(device.origin)} – ${device.origin}`,
    `Gerät: ${device.userAgent}`,
    `Fenster: ${device.viewport.width}×${device.viewport.height}, Pixeldichte ${device.viewport.dpr}`,
    `Farbschema: ${device.theme} · Kartendesign: ${device.deck}`,
    '',
  ];

  if (!game) {
    lines.push('Spiel: keins gestartet');
    return lines.join('\n');
  }

  const { settings } = game;
  lines.push(
    `Modus: ${modeText(settings, role)} · ${game.players.length} Person(en)`,
    ...SECTIONS.map((section) => `${section.label}: ${section.summary(settings)}`),
    `Regeln gerade: ${SUIT_INDICES.map((suit) => `${SUITS[suit].name} ${ruleLabel(game.rules[suit])}`).join(' · ')}`,
    ...stateLines(game),
    '',
    `Einstellungen: ${JSON.stringify(settings)}`,
  );
  if (withState) lines.push('', `Spielstand: ${JSON.stringify(game)}`);
  return lines.join('\n');
}
