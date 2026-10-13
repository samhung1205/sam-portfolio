# 技術架構與維護說明

整理日期：2026-10-13。本文承接原 README 的技術內容，依本機實作補充；操作指令請先參考 [使用手冊](../../README.md)。

## 網站架構

網站以靜態 HTML、CSS、JavaScript 實作，沒有前端框架或執行期後端。Node.js 用於建置、驗證與 Notion 同步；Notion 是文章來源，Cloudflare R2 是選用的文章圖床。

```text
_src/pages/                 各頁的可編輯來源，含案例頁
_src/partials/              共用 head、導覽列、頁尾
_src/layouts/               共用頁面外框
_src/config/                網站、導覽與色彩對比設定
scripts/build.mjs           來源轉為一般公開 HTML
scripts/lib/layout.mjs      共用渲染與版本計算
scripts/sync-notion.mjs     Notion 轉為文章列表與文章頁
scripts/regen-articles.mjs  離線重產現有文章的共用外框
css/                        全站與文章樣式
js/                         內容資料與瀏覽器互動
assets/                     圖片、履歷及論文
_drafts/articles/           本機文章備份與草稿欄位
docs/                       維護說明、報告、選題素材
articles.html               產生的文章列表
articles/                   產生的文章頁
case-studies/               產生的案例頁
```

一般頁面由 [build.mjs](../../scripts/build.mjs) 遞迴讀取 `_src/pages/`，依目錄深度產生相對路徑。目前有六個來源頁面；文章列表由另一條流程維護。

公開 HTML 是部署產物，需要與來源一起提交。GitHub Pages 不會在訪客瀏覽時執行 Node.js 建置。

## 共用頁面外框

[layout.mjs](../../scripts/lib/layout.mjs) 共用 `_src/layouts/`、`_src/partials/` 與設定檔，提供一般頁面及 Notion 文章同一份 head、導覽、頁尾與版本資料。模板使用簡單字串替換，不引入額外模板引擎。

共用結構變更後，執行一般建置及離線文章重產。離線腳本從本機已有的文章 HTML 還原標題、日期、標籤、摘要與正文，重新套用版型；正文 HTML 保持逐位元組相同，不連線 Notion 或 R2。

## 快取版本設計

公開資產使用 `?v=` 內容版本，避免頁面、CSS 與 JavaScript 取得不同時期的快取。

- **資產版本（BUILD_VERSION）**：依 `css/style.css`、`css/article.css`、`js/data.js`、`js/main.js` 的合併內容計算 SHA-256，取前十碼。
- **履歷版本（RESUME_VERSION）**：只依 `assets/files/resume.pdf` 的內容計算。
- **外框版本（SHELL_VERSION）**：依共用 layout、partials、導覽及網站設定計算，放在 HTML 註解內，供驗證器檢查。

同樣內容在本機、提交前後與 CI 中會得到相同版本。曾採用 Git commit 雜湊作版本時，提交前建置與 CI checkout 後的版本不同，導致產出一致性檢查失敗；目前使用內容雜湊，避免這項問題。

## Notion 同步流程

[sync-notion.mjs](../../scripts/sync-notion.mjs) 使用專案既有的 Notion API 版本 `2022-06-28`。資料庫欄位契約為：`Title`（title）、`Slug`／`Summary`（rich text）、`Status`（select）、`PublishedAt`（date）、`Tags`（multi-select）。

同步查詢只取得 `Status = Published`，轉換 blocks 後產生 `articles.html` 與 `articles/<slug>.html`，依日期排序。沒有填日期時會以 Notion 頁面的建立日期代替，因此發布時應主動填寫實際日期。Slug 留空時會由標題產生；撞名時會加序號，建議仍自行設定唯一且穩定的 Slug。

同步會清除 `articles/` 既有 HTML 再依查詢結果重產，因此離開 Published 的文章會在成功同步後下架。此流程不是單純新增一篇文章；不要拿正式同步當作共用版型的離線重建指令。

本機 Markdown 備份與 Notion 沒有自動雙向同步。網站上的文章內容以當次 Notion 同步結果為準。

### 文章圖片與憑證

必填：`NOTION_TOKEN`、`NOTION_DATABASE_ID`。本機 `sync:local` 從 `.env` 載入，GitHub Actions 從 repository secrets 注入；`npm run sync` 本身讀取的是環境變數，不會自行讀取 `.env`。

R2 五個變數全部設定才使用 R2：`R2_ACCOUNT_ID`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_BUCKET_NAME`、`R2_PUBLIC_URL`，設定範例見 [.env.example](../../.env.example)。缺少任何一個時，需儲存的文章圖片改存到 `assets/images/articles/`。圖片依內容雜湊命名，減少重複儲存及 Notion 暫時檔案 URL 過期的影響。

實際憑證不寫入文件或 Git。

## 驗證範圍

[verify.mjs](../../scripts/verify.mjs) 檢查建置一致性、共用外框、導覽、資產與內部路徑、HTML 結構、SEO、色彩 token、設定中宣告的對比配對及文章換行規則。一般頁面建置檢查會重新計算並比較，不寫入產物。

[verify-fixture.mjs](../../scripts/verify-fixture.mjs) 使用隔離範例資料測試 Notion pipeline，不讀寫正式 Notion、不覆蓋正式文章。

目前沒有 `lint` 指令，也沒有完整瀏覽器端到端測試套件。自動檢查不涵蓋所有鍵盤操作、觸控目標、實際畫面、完整標題層級或文字事實；修改後仍需依影響範圍目視與操作。

## CI 與部署

- [Verify](../../.github/workflows/verify.yml)：每次 push／pull request 安裝鎖定依賴，執行 verify 與隔離 fixture；僅有讀取權限。
- [Sync Notion articles](../../.github/workflows/sync-notion.yml)：每天台北 05:00 排程或手動啟動。同步後先 verify，有變更才提交與推送文章 HTML 及本地文章圖片。
- GitHub Pages：依目前專案設定從 `main` 根目錄發布提交的靜態產物；部署後需核對正式網址。

[GitHub Pages 官方文件](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll#configuring-jekyll-in-your-github-pages-site) 說明分支發布採 Jekyll，並可透過 `_config.yml` 的 exclude 排除檔案。本專案的 [_config.yml](../../_config.yml) 排除 docs、草稿、來源模板、設計文件、AI 指令、README、scripts 及套件設定；它們仍在 Git 中供維護，不隨網站發布。正式資產仍為生成的 HTML、CSS、JS、圖片、PDF 與 SEO 檔案。GitHub Pages 的 source／build_type 已於 2026-10-13 透過 GitHub API 確認為 main 根目錄／legacy。

更換正式網域時，除 `site.json` 外，也應檢查 [robots.txt](../../robots.txt)、[sitemap.xml](../../sitemap.xml) 及來源內的固定連結；確認 canonical 與社群預覽網址同步。

## 文件權責

[設計規範](../../design-system/MASTER.md) 記錄 Graphite／muted copper 的視覺原則、字型、響應式與無障礙要求，其中歷史階段的 Planned 項目需要核對實作。網站內容是否已更新、已發布或尚待本人確認，以 [內容更新報告](../reports/2026-10-content-update.md) 的日期與範圍為準。
