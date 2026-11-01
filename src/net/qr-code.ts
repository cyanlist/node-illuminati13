/** QR-Codes zeigen: aus einem Text die dunklen Kästchen als SVG-Pfad. */
import qrcode from 'qrcode-generator';

export interface QrMatrix {
  /** Kantenlänge in Modulen (Kästchen) */
  size: number;
  /** SVG-Pfad aller dunklen Module, ein Modul = 1 × 1 */
  path: string;
}

/** Macht aus einem Text einen QR-Code. Fehlerkorrektur M: verträgt Spiegelungen und leichte Unschärfe. */
export function qrMatrix(text: string): QrMatrix {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const size = qr.getModuleCount();
  let path = '';
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (qr.isDark(row, col)) path += `M${col} ${row}h1v1h-1z`;
    }
  }
  return { size, path };
}
