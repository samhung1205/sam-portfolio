/* =========================================================
   layout.mjs — 全站頁面殼層的唯一來源 (single source of truth)
   ---------------------------------------------------------
   Phase 2 Commit 1：把原本複製在 7 個 HTML 檔（以及 sync-notion.mjs
   內一份硬寫的 template string）的 <head> / nav / footer 抽出來。

   設計限制：
   - 零相依。只用 {{token}} 字串替換，不引入 template engine。
   - 產物必須與重構前「逐位元組相同」，因此所有縮排、空行、註解都照抄。
   - meta 字串（title / description）視為「已是最終 HTML」直接插入，不再
     escape：來源就是原檔案裡已經寫好的字串，二次 escape 會改變位元組。
     Commit 3 的 verify 會擋住未跳脫字元進入產物。
   ========================================================= */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
export const SRC = join(HERE, "..", "..", "_src");
const ROOT = join(HERE, "..", "..");
export const SITE_CONFIG = JSON.parse(
  readFileSync(join(SRC, "config", "site.json"), "utf8")
);

/* =====================================================
   Build version — cache-busting for 靜態 asset（css/js）
   ---------------------------------------------------------
   Phase 4A hotfix：使用者在自己裝置上看到「新 CSS + 舊 HTML」混版
   （FOCUS/CV/DATA 殘留成無樣式純文字）——GitHub Pages 的 CDN／瀏覽器
   對 index.html 與 css/style.css 的快取有效期不同步，導致同一次造訪
   拿到不同版本的檔案組合。修法：css/js 的 <link>/<script> URL 一律
   帶上 ?v=<內容雜湊> 這個 query string。內容一變，URL 就變，瀏覽器/
   CDN 必須當成全新資源重新抓取，不會再讀到「HTML 換版但資源沒換」的
   混版快取。

   版本來源：直接對「會被快取破棄的那幾個檔案」本身的位元組內容做
   SHA-256（取前 10 碼），不是 git commit hash。第一版曾經用 commit
   hash，結果被 build.mjs --check 抓到自我矛盾的 drift：build.mjs 在
   commit 前執行，當時的 HEAD 是「上一個」commit，所以產物裡烙印的是
   上一個 commit 的雜湊；等這次 commit 真的建立、CI checkout 出這個
   commit 後再跑一次 build.mjs --check，這時 HEAD 已經是「這個」
   commit，重新計算出不同的雜湊，於是判定「跟已提交的產物不一致」而
   失敗——這個矛盾是 commit-hash 版本法在 pre-commit 產生 pre-commit
   內容這個場景下結構性無法避免的。內容雜湊沒有這個問題：只要來源檔案
   位元組不變，任何時間點（commit 前、commit 後、CI 裡）重新計算都是
   同一個值，天生跟 build:check 的「重新產生應與已提交產物逐位元組
   相同」要求相容。副作用是隨之而來的好處：只有這幾個檔案真的變了才會
   換版本，不會像 commit hash 那樣每次隨便一個 commit（哪怕沒動到
   css/js）都跟著換一次。
   單一計算、單一來源——build.mjs 與 sync-notion.mjs 都經由這裡的
   renderPage() 拿到同一個版本字串，不需要各自維護。 */
const VERSIONED_ASSET_PATHS = ["css/style.css", "css/article.css", "js/data.js", "js/main.js"];

function computeBuildVersion() {
  const hash = createHash("sha256");
  for (const rel of VERSIONED_ASSET_PATHS) {
    hash.update(readFileSync(join(ROOT, rel)));
  }
  return hash.digest("hex").slice(0, 10);
}
export const BUILD_VERSION = computeBuildVersion();

function computeFileVersion(rel) {
  return createHash("sha256")
    .update(readFileSync(join(ROOT, rel)))
    .digest("hex")
    .slice(0, 10);
}
export const RESUME_VERSION = computeFileVersion("assets/files/resume.pdf");

/* =====================================================
   Shell version — 殼層新鮮度簽章（Phase 4B.3）
   ---------------------------------------------------------
   背景：articles.html / articles/*.html 是由 sync-notion.mjs 產生，
   只在有人手動跑 sync 時才會重新產出；BUILD_VERSION（上面）只反映
   css/js「資產內容」有沒有變，跟殼層「標記結構」（nav 有沒有
   Contact、footer 長什麼樣）是不是最新的完全是兩回事——手寫六頁靠
   build.mjs --check 保證逐位元組同步，但文章頁沒有對應機制，殼層可以
   悄悄過期而 CI 仍是綠的（Phase 4B.2 導覽 hotfix 之後才發現 articles/
   還在用加 Contact 之前的舊殼層）。

   SHELL_VERSION 只雜湊「定義殼層標記結構」的來源檔（不含 css/js 資產
   內容、不含頁面各自的 content），任何一個檔案的結構性改動（例如
   Phase 4A 幫 nav.html 加 Contact CTA、Phase 4B.2 改 head.html 的
   cache-busting）都會讓這個值改變。renderPage() 把它烙進每個產物的
   <!-- shell:... --> 註解裡，verify.mjs 的殼層新鮮度檢查只需要比對這
   個值，不必重新實作一份 nav/head/footer 邏輯，也不必整頁 diff。 */
const SHELL_SOURCE_PATHS = [
  join(SRC, "partials", "head.html"),
  join(SRC, "partials", "nav.html"),
  join(SRC, "partials", "footer.html"),
  join(SRC, "layouts", "base.html"),
  join(SRC, "config", "nav.json"),
  join(SRC, "config", "site.json"),
];

function computeShellVersion() {
  const hash = createHash("sha256");
  for (const abs of SHELL_SOURCE_PATHS) {
    hash.update(readFileSync(abs));
  }
  return hash.digest("hex").slice(0, 10);
}
export const SHELL_VERSION = computeShellVersion();

/** 讀 partial／layout，並去掉檔尾那一個換行（由 base 版型自行控制換行）。 */
const readPart = (rel) => readFileSync(join(SRC, rel), "utf8").replace(/\n$/, "");

/** {{token}} 替換。缺少的 token 一律報錯，避免默默產出 "{{foo}}" 字面值。 */
function fill(template, values) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in values)) {
      throw new Error(`layout: 未提供 token "${key}"`);
    }
    return values[key];
  });
}

export function loadNavConfig() {
  return JSON.parse(readFileSync(join(SRC, "config", "nav.json"), "utf8"));
}

/**
 * 產生頁面殼層。
 * @param {object}  page                 頁面資料
 * @param {string}  page.title
 * @param {string}  page.description
 * @param {string}  page.content         <main> 內容（原樣，含縮排）
 * @param {string}  page.canonicalPath   相對 production root 的公開路徑；首頁用空字串
 * @param {string}  [page.ogType]        Open Graph 類型，預設 website
 * @param {boolean} [page.showBrand]     false 時「完全不輸出」brand DOM 節點
 * @param {string[]}[page.extraCss]      額外樣式表（相對站台根目錄）
 * @param {string}  [page.banner]        <body> 後的註解行
 * @param {string}  [page.pathPrefix]    子目錄頁面用 "../"
 * @param {object}  nav                  nav.json 內容
 */
export function renderPage(page, nav) {
  const pathPrefix = page.pathPrefix ?? "";
  const canonicalUrl = page.canonicalPath
    ? `${SITE_CONFIG.url}/${page.canonicalPath}`
    : `${SITE_CONFIG.url}/`;
  const content = page.content.replaceAll(
    "{{resumeUrl}}",
    `${pathPrefix}assets/files/resume.pdf?v=${RESUME_VERSION}`
  );

  // showBrand === false → 輸出「空」的 <span class="nav__brand-text"></span>，
  // 不省略節點本身。
  //
  // KNOWN-DEBT（Phase 2 Commit 1A，待 Phase 3 處理）：
  // 原本假設「完全不輸出節點」才是安全作法，但實測推翻了這個假設——
  // .nav__brand 是 flex 且有 gap:12px，即使子節點是 0x0，只要「存在」就會
  // 占用一份 gap。拿掉節點本身會讓 .nav__brand 少 12px 寬，而 .nav__inner
  // 是三個 flex 子項（brand / toggle / <nav>）用 space-between，中間那個
  // toggle 因此被往左推 6px——在 768px 與 375px 用瀏覽器實測到
  // .nav__toggle 的 x 座標從 431→425、214→208。1440px 因為 toggle 是
  // display:none 所以量不出差異，但 768px 以下是真實可見的位移。
  // 空節點才是「與重構前逐位元組等價之外，唯一 render 出來完全零視覺差異」
  // 的作法，所以這裡刻意保留一個空節點，而不是省略它。
  // 這是暫時的排版補丁，不是刻意的設計決策；等 Phase 3 重新設計 navbar／
  // 首頁品牌顯示邏輯時，這個空節點連同 showBrand 這個概念都應該一併移除。
  const brandHtml =
    page.showBrand === false
      ? '\n        <span class="nav__brand-text"></span>'
      : [
          "",
          '        <span class="nav__brand-text">',
          `          <strong>${nav.brand.name}</strong>`,
          `          <small>${nav.brand.role}</small>`,
          "        </span>",
        ].join("\n");

  const navItems = nav.items
    .map((i) => `          <li><a class="nav__link" href="${pathPrefix}${i.href}">${i.label}</a></li>`)
    .join("\n");

  // Contact 現在指向站內的 Resume 聯絡區。一般站內路徑需要和導覽項目
  // 一樣套用 pathPrefix，才能從 case-studies/ 與 articles/ 等巢狀頁面
  // 正確回到網站根目錄；mailto:/https:/# 等特殊目標則維持原值。
  const contactHref = /^(?:[a-z][a-z\d+.-]*:|#)/i.test(nav.contact.href)
    ? nav.contact.href
    : `${pathPrefix}${nav.contact.href}`;

  const extraCss = (page.extraCss ?? [])
    .map((href) => `\n  <link rel="stylesheet" href="${pathPrefix}${href}?v=${BUILD_VERSION}" />`)
    .join("");

  const head = fill(readPart("partials/head.html"), {
    title: page.title,
    description: page.description,
    canonicalUrl,
    ogType: page.ogType ?? "website",
    siteName: SITE_CONFIG.name,
    siteLocale: SITE_CONFIG.locale,
    twitterCard: SITE_CONFIG.twitterCard,
    pathPrefix,
    extraCss,
    buildVersion: BUILD_VERSION,
    shellVersion: SHELL_VERSION,
  });

  const navHtml = fill(readPart("partials/nav.html"), {
    pathPrefix,
    brandHref: nav.brand.href,
    brandAriaLabel: nav.brand.ariaLabel,
    brandLogo: nav.brand.logo,
    brandLogoAlt: nav.brand.logoAlt,
    brandHtml,
    menuId: nav.menuId,
    navItems,
    contactHref,
    contactLabel: nav.contact.label,
  });

  const footer = fill(readPart("partials/footer.html"), { pathPrefix, buildVersion: BUILD_VERSION });

  const out = fill(readPart("layouts/base.html"), {
    head,
    banner: page.banner ?? "  <!-- ===== Navigation ===== -->",
    nav: navHtml,
    content,
    footer,
  });

  return out + "\n";
}

/**
 * 解析 _src/pages/*.html：開頭一段 <!--meta { ...json } --> 之後即為 <main> 內容。
 */
export function parsePageSource(raw) {
  const m = raw.match(/^<!--meta\r?\n([\s\S]*?)\r?\n-->\r?\n/);
  if (!m) throw new Error("頁面來源缺少開頭的 <!--meta ... --> 區塊");
  return { meta: JSON.parse(m[1]), content: raw.slice(m[0].length).replace(/\n$/, "") };
}
