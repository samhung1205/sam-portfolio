#!/usr/bin/env node
/* =========================================================
   build.mjs — 由 _src/pages/ 產生站台根目錄的 HTML
   ---------------------------------------------------------
   用法：
     node scripts/build.mjs            產生並寫入
     node scripts/build.mjs --check    只比對，不寫入；有差異則 exit 1

   注意：
   - 產物（index.html 等）需 commit，GitHub Pages 由分支根目錄直接發布。
   - _src/ 以底線開頭，Jekyll 會排除，不會被發布（已於 c408d9e 實測）。
   - articles.html / articles/*.html 由 scripts/sync-notion.mjs 產生，
     本腳本不碰。
   ========================================================= */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadNavConfig, renderPage, parsePageSource, SRC } from "./lib/layout.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");

const nav = loadNavConfig();
const pagesDir = join(SRC, "pages");
const sources = readdirSync(pagesDir).filter((f) => f.endsWith(".html")).sort();

let changed = 0;
const results = [];

for (const file of sources) {
  const { meta, content } = parsePageSource(readFileSync(join(pagesDir, file), "utf8"));
  const html = renderPage({ ...meta, content }, nav);
  const target = join(ROOT, file);

  let previous = null;
  try {
    previous = readFileSync(target, "utf8");
  } catch {
    /* 新檔案 */
  }

  const identical = previous === html;
  if (!identical) changed++;
  results.push({ file, identical, existed: previous !== null, bytes: Buffer.byteLength(html) });

  if (!checkOnly && !identical) writeFileSync(target, html);
}

const label = checkOnly ? "check" : "build";
for (const r of results) {
  const state = r.identical ? "identical" : r.existed ? (checkOnly ? "DIFFERS" : "rewritten") : "created";
  console.log(`  ${r.file.padEnd(16)} ${String(r.bytes).padStart(6)} B  ${state}`);
}
console.log(`${label}: ${results.length} pages, ${changed} changed`);

if (checkOnly && changed > 0) process.exit(1);
