# SpecBridge — Requirements Brief

## Goal
建立一個名為 `specbridge` 的 Node.js CLI 工具，透過解析 Gherkin `.feature` 檔案自動執行 HTTP 合約測試，驗證目標服務的回應狀態碼與回應主體是否符合 feature 檔案中定義的合約。

## Requirements

### CLI 介面
- 實作 `verify` 命令，接受以下參數：
  - `-f, --file <path>`（必填）：指定 `.feature` 檔案路徑
  - `-u, --url <url>`（必填）：目標服務的 Base URL（例如 `http://localhost:3000`）

### Gherkin 解析
- 使用 `@cucumber/gherkin` 與 `@cucumber/messages` 套件解析 feature 檔案
- 支援一個 feature 檔案內的**多個 Scenario**，逐一執行並個別回報結果
- 支援以下 Gherkin 步驟模式：
  - `When I send a "{METHOD}" request to "{PATH}"` — 定義 HTTP 方法與路徑
  - `And the request body is:` + DocString（JSON 格式） — 定義請求主體
  - `Then the response status should be {STATUS}` — 定義預期狀態碼
  - `Then the response body should be:` + DocString（JSON 格式） — 精確比對回應主體
  - `Then the response body should contain field "{field}" with value "{value}"` — 欄位層級部分比對

### 執行流程
- 前置檢查：確認 feature 檔案存在，否則輸出錯誤並以 exit code 1 退出
- 解析 feature 檔案，提取每個 Scenario 的步驟資料
- 將 `--url` 與 Path 組合為完整 endpoint
- 使用 `axios` 發送 HTTP 請求（帶有 request body 若有定義）
- 使用 `chai` 進行斷言：
  - 比對實際狀態碼與預期狀態碼
  - 回應主體精確比對（`Then the response body should be:`）
  - 回應主體欄位比對（`Then the response body should contain field`）

### 輸出
- 每個 Scenario 個別輸出結果：
  - ✅ 綠色成功訊息（合約匹配）
  - ❌ 紅色失敗訊息（狀態碼不符、主體不符、或連線失敗），並附上詳細差異
- 所有 Scenario 完成後輸出總結（幾個通過、幾個失敗）
- Exit code：全部通過為 `0`，任一失敗為 `1`

### 專案結構
- `package.json`：含相依套件與 `bin` 設定（指向 `index.js`）
- `index.js`：主邏輯
- `example.feature`：示範用 feature 檔案

### 技術堆疊
- Runtime：Node.js
- CLI Framework：`commander`
- Gherkin 解析：`@cucumber/gherkin`、`@cucumber/messages`
- HTTP 客戶端：`axios`
- 斷言：`chai`

## Out of Scope
- Gherkin `Background:` 區塊支援
- DataTable 格式的請求主體
- npm 發布流程
- 認證/授權標頭（如 Bearer Token）
- 請求逾時設定
- 測試報告輸出至檔案

## Open Decisions
PRD 作者應解決以下問題：

- **多 Scenario 失敗行為**：當某個 Scenario 失敗時，是繼續執行後續 Scenario，還是立即中止？（建議：繼續執行，最終統一回報）
- **回應主體精確比對策略**：`Then the response body should be:` 是否允許回應含有額外欄位（partial/寬鬆比對），還是要求完全一致（strict/嚴格比對）？

## Context / Background
- 工具定位為合約測試的 MVP，設計上簡單可擴充
- Gherkin 步驟格式需明確固定，以利未來支援更多步驟類型
- 使用者預計考慮未來發布至 npm，因此 `package.json` 的 `bin` 設定與套件命名需符合發布規範
- 本次澄清對話（2026-05-10）確認了以下設計決策：
  - 回應主體驗證在 MVP 範疇內
  - 多 Scenario 全部執行
  - Request body 使用 DocString（JSON）格式
  - Response body 同時支援精確比對與欄位層級比對
