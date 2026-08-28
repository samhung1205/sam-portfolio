#!/usr/bin/env node
/* =========================================================
   regen-article-shell.mjs — 只換殼層，不動文章內容（Phase 4B.3）
   ---------------------------------------------------------
   articles.html / articles/*.html 是 sync-notion.mjs 產生的，正常只有
   手動跑 sync（會打 Notion API，可能改內容、可能經 R2）才會重新產出。
   但殼層（nav/head/footer）改版時，這些檔案不會跟著自動更新——
   Phase 4B.2 導覽 hotfix 就漏掉了它們，殼層停在 Contact CTA 加入之前
   的版本，CI 卻因為沒有對應檢查而完全沒發現。

   這支腳本不呼叫 Notion、不連網路、不碰 R2：直接從「已提交」的檔案裡
   逐位元組抽出 <main>...</main> 內容、<title>、<meta description>、
   sync banner 註解——也就是 sync-notion.mjs 當初傳給 pageShell() 的
   那幾個參數——原封不動地餵回「現在」的 renderPage()，只讓殼層本身
   換成最新版，文章內容（含所有 Notion 轉換出來的 HTML）逐位元組不變。

   用法：node scripts/regen-article-shell.mjs
   ========================================================= */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderPage, loadNavConfig } from "./lib/layout.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const nav = loadNavConfig();
const EXTRA_CSS = ["css/article.css"];

function extractShellInputs(html, file) {
  const titleM = html.match(/<title>([\s\S]*?)<\/title>/);
  const descM = html.match(/<meta name="description" content="([^"]*)" \/>/);
  const mainM = html.match(/<main>\n([\s\S]*?)\n {2}<\/main>/);
  const bannerM = html.match(/<body>\n([^\n]*)\n {2}<header class="nav">/);
  if (!titleM || !descM || !mainM || !bannerM) {
    throw new Error(
      `${file}：無法從既有殼層抽出 title/description/main/banner，格式可能已經跟預期不同，需要人工確認`
    );
  }
  return { title: titleM[1], description: descM[1], main: mainM[1], banner: bannerM[1] };
}

function regen(absPath, relPath, pathPrefix) {
  const before = readFileSync(absPath, "utf8");
  const { title, description, main, banner } = extractShellInputs(before, relPath);
  const after = renderPage(
    { title, description, pathPrefix, extraCss: EXTRA_CSS, banner, content: main },
    nav
  );
  writeFileSync(absPath, after);
  console.log(`  ${relPath}  已換殼（文章內容未變動）`);
}

regen(join(ROOT, "articles.html"), "articles.html", "");
for (const f of readdirSync(join(ROOT, "articles")).filter((f) => f.endsWith(".html"))) {
  regen(join(ROOT, "articles", f), `articles/${f}`, "../");
}
console.log("完成。");
