#!/usr/bin/env node
/* =========================================================
   verify.mjs — Commit 3：正式的迴歸驗證閘門
   ---------------------------------------------------------
   npm run verify         本機 / CI 都可跑，任何一項失敗就 exit 1。
   不含 Notion fixture 驗證（見 npm run verify:fixture / scripts/verify-fixture.mjs）。

   涵蓋範圍（對應 Commit 3 規劃的 A-F、H；G 另見 verify-fixture.mjs）：
     A. _src/pages/*.html 與根目錄產物是否同步（沿用 build.mjs --check）
     B. 共用頁面殼層是否仍只有一個來源（scripts/lib/layout.mjs）
     C. 導覽項目是否與 _src/config/nav.json 一致
     D. css/style.css、css/article.css 的色彩 token 紀律
     E. _src/config/contrast.json 宣告的 WCAG 對比基準線
     F. 結構性 HTML 檢查（title/description/main/h1/aria-controls/內部連結）
     G. canonical / Open Graph / Twitter Card / robots / sitemap
     H. 文章行動裝置換行修正（overflow-wrap）不回歸
     I. 產生頁（articles.html / articles/*.html）殼層是否為最新版本
   ========================================================= */

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkStructuralHtml,
  checkNavConfig,
  checkSharedShellIntegrity,
  checkColorTokenDiscipline,
  checkContrast,
  checkArticleRobustness,
  checkShellFreshness,
  checkSeoFiles,
} from "./lib/checks.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// 用檔案系統掃描而非 `git ls-files`：在 CI 的 sync-notion.yml 裡，verify 是接在
// npm run sync 之後、commit 之前跑的——這時候新文章的 .html 檔還沒 git add，
// 是 untracked 狀態。git ls-files 只看已追蹤的檔案會漏掉它們，等於新文章完全
// 沒被驗證到就發布出去；改用真正的檔案系統掃描才能反映「即將發布的內容」。
const EXCLUDE_DIRS = new Set([".git", "node_modules", "_src", "design-system", ".impeccable", ".codex", ".claude", ".github"]);

function walkFiles(dir, matchExt, base = dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (EXCLUDE_DIRS.has(name)) continue;
    const abs = join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) walkFiles(abs, matchExt, base, acc);
    else if (matchExt.test(name)) acc.push(relative(base, abs));
  }
  return acc;
}

const findings = [];

function run(label, fn) {
  try {
    findings.push(...fn());
  } catch (err) {
    findings.push({ file: "(verify.mjs)", line: null, message: `[${label}] 執行檢查時拋出例外：${err.message}` });
  }
}

// A. build drift — 沿用既有的 build.mjs --check，不重新實作 render 邏輯
run("A. build drift", () => {
  try {
    execFileSync("node", [join(ROOT, "scripts", "build.mjs"), "--check"], { cwd: ROOT, stdio: "pipe" });
    return [];
  } catch (err) {
    const output = ((err.stdout && err.stdout.toString()) || "") + ((err.stderr && err.stderr.toString()) || "");
    return [
      {
        file: "(build:check)",
        line: null,
        message: `_src/pages/*.html 產出的內容與根目錄現有頁面不一致：\n${output.trim()}`,
      },
    ];
  }
});

const allFiles = walkFiles(ROOT, /\.(html|mjs|js)$/i);
const htmlFiles = allFiles.filter((f) => /\.html$/i.test(f));
const scriptFiles = allFiles.filter((f) => /^scripts\//.test(f) && /\.(mjs|js)$/i.test(f));
const nav = JSON.parse(readFileSync(join(ROOT, "_src", "config", "nav.json"), "utf8"));
const contrastConfig = JSON.parse(readFileSync(join(ROOT, "_src", "config", "contrast.json"), "utf8"));

run("B. shared-shell integrity", () =>
  checkSharedShellIntegrity(ROOT, scriptFiles, ["scripts/lib/checks.mjs", "scripts/verify.mjs", "scripts/verify-fixture.mjs"])
);
run("C. navigation config", () => checkNavConfig(ROOT, htmlFiles, nav));
run("D. color token discipline", () => checkColorTokenDiscipline(ROOT, ["css/style.css", "css/article.css"]));
run("E. contrast", () => checkContrast(ROOT, "css/style.css", contrastConfig));
run("F. structural HTML", () => checkStructuralHtml(ROOT, htmlFiles));
run("G. SEO discovery", () => checkSeoFiles(ROOT));
run("H. article robustness", () => checkArticleRobustness(ROOT));
run("I. shell freshness", () => checkShellFreshness(ROOT, htmlFiles));

if (findings.length === 0) {
  console.log(`verify: 全數通過（${htmlFiles.length} 個 HTML 頁面、${scriptFiles.length} 個 script 來源檔）`);
  process.exit(0);
}

console.error(`verify: 發現 ${findings.length} 項問題\n`);
for (const f of findings) {
  const loc = f.line ? `${f.file}:${f.line}` : f.file;
  console.error(`  ✗ ${loc}\n    ${f.message}\n`);
}
process.exit(1);
