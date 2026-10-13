# Sam Hung 個人網站使用手冊

這份手冊提供日後更新個人資料、作品、論文、履歷與文章時的操作方式。網站使用靜態 HTML、CSS 與 JavaScript，文章由 Notion 管理。

- 正式網站：[Sam Hung 個人網站](https://samhung1205.github.io/sam-portfolio/)
- 延伸文件：[文件目錄](docs/README.md)
- 技術細節：[架構與維護說明](docs/development/architecture.md)
- 最新紀錄：[2026 年 10 月內容更新報告](docs/reports/2026-10-content-update.md)

## 1. 網站有哪些內容？

| 頁面 | 用途 |
| --- | --- |
| 首頁（Home） | 個人定位、精選作品與研究入口。 |
| 關於我（About） | 背景、能力與工作方式。 |
| 專案（Projects） | 作品用途、技術、實作重點與展示連結。 |
| 研究（Research） | 論文摘要、結果、限制與全文 PDF。 |
| 文章（Articles） | 從 Notion 發布的技術文章與筆記。 |
| 履歷（Resume） | 學經歷、獎項、聯絡資訊與 PDF 下載。 |
| YOLO 工程案例 | YOLO System 的架構、重構與工程取捨。 |

## 2. 如何在自己的電腦預覽？

準備 Node.js 20 或更新版本，以及 Python 3。終端機切換到本專案資料夾後，第一次使用或套件鎖定檔更新時執行：

```bash
npm ci
```

產生網站頁面並啟動預覽：

```bash
npm run build
node scripts/regen-articles.mjs
python3 -m http.server 8000
```

瀏覽器開啟 [本機網站](http://localhost:8000/)。預覽期間保持終端機開啟，結束時按 `Ctrl+C`。若 8000 已被使用，可改用其他埠號，例如 8001，瀏覽器網址也一起修改。

修改後需要重新執行建置並重新整理瀏覽器；目前沒有自動重新建置功能。

## 3. 要更新內容，應該改哪個檔案？

| 想更新的內容 | 編輯位置 | 補充說明 |
| --- | --- | --- |
| 個人資料、專案、技能、研究卡片、學經歷、獎項 | [js/data.js](js/data.js) | 大部分常更新的資料集中在這裡。 |
| 各頁介紹、研究摘要、固定文字 | [_src/pages/](./_src/pages/) | 例如 `about.html`、`research.html`、`resume.html`；首頁也有固定文字及資料載入前的內容。 |
| YOLO 工程案例 | [_src/pages/case-studies/yolo-system.html](_src/pages/case-studies/yolo-system.html) | 修改來源後由建置指令產生公開頁面。 |
| 最新履歷 PDF | [assets/files/resume.pdf](assets/files/resume.pdf) | 使用相同檔名替換，並同步更新網頁資料。 |
| 論文全文 | [assets/files/Thesis.pdf](assets/files/Thesis.pdf) | 替換後核對研究摘要、數據與檔案大小說明。 |
| 專案圖片 | [assets/images/](assets/images/) | 原圖放這裡；列表預覽圖放 `assets/images/previews/`。 |
| 導覽列與聯絡入口 | [_src/config/nav.json](_src/config/nav.json) | 全站共用設定。 |
| 正式網址、網站名稱、語系 | [_src/config/site.json](_src/config/site.json) | 更換網址時還要核對 SEO 設定，詳見架構文件。 |
| 字型、色彩、間距、版面 | [css/style.css](css/style.css) | 先參考 [設計規範](design-system/MASTER.md)。 |
| 文章內容 | Notion 的 Site Articles 資料庫 | 網站文章 HTML 由同步程式產生。 |

根目錄的 `index.html`、`about.html` 等，以及 `case-studies/`、`articles/` 裡的 HTML 是產出檔。一般內容請編輯來源；文章請在 Notion 修改，以免下一次建置或同步覆蓋手動修改。

### 新增或更新專案

在 `js/data.js` 參考現有專案物件填寫名稱、簡介、技術、角色、重點與連結。已有截圖的三個作品保留 PNG 原圖，列表使用 WebP 預覽；圖片資料包含路徑、替代文字（alt）與尺寸。

個人使用、暫不公開的作品可以參考 LifeOps 或 ScamShield，設定 `access: "personal"`，填寫名稱與文字介紹。目前這類卡片顯示「個人使用」，不顯示圖片占位、GitHub 或使用網址。請勿把私人網址或資料填入 `js/data.js`，這支檔案會提供給網站訪客。

### 更新履歷

1. 用最新版替換 `assets/files/resume.pdf`。
2. 核對 `js/data.js` 的教育、經歷與獎項，以及 `_src/pages/` 相關固定文字。
3. 重新建置，開啟 Resume 頁並確認下載到的是新 PDF。

履歷下載連結會依檔案內容自動更新版本，不必手動修改 `?v=`。

## 4. 如何在 Notion 撰寫與發布文章？

日常編輯入口是 Notion **Site Articles** 資料庫。你在 Notion 決定文章是否公開，網站同步器只讀取 `Status = Published` 的文章。

| Notion 欄位 | 填寫方式 |
| --- | --- |
| `Title` | 文章標題。 |
| `Slug` | 網址代稱，建議使用小寫英文與連字號，例如 `yolo-system-api-refactoring`；不同文章使用不同代稱。 |
| `Summary` | 一至兩句摘要，顯示在文章列表。 |
| `Tags` | 主題標籤，可複選。 |
| `Status` | 撰寫時選 `Draft`；決定公開時改為 `Published`。 |
| `PublishedAt` | 實際發布日期；草稿可以留白。 |

正文寫在該 Notion 頁面內。頁面標題會成為網站文章的主標題，正文不必重複再放一次。Notion 的標題 1、2、3 會依序轉為網站的第二、第三、第四層標題。

### 發布步驟

1. 在 Notion 完成正文，核對標題、摘要、標籤與 Slug。
2. 設定 `PublishedAt`，將 `Status` 改成 `Published`。
3. 等待既有排程同步，或到 GitHub 專案的 **Actions → Sync Notion articles → Run workflow** 手動觸發。
4. 確認同步及 Pages 部署成功，再開啟正式網站核對文章。

工作流程設定為每天台北時間 **05:00** 同步；實際執行與網站更新時間以 GitHub Actions 結果為準。`Published` 是發布開關，設定後下次成功同步即可產生公開文章。

若要下架，把狀態改回 `Draft`，下一次成功同步會從列表及產出的文章頁移除。已公開的內容仍可能留在瀏覽器快取或他人保存的副本中。

### 目前的 YOLO 文章

[從 PySide6 到桌面與 Web 共用後端：YOLO System 的漸進式重構](https://app.notion.com/p/PySide6-Web-YOLO-System-3f8810f2a7c481f1b265c643257216c6) 已放入 Site Articles，目前為 `Draft`。之後請在 Notion 編輯與決定發布。

本機 [Markdown 草稿](_drafts/articles/yolo-system-api-refactoring.md) 是入稿時的備份，不會自動與 Notion 雙向同步。更多題目可參考 [文章選題庫](docs/writing/article-ideas.md)。

### 需要在本機同步時

網站已有 `.env` 設定；新環境可參考 [.env.example](.env.example) 建立自己的 `.env`，填入 `NOTION_TOKEN` 與 `NOTION_DATABASE_ID`，並讓 integration 取得資料庫存取權。請不要覆蓋已填好的 `.env` 或將憑證提交到 Git。

```bash
npm run sync:local
npm run verify
```

這會讀取 Notion 並改寫本機文章列表與文章頁，但不會自行提交或推送本機變更。`sync:local` 使用 Node.js 的 `--env-file` 功能；若版本不支援，請更新 Node.js。圖片儲存設定詳見 [架構文件](docs/development/architecture.md#文章圖片與憑證)。

## 5. 一般更新完成後怎麼檢查？

更新來源、資料、樣式或履歷後，執行：

```bash
npm run build
node scripts/regen-articles.mjs
npm run verify
npm run verify:fixture
```

第一個指令產生一般頁面；第二個在不連線 Notion 的情況下，更新現有文章的共用版型與資產版本，保留文章內容。**若要取得 Notion 最新正文，使用文章同步流程。**

| 指令 | 用途 |
| --- | --- |
| `npm run build` | 從來源產生一般頁面與案例頁。 |
| `node scripts/regen-articles.mjs` | 離線更新文章列表、現有文章頁的外框與資產版本。 |
| `npm run build:check` | 只檢查一般頁面是否與來源一致，不寫入檔案。 |
| `npm run verify` | 檢查建置一致性、導覽、內部連結、SEO、HTML 結構、色彩與宣告的對比規則。 |
| `npm run verify:fixture` | 用隔離範例資料測試文章同步，不讀寫正式 Notion 或覆蓋正式文章。 |

再用瀏覽器核對本次更新涉及的頁面、圖片及下載連結；如果改了版面，也看一次手機寬度。自動檢查不能取代實際閱讀與操作。

## 6. 如何把一般更新放上正式網站？

目前專案設定為 GitHub Pages 從 `main` 分支根目錄發布靜態檔案。

[_config.yml](_config.yml) 設定部署排除清單：`docs/`、文章草稿、AI 指令、README、設計規範及建置工具保留在 Git，正式網站只發布所需頁面與資產。`.env`、node_modules 與系統暫存檔不提交。文件仍可由 GitHub 儲存庫閱讀，排除部署不等於設為私人。

1. 完成前述建置與檢查。
2. 檢視差異，將修改的來源、產出的 HTML、需要的圖片或 PDF 一起提交（commit）。
3. 推送（push）到 `main`。
4. 到 GitHub Actions 確認 Verify 與 Pages 部署結果，再核對正式網站。

請依當前分支與協作情況處理提交，不要為了更新網站直接強制推送。一般更新與 Notion 自動同步是兩條流程；Notion 工作流程會在有變更且檢查通過時自行提交、推送文章產物。

## 7. 常見狀況

| 狀況 | 先檢查什麼？ |
| --- | --- |
| 改了來源，頁面仍是舊內容 | 是否重新執行 `npm run build`？資料或樣式變動時，也執行離線文章重產指令。 |
| `build:check` 顯示不一致 | 先重新建置，再檢查來源與產出差異。 |
| 文章導覽或資產版本過期 | 執行 `node scripts/regen-articles.mjs`，再跑 `npm run verify`。 |
| Notion 文章沒出現在網站 | `Status` 是否為 `Published`？同步、驗證與部署是否成功？ |
| 本機同步發生 401／403／404 | 檢查 token、資料庫 ID 與 Notion integration 的資料庫連線權限；不要把 token 貼進公開紀錄。 |
| 履歷 PDF 與網頁內容不同 | PDF 與網頁資料需分別更新，網站不會自動解析 PDF 填回履歷。 |
| 不確定下一步要改善什麼 | 查看 [更新報告的待辦](docs/reports/2026-10-content-update.md#後續待辦)。 |

README 維護目前可用的操作方式；技術決策、歷程與核對證據放在 [docs/](docs/README.md)。

## 8. 與 AI 協作時，文件如何維護？

[AGENTS.md](AGENTS.md) 是 AI 的專案工作規則，包含必要指令、專案限制與文件同步要求。內容、架構、版面或操作方式變更時，AI 需在同一次工作更新受影響的手冊、設計規範及報告，並核對連結與實際檢查結果。

規則只保留穩定資訊；個人狀態與逐次紀錄放在對應報告。這次指令整理的依據與遷移紀錄見 [AI 指令整理報告](docs/reports/2026-10-13-agent-instructions.md)。
