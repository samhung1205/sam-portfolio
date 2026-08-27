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

const HERE = dirname(fileURLToPath(import.meta.url));
export const SRC = join(HERE, "..", "..", "_src");

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
 * @param {boolean} [page.showBrand]     false 時「完全不輸出」brand DOM 節點
 * @param {string[]}[page.extraCss]      額外樣式表（相對站台根目錄）
 * @param {string}  [page.banner]        <body> 後的註解行
 * @param {string}  [page.pathPrefix]    子目錄頁面用 "../"
 * @param {object}  nav                  nav.json 內容
 */
export function renderPage(page, nav) {
  const pathPrefix = page.pathPrefix ?? "";

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

  const extraCss = (page.extraCss ?? [])
    .map((href) => `\n  <link rel="stylesheet" href="${pathPrefix}${href}" />`)
    .join("");

  const head = fill(readPart("partials/head.html"), {
    title: page.title,
    description: page.description,
    pathPrefix,
    extraCss,
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
  });

  const footer = fill(readPart("partials/footer.html"), { pathPrefix });

  const out = fill(readPart("layouts/base.html"), {
    head,
    banner: page.banner ?? "  <!-- ===== Navigation ===== -->",
    nav: navHtml,
    content: page.content,
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
