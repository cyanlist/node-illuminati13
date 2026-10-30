/** Raum-Codes: kurz, gut anzusagen und abzutippen. */

/** Ohne 0/O, 1/I/L – lässt sich ansagen und abtippen, ohne zu raten */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 5;

/** Ein neuer Raum-Code, z. B. „K7M4X“. */
export function newRoomCode(random: () => number = Math.random): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) code += ALPHABET[Math.floor(random() * ALPHABET.length)];
  return code;
}

const PATTERN = new RegExp(`^[${ALPHABET}]{${ROOM_CODE_LENGTH}}$`);

/** Raum-Code aus einer Eingabe – Groß-/Kleinschreibung und Leerzeichen egal; null, wenn es keiner ist. */
export function normalizeRoomCode(text: string): string | null {
  const code = text.replace(/[\s-]/g, '').toUpperCase();
  return PATTERN.test(code) ? code : null;
}
