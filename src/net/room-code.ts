/** Raum-Codes: kurz, gut anzusagen und abzutippen. */
import type { Rng } from '../core/cards';

/** Ohne 0/O, 1/I/L – lässt sich ansagen und abtippen, ohne zu raten */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const LENGTH = 5;
const PATTERN = new RegExp(`^[${ALPHABET}]{${LENGTH}}$`);

/** Ein neuer Raum-Code, z. B. „K7M4X“. */
export function newRoomCode(rng: Rng = Math.random): string {
  let code = '';
  for (let i = 0; i < LENGTH; i++) code += ALPHABET[Math.floor(rng() * ALPHABET.length)];
  return code;
}

/** Raum-Code aus einer Eingabe – Groß-/Kleinschreibung und Leerzeichen egal; null, wenn es keiner ist. */
export function normalizeRoomCode(text: string): string | null {
  const code = text.replace(/[\s-]/g, '').toUpperCase();
  return PATTERN.test(code) ? code : null;
}
