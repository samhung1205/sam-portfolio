#!/usr/bin/env node
/* =========================================================
   regen-articles.mjs — 用目前的模板重新產生文章頁，但不動文章內容
   （Phase 4B.3 起，Phase 4F 擴充）
   ---------------------------------------------------------
   articles.html / articles/*.html 是 sync-notion.mjs 產生的，正常只有
   手動跑 sync（會打 Notion API、可能改內容、可能經 R2）才會重新產出。
   但殼層（nav/head/footer）或列表／文章頁的「模板外框」改版時，這些
   已提交的檔案不會自動跟上——Phase 4B.2 的導覽 hotfix 就漏掉它們。

   這支腳本不呼叫 Notion、不連網路、不碰 R2：從「已提交」的檔案裡把
   sync-notion.mjs 當初餵給模板的那些欄位原封不動抽回來——
     文章頁：title / date / tags / <article class="article-body"> 內容
     列表頁：每篇的 slug / title / date / tags / summary
   再交給「現在」的 listingPageHtml() / articlePageHtml() 重新輸出。
   Notion 轉出來的 HTML（a.html）逐位元組不變，只有模板外框與殼層換新。

   用法：node scripts/regen-articles.mjs
   ========================================================= */

import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { listingPageHtml, articlePageHtml } from "./sync-notion.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** 從已提交的文章頁抽回 sync-notion.mjs 當初的輸入欄位。 */
function readArticle(slug) {
  const rel = `articles/${slug}.html`;
  const html = readFileSync(join(ROOT, rel), "utf8");

  const title = html.match(/<h1 class="article-title">([\s\S]*?)<\/h1>/);
  const date = html.match(/<i class="fa-regular fa-calendar"[^>]*><\/i>\s*([^<]*?)\s*<\/span>/);
  const body = html.match(/<article class="article-body">\n([\s\S]*?)\n {8}<\/article>/);
  if (!title || !date || !body) {
    throw new Error(`${rel}：抽不出 title/date/body，格式與預期不同，需人工確認`);
  }
  const tagBlock = html.match(/<span class="tag-list">([\s\S]*?)<\/span>\s*<\/div>/);
  const tags = tagBlock ? [...tagBlock[1].matchAll(/<span class="tag">([^<]*)<\/span>/g)].map((m) => m[1]) : [];

  return { slug, title: title[1], date: date[1], tags, html: body[1] };
}

/** 列表頁只有 summary 是文章頁沒有的，從已提交的 articles.html 抽回來。 */
function readSummaries() {
  const html = readFileSync(join(ROOT, "articles.html"), "utf8");
  const out = new Map();
  // 新版列表（.article-item）與舊版卡片（.card）兩種格式都要能讀，
  // 這支腳本才能在模板改版前後都跑得動。
  for (const m of html.matchAll(
    /<a href="articles\/([^"]+)\.html">[\s\S]*?<\/h3>\s*(?:<p class="(?:card__summary|article-item__summary)">([\s\S]*?)<\/p>)?/g
  )) {
    if (!out.has(m[1])) out.set(m[1], (m[2] || "").trim());
  }
  return out;
}

const articlesDir = join(ROOT, "articles");
const slugs = existsSync(articlesDir)
  ? readdirSync(articlesDir)
      .filter((f) => f.endsWith(".html"))
      .map((f) => f.replace(/\.html$/, ""))
      .sort()
  : [];

const summaries = readSummaries();
const articles = slugs.map((slug) => ({ ...readArticle(slug), summary: summaries.get(slug) || "" }));
articles.sort((x, y) => (y.date || "").localeCompare(x.date || ""));

for (const a of articles) {
  const before = readFileSync(join(ROOT, `articles/${a.slug}.html`), "utf8");
  const after = articlePageHtml(a);
  writeFileSync(join(ROOT, `articles/${a.slug}.html`), after);
  const beforeBody = before.match(/<article class="article-body">\n([\s\S]*?)\n {8}<\/article>/)[1];
  const afterBody = after.match(/<article class="article-body">\n([\s\S]*?)\n {8}<\/article>/)[1];
  if (beforeBody !== afterBody) throw new Error(`${a.slug}：文章內容在重產後被改動了，已中止`);
  console.log(`  articles/${a.slug}.html  已重產（內容逐位元組未變）`);
}

writeFileSync(join(ROOT, "articles.html"), listingPageHtml(articles));
console.log(`  articles.html  已重產（${articles.length} 篇）`);
console.log("完成。");
