# 專案文件目錄

整理日期：2026-10-13。日常使用從 [網站使用手冊](../README.md) 開始；本資料夾保留技術說明、更新報告與寫作素材。

## 文件分類

| 分類 | 文件 | 什麼時候閱讀？ |
| --- | --- | --- |
| 開發與維護 | [技術架構與維護說明](development/architecture.md) | 修改建置、共用版型、快取版本、文章同步或驗證流程時。 |
| 更新報告 | [2026 年 10 月內容更新報告](reports/2026-10-content-update.md) | 查看已確認內容、完成事項、驗證紀錄與後續待辦。 |
| 文章核對報告 | [YOLO 重構文章核對與入稿紀錄](reports/yolo-system-article-review.md) | 查文章的程式依據、Notion 欄位與入稿驗證。 |
| AI 指令整理 | [AGENTS.md 遷移與文件同步報告](reports/2026-10-13-agent-instructions.md) | 查官方指南、規則取捨、工具載入差異與同步要求。 |
| 提交與部署 | [2026-10-13 發布紀錄](reports/2026-10-13-release.md) | 查提交範圍、部署排除、檢查與正式發布結果。 |
| 歷史封存 | [遷移前 CLAUDE.md 原稿](archive/CLAUDE-before-2026-10-13.md) | 追溯舊規則；不作為現行 AI 工作指令。 |
| 寫作素材 | [文章選題庫](writing/article-ideas.md) | 找題目、縮小篇幅或開始記錄開發經驗時。 |

## 保留在原位置的文件

- [AGENTS.md](../AGENTS.md)：AI 使用的精簡專案工作規則，已取代原本根目錄 CLAUDE.md；詳細歷程另存報告與封存檔。
- [design-system/MASTER.md](../design-system/MASTER.md)：設計規範，保留英文技術規格及原路徑。部分階段性敘述反映制定時的狀態；實際完成情況需對照目前程式與更新報告。
- [_drafts/articles/yolo-system-api-refactoring.md](../_drafts/articles/yolo-system-api-refactoring.md)：文章入稿時的本機 Markdown 備份；目前編輯入口為 Notion，不會雙向同步。
- [_drafts/articles/yolo-system-api-refactoring.json](../_drafts/articles/yolo-system-api-refactoring.json)：本機草稿欄位備份，不是網站發布開關。

## 文件維護方式

- **使用手冊**：操作流程變動時更新，不把每次開發經過堆進 README。
- **架構說明**：保留現在的實作與重要取捨，指向實際來源檔案。
- **報告**：寫明日期、變更、確認方式及限制；區分本機完成與正式站發布。
- **寫作素材**：保留題目與材料，完成的正文另放文章草稿或 Notion。
- **AI 指令**：只保留穩定規則與必要入口；任何實作變更都要核對受影響文件，在同一次工作完成同步及驗證。原稿封存是歷史，不新增第二份現行規則。

本次把原 README 的架構、驗證與快取設計移入開發說明，將階段性成果整理成更新報告；文章核對表及選題庫移入對應分類。README 改為操作手冊，並以最新已確認狀態取代舊的「暫不公開文章」描述。
