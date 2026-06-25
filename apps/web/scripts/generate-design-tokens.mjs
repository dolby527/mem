#!/usr/bin/env node
/**
 * Parse docs/DESIGN.md token tables → src/styles/generated/tokens.ts
 * Run: pnpm --filter @mem/web tokens
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = join(__dirname, "..");
const DESIGN_MD = join(WEB_ROOT, "../../docs/DESIGN.md");
const OUT_DIR = join(WEB_ROOT, "src/styles/generated");
const OUT_FILE = join(OUT_DIR, "tokens.ts");

function parseTokenTables(md) {
  const tokens = {};
  const sectionRe = /^### ([a-zA-Z]+)\s*$/gm;
  const matches = [...md.matchAll(sectionRe)];

  for (let i = 0; i < matches.length; i++) {
    const group = matches[i][1];
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : md.length;
    const block = md.slice(start, end);

    if (!block.includes("| token | value |")) continue;

    tokens[group] = {};
    for (const line of block.split("\n")) {
      const row = line.match(/^\|\s*([a-zA-Z0-9]+)\s*\|\s*(.+?)\s*\|$/);
      if (!row || row[1] === "token") continue;
      tokens[group][row[1]] = row[2];
    }
  }

  return tokens;
}

function isIdent(key) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key);
}

function emitObject(obj, indent = 2) {
  const pad = " ".repeat(indent);
  const lines = Object.entries(obj).map(([key, value]) => {
    const k = isIdent(key) ? key : JSON.stringify(key);
    const v =
      typeof value === "object" && value !== null
        ? emitObject(value, indent + 2)
        : JSON.stringify(value);
    return `${pad}${k}: ${v}`;
  });
  return `{\n${lines.join(",\n")}\n${" ".repeat(indent - 2)}}`;
}

function emitTs(tokens) {
  return `/* eslint-disable */
// AUTO-GENERATED — do not edit. Source: docs/DESIGN.md
// Regenerate: pnpm --filter @mem/web tokens

export const tokens = ${emitObject(tokens)} as const;

export type DesignTokens = typeof tokens;
`;
}

const md = readFileSync(DESIGN_MD, "utf8");
const designStart = md.indexOf("## Design tokens");
if (designStart === -1) {
  console.error("DESIGN.md: missing '## Design tokens' section");
  process.exit(1);
}

// Stop at the next ## heading — avoid IA/component tables (invalid CSS values).
const nextSection = md.indexOf("\n## ", designStart + 1);
const designSection =
  nextSection === -1 ? md.slice(designStart) : md.slice(designStart, nextSection);

const tokens = parseTokenTables(designSection);
const groups = Object.keys(tokens);
if (groups.length === 0) {
  console.error("DESIGN.md: no token tables found");
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, emitTs(tokens));
console.log(`Generated ${OUT_FILE} (${groups.join(", ")})`);
