# Product Requirements Document (PRD)

**Status:** Draft
**Version:** v1.0
**Owner:** James
**Stakeholders:** Engineering

---

## 1. Background & Goal (Why & Goal)

- **Problem Statement:**
  開發者與 QA 工程師在驗證 API 服務是否符合雙方約定的合約時，缺乏一個輕量、可在 CI/CD 中執行的自動化工具。現有方案（如 Postman、Pact）對於只需要簡單合約驗證的場景過於複雜或需要額外基礎設施。

- **Expected Outcome:**
  開發者能夠用一條指令 (`specbridge verify -f <file> -u <url>`) 驗證目標服務是否符合 Feature File 定義的 Contract，並在 CI/CD pipeline 中透過 exit code 自動判斷通過/失敗。

- **Out of Scope（本版本明確不含）：**
  - Gherkin `Background:` 區塊支援
  - DataTable 格式的 Request Body
  - npm 發布流程
  - 認證/授權標頭（如 Bearer Token）
  - 使用者可設定的請求逾時（硬編碼為 30 秒）
  - 測試報告輸出至檔案

---

## 2. User Personas

- **後端開發者（Backend Developer）**
  - Usage Context：本地開發階段，執行 `specbridge verify` 驗證自己實作的 API 是否符合 Contract；在終端機（macOS / Linux / Windows）中使用
  - 需求：快速回饋、清楚的差異輸出

- **QA / 測試工程師（QA Engineer）**
  - Usage Context：CI/CD pipeline（如 GitHub Actions、GitLab CI）中自動執行，透過 exit code 0/1 決定 pipeline 通過或失敗
  - 需求：可腳本化、exit code 可靠、無互動式輸入需求

- **API 消費方開發者（API Consumer Developer）**
  - Usage Context：驗證上游服務是否仍符合雙方約定的 Contract，通常在整合測試階段使用
  - 需求：個別 Scenario 的詳細差異輸出，能快速定位問題端點

---

## 3. User Stories & Acceptance Criteria

| ID | User Story | Acceptance Criteria | Priority |
| :--- | :--- | :--- | :--- |
| **US-01** | **As a** 後端開發者，**I want to** 執行 `specbridge verify -f api.feature -u http://localhost:3000`，**so that** 我能立即知道我的 API 是否符合 Contract 定義。 | 1. 命令成功解析 Feature File 中的所有 Scenario<br>2. 每個 Scenario 個別顯示 ✅ 或 ❌ 結果<br>3. 全部通過時 exit code 為 0 | P0 |
| **US-02** | **As a** QA 工程師，**I want to** 在 CI/CD pipeline 中執行 specbridge 並透過 exit code 判斷通過/失敗，**so that** Contract 測試可自動阻擋不相容的變更。 | 1. 任一 Scenario 失敗時 exit code 為 1<br>2. 全部通過時 exit code 為 0<br>3. 不需要互動式輸入即可完整執行 | P0 |
| **US-03** | **As a** API 消費方開發者，**I want to** 看到每個 Scenario 的個別結果與詳細差異，**so that** 我能快速定位哪個端點違反了 Contract。 | 1. 失敗時顯示紅色錯誤訊息，含預期值與實際值的差異<br>2. 所有 Scenario 執行完畢後顯示 Verification Summary（N passed, M failed）<br>3. 連線失敗時顯示可讀的錯誤原因 | P1 |
| **US-04** | **As a** 後端開發者，**I want to** 在 Feature File 中定義 Request Body 與 Response Body 的預期內容，**so that** Contract 不只驗證 Status Code，也驗證資料結構。 | 1. 支援 DocString（JSON）格式的 Request Body<br>2. 支援精確 Response Body 比對（Partial 寬鬆模式：回應可含多餘欄位）<br>3. 支援欄位層級的 Response Body 比對 | P1 |

---

## 4. Business Flow & Logic

### Happy Path

```
使用者執行: specbridge verify -f <path> -u <baseUrl>
  │
  ├─ [前置檢查] Feature File 是否存在？
  │     否 → 輸出紅色錯誤訊息，exit code 1，結束
  │     是 → 繼續
  │
  ├─ [Parse Feature File] 使用 @cucumber/gherkin 解析
  │     提取所有 Scenario，每個 Scenario 含：
  │     - HTTP Method + Path（來自 When step）
  │     - Request Body（來自 And DocString step，選填）
  │     - 預期 Status Code（來自 Then step）
  │     - 預期 Response Body - exact（來自 Then DocString step，選填）
  │     - 預期 Response Body - field（來自 Then field step，選填，可多個）
  │
  ├─ [逐一執行 Scenario]（失敗不中斷，繼續執行後續 Scenario）
  │     對每個 Scenario：
  │     ├─ 組合 Endpoint = Base URL + Path
  │     ├─ 使用 axios 發送 HTTP 請求（含 Request Body 若存在，逾時 30 秒）
  │     ├─ Assert Status Code（chai）
  │     ├─ Assert Response Body Exact（chai，Partial 寬鬆模式）（若有定義）
  │     ├─ Assert Response Body Field（chai）（若有定義，可多個）
  │     └─ 輸出該 Scenario 的 Result（pass ✅ / fail ❌）
  │
  └─ [輸出 Verification Summary]
        N passed, M failed
        exit code 0（全部 pass）或 1（任一 fail）
```

### Core Business Rules

- **Rule 1 — 失敗繼續執行**：某個 Scenario 失敗（斷言不符或請求失敗），不中斷後續 Scenario 的執行。
- **Rule 2 — Partial Response Body 比對**：`Then the response body should be:` 使用寬鬆比對——Response Body 允許含有 Feature File 未定義的額外欄位，但定義的欄位值必須完全符合。
- **Rule 3 — 欄位比對獨立執行**：`Then the response body should contain field "{field}" with value "{value}"` 每條 Step 獨立斷言，任一失敗即標記該 Scenario 為 fail。
- **Rule 4 — Endpoint 組合**：Base URL 末尾的 `/` 與 Path 開頭的 `/` 自動處理，不重複也不遺漏。

### Edge Cases

| 情境 | 處理方式 |
| :--- | :--- |
| Feature File 不存在 | 輸出紅色錯誤，exit code 1，立即結束 |
| Feature File 格式錯誤（無法解析） | 輸出紅色錯誤訊息含解析錯誤詳情，exit code 1 |
| Feature File 中無任何 Scenario | 輸出警告訊息「No scenarios found」，exit code 0 |
| HTTP 請求連線失敗（ECONNREFUSED 等） | 標記該 Scenario 為 fail，輸出紅色錯誤含連線錯誤原因，繼續執行後續 Scenario |
| HTTP 請求逾時（> 30 秒） | 標記該 Scenario 為 fail，輸出「Request timed out after 30s」 |
| Response Body 非 JSON 格式 | 標記該 Scenario 為 fail，輸出「Response body is not valid JSON」 |
| Scenario 缺少 When 或 Then status step | 跳過該 Scenario，輸出警告「Scenario skipped: missing required steps」 |

---

## 5. UI/UX Design & Interaction

此為 CLI 工具，無圖形介面。終端輸出規格如下：

### 每個 Scenario 的輸出格式

**通過（Pass）：**
```
✅  Scenario: Check User Endpoint
    GET http://localhost:3000/api/health → 200 OK
```

**失敗（Fail）— Status Code 不符：**
```
❌  Scenario: Check User Endpoint
    GET http://localhost:3000/api/health
    Status Code: expected 200, got 404
```

**失敗（Fail）— Response Body 不符：**
```
❌  Scenario: Check User Endpoint
    GET http://localhost:3000/api/users/1
    Response Body mismatch:
      expected field "name" to equal "John", got "Jane"
```

**失敗（Fail）— 連線失敗：**
```
❌  Scenario: Check User Endpoint
    POST http://localhost:3000/api/users
    Connection failed: ECONNREFUSED http://localhost:3000
```

### Verification Summary（最後輸出）

```
────────────────────────────────
  Results: 3 passed, 1 failed
────────────────────────────────
```

### 顏色規範

- 綠色（`\x1b[32m`）：pass 訊息
- 紅色（`\x1b[31m`）：fail 訊息與錯誤詳情
- 黃色（`\x1b[33m`）：警告訊息（跳過 Scenario 等）
- 預設色：Endpoint、Summary 分隔線

---

## 6. Non-Functional Requirements

- **Runtime Compatibility：** Node.js 18+（使用 ES Modules 或 CommonJS 均可，以 `@cucumber/gherkin` 套件相容性為準）
- **Performance：** 單次執行 10 個 Scenario 應在 HTTP 逾時時間內完成（串列執行，無並發需求）
- **HTTP Timeout：** 每個請求硬編碼 30 秒逾時（MVP 不提供使用者設定）
- **Security：** 不儲存任何請求/回應內容至磁碟；不處理認證資訊
- **Compatibility：** macOS、Linux、Windows（透過 Node.js 跨平台）
- **Analytics / Tracking：** 無

---

## 7. Dependencies & Risks

### External Dependencies

| 套件 | 用途 | 版本策略 |
| :--- | :--- | :--- |
| `commander` | CLI 框架（參數解析） | latest |
| `@cucumber/gherkin` | Gherkin 解析器 | latest |
| `@cucumber/messages` | Gherkin 訊息格式（與 gherkin 搭配） | latest |
| `axios` | HTTP 客戶端 | latest |
| `chai` | 斷言函式庫 | latest |

### Known Risks

無使用者提報的額外風險。以下為技術評估風險：

| 風險 | 說明 | 緩解策略 |
| :--- | :--- | :--- |
| `@cucumber/gherkin` API 變動 | 此套件的 Stream API 在不同版本間有重大變更 | 鎖定版本，並在 README 中標注測試過的版本 |
| ESM/CJS 模組格式衝突 | `@cucumber/gherkin` 為 ESM，`chai` v5 也轉為 ESM，可能與 CommonJS 專案衝突 | 於 `package.json` 設定 `"type": "module"` 或使用動態 `import()` |

---

## 8. Appendix

### 支援的 Gherkin Step 模式（完整列表）

| Step 模式 | 類型 | 必填 |
| :--- | :--- | :--- |
| `When I send a "{METHOD}" request to "{PATH}"` | Action | ✅ 必填 |
| `And the request body is:` + DocString（JSON） | Action | 選填 |
| `Then the response status should be {STATUS}` | Assertion | ✅ 必填 |
| `Then the response body should be:` + DocString（JSON） | Assertion | 選填 |
| `Then the response body should contain field "{field}" with value "{value}"` | Assertion | 選填（可多個） |

### 範例 Feature File

```gherkin
Feature: API Contract Verification

  Scenario: Health check endpoint
    When I send a "GET" request to "/api/health"
    Then the response status should be 200
    Then the response body should contain field "status" with value "ok"

  Scenario: Get user by ID
    When I send a "GET" request to "/api/users/1"
    Then the response status should be 200
    Then the response body should be:
      """
      { "id": 1, "name": "John" }
      """

  Scenario: Create a new user
    When I send a "POST" request to "/api/users"
    And the request body is:
      """
      { "name": "Alice", "email": "alice@example.com" }
      """
    Then the response status should be 201
    Then the response body should contain field "name" with value "Alice"
```

### 相關文件

- `BRIEF.md`：需求澄清摘要（`.sdd/2026-05-10-specbridge/BRIEF.md`）
- `UL-MAP.md`：統一語言地圖（`.sdd/UL-MAP.md`）
