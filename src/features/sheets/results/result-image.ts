/**
 * Das Ergebnis als Bild zum Teilen: eine eigene Karte im dunklen Stil des Spiels – Logo und Schriftzug, Überschrift,
 * das Duell (allein: der Vergleich mit dem Bestwert), der Verlauf mit seinem Satz, die Stapelregeln vom Spielbeginn,
 * die Varianten und der Link zum Spiel. Gezeichnet auf einer Leinwand (Canvas) – ohne Bibliothek, auch offline.
 *
 * Aufgebaut aus Blöcken mit fester Höhe: Erst werden alle Höhen zusammengezählt, dann wird gezeichnet. So ist das
 * Bild genau so hoch wie sein Inhalt.
 */
import type { SuitIndex } from '../../../core/cards';
import type { GameState, Player } from '../../../core/game';
import { hueFor, initials } from '../../../ui/avatar';
import { EYE } from '../../../ui/eye';
import { pointWord } from '../../../ui/format';
import { SUIT_SHAPES } from '../../../ui/suit-shapes';
import { PUBLIC_URL, type ResultSummary } from './result-summary';

const WIDTH = 1080;
const PAD = 72;
const INNER = WIDTH - 2 * PAD;
/** Innenabstand der beiden Kästen (Verlauf, Stapel) */
const BOX = 36;

/** Das dunkle Farbschema der App – das Bild sieht auf jedem Gerät gleich aus */
const COLOR = {
  bg: '#14161b',
  surface: '#1e2128',
  line: '#353a45',
  text: '#e8eaef',
  muted: '#9ba3b2',
  ok: '#4cc98a',
  red: '#ff7f8e',
  suits: ['#ff7f8e', '#b9a0ff', '#ffb347', '#5fd39a'],
} as const;

const TITLE_FONT = '"Kalam", "Segoe Print", cursive';
const BODY_FONT = '"Atkinson Hyperlegible", system-ui, sans-serif';
const font = (size: number, bold = false, family = BODY_FONT): string =>
  `${bold ? 700 : 400} ${size}px ${family}`;

type Ctx = CanvasRenderingContext2D;

interface Block {
  /** Abstand nach oben zum vorigen Block */
  gap: number;
  height: number;
  draw(ctx: Ctx, top: number): void;
}

const playerColor = (player: Player): string =>
  player.cpu ? COLOR.text : `hsl(${hueFor(player.name)} 65% 68%)`;

/** Zeichnet die Ergebniskarte und gibt sie als PNG zurück. */
export async function resultImage(game: GameState, summary: ResultSummary): Promise<Blob> {
  await loadFonts();
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Kein Zeichenbereich verfügbar.');

  const blocks = layout(ctx, game, summary);
  canvas.height = PAD * 2 + blocks.reduce((total, block) => total + block.gap + block.height, 0);
  // die Größe zu setzen leert die Leinwand samt Einstellungen – also erst jetzt zeichnen
  ctx.fillStyle = COLOR.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let top = PAD;
  for (const block of blocks) {
    top += block.gap;
    ctx.save();
    block.draw(ctx, top);
    ctx.restore();
    top += block.height;
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Bild ließ sich nicht erzeugen.'))),
      'image/png',
    ),
  );
}

async function loadFonts(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load(font(60, true, TITLE_FONT)),
      document.fonts.load(font(40, true)),
      document.fonts.load(font(34)),
    ]);
  } catch {
    // dann eben mit Ersatzschrift
  }
}

function layout(ctx: Ctx, game: GameState, summary: ResultSummary): Block[] {
  const blocks: Block[] = [header(), titleBlock(ctx, summary)];
  if (!summary.solo) blocks.push(duel(summary));
  else if (summary.comparison) blocks.push(soloBest(summary));
  blocks.push(chart(ctx, game, summary), piles(ctx, summary), footer());
  return blocks;
}

/* ---------- Blöcke ---------- */

function header(): Block {
  return {
    gap: 0,
    height: 72,
    draw(ctx, top) {
      const logoHeight = 64;
      drawEye(ctx, PAD, top + 4, logoHeight, COLOR.red);
      const x = PAD + (EYE.width / EYE.height) * logoHeight + 22;
      ctx.font = font(60, true, TITLE_FONT);
      ctx.textBaseline = 'middle';
      ctx.fillStyle = COLOR.text;
      const words = 'Illuminati ';
      ctx.fillText(words, x, top + 40);
      ctx.fillStyle = COLOR.red;
      ctx.fillText('13', x + ctx.measureText(words).width, top + 40);
    },
  };
}

function titleBlock(ctx: Ctx, summary: ResultSummary): Block {
  ctx.font = font(34);
  const lines = wrap(ctx, summary.subtitle, INNER);
  return {
    gap: 48,
    height: 76 + 14 + lines.length * 46,
    draw(ctx, top) {
      ctx.textBaseline = 'top';
      ctx.fillStyle = COLOR.text;
      ctx.font = font(64, true);
      ctx.fillText(summary.title, PAD, top);
      ctx.fillStyle = COLOR.muted;
      ctx.font = font(34);
      for (const [i, line] of lines.entries()) ctx.fillText(line, PAD, top + 90 + i * 46);
    },
  };
}

/** Zu zweit: beide Plätze nebeneinander – wer gewinnt, links, erleuchtet und mit vollem Farbring */
function duel(summary: ResultSummary): Block {
  return {
    gap: 52,
    height: 470,
    draw(ctx, top) {
      summary.order.forEach((player, i) => {
        const won = i === 0 || summary.tie;
        const x = PAD + INNER * (i === 0 ? 0.25 : 0.75);
        const color = playerColor(player);
        ctx.save();
        ctx.globalAlpha = won ? 1 : 0.72;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (won) {
          ctx.font = font(28, true);
          const label = 'erleuchtet';
          const labelWidth = ctx.measureText(label).width;
          const eyeWidth = (EYE.width / EYE.height) * 30;
          const start = x - (eyeWidth + 10 + labelWidth) / 2;
          drawEye(ctx, start, top + 7, 30, color);
          ctx.textAlign = 'left';
          ctx.fillStyle = color;
          ctx.fillText(label, start + eyeWidth + 10, top + 22);
          ctx.textAlign = 'center';
        }
        const cy = top + 56 + 92;
        drawAvatar(ctx, player, x, cy, 78, color, won);
        ctx.fillStyle = COLOR.text;
        ctx.font = font(40, true);
        ctx.fillText(ellipsize(ctx, player.name, INNER / 2 - 40), x, cy + 92 + 44);
        ctx.fillStyle = color;
        ctx.font = font(120, true);
        ctx.fillText(String(player.points), x, cy + 92 + 44 + 96);
        ctx.fillStyle = COLOR.muted;
        ctx.font = font(30);
        ctx.fillText(`${pointWord(player.points)} · 13 × ${player.combos}`, x, cy + 92 + 44 + 176);
        ctx.restore();
      });
      ctx.fillStyle = COLOR.muted;
      ctx.font = font(30);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('gegen', WIDTH / 2, top + 148);
    },
  };
}

/** Allein: heute und Bestwert als zwei Balken, der bessere grün */
function soloBest(summary: ResultSummary): Block {
  const comparison = summary.comparison;
  return {
    gap: 44,
    height: comparison?.fewerIsBetter ? 172 : 128,
    draw(ctx, top) {
      if (!comparison) return;
      const { today, best, unit, fewerIsBetter } = comparison;
      const todayWins = fewerIsBetter ? today < best : today > best;
      const rows = [
        { label: 'Heute', value: today, better: todayWins },
        { label: 'Bestwert', value: best, better: !todayWins && today !== best },
      ];
      const most = Math.max(today, best, 1);
      const trackX = PAD + 190;
      const trackWidth = INNER - 190 - 230;
      ctx.textBaseline = 'middle';
      rows.forEach((row, i) => {
        const y = top + 32 + i * 64;
        ctx.fillStyle = COLOR.muted;
        ctx.font = font(32, true);
        ctx.textAlign = 'left';
        ctx.fillText(row.label, PAD, y);
        roundRect(ctx, trackX, y - 10, trackWidth, 20, 10);
        ctx.fillStyle = COLOR.surface;
        ctx.fill();
        roundRect(ctx, trackX, y - 10, Math.max(20, (row.value / most) * trackWidth), 20, 10);
        ctx.fillStyle = row.better ? COLOR.ok : 'rgba(232, 234, 239, 0.4)';
        ctx.fill();
        ctx.fillStyle = COLOR.text;
        ctx.textAlign = 'right';
        ctx.fillText(`${row.value} ${unit}`, WIDTH - PAD, y);
      });
      if (fewerIsBetter) {
        ctx.fillStyle = COLOR.muted;
        ctx.font = font(26);
        ctx.textAlign = 'left';
        ctx.fillText('Weniger Züge sind besser.', PAD, top + 32 + 2 * 64 + 4);
      }
    },
  };
}

/** Der Verlauf: Punkte nach jedem Zug, je Person in ihrer Farbe, darüber sein Satz */
function chart(ctx: Ctx, game: GameState, summary: ResultSummary): Block {
  ctx.font = font(30);
  const caption = wrap(ctx, `Verlauf · ${summary.caption}`, INNER - 2 * BOX);
  const chartHeight = 240;
  const captionHeight = caption.length * 40;
  return {
    gap: 44,
    height: BOX + captionHeight + 24 + chartHeight + BOX,
    draw(ctx, top) {
      roundRect(ctx, PAD, top, INNER, BOX + captionHeight + 24 + chartHeight + BOX, 28);
      ctx.fillStyle = COLOR.surface;
      ctx.fill();
      ctx.fillStyle = COLOR.muted;
      ctx.font = font(30);
      ctx.textBaseline = 'top';
      for (const [i, line] of caption.entries()) ctx.fillText(line, PAD + BOX, top + BOX + i * 40);

      const left = PAD + BOX;
      const width = INNER - 2 * BOX;
      const chartTop = top + BOX + captionHeight + 24;
      const { history, goal } = summary;
      const most = Math.max(1, goal ?? 0, ...history.flat());
      const x = (i: number): number => left + (history.length > 1 ? (i / (history.length - 1)) * width : 0);
      const y = (points: number): number => chartTop + chartHeight - 6 - (points / most) * (chartHeight - 12);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = COLOR.line;
      ctx.lineWidth = 2;
      line(ctx, left, y(0), left + width, y(0));
      if (goal !== null) {
        ctx.setLineDash([12, 12]);
        ctx.strokeStyle = COLOR.muted;
        line(ctx, left, y(goal), left + width, y(goal));
        ctx.setLineDash([]);
      }
      game.players.forEach((player, seat) => {
        ctx.strokeStyle = playerColor(player);
        ctx.lineWidth = seat === summary.winnerIndex && !summary.tie ? 8 : 5;
        ctx.beginPath();
        history.forEach((points, i) => {
          const px = x(i);
          const py = y(points[seat] ?? 0);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      });
    },
  };
}

/** Womit gespielt wurde: die vier Stapel mit ihrer Regel zu Spielbeginn, darunter die Varianten */
function piles(ctx: Ctx, summary: ResultSummary): Block {
  ctx.font = font(30);
  const variants =
    summary.variants.length > 0
      ? wrap(ctx, `Varianten: ${summary.variants.join(' · ')}`, INNER - 2 * BOX)
      : [];
  const variantsHeight = variants.length > 0 ? 24 + variants.length * 40 : 0;
  const height = BOX + 40 + 20 + 120 + variantsHeight + BOX;
  return {
    gap: 28,
    height,
    draw(ctx, top) {
      roundRect(ctx, PAD, top, INNER, height, 28);
      ctx.fillStyle = COLOR.surface;
      ctx.fill();
      ctx.textBaseline = 'top';
      ctx.fillStyle = COLOR.muted;
      ctx.font = font(30, true);
      ctx.fillText('Stapel zu Spielbeginn', PAD + BOX, top + BOX);

      const column = (INNER - 2 * BOX) / summary.rules.length;
      const rowTop = top + BOX + 40 + 20;
      summary.rules.forEach(({ suit, short }, i) => {
        const cx = PAD + BOX + column * i + column / 2;
        drawSuit(ctx, suit, cx - 28, rowTop, 56);
        ctx.fillStyle = COLOR.text;
        ctx.font = font(34, true);
        ctx.textAlign = 'center';
        ctx.fillText(short, cx, rowTop + 74);
      });

      ctx.textAlign = 'left';
      ctx.fillStyle = COLOR.muted;
      ctx.font = font(30);
      for (const [i, text] of variants.entries()) ctx.fillText(text, PAD + BOX, rowTop + 120 + 24 + i * 40);
    },
  };
}

function footer(): Block {
  return {
    gap: 40,
    height: 40,
    draw(ctx, top) {
      ctx.fillStyle = COLOR.muted;
      ctx.font = font(30);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const address = PUBLIC_URL.replace(/^https:\/\//, '').replace(/\/$/, '');
      ctx.fillText(`Selbst spielen: ${address}`, WIDTH / 2, top);
    },
  };
}

/* ---------- Zeichenhilfen ---------- */

/** Das Auge in der Pyramide, `height` hoch, oben links bei (x, y) */
function drawEye(ctx: Ctx, x: number, y: number, height: number, color: string): void {
  const scale = height / EYE.height;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const part of [EYE.pyramid, EYE.eye, EYE.rays]) {
    ctx.lineWidth = part.stroke;
    ctx.stroke(new Path2D(part.d));
  }
  ctx.beginPath();
  ctx.arc(EYE.pupil.cx, EYE.pupil.cy, EYE.pupil.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Ein Farbsymbol, `size` groß, oben links bei (x, y) */
function drawSuit(ctx: Ctx, suit: SuitIndex, x: number, y: number, size: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = COLOR.suits[suit];
  for (const d of SUIT_SHAPES[suit]) ctx.fill(new Path2D(d));
  ctx.restore();
}

/** Avatar wie in der App: Initialen auf der Farbe des Namens (der Computer: das Auge), mit Ring in der Spielerfarbe */
function drawAvatar(
  ctx: Ctx,
  player: Player,
  cx: number,
  cy: number,
  r: number,
  color: string,
  won: boolean,
): void {
  ctx.beginPath();
  ctx.arc(cx, cy, r + (won ? 16 : 12), 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = won ? 10 : 4;
  ctx.globalAlpha *= won ? 1 : 0.6;
  ctx.stroke();
  ctx.globalAlpha /= won ? 1 : 0.6;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = player.cpu ? COLOR.text : `hsl(${hueFor(player.name)} 45% 40%)`;
  ctx.fill();
  if (player.cpu) {
    const height = r * 1.1;
    drawEye(ctx, cx - (EYE.width / EYE.height) * height * 0.5, cy - height * 0.55, height, COLOR.bg);
    return;
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = font(r * 0.8, true);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials(player.name), cx, cy + 2);
}

function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/** Rechteck mit runden Ecken als Pfad (nicht jeder Browser kennt ctx.roundRect) */
function roundRect(ctx: Ctx, x: number, y: number, width: number, height: number, radius: number): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

/** Bricht Text in Zeilen um, die höchstens `width` breit sind (mit der gerade gesetzten Schrift) */
function wrap(ctx: Ctx, text: string, width: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(' ')) {
    const next = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(next).width > width) {
      lines.push(current);
      current = word;
    } else current = next;
  }
  if (current) lines.push(current);
  return lines;
}

/** Kürzt Text mit „…“, bis er höchstens `width` breit ist */
function ellipsize(ctx: Ctx, text: string, width: number): string {
  if (ctx.measureText(text).width <= width) return text;
  let shorter = text;
  while (shorter.length > 1 && ctx.measureText(`${shorter}…`).width > width) shorter = shorter.slice(0, -1);
  return `${shorter}…`;
}
