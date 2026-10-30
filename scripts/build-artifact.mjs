// Erzeugt aus dist/index.html die Fassung für ein Claude-Artifact: dist/artifact.html.
// Ein Artifact bettet die Seite selbst in ein Grundgerüst (doctype, head, body mit charset und viewport) ein,
// daher kommen hier nur Titel, Meta-Angaben, Schriften, Styles, Markup und Skript hinein – der Titel ganz vorne.
import { readFileSync, writeFileSync } from 'node:fs';

const source = readFileSync('dist/index.html', 'utf8');
const head = /<head>([\s\S]*?)<\/head>/i.exec(source)?.[1] ?? '';
const body = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(source)?.[1] ?? '';

// Skripte zuerst herauslösen, damit der restliche Kopf nicht im eingebetteten Code gesucht wird
const scripts = head.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) ?? [];
const rest = head.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
const all = (pattern) => rest.match(pattern) ?? [];

const parts = [
  ...all(/<title>[\s\S]*?<\/title>/gi),
  ...all(/<meta\b[^>]*>/gi).filter((tag) => !/charset|name="viewport"/i.test(tag)),
  // ein Artifact hat sein eigenes Symbol – das Favicon der Einzeldatei braucht es nicht
  ...all(/<link\b[^>]*>/gi).filter((tag) => !/rel="icon"/i.test(tag)),
  ...all(/<style\b[^>]*>[\s\S]*?<\/style>/gi),
  body.trim(),
  ...scripts,
];

writeFileSync('dist/artifact.html', `${parts.join('\n')}\n`);
console.log('dist/artifact.html geschrieben');
