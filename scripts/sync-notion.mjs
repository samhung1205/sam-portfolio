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

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE = process.argv.includes("--fixture");
const env = process.env;

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
    if (!res.ok) throw new Error(`Notion API ${pathname} → ${res.status}: ${await res.text()}`);
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
    const res = await notionApi(`/databases/${env.NOTION_DATABASE_ID}/query`, {
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
    const dir = path.join(ROOT, "assets", "images", "articles");
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
   4. 頁面模板（與現有六頁的 nav / footer / head 一致）
   ===================================================== */
const NAV_ITEMS = [
  ["index.html", "Home"],
  ["about.html", "About"],
  ["projects.html", "Projects"],
  ["research.html", "Research"],
  ["articles.html", "Articles"],
  ["resume.html", "Resume"],
];

function pageShell({ title, description, rel, main }) {
  const nav = NAV_ITEMS.map(
    ([href, label]) => `          <li><a class="nav__link" href="${rel}${href}">${label}</a></li>`
  ).join("\n");
  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeAttr(description)}" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" />
  <link rel="stylesheet" href="${rel}css/style.css" />
  <link rel="stylesheet" href="${rel}css/article.css" />
</head>
<body>
  <!-- 本檔由 scripts/sync-notion.mjs 產生，請勿手動編輯；內容請到 Notion「Site Articles」資料庫修改 -->
  <header class="nav">
    <div class="container nav__inner">
      <a class="nav__brand" href="${rel}index.html" aria-label="Back to homepage">
        <img class="nav__logo" src="${rel}assets/images/logo.png" alt="Sam logo" />
        <span class="nav__brand-text">
          <strong>Sam Hung</strong>
          <small>AI Agent Engineer</small>
        </span>
      </a>
      <button class="nav__toggle" type="button" aria-label="Toggle menu" aria-controls="site-menu" aria-expanded="false"><span></span></button>
      <nav aria-label="Primary navigation">
        <ul class="nav__menu" id="site-menu">
${nav}
        </ul>
      </nav>
    </div>
  </header>

  <main>
${main}
  </main>

  <footer class="footer">
    <div class="container footer__inner">
      <div>© <span data-render="footer-year"></span> Sam Hung · AI Agent Engineer</div>
      <ul class="footer__social" data-render="footer-social"></ul>
    </div>
  </footer>

  <script src="${rel}js/data.js"></script>
  <script src="${rel}js/main.js"></script>
</body>
</html>
`;
}

function articleCardHtml(a) {
  const tags = a.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  return `        <article class="card reveal">
          <div class="card__header">
            <div>
              <span class="card__kicker">${escapeHtml(a.date)}</span>
              <h3 class="card__title card__title--spaced"><a href="articles/${a.slug}.html">${escapeHtml(a.title)}</a></h3>
            </div>
          </div>
          <p class="card__summary">${escapeHtml(a.summary)}</p>
          ${tags ? `<div class="tag-list">${tags}</div>` : ""}
          <div class="card__footer">
            <a href="articles/${a.slug}.html"><i class="fa-solid fa-book-open"></i> 閱讀全文</a>
          </div>
        </article>`;
}

function listingPageHtml(articles) {
  const cards = articles.map(articleCardHtml).join("\n");
  const main = `    <section class="section page-hero page-hero--articles">
      <div class="container reveal">
        <span class="section-eyebrow">// ARTICLES</span>
        <h1>文章筆記</h1>
        <p class="page-intro">
          技術筆記與心得，在 Notion 撰寫、自動同步到這裡。涵蓋 AI Agent、演算法、軟體工程與數學。
        </p>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container">
        ${
          articles.length
            ? `<div class="grid grid--2">\n${cards}\n        </div>`
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
        <span class="section-eyebrow">// ARTICLE</span>
        <h1 class="article-title">${escapeHtml(a.title)}</h1>
        <div class="article-meta">
          <span><i class="fa-regular fa-calendar"></i> ${escapeHtml(a.date)}</span>
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
          <a class="btn btn--ghost" href="../articles.html"><i class="fa-solid fa-arrow-left"></i> 回文章列表</a>
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

async function loadPosts() {
  if (FIXTURE) {
    const raw = await readFile(path.join(ROOT, "scripts", "fixture.json"), "utf8");
    return JSON.parse(raw).posts;
  }
  const missing = ["NOTION_TOKEN", "NOTION_DATABASE_ID"].filter((k) => !env[k]);
  if (missing.length) {
    console.error(`缺少環境變數：${missing.join(", ")}（參考 .env.example）`);
    process.exit(1);
  }
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
  const outDir = path.join(ROOT, "articles");
  await mkdir(outDir, { recursive: true });
  for (const f of await readdir(outDir)) {
    if (f.endsWith(".html")) await unlink(path.join(outDir, f));
  }

  for (const a of articles) {
    await writeFile(path.join(outDir, `${a.slug}.html`), articlePageHtml(a));
  }
  await writeFile(path.join(ROOT, "articles.html"), listingPageHtml(articles));

  console.log(`完成：${articles.length} 篇文章 → articles.html + articles/*.html`);
}

main().catch((err) => {
  console.error("同步失敗：", err);
  process.exit(1);
});
