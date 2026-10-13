# AI 專案指令整理與文件同步報告

日期：2026-10-13。依本人要求將根目錄 `CLAUDE.md` 改為 `AGENTS.md`，查閱當日可取得的 OpenAI 與 Anthropic 官方指南，並同步 README、文件索引與更新紀錄。本次為文件與 AI 工作規則整理，沒有變更網站程式、Notion 發布狀態或部署。

## 官方指南與採用方式

### OpenAI

OpenAI 於 2026-09-11 發布的 [GPT-6 Astra 指令整理指南](https://learn.chatgpt.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra) 建議重新檢視既有 Skills、AGENTS.md 與任務提示，避免不必要的上下文及過度指定流程。文件入口應依任務需要提供，無需每次修改都先讀完整架構與部署文件；決策邊界應明確，避免讓代理在本來可完成的工作中過早停下。

本專案因此保留必要流程與授權邊界，文件按需查閱，移除固定檔案數、通用程式碼行數等會造成額外中斷的限制。這是依本專案需求的整理，並非官方指定唯一的 AGENTS.md 範本。

[OpenAI AGENTS.md 文件](https://learn.chatgpt.com/docs/agent-configuration/agents-md) 說明 Codex 在工作前載入專案指令，依目錄層級組合，較深層指令可覆蓋上層。AGENTS.md 適合保存穩定的工作約定；不是操作手冊或每次任務的完整紀錄。

### Anthropic

[Claude Code 最佳實務](https://code.claude.com/docs/en/best-practices#write-an-effective-claudemd) 建議保留模型難以自行推得的指令、特殊慣例、驗證流程與常見陷阱；一般語言規範、詳細 API 文件、長篇教學及頻繁變動的資訊應放到其他文件，按需閱讀。

[Claude Code 記憶與指令說明](https://code.claude.com/docs/en/memory#write-effective-instructions) 建議指令明確、可核對且一致，目標控制在 200 行以內；`@path` 匯入有助於整理，但匯入內容仍會占用啟動時的上下文。因此本次使用普通 Markdown 文件連結，不自動匯入整份 README 或報告。

## AGENTS.md 保留什麼？

- 專案的靜態建置、來源／產出分工、Notion 發布與私人內容邊界。
- 現有且可執行的建置、離線文章重產與驗證指令。
- 繁體中文溝通、合理使用 Skills、保留既有變更與發布授權要求。
- 根據變更類型同步文件與報告的完成條件。
- 四個按需查閱的文件入口。

個人畢業日期、成果數字、專案狀態、待辦與逐次驗證記錄繼續維護在 [內容更新報告](2026-10-content-update.md)，避免在多份指令檔重複保存而失去同步。

## 移除或更正的舊內容

| 舊內容 | 本次整理 |
| --- | --- |
| 未填寫的 TypeScript、資料庫、部署範本 | 改為目前 HTML／CSS／JavaScript、Node.js 工具、npm、GitHub Pages 的實際情況。 |
| SQL、migration、API server、PORT 等通用後端規則 | 本專案沒有該類執行期服務，移出現行指令。未來引入時另訂實際規範。 |
| 強制執行不存在的 lint／dev 指令 | 使用 package.json 已有指令，依修改性質選擇必要檢查。 |
| 超過約五個檔案就停下 | 改以授權範圍、不可逆操作、正式依賴與架構改造作為決策邊界。 |
| 未啟用的 Hotfix 自動推版範本 | 現行規則維持未獲授權不得 commit／push／部署，不保留空白啟用表單。 |
| 每次任務的大量固定動作 | 保留實際必要的驗證及收尾，文件按需閱讀。 |

遷移前原稿完整保存在 [歷史 CLAUDE.md](../archive/CLAUDE-before-2026-10-13.md)，僅新增封存註記；其中舊規則不是目前工作指令。

## 文件同步規則

AGENTS.md 新增變更對照表：操作更新 README；架構更新 development 文件；排版與視覺規則更新設計規範；個人資料、研究及作品更新對應來源與報告；文章更新核對紀錄；文件搬移更新索引與連結。

每次有實際變更，在相關報告追加日期、原因、結果、驗證與限制；大型新主題另建報告。歷史事實保留並註明新狀態，操作手冊直接維護現行做法。無影響的文件核對後不需重寫。

這是 AI 的工作完成條件，不是新建的檔案監聽器、CI 規則或自動文件生成器；仍需執行者實際完成核對。

## Codex 與 Claude Code 的載入差異

本次以 AGENTS.md 作為唯一的現行專案指令，沒有留下第二份根目錄 CLAUDE.md。

依查閱時的 [Anthropic 官方文件](https://code.claude.com/docs/en/memory#agentsmd)，Claude Code v2.1.277 起可直接讀取 AGENTS.md；預設要求工作目錄及上層沒有專案 CLAUDE.md／CLAUDE.local.md，且相關支援可用。舊版或特定設定需透過 CLAUDE.md 的 `@AGENTS.md` 匯入，不能假設所有版本都會自動載入。尚未實際啟動新 Codex／Claude Code session 驗證此次載入情形，也沒有更動使用者全域設定。

本次採用的中文篇幅、文件分類及同步表是專案選擇；官方指南提供精簡、按需與可驗證的方向，沒有規定所有指令檔只能保留固定幾種欄位。

## 驗證與限制

- AGENTS.md 為 68 行、5,916 bytes，低於採用的 200 行目標；根目錄舊檔已移出，封存檔保留舊稿及封存註記。
- 現行 Markdown 核對通過：8 份文件、57 個本機連結、19 處 npm 指令；相對連結、標題結構與指令存在性已確認。原稿封存不套用現行指令驗證，避免將歷史範本誤判為現在必須執行的指令。
- 網站驗證輸出：`verify: 全數通過（7 個 HTML 頁面、7 個 script 來源檔）`。
- 差異空白檢查無錯誤；未 commit、push 或部署。

上述檢查確認文件與現有程式的連結／指令一致，不代表已驗證未來所有 AI 都會遵循指令或工具新 session 的自動載入。
