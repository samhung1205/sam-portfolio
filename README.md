# Sam Hung — Portfolio

Sam Hung 的個人品牌網站，用來持續累積 Projects、Research、Articles 與個人經歷。正式站：<https://samhung1205.github.io/sam-portfolio/>

網站以靜態 HTML、CSS 與 JavaScript 實作，採用 Graphite 與 muted copper 的設計系統。主要公開資訊架構為：

- Home
- About
- Projects
- Research
- Articles
- Resume
- YOLO System engineering case study

Projects 表達「我建造了什麼」；Research 表達「我正在研究什麼」。Articles 與 Notion publishing pipeline 仍是長期架構的一部分，但目前正式站只顯示誠實的空狀態，不發布尚未整理完成的文章。

## Architecture

網站沒有前端框架或執行期後端。可編輯來源與部署產物刻意分開：

```text
_src/pages/                 page-specific source content
_src/partials/              shared head, navigation, and footer
_src/layouts/               shared HTML shell
_src/config/                navigation, SEO, and contrast contracts
scripts/build.mjs           source -> generated public HTML
scripts/lib/layout.mjs      shared renderer and content hashes
scripts/sync-notion.mjs     Notion -> Articles publishing pipeline
scripts/regen-articles.mjs  offline Articles regeneration
css/                        shared and article styles
js/                         content data and browser behavior
assets/                     images, screenshots, and resume PDF
articles.html               generated Articles listing
articles/                   generated nested article routes
case-studies/               generated case-study routes
```

根目錄的公開 HTML 是 generated output，需與 `_src/` 一起提交。一般頁面由 `npm run build` 產生；Articles listing 與文章頁由 Notion pipeline 或離線 regeneration 產生。不要直接修改 generated HTML 來解決 source conflict。

所有一般頁面與 Articles 共用同一套 shell。驗證會檢查 shell freshness、導覽設定、內部路徑、HTML 結構、色彩與對比規則，避免一般頁面和巢狀 article/case-study routes 漂移。

## Local development

需求：Node.js 20 或更新版本。

```bash
npm ci
npm run build
python3 -m http.server 8000
```

開啟 <http://localhost:8000/>。修改 `_src/pages/`、shared partials 或 layout 後，重新執行 `npm run build`。

## Verification

```bash
npm run build:check
npm run verify
npm run verify:fixture
```

- `build:check`：確認 source 與 committed generated pages 完全一致。
- `verify`：執行 build drift、shared-shell、nav、asset、contrast、SEO 與結構檢查。
- `verify:fixture`：用 repository fixture 隔離驗證 Notion pipeline，不讀寫 production Notion。

CI 會在 push 與 pull request 上執行 `verify` 和 `verify:fixture`。

## Content-hash cache busting

CSS、JavaScript 與 resume PDF 的公開 URL 使用檔案內容的 SHA-256 短雜湊作為 `?v=` 版本。相同內容會得到相同 URL；只有檔案內容改變時版本才改變。這個策略不依賴時間戳、`Date.now()` 或 Git commit SHA，因此 local build、CI 與部署結果可重現。

## Articles and Notion

Notion infrastructure 保留在 `scripts/sync-notion.mjs`，包含 renderer、article CSS、fixture、shared-shell freshness 與 nested route 支援。

目前產品決策是暫不公開 article content：

- `articles.html` 應顯示空狀態。
- 未整理完成的文章不應存在於 production output。
- `npm run verify:fixture` 只在隔離暫存目錄測試同步結果。
- 不要為了本機 conflict 直接執行 production Notion sync。

需要重新發布文章時，先在 Notion 確認內容與 Published 狀態，再以正確環境變數執行同步流程。

## Deployment

GitHub Pages 從 `main` 的 repository root 發布 committed static output。標準發布流程：

```bash
npm run build:check
npm run verify
npm run verify:fixture
git push origin main
```

推送後等待 GitHub Actions 的 Verify 與 Pages deployment 完成，再對正式站做 smoke test。

## Known and deferred work

- Master's Thesis 仍在進行中；目前不提供完成版 thesis page。
- Articles 暫時只有公開空狀態，內容整理完成後才恢復發布。
- Resume 中無法由 public repository 直接驗證的敘述，需由本人依私人紀錄確認；本 repository 不自動增強或改寫這些主張。
- Dark mode、獨立 thesis page、article rewriting 與其他新功能不屬於目前 release baseline。
