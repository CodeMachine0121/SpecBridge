# 📔 Ubiquitous Language Map

**Project:** SpecBridge
**Bounded Context:** Contract Testing CLI
**Maintainer:** James
**Last Updated:** 2026-05-10

---

## 1. Nouns & Concepts
*Records entities, value objects, attributes and their correspondence between code and real business.*

| Domain Term | Technical Name | User-Facing Label | Definition & Business Rules | Status |
| :--- | :--- | :--- | :--- | :--- |
| Contract | contract | Contract | 定義在 `.feature` 檔案中的預期行為規格，包含 HTTP 方法、路徑、請求主體、預期狀態碼與預期回應主體 | Confirmed |
| Feature File | featureFile / `--file` | Feature File | Gherkin 格式的 `.feature` 檔案，作為合約的唯一來源（Single Source of Truth） | Confirmed |
| Scenario | scenario | Scenario | Feature File 中的單一測試情境，代表一組完整的合約驗證流程；每個 Scenario 獨立執行並個別回報 | Confirmed |
| Gherkin Step | step | Step | Scenario 中的單一行指令（When / Then / And），定義請求或斷言的具體行為 | Confirmed |
| HTTP Method | method | Method | HTTP 動詞，如 GET、POST、PUT、DELETE，從 Gherkin Step 中提取 | Confirmed |
| Path | path | Path | URL 路徑段（如 `/api/health`），從 Gherkin Step 中提取，與 Base URL 組合成 Endpoint | Confirmed |
| Base URL | baseUrl / `--url` | Base URL | 目標服務的根 URL（如 `http://localhost:3000`），由 CLI 參數提供 | Confirmed |
| Endpoint | endpoint | Endpoint | Base URL 與 Path 的組合，即實際發送 HTTP 請求的完整網址 | Confirmed |
| Request Body | requestBody | Request Body | 以 DocString（JSON 格式）寫在 Gherkin 中的 HTTP 請求主體；僅 POST/PUT 等方法適用 | Confirmed |
| Response | response | Response | 目標服務對 HTTP 請求的完整回應，包含 Status Code 與 Response Body | Confirmed |
| Response Body | responseBody | Response Body | HTTP 回應的 JSON 主體，用於與 Gherkin 定義的預期內容進行比對 | Confirmed |
| Status Code | statusCode | Status Code | HTTP 回應的三位數狀態碼（如 200、404），是合約驗證的核心指標之一 | Confirmed |
| DocString | docString | — | Gherkin 中以三引號（`"""`）包裹的多行字串，用於表達 Request Body 或 Response Body 的 JSON 內容 | Confirmed |
| Scenario Result | result | Result | 單一 Scenario 的執行結果，值為 pass 或 fail | Archeology |
| Verification Summary | summary | Summary | 所有 Scenario 執行完畢後的統計回報（通過數 / 失敗數） | Archeology |

---

## 2. Actions & Processes
*Records business operations, function logic, and their corresponding business actions.*

| Business Action | Technical Method | Trigger | Business Impact | Notes |
| :--- | :--- | :--- | :--- | :--- |
| 執行合約驗證 (Verify Contract) | `verify` command | 使用者執行 `specbridge verify -f <file> -u <url>` | 對目標服務發送請求並比對合約，輸出每個 Scenario 的結果與總結 | 核心業務動作 |
| 解析 Feature File (Parse Feature File) | parseFeatureFile | `verify` 命令前置步驟 | 將 `.feature` 檔案轉換為結構化的 Scenario 列表，提取 Steps 資料 | 使用 `@cucumber/gherkin` |
| 發送 HTTP 請求 (Send Request) | sendRequest | 每個 Scenario 執行時 | 對 Endpoint 發送 HTTP 請求，取得實際 Response | 使用 `axios` |
| 斷言狀態碼 (Assert Status Code) | assertStatus | 收到 Response 後 | 比對實際 Status Code 與 Gherkin 定義的預期值；不符則標記為 fail | 使用 `chai` |
| 精確比對回應主體 (Assert Response Body Exact) | assertBodyExact | 收到 Response 後（若 Scenario 含此 Step） | 將實際 Response Body 與 Gherkin DocString 進行完整 JSON 比對 | 使用 `chai` deep equal |
| 欄位比對回應主體 (Assert Response Body Field) | assertBodyField | 收到 Response 後（若 Scenario 含此 Step） | 驗證 Response Body 中特定欄位的值是否符合預期 | 部分比對，不要求完整一致 |
| 回報結果 (Report Result) | reportResult | 每個 Scenario 執行完畢後 | 輸出綠色（pass）或紅色（fail）訊息，包含差異詳情 | exit code 0 / 1 |

---

## 3. Ambiguities & Conflicts
*Records cases where the same technical term means different things in different modules, or multiple terms refer to the same concept.*

| Ambiguous Term | Meaning in Context A | Meaning in Context B | Resolution |
| :--- | :--- | :--- | :--- |
| contract | 整個 `.feature` 檔案（作為合約文件） | Feature File 中單一 Scenario 定義的預期行為 | 統一使用「Contract」指整份 feature file；「Scenario」指單一合約條目 |
| verify | CLI 命令名稱（`specbridge verify`） | 驗證行為本身（assertion/comparison） | CLI 命令用 `verify`；程式內部驗證行為用 `assert` |
| body | Request Body（發送給服務的內容） | Response Body（服務回傳的內容） | 永遠加前綴：`requestBody` / `responseBody` |

---

## 4. External & Enum Mapping
*Records magic numbers/strings in code and their real business meaning.*

| Category | Code Value / Key | Domain Label | Description |
| :--- | :--- | :--- | :--- |
| HTTP Method | `"GET"` | GET | 取得資源，通常無 Request Body |
| HTTP Method | `"POST"` | POST | 建立資源，通常附帶 Request Body |
| HTTP Method | `"PUT"` | PUT | 更新資源，通常附帶 Request Body |
| HTTP Method | `"DELETE"` | DELETE | 刪除資源 |
| HTTP Method | `"PATCH"` | PATCH | 部分更新資源 |
| Exit Code | `0` | Success | 所有 Scenario 均通過 |
| Exit Code | `1` | Failure | 至少一個 Scenario 失敗，或執行期間發生錯誤 |
| Scenario Result | `"pass"` | Pass | Scenario 所有斷言均符合預期 |
| Scenario Result | `"fail"` | Fail | 至少一個斷言不符預期，或請求發送失敗 |
| Gherkin Keyword | `When` | Action Step | 定義 HTTP 請求行為的步驟前綴 |
| Gherkin Keyword | `Then` | Assertion Step | 定義斷言條件的步驟前綴 |
| Gherkin Keyword | `And` | Continuation Step | 延續前一個 When 或 Then 的補充步驟 |

---

## Quick Start Guide
1. **Archeology** — read source code; fill `Technical Name` with raw names found in the codebase.
2. **Mapping** — check UI screens or ask business stakeholders; fill `Domain Term` with the correct canonical name.
3. **Refine** — add business rules (e.g., "this field cannot be negative", "this action must occur after checkout").
4. **Sync** — this document is the single authoritative dictionary for all future renaming, refactoring, and new documentation.
