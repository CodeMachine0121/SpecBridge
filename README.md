# SpecBridge

> Contract testing CLI — verify HTTP APIs against Gherkin feature files.

SpecBridge lets you describe the expected behaviour of an HTTP API in plain-English Gherkin (`.feature`) files and then verify a live service against those contracts from the command line.

---

## Requirements

- Node.js ≥ 18

---

## Installation

```bash
# Clone and install dependencies
git clone <repo-url>
cd SpecBridge
npm install
```

To use the `specbridge` command globally:

```bash
npm link
```

---

## Usage

```
specbridge verify -f <path-to-feature> -u <base-url>
```

| Option | Alias | Required | Description |
|---|---|---|---|
| `--file` | `-f` | ✅ | Path to the `.feature` contract file |
| `--url` | `-u` | ✅ | Base URL of the service to test (e.g. `http://localhost:3000`) |

---

## Writing a Contract

Contracts are written in [Gherkin](https://cucumber.io/docs/gherkin/) and stored as `.feature` files.
Each **Scenario** maps to one API call and a set of assertions.

### Supported Steps

| Step | Description |
|---|---|
| `When I send a "METHOD" request to "/path"` | HTTP request (GET, POST, PUT, DELETE, …) |
| `And the request body is:` + doc-string | JSON request body |
| `Then the response status should be <code>` | Assert HTTP status code |
| `Then the response body should be:` + doc-string | Assert exact JSON response (key-by-key) |
| `Then the response body should contain field "key" with value "val"` | Assert a single field value |

> A scenario **must** include at least one `When` step and one `Then` status step to be executed.
> Scenarios missing these are skipped with a warning.

---

## End-to-End Example

The `example-api/` directory contains a small Node.js server and `example.feature` provides its contract.

### 1 — Start the example API

```bash
cd example-api
npm start
# Example API running at http://localhost:3000
```

### 2 — Run contract verification

From the project root:

```bash
node index.js verify -f example.feature -u http://localhost:3000
```

Or, if you ran `npm link`:

```bash
specbridge verify -f example.feature -u http://localhost:3000
```

### 3 — Expected output

```
✅  Scenario: Health check endpoint
    GET http://localhost:3000/api/health
✅  Scenario: Get user by ID
    GET http://localhost:3000/api/users/1
✅  Scenario: Create a new user
    POST http://localhost:3000/api/users
────────────────────────────────
  Results: 3 passed, 0 failed
────────────────────────────────
```

### The contract file (`example.feature`)

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

### The example API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — returns `{ "status": "ok" }` |
| `GET` | `/api/users/:id` | Fetch a user by ID |
| `POST` | `/api/users` | Create a new user (requires `name` in body) |

---

## Exit Codes

| Code | Meaning |
|---|---|
| `0` | All scenarios passed |
| `1` | One or more scenarios failed, or the feature file was not found / could not be parsed |

---

## Running Tests

```bash
npm test
```

---

## License

MIT
