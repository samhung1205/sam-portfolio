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

import { readFileSync, writeFileSync, readdirSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadNavConfig, renderPage, parsePageSource, SRC } from "./lib/layout.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");

const nav = loadNavConfig();
const pagesDir = join(SRC, "pages");

/* 子目錄頁面（例：_src/pages/case-studies/yolo-system.html →
   case-studies/yolo-system.html）。pathPrefix 由相對路徑的深度推導，跟
   sync-notion.mjs 對 articles/ 用 "../" 是同一套規則；verify 的
   checkNavConfig / checkStructuralHtml 本來就照檔案自身位置解析深度與
   相對連結，所以不需要為此改動任何驗證邏輯。 */
function collectPages(dir, base = dir, acc = []) {
  for (const name of readdirSync(dir).sort()) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) collectPages(abs, base, acc);
    else if (name.endsWith(".html")) acc.push(relative(base, abs).split(sep).join("/"));
  }
  return acc;
}
const sources = collectPages(pagesDir);

let changed = 0;
const results = [];

for (const file of sources) {
  const { meta, content } = parsePageSource(readFileSync(join(pagesDir, file), "utf8"));
  const depth = file.split("/").length - 1;
  const html = renderPage({ ...meta, pathPrefix: "../".repeat(depth), content }, nav);
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

  if (!checkOnly && !identical) {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, html);
  }
}

const label = checkOnly ? "check" : "build";
for (const r of results) {
  const state = r.identical ? "identical" : r.existed ? (checkOnly ? "DIFFERS" : "rewritten") : "created";
  console.log(`  ${r.file.padEnd(32)} ${String(r.bytes).padStart(6)} B  ${state}`);
}
console.log(`${label}: ${results.length} pages, ${changed} changed`);

if (checkOnly && changed > 0) process.exit(1);
