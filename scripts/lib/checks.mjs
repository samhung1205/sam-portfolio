/* =========================================================
   checks.mjs — Commit 3：verify.mjs 與 verify-fixture.mjs 共用的檢查函式
   ---------------------------------------------------------
   每個 check* 函式回傳 finding 陣列：{ file, line, message }。
   不在這裡 process.exit；聚合與判斷 pass/fail 交給呼叫端（verify.mjs /
   verify-fixture.mjs），這裡只負責「掃出哪裡有問題」。
   ========================================================= */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

/* =====================================================
   F. 結構性 HTML 檢查
   ===================================================== */
export function checkStructuralHtml(rootDir, htmlRelPaths, options = {}) {
  const { checkLinks = true } = options;
  const findings = [];
  for (const rel of htmlRelPaths) {
    const abs = join(rootDir, rel);
    const html = readFileSync(abs, "utf8");

    const firstLine = html.split("\n").find((l) => l.trim() !== "");
    if (firstLine && firstLine.trim() === "---") {
      findings.push({ file: rel, line: 1, message: "檔案以 `---` 開頭，會被 Jekyll 誤判為 front matter" });
    }

    if (!/<title>[^<]+<\/title>/i.test(html)) {
      findings.push({ file: rel, line: null, message: "缺少非空的 <title>" });
    }
    if (!/<meta\s+name=["']description["']\s+content=["'][^"']+["']/i.test(html)) {
      findings.push({ file: rel, line: null, message: '缺少非空的 <meta name="description">' });
    }

    const mainOpens = [...html.matchAll(/<main\b/gi)];
    if (mainOpens.length !== 1) {
      findings.push({
        file: rel,
        line: mainOpens[0] ? lineOf(html, mainOpens[0].index) : null,
        message: `<main> 數量應為 1，實際 ${mainOpens.length}`,
      });
    } else {
      const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
      if (!mainMatch || !mainMatch[1].trim()) {
        findings.push({ file: rel, line: lineOf(html, mainOpens[0].index), message: "<main> 內容為空" });
      }
    }

    const h1s = [...html.matchAll(/<h1\b/gi)];
    if (h1s.length !== 1) {
      findings.push({
        file: rel,
        line: h1s[0] ? lineOf(html, h1s[0].index) : null,
        message: `<h1> 數量應為 1，實際 ${h1s.length}`,
      });
    }

    const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => m[1]));
    for (const m of html.matchAll(/\baria-controls=["']([^"']+)["']/g)) {
      if (!ids.has(m[1])) {
        findings.push({ file: rel, line: lineOf(html, m.index), message: `aria-controls="${m[1]}" 找不到對應的 id` });
      }
    }

    if (checkLinks) {
      for (const m of html.matchAll(/<(?:a|link|img|script)\b[^>]*\b(?:href|src)=["']([^"']+)["']/gi)) {
        const target = m[1];
        if (/^([a-z]+:)?\/\//i.test(target)) continue; // http(s):// 或 protocol-relative
        if (/^(mailto:|tel:|javascript:|data:|#)/i.test(target)) continue;
        const clean = target.split("#")[0].split("?")[0];
        if (!clean) continue;
        const resolved = join(dirname(abs), clean);
        if (!existsSync(resolved)) {
          findings.push({ file: rel, line: lineOf(html, m.index), message: `內部連結目標不存在：${target}` });
        }
      }
    }
  }
  return findings;
}

/* =====================================================
   C. 導覽設定（以 _src/config/nav.json 為權威來源）
   ===================================================== */
export function checkNavConfig(rootDir, htmlRelPaths, nav) {
  const findings = [];
  for (const rel of htmlRelPaths) {
    const abs = join(rootDir, rel);
    const html = readFileSync(abs, "utf8");
    const depth = rel.split("/").length - 1;
    const prefix = "../".repeat(depth);

    const menuMatch = html.match(/<ul class="nav__menu" id="([^"]+)">([\s\S]*?)<\/ul>/);
    if (!menuMatch) {
      findings.push({ file: rel, line: null, message: '找不到 <ul class="nav__menu">，無法驗證導覽項目' });
      continue;
    }
    if (menuMatch[1] !== nav.menuId) {
      findings.push({
        file: rel,
        line: lineOf(html, menuMatch.index),
        message: `nav__menu id 是 "${menuMatch[1]}"，應為 nav.json 宣告的 "${nav.menuId}"`,
      });
    }

    const actual = [...menuMatch[2].matchAll(/<a class="nav__link" href="([^"]+)">([^<]*)<\/a>/g)].map((m) => ({
      href: m[1],
      label: m[2],
    }));
    const expected = nav.items.map((i) => ({ href: `${prefix}${i.href}`, label: i.label }));
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      findings.push({
        file: rel,
        line: lineOf(html, menuMatch.index),
        message: `導覽項目與 _src/config/nav.json 不一致。預期：${JSON.stringify(expected)}；實際：${JSON.stringify(actual)}`,
      });
    }
  }
  return findings;
}

/* =====================================================
   B. 共用殼層來源唯一性（掃來源碼，不掃產物）
   ===================================================== */
const SHELL_MARKERS = ["<!DOCTYPE html>", 'class="nav__brand"', 'class="footer__inner"'];

export function checkSharedShellIntegrity(rootDir, scriptRelPaths, excludeRelPaths) {
  const findings = [];
  for (const rel of scriptRelPaths) {
    if (excludeRelPaths.includes(rel)) continue;
    const src = readFileSync(join(rootDir, rel), "utf8");
    for (const marker of SHELL_MARKERS) {
      const idx = src.indexOf(marker);
      if (idx !== -1) {
        findings.push({
          file: rel,
          line: lineOf(src, idx),
          message: `疑似獨立定義了第二份頁面殼層（含字面 "${marker}"），應改用 scripts/lib/layout.mjs 的 renderPage()`,
        });
      }
    }
  }

  for (const rel of ["scripts/build.mjs", "scripts/sync-notion.mjs"]) {
    const abs = join(rootDir, rel);
    if (!existsSync(abs)) {
      findings.push({ file: rel, line: null, message: "檔案不存在" });
      continue;
    }
    const src = readFileSync(abs, "utf8");
    if (!/from\s+["'][^"']*lib\/layout\.mjs["']/.test(src) || !/renderPage/.test(src)) {
      findings.push({
        file: rel,
        line: null,
        message: "未從 scripts/lib/layout.mjs 匯入並使用 renderPage()，殼層來源可能不再統一",
      });
    }
  }
  return findings;
}

/* =====================================================
   D. 色彩 token 紀律（css/style.css、css/article.css）
   ---------------------------------------------------------
   規則：
   - :root { ... } 內的 token 定義區塊本身允許字面值（那就是 token 的定義處）。
   - 其餘任何 hex 或字面 rgb()/rgba() 一律要出現在下方 COLOR_EXCEPTIONS
     裡（以「該行去頭尾空白後的完整內容」精準比對，不是只比對顏色值），
     否則視為未說明的新硬編碼理論色而失敗。
   ===================================================== */
export const COLOR_EXCEPTIONS = [
  { file: "css/style.css", line: "background: #ff5f57;", reason: "macOS 視窗紅黃綠三色點（Category D，固定系統色，與主題無關）" },
  { file: "css/style.css", line: "box-shadow: 18px 0 0 #febc2e, 36px 0 0 #28c840;", reason: "同上" },
  {
    file: "css/style.css",
    line: "linear-gradient(135deg, #eaf2ff, var(--color-surface));",
    reason: "project-card--metropulse 裝飾縮圖，一次性手選色（Category D）",
  },
  {
    file: "css/style.css",
    line: "linear-gradient(135deg, #eff6ff, var(--color-bg));",
    reason: "project-card--yolo-ship 裝飾縮圖，一次性手選色（Category D）",
  },
  {
    file: "css/style.css",
    line: "linear-gradient(135deg, #f0f7ff, var(--color-surface));",
    reason: "project-card--ai-agent-lab 裝飾縮圖，一次性手選色（Category D）",
  },
  { file: "css/article.css", line: "background: #0f172a;", reason: "文章程式碼區塊固定深色終端機底色（Category E）" },
  { file: "css/article.css", line: "color: #e2e8f0;", reason: "文章程式碼區塊固定淺色字（Category E）" },
];

function stripCssComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

export function checkColorTokenDiscipline(rootDir, cssRelPaths) {
  const findings = [];
  for (const rel of cssRelPaths) {
    const original = readFileSync(join(rootDir, rel), "utf8");
    const stripped = stripCssComments(original);
    const origLines = original.split("\n");
    const strippedLines = stripped.split("\n");

    let depth = 0;
    let inRoot = false;
    let rootDepth = 0;

    for (let i = 0; i < strippedLines.length; i++) {
      const sLine = strippedLines[i];
      const trimmed = sLine.trim();
      if (!inRoot && /^:root\s*\{/.test(trimmed)) {
        inRoot = true;
        rootDepth = depth;
      }

      if (!inRoot) {
        const literals = [
          ...[...sLine.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]),
          ...[...sLine.matchAll(/rgba?\(\s*\d[^)]*\)/g)].map((m) => m[0]),
        ];
        if (literals.length) {
          const origTrim = origLines[i].trim();
          const allowed = COLOR_EXCEPTIONS.some((e) => e.file === rel && origTrim === e.line);
          if (!allowed) {
            findings.push({
              file: rel,
              line: i + 1,
              message: `未說明的硬編碼理論色：${literals.join(", ")}（"${origTrim}"）。若為刻意保留的字面值，需加進 checks.mjs 的 COLOR_EXCEPTIONS 並附理由`,
            });
          }
        }
      }

      const opens = (sLine.match(/\{/g) || []).length;
      const closes = (sLine.match(/\}/g) || []).length;
      depth += opens - closes;
      if (inRoot && closes > 0 && depth <= rootDepth) inRoot = false;
    }
  }
  return findings;
}

/* =====================================================
   E. WCAG 對比驗證（_src/config/contrast.json 宣告）
   ===================================================== */
function parseRootTokens(cssText) {
  const rootMatch = cssText.match(/:root\s*\{([\s\S]*?)\n\}/);
  if (!rootMatch) throw new Error("找不到 :root token 區塊");
  const map = {};
  for (const line of rootMatch[1].split("\n")) {
    const m = line.match(/^\s*(--[\w-]+)\s*:\s*(.+?);\s*$/);
    if (m) map[m[1]] = m[2].trim();
  }
  return map;
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function resolveValue(raw, map, seen) {
  raw = raw.trim();
  if (raw.startsWith("#")) return hexToRgb(raw);
  if (/^\d+\s+\d+\s+\d+$/.test(raw)) return raw.split(/\s+/).map(Number);
  const rgbVarMatch = raw.match(/^rgb\(\s*var\((--[\w-]+)\)(?:\s*\/\s*[\d.]+)?\s*\)$/);
  if (rgbVarMatch) return resolveToken(rgbVarMatch[1], map, seen);
  throw new Error(`無法解析顏色 token 值："${raw}"`);
}

function resolveToken(name, map, seen = new Set()) {
  if (seen.has(name)) throw new Error(`token 循環參照：${name}`);
  seen.add(name);
  const raw = map[name];
  if (raw === undefined) throw new Error(`找不到 token：${name}`);
  return resolveValue(raw, map, seen);
}

function relativeLuminance([r, g, b]) {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [R, G, B] = [f(r), f(g), f(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(rgbA, rgbB) {
  const [L1, L2] = [relativeLuminance(rgbA), relativeLuminance(rgbB)].sort((a, b) => b - a);
  return (L1 + 0.05) / (L2 + 0.05);
}

export function checkContrast(rootDir, cssRelPath, contrastConfig) {
  const findings = [];
  const cssText = readFileSync(join(rootDir, cssRelPath), "utf8");
  let tokens;
  try {
    tokens = parseRootTokens(cssText);
  } catch (err) {
    return [{ file: cssRelPath, line: null, message: `contrast 驗證無法解析 :root：${err.message}` }];
  }

  for (const pair of contrastConfig.pairs) {
    let fg, bg;
    try {
      fg = resolveToken(pair.foregroundToken, tokens);
      bg = resolveToken(pair.backgroundToken, tokens);
    } catch (err) {
      findings.push({
        file: "_src/config/contrast.json",
        line: null,
        message: `"${pair.id}" 無法解析顏色 token：${err.message}`,
      });
      continue;
    }
    const actual = contrastRatio(fg, bg);
    if (actual < pair.threshold - 1e-6) {
      findings.push({
        file: "_src/config/contrast.json",
        line: null,
        message: `對比不足："${pair.id}"（${pair.context}）需要 ≥ ${pair.threshold}:1（${pair.wcag}），實測 ${actual.toFixed(2)}:1`,
      });
    }
  }
  return findings;
}

/* =====================================================
   H. 文章行動裝置換行回歸保護
   ===================================================== */
export function checkArticleRobustness(rootDir) {
  const findings = [];
  const css = readFileSync(join(rootDir, "css/article.css"), "utf8");
  const required = [
    {
      re: /\.article-body\s+code\s*\{[^}]*overflow-wrap:\s*anywhere/,
      msg: ".article-body code 應維持 overflow-wrap: anywhere（行內程式碼可換行）",
    },
    {
      re: /\.article-body\s+a\s*\{[^}]*overflow-wrap:\s*anywhere/,
      msg: ".article-body a 應維持 overflow-wrap: anywhere（連結可換行）",
    },
    {
      re: /\.article-code\s*\{[^}]*overflow-x:\s*auto/,
      msg: ".article-code 應維持 overflow-x: auto（區塊程式碼保留橫向捲動）",
    },
    {
      re: /\.article-code\s+code\s*\{[^}]*overflow-wrap:\s*normal/,
      msg: ".article-code code 應維持 overflow-wrap: normal（避免繼承 anywhere 壞了區塊排版）",
    },
  ];
  for (const { re, msg } of required) {
    if (!re.test(css)) findings.push({ file: "css/article.css", line: null, message: `回歸：${msg}` });
  }

  const syncSrc = readFileSync(join(rootDir, "scripts/sync-notion.mjs"), "utf8");
  if (!/<pre class="article-code">/.test(syncSrc)) {
    findings.push({
      file: "scripts/sync-notion.mjs",
      line: null,
      message: '區塊程式碼應仍輸出 <pre class="article-code">（瀏覽器預設 white-space:pre 是橫向捲動與保留排版的前提）',
    });
  }
  return findings;
}
