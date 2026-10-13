# YOLO 重構文章：核對與入稿紀錄

狀態：內容已確認，2026-10-13 已加入 Notion Site Articles，Status=Draft、PublishedAt=null，尚未發佈。

Notion：<https://app.notion.com/p/PySide6-Web-YOLO-System-3f8810f2a7c481f1b265c643257216c6>。已讀回核對標題、Slug、摘要、四個標籤、草稿狀態，以及完整 47 個正文區塊（含 8 個段落標題）、粗體、行內程式碼、程式碼區塊與連結。正文首行標題由 Notion 頁面 Title 承擔，未重複插入。

內容來源為目前本機 Yolo_system 程式與文件，不宣稱遠端儲存庫或部署環境與本機版本完全相同。本輪沒有重新執行 YOLO 模型、專案測試或連線資料庫。

## 來源核對

| 文章內容 | 實際依據 |
|---|---|
| Legacy 耦合與逐步重構 | Yolo_system/README.md、AGENTS.md、docs/current-system-analysis.md、原有案例頁 |
| 桌面共用 API client 與不同 timeout | desktop-app/api_client.py：DesktopApiClient、INFERENCE_TIMEOUT／UPLOAD_TIMEOUT／STREAM_TIMEOUT／BINARY_TIMEOUT |
| Web HTTP client／認證 | web-frontend/src/services/api.js |
| Route／service／repository 路徑 | backend/app/api/routes/detections.py、services/detection_service.py、repositories/detection_repository.py |
| bcrypt／JWT | backend/app/core/security.py、services/auth_service.py |
| 預設金鑰的 production 啟動阻擋 | backend/main.py：startup_event |
| 簽章／Bearer 存取與登入存取為兩條路徑 | backend/app/api/routes/static_files.py、core/static_tokens.py、services/static_access_service.py |
| 結果 API 的擁有權檢查與簽章產生 | detection_service.py：_get_owned_task、get_detection、_to_static_url |
| Desktop／Web 的 Agent SSE | desktop-app/api_client.py、web-frontend/src/services/agentService.js、backend/app/api/routes/agents.py |
| Agent 工具權限、mock／fallback | backend/app/agents/tools/detection_tools.py、agents/llm.py、AGENTS.md |
| BackgroundTasks 與部分測試 | backend/app/api/routes/detections.py、backend/tests/test_static_tokens.py 等測試檔；僅核對測試存在，沒有宣稱本輪執行通過 |

## 已同步校正案例頁

- 「明文舊密碼無法轉成雜湊」改為：既有帳號需明確遷移或重設策略，資料表更新不會自動完成轉換。
- 「每次圖片取檔都再次核對帳號」改為：簽章路徑核對簽章／期限；無簽章路徑驗證登入者與檔案權限。有效簽章網址是短期存取能力。

這是文案校正，沒有改動 YOLO 程式或其存取行為。

## Notion 欄位

依網站目前 scripts/sync-notion.mjs 的實際映射：

- Title：從 PySide6 到桌面與 Web 共用後端：YOLO System 的漸進式重構
- Slug：yolo-system-api-refactoring
- Summary：從耦合的桌面程式建立共用 FastAPI 後端：逐步遷移客戶端，整理認證、結果檔案存取與唯讀 Agent 邊界，並保留未完成的維運限制。
- Tags：Software Engineering、Refactoring、FastAPI、AI Agent
- Status：審閱期間維持非 Published；資料庫若已有 Draft，可選 Draft。
- PublishedAt：確認發布時再填實際日期，不以草稿建立日期代替。

文章正文備份為 [_drafts/articles/yolo-system-api-refactoring.md](../../_drafts/articles/yolo-system-api-refactoring.md)，欄位備份為 [JSON](../../_drafts/articles/yolo-system-api-refactoring.json)。已完成 Notion 入稿，之後請在 Notion 編輯；本機備份不會自動雙向同步。入稿時以頁面 Title 承擔主標題，避免重複。本文只使用目前同步器支援的段落、標題、清單、程式碼與連結，未依賴 Mermaid 渲染。

## 發布界線

目前 Articles 正式列表仍為空。已依本人要求寫入 Notion 草稿，沒有切換 Published、執行正式同步、commit、push 或部署。

本人可直接在 Notion 繼續編輯；決定發布時再設定 Published 與 PublishedAt，由既有流程同步。草稿已附 Markdown、metadata 與使用現有文章模板的隔離本機預覽，不需為此改變網站架構。
