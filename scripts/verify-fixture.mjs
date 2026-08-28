#!/usr/bin/env node
/* =========================================================
   verify-fixture.mjs — Commit 3：安全的 Notion fixture 驗證（G）
   ---------------------------------------------------------
   背景：npm run sync:fixture 曾經直接對著 repo 工作目錄跑，
   刪掉並覆寫了真實的 articles/。這支腳本改成：

     1. 先對 production articles/ + articles.html 拍一份內容快照（hash）。
     2. 用 SYNC_OUT_DIR 環境變數，把 sync-notion.mjs --fixture 的「輸出」
        導去一個 mkdtemp 建立的隔離暫存目錄（真正的 Notion→HTML pipeline
        與共用 renderPage() 完全不變，只是寫入位置不同）。
     3. 對暫存目錄裡的產物跑跟 verify.mjs 一樣的結構性檢查，並額外驗證
        articles/*.html 的 ../ path-prefix 行為正確。
     4. 跑完（不論成功或失敗）都清掉暫存目錄，並重新對 production
        articles/ + articles.html 拍一次快照——兩次 hash 不同就視為
        致命錯誤（production 被動到了），不論前面的檢查是否通過都 exit 1。

   npm run verify:fixture
   ========================================================= */

import { mkdtempSync, rmSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { checkStructuralHtml, checkArticleRobustness } from "./lib/checks.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROD_ARTICLES_DIR = join(ROOT, "articles");
const PROD_LISTING = join(ROOT, "articles.html");

function snapshotHash() {
  const h = createHash("sha256");
  const names = existsSync(PROD_ARTICLES_DIR)
    ? readdirSync(PROD_ARTICLES_DIR).filter((f) => f.endsWith(".html")).sort()
    : [];
  h.update(names.join("\n"));
  for (const n of names) h.update(readFileSync(join(PROD_ARTICLES_DIR, n)));
  h.update(existsSync(PROD_LISTING) ? readFileSync(PROD_LISTING) : Buffer.from("<missing>"));
  return h.digest("hex");
}

const beforeHash = snapshotHash();
const tmp = mkdtempSync(join(tmpdir(), "sam-portfolio-fixture-"));

let ok = true;
let failReason = "";
const notes = [];

try {
  execFileSync("node", [join(ROOT, "scripts", "sync-notion.mjs"), "--fixture"], {
    cwd: ROOT,
    env: { ...process.env, SYNC_OUT_DIR: tmp },
    stdio: "pipe",
  });

  const listingPath = join(tmp, "articles.html");
  const articlesDir = join(tmp, "articles");
  if (!existsSync(listingPath)) throw new Error("fixture 未產生 articles.html");
  if (!existsSync(articlesDir)) throw new Error("fixture 未產生 articles/ 目錄");

  const generated = readdirSync(articlesDir).filter((f) => f.endsWith(".html"));
  if (generated.length === 0) throw new Error("fixture 未產生任何文章頁");

  const listingHtml = readFileSync(listingPath, "utf8");
  for (const f of generated) {
    const slug = f.replace(/\.html$/, "");
    if (!listingHtml.includes(`articles/${slug}.html`)) {
      throw new Error(`articles.html 未連結到 fixture 產生的文章：${f}`);
    }
    const articleHtml = readFileSync(join(articlesDir, f), "utf8");
    // css/style.css 現在帶 ?v=<BUILD_VERSION> 快取破棄字串（Phase 4A hotfix），
    // 所以用「開頭字串」比對而非完整相等比對；../index.html 是頁面導覽連結，
    // 不是靜態資源，維持完整比對。
    if (!articleHtml.includes('href="../index.html"') || !articleHtml.includes('href="../css/style.css?v=')) {
      throw new Error(`${f} 缺少預期的 ../ path-prefix 導覽/樣式連結`);
    }
  }

  // 重用 verify.mjs 的結構性檢查與換行回歸檢查，跑在暫存目錄的相對路徑上，
  // 確保 fixture 走的是同一套 renderPage() + 共用 CSS 規則，而不是另一套邏輯。
  // fixture 暫存目錄只materialize了 articles 相關產物，不含整站（css/js/assets/
  // 其他頁面），所以內部連結是否「在磁碟上存在」這條規則在這裡不適用；
  // ../ path-prefix 是否正確已經在上面用字串比對驗證過了。
  const relHtml = ["articles.html", ...generated.map((f) => `articles/${f}`)];
  const structuralFindings = checkStructuralHtml(tmp, relHtml, { checkLinks: false });
  if (structuralFindings.length) {
    throw new Error(
      `fixture 產物未通過結構性檢查：\n` + structuralFindings.map((f) => `  - ${f.file}: ${f.message}`).join("\n")
    );
  }
  // article robustness 檢查讀的是 repo 內的 css/article.css + sync-notion.mjs 原始碼，
  // 與輸出目錄無關，用真正的 ROOT 驗證即可。
  const robustnessFindings = checkArticleRobustness(ROOT);
  if (robustnessFindings.length) {
    throw new Error(
      `文章換行回歸檢查未通過：\n` + robustnessFindings.map((f) => `  - ${f.file}: ${f.message}`).join("\n")
    );
  }

  notes.push(`產生 ${generated.length} 篇文章頁 + articles.html，結構與 ../ path-prefix 皆正確。`);
} catch (err) {
  ok = false;
  const procOutput = ((err.stdout && err.stdout.toString()) || "") + ((err.stderr && err.stderr.toString()) || "");
  failReason = procOutput.trim() ? `${err.message}\n${procOutput.trim()}` : err.message || String(err);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

const afterHash = snapshotHash();
if (beforeHash !== afterHash) {
  console.error("verify:fixture: 致命 — production articles/ 或 articles.html 在 fixture 驗證期間被改動！");
  console.error("這代表 SYNC_OUT_DIR 隔離失效，必須先修好才能再跑一次。");
  process.exit(1);
}

if (!ok) {
  console.error(`verify:fixture 失敗：${failReason}`);
  console.error("（production articles/ 與 articles.html 已確認未受影響）");
  process.exit(1);
}

console.log("verify:fixture: 通過。" + notes.join(" "));
console.log("production articles/ 與 articles.html 位元組層級未變動。");
