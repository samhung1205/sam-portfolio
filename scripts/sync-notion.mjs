#!/usr/bin/env node
/* =========================================================
   sync-notion.mjs — Notion 文章 → 靜態 HTML 同步腳本
   ---------------------------------------------------------
   流程：
     1. 查詢 Notion「Site Articles」資料庫中 Status = Published 的頁面
     2. 抓取每頁的 blocks，轉成 HTML（沿用網站設計系統）
     3. 圖片下載後上傳 Cloudflare R2（未設定 R2 時改存 assets/images/articles/）
     4. 產出 articles.html（列表頁）與 articles/<slug>.html（文章頁）

   用法：
     node scripts/sync-notion.mjs            需要 NOTION_TOKEN / NOTION_DATABASE_ID
     node scripts/sync-notion.mjs --fixture  用 scripts/fixture.json 離線驗證產頁

   由 .github/workflows/sync-notion.yml 排程執行並 commit 產出。
   ========================================================= */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderPage, loadNavConfig } from "./lib/layout.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE = process.argv.includes("--fixture");
const env = process.env;
// Commit 3：verify:fixture 用來把「產出」導去隔離的暫存目錄，避免重演
// fixture 測試曾經覆寫過真實 articles/ 的事故。只影響寫入路徑；
// fixture.json 一律仍從真正的 repo（ROOT）讀。
const OUT_ROOT = env.SYNC_OUT_DIR ? path.resolve(env.SYNC_OUT_DIR) : ROOT;

// R2 五個變數齊全才走 R2；否則圖片落地到 repo（GitHub Pages 也能直接服務）
const R2_KEYS = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_PUBLIC_URL"];
const R2_READY = R2_KEYS.every((k) => env[k]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
const escapeAttr = escapeHtml;

/* =====================================================
   1. Notion API（官方 REST，免 SDK；Node 20+ 內建 fetch）
   ===================================================== */
const NOTION_VERSION = "2022-06-28";

// 使用者可能貼整段網址而非純 ID，一律正規化成 32 碼十六進位
function normalizeNotionId(raw = "") {
  const hex = String(raw).trim().replace(/^.*?([0-9a-fA-F-]{32,36}).*$/s, "$1").replace(/-/g, "");
  return /^[0-9a-f]{32}$/i.test(hex) ? hex : null;
}

// 失敗時把 Notion 的錯誤碼翻成「該怎麼修」，避免只看到一串 JSON
function explainNotionError(status, body) {
  let code = "";
  try {
    code = JSON.parse(body).code || "";
  } catch {
    /* 非 JSON 回應就只靠狀態碼判斷 */
  }
  if (status === 401)
    return "NOTION_TOKEN 無效或已撤銷。請到 notion.so/my-integrations 重新複製 Internal Integration Secret，更新同名 secret。";
  if (status === 404 || code === "object_not_found")
    return (
      "找得到 token 但讀不到資料庫，最常見原因是「整合尚未被加入這個資料庫」。\n" +
      "  修法：在 Notion 開啟「Site Articles」資料庫 → 右上 ⋯ → Connections（連線）→ 選你的 integration。\n" +
      "  次要可能：NOTION_DATABASE_ID 填錯（本專案應為 1b03014710694ddaab6fd85f84ede018）。"
    );
  if (status === 400 && code === "validation_error")
    return "請求格式被拒。通常是資料庫欄位被改名或改型別（本腳本預期 Status 為 select，含 Published 選項）。";
  if (status === 403)
    return "整合權限不足。請確認該 integration 具備讀取內容的能力。";
  return "";
}

async function notionApi(pathname, init = {}) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`https://api.notion.com/v1${pathname}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${env.NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
    });
    if (res.status === 429) {
      // Notion 限流約 3 req/s：按 Retry-After 等待後重試
      await sleep((Number(res.headers.get("retry-after")) || 2) * 1000);
      continue;
    }
    if (!res.ok) {
      const body = await res.text();
      const hint = explainNotionError(res.status, body);
      throw new Error(`Notion API ${pathname} → HTTP ${res.status}\n  回應：${body}${hint ? `\n\n▶ ${hint}` : ""}`);
    }
    return res.json();
  }
  throw new Error(`Notion API ${pathname}：重試多次仍被限流`);
}

async function queryPublishedPages() {
  const pages = [];
  let cursor;
  do {
    const body = {
      filter: { property: "Status", select: { equals: "Published" } },
      ...(cursor ? { start_cursor: cursor } : {}),
    };
    const res = await notionApi(`/databases/${normalizeNotionId(env.NOTION_DATABASE_ID)}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return pages;
}

async function fetchBlockChildren(blockId) {
  const blocks = [];
  let cursor;
  do {
    const qs = cursor ? `?page_size=100&start_cursor=${cursor}` : "?page_size=100";
    const res = await notionApi(`/blocks/${blockId}/children${qs}`);
    blocks.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
    await sleep(150);
  } while (cursor);
  for (const b of blocks) {
    if (b.has_children && b.type !== "child_page" && b.type !== "child_database") {
      b[b.type].children = await fetchBlockChildren(b.id);
    }
  }
  return blocks;
}

/* =====================================================
   2. 圖片處理：下載 → 上傳 R2 或落地 repo
   ===================================================== */
const imageCache = new Map(); // 來源 URL → 最終公開 URL
let s3Client, s3Cmd;

const EXT_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

async function resolveImage(sourceUrl) {
  if (imageCache.has(sourceUrl)) return imageCache.get(sourceUrl);
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`下載圖片失敗（${res.status}）：${sourceUrl}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = (res.headers.get("content-type") || "").split(";")[0];
  const ext = EXT_BY_TYPE[contentType] || "png";
  // 用內容 hash 命名：同圖不重傳，Notion 檔案 URL 過期也不影響已同步的圖
  const filename = `${createHash("sha1").update(buf).digest("hex").slice(0, 16)}.${ext}`;

  let publicUrl;
  if (R2_READY) {
    publicUrl = await uploadToR2(`articles/${filename}`, buf, contentType || "application/octet-stream");
  } else {
    const dir = path.join(OUT_ROOT, "assets", "images", "articles");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buf);
    publicUrl = `../assets/images/articles/${filename}`; // 圖片只出現在 articles/*.html 內
  }
  imageCache.set(sourceUrl, publicUrl);
  return publicUrl;
}

async function uploadToR2(key, buf, contentType) {
  if (!s3Client) {
    const { S3Client, PutObjectCommand, HeadObjectCommand } = await import("@aws-sdk/client-s3");
    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
    });
    s3Cmd = { PutObjectCommand, HeadObjectCommand };
  }
  try {
    await s3Client.send(new s3Cmd.HeadObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }));
  } catch {
    await s3Client.send(
      new s3Cmd.PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key, Body: buf, ContentType: contentType })
    );
  }
  return `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
}

/* =====================================================
   3. Notion blocks → HTML
   ===================================================== */
const plainOf = (richArr = []) => richArr.map((t) => t.plain_text ?? "").join("");

function richTextHtml(richArr = []) {
  return richArr
    .map((t) => {
      let html = escapeHtml(t.plain_text ?? "").replace(/\n/g, "<br />");
      const a = t.annotations || {};
      if (a.code || t.type === "equation") html = `<code>${html}</code>`;
      if (a.bold) html = `<strong>${html}</strong>`;
      if (a.italic) html = `<em>${html}</em>`;
      if (a.strikethrough) html = `<s>${html}</s>`;
      if (a.underline) html = `<u>${html}</u>`;
      if (t.href) html = `<a href="${escapeAttr(t.href)}" target="_blank" rel="noopener">${html}</a>`;
      return html;
    })
    .join("");
}

async function blocksToHtml(blocks = []) {
  let html = "";
  let list = null; // 連續 list item 聚合成同一個 <ul>/<ol>
  const flushList = () => {
    if (list) {
      html += `<${list.tag}>${list.items.join("")}</${list.tag}>`;
      list = null;
    }
  };

  for (const b of blocks) {
    const type = b.type;
    const d = b[type] || {};

    if (type === "bulleted_list_item" || type === "numbered_list_item" || type === "to_do") {
      const tag = type === "numbered_list_item" ? "ol" : "ul";
      if (!list || list.tag !== tag) {
        flushList();
        list = { tag, items: [] };
      }
      let inner =
        type === "to_do"
          ? `<input type="checkbox" disabled${d.checked ? " checked" : ""} /> ${richTextHtml(d.rich_text)}`
          : richTextHtml(d.rich_text);
      if (d.children) inner += await blocksToHtml(d.children);
      list.items.push(`<li>${inner}</li>`);
      continue;
    }
    flushList();

    switch (type) {
      case "paragraph": {
        const inner = richTextHtml(d.rich_text);
        if (inner) html += `<p>${inner}</p>`;
        if (d.children) html += await blocksToHtml(d.children);
        break;
      }
      // 文章頁的 <h1> 保留給標題，Notion 標題整體降一級
      case "heading_1":
        html += `<h2>${richTextHtml(d.rich_text)}</h2>`;
        if (d.children) html += await blocksToHtml(d.children);
        break;
      case "heading_2":
        html += `<h3>${richTextHtml(d.rich_text)}</h3>`;
        if (d.children) html += await blocksToHtml(d.children);
        break;
      case "heading_3":
        html += `<h4>${richTextHtml(d.rich_text)}</h4>`;
        if (d.children) html += await blocksToHtml(d.children);
        break;
      case "quote":
        html += `<blockquote>${richTextHtml(d.rich_text)}${d.children ? await blocksToHtml(d.children) : ""}</blockquote>`;
        break;
      case "code":
        html += `<pre class="article-code"><code class="language-${escapeAttr(d.language || "plain")}">${escapeHtml(
          plainOf(d.rich_text)
        )}</code></pre>`;
        if (plainOf(d.caption)) html += `<p class="article-caption">${richTextHtml(d.caption)}</p>`;
        break;
      case "divider":
        html += `<hr />`;
        break;
      case "image": {
        const src = d.type === "external" ? d.external?.url : d.file?.url;
        if (!src) break;
        const url = await resolveImage(src);
        const caption = richTextHtml(d.caption);
        html += `<figure><img src="${escapeAttr(url)}" alt="${escapeAttr(plainOf(d.caption) || "文章圖片")}" loading="lazy" />${
          caption ? `<figcaption>${caption}</figcaption>` : ""
        }</figure>`;
        break;
      }
      case "callout": {
        const icon = d.icon?.type === "emoji" ? d.icon.emoji : "💡";
        html += `<div class="article-callout"><span aria-hidden="true">${escapeHtml(icon)}</span><div>${richTextHtml(
          d.rich_text
        )}${d.children ? await blocksToHtml(d.children) : ""}</div></div>`;
        break;
      }
      case "toggle":
        html += `<details><summary>${richTextHtml(d.rich_text)}</summary>${
          d.children ? await blocksToHtml(d.children) : ""
        }</details>`;
        break;
      case "table": {
        const rows = d.children || [];
        const cellsHtml = rows.map((row, i) => {
          const cellTag = d.has_column_header && i === 0 ? "th" : "td";
          const cells = (row.table_row?.cells || []).map((c) => `<${cellTag}>${richTextHtml(c)}</${cellTag}>`).join("");
          return `<tr>${cells}</tr>`;
        });
        html += `<div class="table-wrap"><table>${cellsHtml.join("")}</table></div>`;
        break;
      }
      case "equation":
        html += `<pre class="article-code"><code>${escapeHtml(d.expression || "")}</code></pre>`;
        break;
      case "bookmark":
      case "embed":
      case "video":
      case "file": {
        const url = d.url || d.external?.url || d.file?.url;
        if (url)
          html += `<p><a href="${escapeAttr(url)}" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i> ${escapeHtml(
            plainOf(d.caption) || url
          )}</a></p>`;
        break;
      }
      case "column_list":
      case "column":
        if (d.children) html += await blocksToHtml(d.children);
        break;
      default:
        console.warn(`  略過不支援的 block 類型：${type}`);
    }
  }
  flushList();
  return html;
}

/* =====================================================
   4. 頁面模板
   ---------------------------------------------------------
   殼層（head / nav / footer）改用 scripts/lib/layout.mjs 的
   renderPage()，與其餘六頁共用同一份 render 邏輯與 _src/config/nav.json
   （Phase 2 Commit 1B）。escaping 仍由本檔負責——Notion 內容是不可信
   輸入，renderPage() 假設呼叫端已經把 title / description escape 好
   （與其餘六頁的 _src/pages/*.html 是同一個假設），這點與遷移前
   pageShell() 內部呼叫 escapeHtml/escapeAttr 的行為完全等價。

   已知、刻意的差異（已用 A/B 測試證實只有這一處、且是加法、零渲染
   影響）：footer 現在統一走共用的 footer.html partial，會多出一行
   `<!-- ===== Footer ===== -->` 註解——原本手寫六頁本來就有這行，只有
   Notion 產出頁沒有，屬於重構前殼層本身不一致。統一成同一份共用
   footer 正是本次 Commit 1B 的目的（不得為文章頁另建一份 shell）。
   ===================================================== */
const ARTICLE_BANNER =
  '  <!-- 本檔由 scripts/sync-notion.mjs 產生，請勿手動編輯；內容請到 Notion「Site Articles」資料庫修改 -->';
const ARTICLE_EXTRA_CSS = ["css/article.css"];
const nav = loadNavConfig();

function pageShell({ title, description, rel, main }) {
  return renderPage(
    {
      title: escapeHtml(title),
      description: escapeAttr(description),
      pathPrefix: rel,
      extraCss: ARTICLE_EXTRA_CSS,
      banner: ARTICLE_BANNER,
      content: main,
    },
    nav
  );
}

/* Phase 4F：列表改成閱讀清單列，不再用 Projects 的大卡片。文章數量少時
   一整排大卡只會製造假密度；標題連結用 ::after 撐滿整列當點擊區（見
   css/article.css .article-item__title a::after），可及名稱維持只有標題。
   summary 為空時整段不輸出——Notion 沒填摘要時原本會留下一個空的
   <p class="card__summary">。 */
function articleItemHtml(a) {
  const tags = a.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  const summary = (a.summary || "").trim();
  const rows = [
    `<span class="article-item__date">${escapeHtml(a.date)}</span>`,
    `<h3 class="article-item__title"><a href="articles/${a.slug}.html">${escapeHtml(a.title)}</a></h3>`,
    summary ? `<p class="article-item__summary">${escapeHtml(summary)}</p>` : "",
    tags ? `<div class="tag-list">${tags}</div>` : "",
    `<span class="article-item__cue" aria-hidden="true"><i class="fa-solid fa-arrow-right"></i></span>`,
  ].filter(Boolean);
  return `          <li class="article-item reveal">\n${rows.map((r) => `            ${r}`).join("\n")}\n          </li>`;
}

function listingPageHtml(articles) {
  const items = articles.map(articleItemHtml).join("\n");
  const main = `    <section class="section page-hero page-hero--articles">
      <div class="container reveal">
        <span class="section-eyebrow">Articles</span>
        <h1>文章筆記</h1>
        <p class="page-intro articles-intro">
          讀書筆記與技術整理，在 Notion 寫、自動同步到這裡。
          這裡放的是「我在學什麼、怎麼記」——做出來的東西在 <a href="projects.html">Projects</a>。
        </p>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container">
        <header class="section-header reveal">
          <h2>全部文章</h2>
        </header>
        ${
          articles.length
            ? `<ul class="article-list">\n${items}\n        </ul>`
            : `<p class="text-center">目前還沒有發佈的文章，敬請期待。</p>`
        }
      </div>
    </section>`;
  return pageShell({
    title: "Articles · Sam Hung",
    description: "Sam Hung 的技術文章與筆記：AI Agent、演算法、軟體工程與數學。",
    rel: "",
    main,
  });
}

function articlePageHtml(a) {
  const tags = a.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  const main = `    <section class="section article-hero">
      <div class="container reveal">
        <a class="article-back" href="../articles.html"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> 文章筆記</a>
        <h1 class="article-title">${escapeHtml(a.title)}</h1>
        <div class="article-meta">
          <span><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${escapeHtml(a.date)}</span>
          ${tags ? `<span class="tag-list">${tags}</span>` : ""}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <article class="article-body">
${a.html}
        </article>
        <div class="btn-row btn-row--center">
          <a class="btn btn--ghost" href="../articles.html"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> 回文章列表</a>
        </div>
      </div>
    </section>`;
  return pageShell({
    title: `${a.title} · Sam Hung`,
    description: a.summary || a.title,
    rel: "../",
    main,
  });
}

/* =====================================================
   5. 主流程
   ===================================================== */
function sanitizeSlug(str = "") {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function pageMeta(page) {
  const props = page.properties || {};
  const title = plainOf(props.Title?.title) || "Untitled";
  const slug =
    sanitizeSlug(plainOf(props.Slug?.rich_text)) ||
    sanitizeSlug(title) ||
    page.id.replace(/-/g, "").slice(0, 12);
  return {
    title,
    slug,
    summary: plainOf(props.Summary?.rich_text),
    tags: (props.Tags?.multi_select || []).map((o) => o.name),
    date: props.PublishedAt?.date?.start || (page.created_time || "").slice(0, 10),
  };
}

// 只回報「有沒有設、格式對不對」，絕不印出任何 secret 的值
function preflight() {
  const token = env.NOTION_TOKEN || "";
  const rawId = env.NOTION_DATABASE_ID || "";
  const id = normalizeNotionId(rawId);
  let ok = true;

  console.log("環境變數檢查：");

  if (!token) {
    console.log("  ✗ NOTION_TOKEN：未設定（GitHub → Settings → Secrets and variables → Actions）");
    ok = false;
  } else if (!/^(ntn_|secret_)/.test(token)) {
    console.log(`  ✗ NOTION_TOKEN：已設定但格式不像 Notion token（長度 ${token.length}，應以 ntn_ 或 secret_ 開頭）`);
    ok = false;
  } else {
    console.log(`  ✓ NOTION_TOKEN：已設定（格式正確，長度 ${token.length}）`);
  }

  if (!rawId) {
    console.log("  ✗ NOTION_DATABASE_ID：未設定");
    ok = false;
  } else if (!id) {
    console.log(`  ✗ NOTION_DATABASE_ID：無法解析出 32 碼 ID（目前長度 ${rawId.length}）`);
    ok = false;
  } else {
    console.log(`  ✓ NOTION_DATABASE_ID：${id}`);
  }

  const r2Set = R2_KEYS.filter((k) => env[k]);
  console.log(
    r2Set.length === R2_KEYS.length
      ? "  ✓ R2：五個變數齊全，圖片將上傳 Cloudflare R2"
      : `  · R2：已設 ${r2Set.length}/5${r2Set.length ? `（缺 ${R2_KEYS.filter((k) => !env[k]).join(", ")}）` : ""}，圖片改存 repo`
  );

  if (!ok) console.error("\n環境變數不完整，中止。名稱必須完全一致（含大小寫），參考 .env.example。");
  return ok;
}

async function loadPosts() {
  if (FIXTURE) {
    const raw = await readFile(path.join(ROOT, "scripts", "fixture.json"), "utf8");
    return JSON.parse(raw).posts;
  }
  if (!preflight()) process.exit(1);
  const pages = await queryPublishedPages();
  const posts = [];
  for (const page of pages) {
    posts.push({ page, blocks: await fetchBlockChildren(page.id) });
  }
  return posts;
}

async function main() {
  console.log(`模式：${FIXTURE ? "fixture（離線假資料）" : "Notion API"}；圖床：${R2_READY ? "Cloudflare R2" : "repo 本地（assets/images/articles/）"}`);

  const posts = await loadPosts();
  const articles = [];
  const usedSlugs = new Set();
  for (const { page, blocks } of posts) {
    const meta = pageMeta(page);
    // slug 撞名時加序號，避免互相覆蓋
    let slug = meta.slug;
    for (let i = 2; usedSlugs.has(slug); i++) slug = `${meta.slug}-${i}`;
    usedSlugs.add(slug);
    console.log(`轉換文章：${meta.title}（${slug}）`);
    articles.push({ ...meta, slug, html: await blocksToHtml(blocks) });
  }
  articles.sort((x, y) => (y.date || "").localeCompare(x.date || ""));

  // 清掉上次產生、這次已下架的文章頁
  const outDir = path.join(OUT_ROOT, "articles");
  await mkdir(outDir, { recursive: true });
  for (const f of await readdir(outDir)) {
    if (f.endsWith(".html")) await unlink(path.join(outDir, f));
  }

  for (const a of articles) {
    await writeFile(path.join(outDir, `${a.slug}.html`), articlePageHtml(a));
  }
  await writeFile(path.join(OUT_ROOT, "articles.html"), listingPageHtml(articles));

  console.log(`完成：${articles.length} 篇文章 → articles.html + articles/*.html`);
}

/* 只有「直接執行這支腳本」時才跑同步。scripts/regen-articles.mjs 會
   import 上面的 listingPageHtml / articlePageHtml 來用目前的模板重產
   已提交的文章頁（不連 Notion）——沒有這個守衛的話，光是 import 就會
   觸發一次真正的同步。CLI 行為完全不變：npm run sync、
   npm run sync:fixture，以及 verify-fixture.mjs 用 execFileSync 起的
   子行程都仍然是 entry point。 */
const isEntryPoint =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntryPoint) {
  main().catch((err) => {
    console.error("同步失敗：", err);
    process.exit(1);
  });
}

export { listingPageHtml, articlePageHtml };
