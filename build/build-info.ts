import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import type { BuildInfo } from '../src/build.ts';

/** Ein git-Befehl; ohne git (oder außerhalb des Repos) bleibt es leer. */
function git(command: string): string {
  try {
    return execSync(`git ${command}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

/**
 * Woran man einen Build wiedererkennt: Version aus package.json, Commit, ob es lokale Änderungen gab, und
 * wann gebaut wurde. Landet über `define` als `__BUILD__` im Code – siehe src/build.ts.
 */
export function buildInfo(): BuildInfo {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version?: string };
  return {
    version: pkg.version ?? '0.0.0',
    commit: git('rev-parse --short HEAD') || 'unbekannt',
    dirty: git('status --porcelain') !== '',
    date: new Date().toISOString(),
  };
}
